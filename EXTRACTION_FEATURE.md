# Extract & Summarize Feature

The Extract & Summarize feature is a powerful addition to Insight.AI that allows you to process PDFs, YouTube videos, and text transcripts with AI-powered summarization.

## Features

### 📄 PDF Extraction & Summarization
- Upload PDF files and automatically extract all text
- Intelligent chapter/section detection
- Generate clean, simplified overviews of PDF content
- Displays:
  - Executive summary of main topics
  - Key concepts organized by section
  - Main takeaways and important details
  - Page count and detected sections

### 🎥 YouTube Video Summarization
- Extract transcripts from YouTube videos (when available)
- Generate 6 key bullet points of core ideas
- Provide 3 follow-up learning suggestions
- Supports various YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`

### 📝 Text/Transcript Summarization
- Paste any text, article, or transcript
- AI-powered summarization with:
  - 6 key bullet points
  - 3 learning resource suggestions
- Perfect for conference talks, articles, or documents

## How to Use

### Opening the Tool
1. **From Popup**: Click the extension icon → "📄 Extract & Summarize" button
2. **Context Menu**: Right-click anywhere → "Extract & Summarize"
3. **Keyboard Shortcut**: `Ctrl+Shift+E` (when configured)

### Extracting PDFs
1. Click the **PDF** tab
2. Drag and drop your PDF or click to select
3. Wait for extraction and summarization
4. Review results in the popup panel

### Summarizing YouTube Videos
1. Click the **YouTube** tab
2. Paste a YouTube URL
3. Click "Extract & Summarize"
4. Results display with key points and learning suggestions

### Summarizing Text
1. Click the **Transcript** tab
2. Paste your text (minimum 100 characters)
3. Click "Summarize"
4. Review formatted summary with bullet points

## Results Panel

After processing, a results panel appears with:
- **📋 Copy Button**: Copy summary to clipboard
- **💾 Download Button**: Save as `.txt` file
- **✕ Close Button**: Dismiss the panel

## Technical Details

### API Requirements
- Uses **Gemini 2.0 Flash** API for summarization
- API key must be configured in extension settings
- Processes content on-demand without storing data permanently

### PDF Processing
- Uses PDF.js library for text extraction
- Automatically detects chapters and sections
- Handles multi-page documents efficiently

### YouTube Processing
- Attempts to fetch available captions/transcripts
- Falls back to manual paste if auto-extraction fails
- Supports multiple YouTube URL formats

## Performance Notes
- Large PDFs (100+ pages) may take longer to process
- Summarization quality depends on source material
- Minimum 100 characters required for text summarization

## Privacy
- PDFs and transcripts are sent to Gemini API for summarization
- Content is not stored permanently
- Results are cached locally in your browser

## Troubleshooting

**YouTube transcript not found?**
- Some videos don't have publicly available transcripts
- Use the Transcript tab and paste the transcript manually

**PDF extraction failed?**
- Ensure the PDF contains selectable text (not a scanned image)
- Try a smaller PDF first to test functionality

**Summarization seems incomplete?**
- Increase response mode to "Detailed" in settings
- Large documents may need multiple passes

## Future Enhancements
- Audio file transcription
- Multi-language support
- Custom summarization templates
- Batch processing for multiple files
