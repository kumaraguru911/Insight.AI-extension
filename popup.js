// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const modeSelect = document.getElementById("mode");
  const saveBtn = document.getElementById("saveBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Load saved mode when popup opens
  chrome.storage.sync.get("responseMode", (data) => {
    if (data.responseMode) {
      modeSelect.value = data.responseMode;
    }
  });

  // Save mode to Chrome storage
  saveBtn.addEventListener("click", () => {
    const selectedMode = modeSelect.value;
    chrome.storage.sync.set({ responseMode: selectedMode }, () => {
      statusMsg.textContent = "✅ Settings saved!";
      setTimeout(() => (statusMsg.textContent = ""), 1500);
    });
  });
});
