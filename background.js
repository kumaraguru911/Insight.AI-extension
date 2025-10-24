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
      let promptText;
      switch(info.menuItemId) {
        case "askAI_explain":
          promptText = `Explain this clearly in simple terms: ${info.selectionText}`;
          break;
        case "askAI_summarize":
          promptText = `Summarize this text in 2-3 sentences: ${info.selectionText}`;
          break;
        case "askAI_translate":
          promptText = `Translate this text to English: ${info.selectionText}`;
          break;
        default:
          return;
      }

      // Call AI
      const aiResponse = await getGeminiResponse(promptText);

      // Store in cache
      chrome.storage.local.set({ [key]: aiResponse });

      // Show popup
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showAIResponse,
        args: [aiResponse]
      });
    }
  });
});



// Function to call Gemini API
async function getGeminiResponse(text) {
   // replace with your real key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=YOUR_API_KEY`;

  const payload = {
    contents: [
      {
        parts: [
          { text: `Explain this clearly in one short paragraph: ${text}` }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Gemini response:", data);

    // Extract response text
    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text ||
      "⚠️ No response text found.";

    return output;
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Error fetching response from Gemini API.";
  }
}



function showAIResponse(aiResponse) {
  const box = document.createElement("div");
  box.innerText = aiResponse;
  box.id = "ai-popup-box";

  Object.assign(box.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1e1e1e",
    color: "white",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "14px",
    maxWidth: "400px",
    maxHeight: "250px",
    overflowY: "auto",
    boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
    zIndex: 999999,
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.4",
    cursor: "move"
  });

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.innerText = "✖";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "6px",
    right: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  });
  closeBtn.onclick = () => box.remove();
  box.appendChild(closeBtn);

  document.body.appendChild(box);

  // Make draggable
  let isDragging = false;
  let offsetX, offsetY;

  box.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - box.getBoundingClientRect().left;
    offsetY = e.clientY - box.getBoundingClientRect().top;
    box.style.transition = "none"; // remove transition while dragging
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
    box.style.transition = "all 0.2s"; // smooth transition after drag
  });
}

