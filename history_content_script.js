// history_content_script.js

(function() {
  const HISTORY_STORAGE_KEY = 'aiResponseHistory'; // Must match key in background.js

  // Check if sidebar already exists to prevent duplicates
  if (document.getElementById('ai-history-sidebar')) {
    document.getElementById('ai-history-sidebar').remove();
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'ai-history-sidebar';

  const header = document.createElement('div');
  header.className = 'ai-history-header';
  header.innerHTML = `
    <h3>AI History</h3>
    <span class="ai-history-close-btn">✖</span>
  `;
  sidebar.appendChild(header);

  const historyList = document.createElement('div');
  historyList.className = 'ai-history-list';
  sidebar.appendChild(historyList);

  const footer = document.createElement('div');
  footer.className = 'ai-history-footer';
  footer.innerHTML = `
    <button class="ai-history-clear-btn">Clear History</button>
  `;
  sidebar.appendChild(footer);

  document.body.appendChild(sidebar);

  // --- Event Listeners ---

  // Close button
  sidebar.querySelector('.ai-history-close-btn').addEventListener('click', () => {
    sidebar.remove();
  });

  // Clear History button
  sidebar.querySelector('.ai-history-clear-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all AI history?')) {
      await chrome.runtime.sendMessage({ action: "clearAIHistory" });
      renderHistory([]); // Clear UI immediately
    }
  });

  // Draggable functionality
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('ai-history-close-btn')) return; // Don't drag if clicking close
    isDragging = true;
    offsetX = e.clientX - sidebar.getBoundingClientRect().left;
    offsetY = e.clientY - sidebar.getBoundingClientRect().top;
    sidebar.classList.add('is-dragging');
    sidebar.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Calculate new position
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Keep sidebar within viewport bounds
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - sidebar.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - sidebar.offsetHeight));

      sidebar.style.left = `${newLeft}px`;
      sidebar.style.top = `${newTop}px`;
      sidebar.style.right = 'auto'; // Override fixed right position
      sidebar.style.bottom = 'auto'; // Override fixed bottom position
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    sidebar.classList.remove('is-dragging');
    sidebar.style.cursor = 'grab';
  });

  // --- History Rendering ---

  async function fetchAndRenderHistory() {
    const response = await chrome.runtime.sendMessage({ action: "getAIHistory" });
    renderHistory(response.history);
  }

  function renderHistory(history) {
    historyList.innerHTML = ''; // Clear existing entries
    if (history.length === 0) {
      historyList.innerHTML = '<div class="ai-history-empty">No history yet.</div>';
      return;
    }

    history.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'ai-history-item';
      item.innerHTML = `
        <div class="ai-history-query">${entry.query}</div>
        <div class="ai-history-response">${entry.response}</div>
      `;
      item.addEventListener('click', () => {
        // Send message to background script to show the AI response popup
        chrome.runtime.sendMessage({ action: "showAIResponseFromHistory", response: entry.response });
      });
      historyList.appendChild(item);
    });
  }

  // Initial fetch and render
  fetchAndRenderHistory();
})();