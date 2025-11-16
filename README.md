# InsightAI — Smart AI Assistant for Instant Explanations

![Insight.AI Icon](icons/icon48.png)

**Release:** Version 2.0 — Updated 2025-11-16

**InsightAI** is a powerful Chrome extension that solves the problem of encountering complex or confusing text online. Instead of switching tabs to search for definitions, this tool helps you get instant understanding directly on the page. Using the **Google Gemini API**, you can select any text to receive a concise, AI-generated explanation, summary, or translation, integrating a smart assistant seamlessly into your browsing workflow.
---

## 🎥 Live Demo :

You can link a working demo video here so users can see Insight.AI in action. Replace the placeholder ID below with your demo video's YouTube ID.

Demo placeholder (replace with your video):

`DEMO_YOUTUBE_ID = LPZh9BOjkQs`

```markdown
[![Insight.AI Demo on YouTube](https://img.youtube.com/vi/DEMO_YOUTUBE_ID/maxresdefault.jpg)](https://youtu.be/DEMO_YOUTUBE_ID)
```

For quick testing, you can use the following demo URL placeholder:

https://www.youtube.com/watch?v=LPZh9BOjkQs

---

## 📝 Recent Changes & How To Test (Summary)

This project recently added a focused "Extract & Summarize" feature and several reliability and UX improvements. Use this section to quickly understand what changed and how to validate the YouTube + PDF extraction flows.

- New extraction UI and logic: `extraction.html`, `extraction.js`, `extraction-ui.js`, `extraction.css` — these files provide a dedicated interface for PDF and YouTube transcript extraction and summarization.
- Local PDF extractor: `pdf-lib.js` was added to extract text locally (no CDN). It uses a two-tier approach (primary extraction + binary/stream fallback) to handle a variety of PDF encodings.
- YouTube transcript extraction: The extension first attempts the public `timedtext` endpoint. If that fails because of CORS or missing captions, it now uses a page-context fallback (opens the video page in a background tab and runs a small script via `chrome.scripting.executeScript`) and will try to scrape visible captions from the player DOM or the transcript drawer as a last resort.
- Improved error messaging and user guidance: When auto-extraction fails, the UI clearly explains the limitation and provides a manual fallback (copy transcript from YouTube's "Show transcript" and paste it into the Transcript tab).
- Manifest & security: The manifest was updated to support local PDF processing and required permissions for executing page-context scripts (`scripting`, `tabs`, and `host_permissions` are in use). The extension uses local resources only.
- Troubleshooting guide: A dedicated guide `YOUTUBE_PDF_GUIDE.md` was added that explains common failure modes and step-by-step workarounds for YouTube and PDF extraction issues.

Quick test steps (YouTube)
- Reload the extension at `chrome://extensions/` (click **Reload**).
- Open the Extract tool in the extension and paste this demo URL: `https://www.youtube.com/watch?v=LPZh9BOjkQs`.
- Click **Extract**. The extension may open a temporary background tab (it will close automatically) while fetching captions — this is intentional for the page-context fallback.
- If auto-extract still fails, open the YouTube video, click **Show transcript**, copy all text, then paste into the extension's **Transcript** tab and click **Summarize**.

Quick test steps (PDF)
- Use the PDF tab and upload a text-based PDF (selectable text). The extractor uses `pdf-lib.js` with a fallback for encoded PDFs.
- If the PDF is a scanned image (no selectable text), the extractor will not work — use OCR tools first or copy/paste text into the Transcript tab.

Where to look for logs
- Open the extension popup or extraction UI and inspect it (right-click → Inspect) to view the Console for error messages and progress logs (helpful when debugging specific videos).


## ✨ Features

*   **Context-Aware Actions**: Right-click on selected text to:
    *   **Explain**: Get a detailed explanation of a concept or term.
    *   **Summarize**: Condense long passages into key points.
    *   **Translate**: Convert text from any language into English.
*   **Floating Tooltip**: A subtle tooltip appears on text selection for quick "Explain" actions, providing a faster workflow.
*   **AI History Sidebar**:
    *   Access a complete history of your past queries and the AI's responses.
    *   Click any history item to instantly re-display the response.
    *   Clear your entire history with a single click.
*   **Interactive Response UI**:
    *   AI responses are displayed in a sleek, draggable pop-up on the page.
    *   A "typing" effect presents the information in an engaging way.
*   **Customizable Settings**:
    *   **Theme Control**: Choose between a modern `dark` mode and a clean `light` mode for all UI elements.
    *   **Response Mode**: Adjust the AI's verbosity by choosing between `concise` and other potential modes for explanations and summaries.
*   **Smart Caching**: Repeated queries are served from a local cache to provide instant responses and reduce API usage.

---

## 🛠️ Tech Stack

*   **Core Logic**: JavaScript (ES6+)
*   **Platform**: Chrome Extension APIs (Manifest V3)
*   **AI Provider**: Google Gemini API (`generativelanguage.googleapis.com`)
*   **Styling**: HTML5 & CSS3

---
## 🧠 Core API Capabilities

This project leverages the versatile **Google Gemini API** to perform several key tasks by sending different prompts for each feature:

*   **📄 Summarizer API**: Distills complex information into clear insights when you use the "Summarize" feature.
*   **🌐 Translator API**: Adds multilingual capabilities by translating selected text into your preferred language (English by default).
*   **✏️ Writer API**: Creates original and engaging text to provide detailed or simple explanations for selected concepts.

---

## 🚀 Getting Started

Follow these steps to install and run the extension locally.

### Prerequisites

*   Google Chrome
*   A Google Gemini API Key. You can get one from Google AI Studio.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/kumaraguru911/insight-ai-extension.git
    cd insight-ai-extension
    ```

2.  **Add Your API Key:**
    *   Open the `background.js` file.
    *   Find the line:
        ```javascript
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=YOUR_API_KEY`;
        ```
    *   Replace `YOUR_API_KEY` with your actual Gemini API key.
    *   **Note**: This is the most important step for the extension to work.

3.  **Load the Extension in Chrome:**
    *   Open Chrome and navigate to `chrome://extensions`.
    *   Enable "Developer mode" using the toggle in the top-right corner.
    *   Click the "Load unpacked" button.
    *   Select the `insight-ai-extension` directory that you cloned.

The Insight.AI icon should now appear in your Chrome toolbar!

---

## 💡 How to Use

1.  **Using the Context Menu**:
    *   Highlight any text on a webpage.
    *   Right-click to open the context menu.
    *   Navigate to the "AI:" sub-menu and choose "Explain," "Summarize," or "Translate."

2.  **Using the Tooltip**:
    *   Highlight text on a page.
    *   A small "Ask Insight.AI" tooltip will appear above your selection.
    *   Click the tooltip to get an explanation of the text.

3.  **Viewing History**:
    *   Right-click anywhere on a page (or on the extension icon).
    *   Select "Show AI History" to open the history sidebar.

4.  **Changing Settings**:
    *   Click the Insight.AI icon in your Chrome toolbar.
    *   In the popup, you can change the AI Response Mode and toggle between Dark/Light themes.
    *   Click "Save Settings" to apply your changes.

---

## 📂 Project Structure

*   `background.js`: The service worker. Handles API calls, context menu logic, and message passing.
*   `popup.html` / `popup.js` / `style.css`: Files for the extension's main settings popup.
*   `content.css`: Styles for the on-page AI response pop-up.
*   `history_content_script.js` / `history.css`: The logic and styling for the history sidebar injected into pages.
*   `tooltip_content_script.js`: Manages the appearance and functionality of the floating tooltip on text selection.
*   `manifest.json`: The core configuration file for the Chrome extension.
*   `icons/`: Contains all the necessary icons for the extension.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---