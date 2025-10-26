# InsightAI — Smart AI Assistant for Instant Explanations

![Insight.AI Icon](icons/icon48.png)

**InsightAI** is a powerful Chrome extension that solves the problem of encountering complex or confusing text online. Instead of switching tabs to search for definitions, this tool helps you get instant understanding directly on the page. Using the **Google Gemini API**, you can select any text to receive a concise, AI-generated explanation, summary, or translation, integrating a smart assistant seamlessly into your browsing workflow.
---

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