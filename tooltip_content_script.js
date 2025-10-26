// tooltip_content_script.js

(function() {
  let tooltip;

  function createTooltip() {
    const el = document.createElement('div');
    el.id = 'insight-ai-tooltip';
    el.innerHTML = `
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="Insight.AI icon" />
      <span>Ask Insight.AI</span>
    `;
    document.body.appendChild(el);
    return el;
  }

  function showTooltip() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim().length < 3) {
      hideTooltip();
      return;
    }

    if (!tooltip) {
      tooltip = createTooltip();
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position the tooltip above the selection
    tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 40}px`; // 40px offset above
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translate(-50%, 0) scale(1)';
    tooltip.style.pointerEvents = 'auto';

    tooltip.onclick = (e) => {
      e.stopPropagation();
      const selectedText = selection.toString();
      // Send a message to the background script to trigger the AI explanation
      chrome.runtime.sendMessage({
        action: "askAIFromTooltip",
        selectionText: selectedText
      });
      hideTooltip();
    };
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translate(-50%, 0) scale(0.9)';
      tooltip.style.pointerEvents = 'none';
    }
  }

  // --- Event Listeners ---

  // Show tooltip on text selection
  document.addEventListener('mouseup', (e) => {
    // Use a small timeout to allow the selection to finalize
    setTimeout(() => showTooltip(), 10);
  });

  // Hide tooltip when user clicks away
  document.addEventListener('mousedown', (e) => {
    if (tooltip && !tooltip.contains(e.target)) {
      hideTooltip();
    }
  });

  // Hide on scroll to prevent detached tooltips
  document.addEventListener('scroll', hideTooltip, { passive: true });

})(); 