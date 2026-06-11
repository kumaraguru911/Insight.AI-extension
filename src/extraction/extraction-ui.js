// extraction-ui.js - UI logic for PDF/YouTube extraction

document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializePDFUpload();
  initializeYouTubeExtraction();
  initializeTranscriptExtraction();
  initializeResultsPanel();
  initializeSettings();
});

// Tab Navigation
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // Remove active class from all
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// PDF Upload Handler
function initializePDFUpload() {
  const uploadArea = document.getElementById('pdfUploadArea');
  const pdfInput = document.getElementById('pdfInput');
  const pdfStatus = document.getElementById('pdfStatus');

  // Click to upload
  uploadArea.addEventListener('click', () => pdfInput.click());

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragging');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      handlePDFUpload(files[0], pdfStatus);
    } else {
      showStatus(pdfStatus, '⚠️ Please upload a valid PDF file', 'error');
    }
  });

  pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handlePDFUpload(e.target.files[0], pdfStatus);
    }
  });
}

async function handlePDFUpload(file, statusElement) {
  showStatus(statusElement, '📖 Reading PDF... This may take a moment.', 'loading');

  try {
    // Use local PDF extraction library
    const pdfData = await PDFExtractor.extractText(file);
    if (!pdfData || pdfData.fullText.trim().length === 0) {
      showStatus(statusElement, '⚠️ Could not extract text from PDF.\n\nThis might be:\n• A scanned image PDF\n• A protected PDF\n• A PDF with no selectable text\n\nTry using another PDF with selectable text.', 'error');
      return;
    }

    if (pdfData.fullText.trim().length < 50) {
      showStatus(statusElement, '⚠️ Very little text found in PDF.\n\nMake sure the PDF has selectable text, not just images.', 'error');
      return;
    }

    showStatus(statusElement, '✨ Generating AI summary (analyzing ' + pdfData.totalPages + ' pages)...', 'loading');
    const summary = await summarizePDF(pdfData);

    displayResults({
      type: 'pdf',
      filename: file.name,
      pages: pdfData.totalPages,
      summary: summary,
      timestamp: new Date().toLocaleString()
    });

    showStatus(statusElement, '✅ PDF processed successfully!', 'success');
  } catch (error) {
    console.error('PDF processing error:', error);
    showStatus(statusElement, '❌ Error: ' + error.message + '\n\nTip: Try a different PDF file.', 'error');
  }
}

// YouTube Extraction Handler
function initializeYouTubeExtraction() {
  const youtubeBtn = document.getElementById('youtubeExtractBtn');
  const youtubeUrl = document.getElementById('youtubeUrl');
  const youtubeStatus = document.getElementById('youtubeStatus');

  youtubeBtn.addEventListener('click', async () => {
    const url = youtubeUrl.value.trim();
    if (!url) {
      showStatus(youtubeStatus, '⚠️ Please enter a YouTube URL', 'error');
      return;
    }

    showStatus(youtubeStatus, 'Extracting transcript...', 'loading');
    youtubeBtn.disabled = true;

    try {
      const transcript = await extractYouTubeTranscript(url);
      if (!transcript) {
        showStatus(youtubeStatus, '📝 Auto-extraction unavailable.\n\n✅ Alternative: Use Transcript tab\n1. Click "Show transcript" on YouTube\n2. Copy the full transcript\n3. Paste in Transcript tab\n4. Click Summarize', 'error');
        youtubeBtn.disabled = false;
        return;
      }

      showStatus(youtubeStatus, 'Summarizing transcript...', 'loading');
      const summary = await summarizeYouTubeTranscript(transcript);

      displayResults({
        type: 'youtube',
        url: url,
        summary: summary,
        timestamp: new Date().toLocaleString()
      });

      showStatus(youtubeStatus, '✅ YouTube video summarized successfully!', 'success');
    } catch (error) {
      console.error('YouTube extraction error:', error);
      showStatus(youtubeStatus, '⚠️ Could not auto-extract. Please use Transcript tab to paste manually.', 'error');
    } finally {
      youtubeBtn.disabled = false;
    }
  });
}

// Transcript Extraction Handler
function initializeTranscriptExtraction() {
  const transcriptBtn = document.getElementById('transcriptExtractBtn');
  const transcriptText = document.getElementById('transcriptText');
  const transcriptStatus = document.getElementById('transcriptStatus');

  transcriptBtn.addEventListener('click', async () => {
    const text = transcriptText.value.trim();
    if (!text) {
      showStatus(transcriptStatus, '⚠️ Please paste some text', 'error');
      return;
    }

    if (text.length < 100) {
      showStatus(transcriptStatus, '⚠️ Text is too short. Please provide at least 100 characters.', 'error');
      return;
    }

    showStatus(transcriptStatus, 'Analyzing transcript...', 'loading');
    transcriptBtn.disabled = true;

    try {
      const summary = await summarizeYouTubeTranscript(text);

      displayResults({
        type: 'transcript',
        wordCount: text.split(/\s+/).length,
        summary: summary,
        timestamp: new Date().toLocaleString()
      });

      showStatus(transcriptStatus, '✅ Transcript summarized successfully!', 'success');
    } catch (error) {
      console.error('Transcript extraction error:', error);
      showStatus(transcriptStatus, '❌ Error: ' + error.message, 'error');
    } finally {
      transcriptBtn.disabled = false;
    }
  });
}

// Results Panel Handler
function initializeResultsPanel() {
  const closeBtn = document.getElementById('closeResultsBtn');
  const copyBtn = document.getElementById('copyResultsBtn');
  const downloadBtn = document.getElementById('downloadResultsBtn');
  const resultsContainer = document.getElementById('resultsContainer');

  closeBtn.addEventListener('click', () => {
    resultsContainer.classList.add('hidden');
  });

  copyBtn.addEventListener('click', () => {
    const resultsContent = document.getElementById('resultsContent');
    const text = resultsContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback(copyBtn);
    });
  });

  downloadBtn.addEventListener('click', () => {
    const resultsContent = document.getElementById('resultsContent');
    const text = resultsContent.innerText;
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `extraction-summary-${timestamp}.txt`;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
}

// Display results in panel
function displayResults(data) {
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsContent = document.getElementById('resultsContent');

  let header = '';
  if (data.type === 'pdf') {
    header = `📄 <strong>${data.filename}</strong> (${data.pages} pages)`;
  } else if (data.type === 'youtube') {
    header = `🎥 <strong>YouTube Video Summary</strong>`;
  } else if (data.type === 'transcript') {
    header = `📝 <strong>Transcript Summary</strong> (${data.wordCount} words)`;
  }

  resultsContent.innerHTML = `
    <div class="result-header" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
      ${header}
      <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Extracted: ${data.timestamp}</div>
    </div>
    <div class="result-body">
      ${formatMarkdownContent(data.summary)}
    </div>
  `;

  resultsContainer.classList.remove('hidden');
}

// Format markdown-like content to HTML
function formatMarkdownContent(content) {
  let html = content
    .replace(/^### (.+)$/gm, '<h3 style="color: #6366f1; margin-top: 16px; margin-bottom: 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h3 style="color: #6366f1; margin-top: 16px; margin-bottom: 8px; font-size: 16px;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="color: #6366f1; margin-top: 16px; margin-bottom: 8px; font-size: 18px;">$1</h2>')
    .replace(/^\* (.+)$/gm, '<li style="margin-bottom: 8px;">$1</li>')
    .replace(/^• (.+)$/gm, '<li style="margin-bottom: 8px;">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-bottom: 8px;">$2</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/<li/g, '<ul style="margin-left: 20px; margin-bottom: 16px;"><li')
    .replace(/li>(?!.*<li)/g, 'li></ul>');

  return html;
}

// Copy feedback
function showCopyFeedback(button) {
  const originalText = button.textContent;
  button.textContent = '✓ Copied!';
  setTimeout(() => {
    button.textContent = originalText;
  }, 2000);
}

// Status message display
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message show ${type}`;
}

// Settings
function initializeSettings() {
  const settingsLink = document.getElementById('settingsLink');
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage?.() || chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/popup.html') });
  });
}

// Helper function to call from extraction.js (avoids duplication)
async function extractPDFText(file) {
  // Use the local PDFExtractor from pdf-lib.js
  return await PDFExtractor.extractText(file);
}

async function summarizePDF(pdfData) {
  const pages = pdfData.pages;
  const chapters = detectPDFChapters(pages);

  // Limit text to avoid API token limits - take first 20k characters
  const maxChars = 20000;
  const truncatedText = pdfData.fullText.length > maxChars 
    ? pdfData.fullText.substring(0, maxChars) + '\n\n[... Content truncated for length ...]'
    : pdfData.fullText;

  let summaryPrompt = `You are analyzing a PDF document. Provide a comprehensive summary with the following structure:

📄 DOCUMENT ANALYSIS
- Total pages: ${pdfData.totalPages}
- Detected sections: ${chapters.length}
${chapters.length > 0 ? '- Sections: ' + chapters.map(c => c.title).join(', ') : ''}

Please provide:

## Executive Summary
(2-3 sentences of the overall content)

## Key Topics & Concepts
(List main topics covered with brief explanations)

## Important Details
(Specific findings, numbers, recommendations, or critical information)

## Main Takeaways
(3-5 bullet points of what to remember)

## Suggested Next Steps
(If applicable, what to do with this information)

Format clearly with headers and bullet points for easy reading.

PDF Content:
${truncatedText}`;

  return await callGeminiAPI(summaryPrompt);
}

function detectPDFChapters(pages) {
  const chapters = [];
  let currentChapter = null;

  pages.forEach((page) => {
    const lines = page.text.split('\n');
    const firstLine = lines[0]?.trim() || '';

    if (isLikelyChapterTitle(firstLine)) {
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      currentChapter = {
        title: firstLine,
        startPage: page.pageNumber,
        endPage: page.pageNumber,
        content: page.text
      };
    } else if (currentChapter) {
      currentChapter.endPage = page.pageNumber;
      currentChapter.content += '\n\n' + page.text;
    }
  });

  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

function isLikelyChapterTitle(text) {
  if (!text || text.length > 100) return false;

  const titlePatterns = [
    /^chapter\s+\d+/i,
    /^section\s+\d+/i,
    /^part\s+\d+/i,
    /^[A-Z][^.!?]*$/,
  ];

  return titlePatterns.some(pattern => pattern.test(text));
}

async function extractYouTubeTranscript(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error('Invalid YouTube URL');

    // Attempt to fetch transcript
    const response = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
    if (response.ok) {
      const data = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const textNodes = xmlDoc.querySelectorAll('text');
      let transcript = '';
      textNodes.forEach(node => {
        transcript += node.textContent + ' ';
      });
      const cleaned = transcript.trim();
      if (cleaned.length > 100) return cleaned;
    }

    // Direct fetch may fail due to CORS. Try page-context fallback using chrome.scripting
    if (typeof chrome !== 'undefined' && chrome.scripting && chrome.tabs) {
      try {
        const videoPage = `https://www.youtube.com/watch?v=${videoId}`;
        // Open a background tab to the video (non-active when possible)
        const createdTab = await new Promise((resolve) => chrome.tabs.create({ url: videoPage, active: false }, resolve));
        const tabId = createdTab?.id;

        // Wait for the tab to finish loading
        await new Promise((resolve) => {
          const listener = (updatedTabId, changeInfo) => {
            if (updatedTabId === tabId && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              // small delay to allow any dynamic scripts to run
              setTimeout(resolve, 500);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });

        // Execute a script in the page context to fetch the timedtext (bypasses CORS)
        const execResult = await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (vId) => {
            // Try timedtext endpoint first
            const url = `https://www.youtube.com/api/timedtext?v=${vId}&lang=en`;
            return fetch(url).then(r => r.text()).then(data => {
              try {
                const p = new DOMParser();
                const xml = p.parseFromString(data, 'text/xml');
                const nodes = xml.querySelectorAll('text');
                let s = '';
                nodes.forEach(n => s += (n.textContent || '') + ' ');
                const cleaned = s.trim();
                if (cleaned && cleaned.length > 50) return cleaned;
              } catch (e) {
                // continue to DOM scraping fallback
              }
              // If timedtext empty or invalid, try scraping captions from the player DOM
              try {
                // Common caption container selectors
                const selectors = [
                  '.ytp-caption-segment',
                  '.caption-window .ytp-caption-segment',
                  '.ytp-caption-rollup',
                  '.caption-window',
                  '.ytp-caption-renderer'
                ];

                let collected = '';
                selectors.forEach(sel => {
                  document.querySelectorAll(sel).forEach(node => {
                    collected += (node.textContent || '') + ' ';
                  });
                });

                // As a last resort, try the transcript panel if it exists
                if (!collected.trim()) {
                  const transcriptPanel = document.querySelector('#transcript');
                  if (transcriptPanel) {
                    collected = transcriptPanel.innerText || '';
                  } else {
                    // Try the transcript lines used in the YouTube transcript drawer
                    const drawerItems = document.querySelectorAll('#body-text .cue');
                    drawerItems.forEach(it => collected += (it.textContent || '') + ' ');
                  }
                }

                const final = collected.trim();
                return final.length > 50 ? final : null;
              } catch (e) {
                return null;
              }
            }).catch(() => {
              // If fetch failed, try DOM scraping directly
              try {
                const selectors = ['.ytp-caption-segment', '.caption-window', '.ytp-caption-renderer'];
                let collected = '';
                selectors.forEach(sel => {
                  document.querySelectorAll(sel).forEach(node => collected += (node.textContent || '') + ' ');
                });
                return collected.trim().length > 50 ? collected.trim() : null;
              } catch (e) {
                return null;
              }
            });
          },
          args: [videoId]
        });

        // Close the created tab to avoid leaving tabs open
        try { chrome.tabs.remove(tabId); } catch (e) { /* ignore */ }

        const pageTranscript = execResult?.[0]?.result || null;
        if (pageTranscript && pageTranscript.length > 100) return pageTranscript;
      } catch (e) {
        console.error('Page-context transcript fetch failed:', e);
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting YouTube transcript:', error);
    return null;
  }
}

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function summarizeYouTubeTranscript(transcript) {
  const prompt = `Analyze this YouTube video transcript and provide:

1. A clear, structured summary with 6 key bullet points of the core ideas
2. 3 follow-up learning suggestions for deeper understanding

Format your response as:
## Key Points:
• [Point 1]
• [Point 2]
• [Point 3]
• [Point 4]
• [Point 5]
• [Point 6]

## Suggested Learning Resources:
1. [Learning suggestion 1]
2. [Learning suggestion 2]
3. [Learning suggestion 3]

Transcript:
${transcript}`;

  return await callGeminiAPI(prompt);
}

async function callGeminiAPI(prompt) {
  const apiKey = await getEnv('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please add GEMINI_API_KEY to the .env file.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'API Error');
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      const blockReason = data.promptFeedback?.blockReason;
      throw new Error(blockReason || 'No response from API');
    }

    return data.candidates[0]?.content?.parts?.[0]?.text || 'No response text found.';
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
