// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const modeSelect = document.getElementById("mode");
  const themeToggle = document.getElementById("themeToggle");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");
  const openExtractionBtn = document.getElementById("openExtractionBtn");

  // Load saved settings when popup opens
  chrome.storage.sync.get(["responseMode", "theme"], (data) => {
    if (data.responseMode) {
      modeSelect.value = data.responseMode;
    }
    // Default to dark theme if nothing is set
    themeToggle.checked = data.theme === "dark" || data.theme === undefined;
  });

  // Save settings to Chrome storage
  saveBtn.addEventListener("click", () => {
    const selectedMode = modeSelect.value;
    const selectedTheme = themeToggle.checked ? "dark" : "light";

    chrome.storage.sync.set({
      responseMode: selectedMode,
      theme: selectedTheme
    }, () => {
      statusMsg.textContent = "✅ Settings saved!";
      setTimeout(() => (statusMsg.textContent = ""), 1500);
    });
  });

  // Open extraction tool
  openExtractionBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('extraction.html') });
  });
});
