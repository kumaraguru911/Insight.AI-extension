chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
  id: "askAI_explain",
  title: "AI: Explain selected text",
  contexts: ["selection"]
});

chrome.contextMenus.create({
  id: "askAI_summarize",
  title: "AI: Summarize selected text",
  contexts: ["selection"]
});

chrome.contextMenus.create({
  id: "askAI_translate",
  title: "AI: Translate to English",
  contexts: ["selection"]
});

});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) return;

  const key = info.selectionText + "_" + info.menuItemId;

  // Check if cached
  chrome.storage.local.get([key], async (result) => {
    if (result[key]) {
      // Show cached response
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showAIResponse,
        args: [result[key]]
      });
    } else {
      // Prepare prompt
      // Get the saved response mode from storage
      chrome.storage.sync.get({ responseMode: 'concise' }, async (settings) => {
        const { responseMode } = settings;
        let promptInstruction = '';

        switch (info.menuItemId) {
          case "askAI_explain":
            promptInstruction = `Explain this in a ${responseMode} way:`;
            break;
          case "askAI_summarize":
            promptInstruction = `Summarize this in a ${responseMode} way:`;
            break;
          case "askAI_translate":
            promptInstruction = `Translate this to English:`;
            break;
          default:
            return;
        }

        const fullPrompt = `${promptInstruction}\n\n"${info.selectionText}"`;

        // Call AI
        const aiResponse = await getGeminiResponse(fullPrompt);

        // Store in cache
        chrome.storage.local.set({ [key]: aiResponse });

        // Show popup
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showAIResponse,
          args: [aiResponse]
        });
      });
    }
  });
});



// Function to call Gemini API
async function getGeminiResponse(text) {
  // IMPORTANT: Replace with your real API key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=YOUR_API_KEY_HERE`;

  const payload = {
    contents: [
      {
        parts: [{ text: text }] // Use the full prompt text passed into the function
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      // Log the full error object for detailed debugging in the console
      console.error("Gemini API HTTP Error:", JSON.stringify(errorData, null, 2));
      // This provides a robust way to get the error message, even if the structure varies.
      const errorMessage = errorData?.error?.message || 'An unknown API error occurred. Check the console for details.';
      return `⚠️ API Error: ${errorMessage}`;
    }

    const data = await res.json();
    console.log("Gemini response:", data);

    // Check if the response was blocked or is missing candidates
    if (!data.candidates || data.candidates.length === 0) {
      const blockReason = data.promptFeedback?.blockReason;
      if (blockReason) {
        return `⚠️ Request blocked by API for reason: ${blockReason}.`;
      }
      return "⚠️ API returned no response. Check the background console.";
    }

    // Extract response text
    return data.candidates[0]?.content?.parts?.[0]?.text || "⚠️ No response text found.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "⚠️ Network error. Could not connect to Gemini API.";
  }
}



function showAIResponse(aiResponse) {
  const existingBox = document.getElementById("ai-popup-box");
  if (existingBox) existingBox.remove();

  const box = document.createElement("div");
  box.id = "ai-popup-box";

  // Apply futuristic, glassmorphic styling
  Object.assign(box.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "rgba(29, 42, 68, 0.5)", // Semi-transparent glass background
    backdropFilter: "blur(16px)",
    webkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
    color: "#f9fafb",
    padding: "20px",
    borderRadius: "16px",
    fontSize: "15px",
    maxWidth: "400px",
    maxHeight: "300px",
    overflowY: "auto",
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
    zIndex: 999999,
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    lineHeight: "1.6",
    cursor: "move",
    opacity: "0",
    transform: "translateY(10px)",
    transition: "opacity 0.4s ease, transform 0.4s ease"
  });

  // Header for the popup
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
  });

  // Use a div for the icon to apply the same professional cropping as the popup
  const icon = document.createElement('div');
  Object.assign(icon.style, {
    width: '22px', height: '22px', borderRadius: '50%',
    backgroundImage: `url(${chrome.runtime.getURL('icons/icon48.png')})`,
    backgroundSize: '44px 44px',
    backgroundPosition: 'center -11px', // Crop to show only the bulb
    backgroundRepeat: 'no-repeat'
  });

  const title = document.createElement('span');
  title.textContent = 'Insight.AI';
  Object.assign(title.style, { fontWeight: '600', fontSize: '16px', textShadow: '0 0 8px rgba(255, 255, 255, 0.3)' });

  header.appendChild(icon);
  header.appendChild(title);
  box.appendChild(header);

  // Content area for typing effect
  const contentArea = document.createElement('div');
  box.appendChild(contentArea);

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.innerText = "✖";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "6px",
    right: "12px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#9ca3af",
    transition: "color 0.2s"
  });
  closeBtn.onclick = () => box.remove();
  closeBtn.onmouseover = () => closeBtn.style.color = "#f9fafb";
  closeBtn.onmouseout = () => closeBtn.style.color = "#9ca3af";
  box.appendChild(closeBtn);

  // Add to page and fade in
  document.body.appendChild(box);
  setTimeout(() => {
    box.style.opacity = "1";
    box.style.transform = "translateY(0)";
  }, 50);

  // Typing effect
  let i = 0;
  const speed = 10; // milliseconds per character
  const formattedResponse = aiResponse.replace(/\n/g, '<br>');

  function typeWriter() {
    if (i < formattedResponse.length) {
      // Handle HTML tags by finding the next tag and appending the whole thing
      if (formattedResponse.charAt(i) === '<') {
        const tagEnd = formattedResponse.indexOf('>', i);
        contentArea.innerHTML += formattedResponse.substring(i, tagEnd + 1);
        i = tagEnd;
      } else {
        contentArea.innerHTML += formattedResponse.charAt(i);
      }
      i++;
      setTimeout(typeWriter, speed);
    }
  }
  typeWriter();

  // Make draggable
  let isDragging = false;
  let offsetX, offsetY;

  box.addEventListener("mousedown", (e) => {
    // Prevent dragging when clicking on the close button
    if (e.target === closeBtn) return;
    isDragging = true;
    offsetX = e.clientX - box.getBoundingClientRect().left;
    offsetY = e.clientY - box.getBoundingClientRect().top;
    box.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      box.style.left = e.clientX - offsetX + "px";
      box.style.top = e.clientY - offsetY + "px";
      box.style.bottom = "auto";
      box.style.right = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    box.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  });
}
