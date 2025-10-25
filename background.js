const HISTORY_STORAGE_KEY = 'aiResponseHistory'; // Define a constant for the history storage key
const MAX_HISTORY_ENTRIES = 50; // Limit history to prevent excessive storage

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

  // New context menu item for history
  chrome.contextMenus.create({
    id: "showAIHistory",
    title: "Show AI History",
    contexts: ["all"] // Can be clicked anywhere
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "showAIHistory") {
    // Inject history sidebar
    chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ["history.css"] });
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["history_content_script.js"] });
    return; // Exit early for history menu item
  }

  if (!info.selectionText) return;

  const key = info.selectionText + "_" + info.menuItemId;

  // Check if cached
  chrome.storage.local.get([key], async (result) => {
    if (result[key]) {
      // Show cached response
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["content.css"]
      });
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

        // Save to history
        saveToHistory(info.selectionText, aiResponse);

        // Show popup
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"]
        });
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showAIResponse,
          args: [aiResponse]
        });
      });
    }
  });
});

// Function to save AI response to history
async function saveToHistory(query, response) {
  chrome.storage.local.get([HISTORY_STORAGE_KEY], (result) => {
    let history = result[HISTORY_STORAGE_KEY] || [];
    // Add new entry to the beginning of the array
    history.unshift({ query: query, response: response, timestamp: Date.now() });
    // Trim history to max entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history = history.slice(0, MAX_HISTORY_ENTRIES);
    }
    chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: history });
  });
}

// Listener for messages from content scripts (e.g., history sidebar)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showAIResponseFromHistory") {
    if (sender.tab && message.response) {
      chrome.scripting.insertCSS({ target: { tabId: sender.tab.id }, files: ["content.css"] });
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: showAIResponse,
        args: [message.response]
      });
    }
  } else if (message.action === "clearAIHistory") {
    chrome.storage.local.remove(HISTORY_STORAGE_KEY, () => {
      console.log("AI History cleared.");
      sendResponse({ success: true }); // Acknowledge clearance
    });
    return true; // Indicate that sendResponse will be called asynchronously
  } else if (message.action === "getAIHistory") {
    chrome.storage.local.get([HISTORY_STORAGE_KEY], (result) => { sendResponse({ history: result[HISTORY_STORAGE_KEY] || [] }); });
    return true; // Indicate that sendResponse will be called asynchronously
  }
});

// Function to call Gemini API
async function getGeminiResponse(text) {
  // IMPORTANT: Replace with your real API key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=YOUR_API_KEY`;

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
  box.id = 'ai-popup-box';

  // Header for the popup
  const header = document.createElement('div');
  header.className = 'ai-popup-header';

  // Use a div for the icon to apply the same professional cropping as the popup
  const icon = document.createElement('div');
  icon.className = 'ai-popup-icon';
  icon.style.backgroundImage = `url(${chrome.runtime.getURL('icons/icon48.png')})`;

  const title = document.createElement('span');
  title.textContent = 'Insight.AI';
  title.className = 'ai-popup-title';

  header.appendChild(icon);
  header.appendChild(title);
  box.appendChild(header);

  // Content area for typing effect
  const contentArea = document.createElement('div');
  contentArea.className = 'ai-popup-content';
  box.appendChild(contentArea);

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.className = 'ai-popup-close-btn';
  closeBtn.innerText = "✖";
  closeBtn.onclick = () => box.remove();
  box.appendChild(closeBtn);

  // Add to page and fade in
  document.body.appendChild(box);

  // Typing effect
  let i = 0;
  const speed = 10; // milliseconds per character

  function typeWriter() {
    // The CSS `white-space: pre-wrap` handles newlines, so no need to replace with <br>
    if (i < aiResponse.length) {
      // Handle HTML tags by finding the next tag and appending the whole thing
      if (aiResponse.charAt(i) === '<') {
        const tagEnd = aiResponse.indexOf('>', i);
        contentArea.innerHTML += aiResponse.substring(i, tagEnd + 1);
        i = tagEnd;
      } else {
        contentArea.innerHTML += aiResponse.charAt(i);
      }
      i++;
      setTimeout(typeWriter, speed);
    } else {
      contentArea.classList.add('typing-done'); // Hide cursor when done
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
    box.classList.add('is-dragging');
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      // We have to set style directly here for drag position
      box.style.left = e.clientX - offsetX + "px";
      box.style.top = e.clientY - offsetY + "px";
      box.style.bottom = "auto";
      box.style.right = "auto";
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging = false;
    box.classList.remove('is-dragging');
  });
}
