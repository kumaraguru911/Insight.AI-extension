# YouTube & PDF Issues - Resolution Guide

## Issue 1: YouTube Transcript Extraction Not Working

### Why It Happens
YouTube's transcript/caption API has **CORS (Cross-Origin Request Sharing) restrictions** that prevent Chrome extensions from directly fetching transcripts. This is a security limitation of web browsers, not a bug in the extension.

### How to Use Properly ✅

**Method 1: Manual Copy (RECOMMENDED)**
1. Open the YouTube video in your browser
2. Click the **three dots** menu below the video
3. Select **"Show transcript"**
4. The transcript panel opens on the right
5. **Select and copy** all the text (Ctrl+A, Ctrl+C)
6. Go back to extension → **Transcript tab**
7. **Paste** the transcript (Ctrl+V)
8. Click **"Summarize"**

**Method 2: Using Transcript Tab**
```
YouTube URL → Can't auto-extract?
         ↓
1. Copy transcript manually from YouTube
2. Use Transcript Tab instead
3. Paste and summarize
```

### What Videos Support Auto-Extraction?
- Only videos with **closed captions enabled** by creator
- Some older videos may not have captions
- YouTube Shorts usually don't have captions
- Some channels disable caption downloads

### Error Messages & Solutions

| Message | Solution |
|---------|----------|
| "Auto-extraction unavailable" | Use Manual Copy method above |
| "No response from API" | Video may not have captions |
| "CORS error" | Expected limitation - use Manual method |

---

## Issue 2: PDF Not Summarized Properly

### Possible Causes & Solutions

#### Cause 1: Scanned Image PDF ❌
**What is it?** PDF that's just photos of pages (not actual text)
**Symptoms:** Extraction shows very little or no text
**Solution:** 
- PDFs must have **selectable text**
- Try copying text with Ctrl+C from the PDF - if it works, it's text-based
- Scanned PDFs need OCR (Optical Character Recognition) - not supported in this extension

#### Cause 2: Protected/Encrypted PDF ❌
**What is it?** PDF with restrictions
**Symptoms:** Error during extraction
**Solution:**
- Remove PDF protection (use online tools or desktop PDF software)
- Check if you have permission to extract text

#### Cause 3: Complex PDF Layout ⚠️
**What is it?** Multi-column, unusual formatting, images mixed with text
**Symptoms:** Text extracted but doesn't make sense, summary is poor quality
**Solution:**
- Extract manual: Open PDF → Select text → Copy
- Then use **Transcript Tab** to paste and summarize

#### Cause 4: Very Large PDF 📄
**What is it?** PDF with 100+ pages or very large file size
**Symptoms:** Takes very long, or incomplete summary
**Solution:**
- Split the PDF into smaller sections
- Summarize each section separately
- Combine summaries manually

### How to Check if Your PDF Works

1. **Test Text Selection**
   - Open PDF in any reader
   - Try to select text with mouse
   - If you CAN select text → PDF should work
   - If you CANNOT select text → It's a scanned image

2. **Test with Extension**
   - Upload PDF
   - If extraction shows lots of text → PDF is compatible
   - If extraction shows little/no text → PDF is image-based or protected

### Better Summarization Tips ✅

**For Best Results:**
1. Use **text-based PDFs** (not scanned)
2. Keep PDFs under **100 pages** if possible
3. Use **standard format** (not complex layouts)
4. Ensure **readable text** (not corrupted fonts)

**If PDF Still Doesn't Summarize Well:**
1. Extract the text manually from PDF
2. Paste it in **Transcript Tab**
3. Let AI summarize from clean text

---

## PDF Extraction Process Explained

### What the Extension Does

```
1. Upload PDF
   ↓
2. Extract all text content
   ↓
3. Detect chapters/sections
   ↓
4. Send to AI for summarization
   ↓
5. Return formatted summary
```

### File Size Limits
- **Text sent to API:** First 20,000 characters
- **Large PDFs:** Summary based on first ~7,000 words
- For longer PDFs: Extract first sections, then later sections separately

### Supported PDF Types
✅ **Text-based PDFs** (normal documents)
✅ **PDFs with selectable text** (reports, eBooks)
✅ **Standard layouts** (single column)

❌ **Scanned PDFs** (image files)
❌ **Protected PDFs** (password encrypted)
❌ **Very complex layouts** (magazines, designs)

---

## Recommended Workflow

### For YouTube Videos
```
Want to summarize YouTube video?
     ↓
Yes, has captions? → Try YouTube Tab
     ↓
No, or failed?     → Manual Copy Method
     ↓
Copy from YouTube  → Paste in Transcript Tab
     ↓
Click Summarize    → Get results
```

### For PDFs
```
Have a PDF to summarize?
     ↓
Upload to PDF Tab
     ↓
Extraction works?   → Success! ✅
     ↓
No text extracted?  → Check if text-based
     ↓
Still having issues?→ Use Transcript Tab
                      (Extract text from PDF → Paste → Summarize)
```

---

## Technical Notes

### Why YouTube Extraction Fails
- Browser security (CORS policy)
- Extension sandboxing
- YouTube API restrictions
- Not a limitation of the extension, but of browser security

### Why Some PDFs Don't Extract Text
- PDF format variations (encrypted, compressed)
- Text encoding issues
- Scanned image PDFs without OCR
- Unusual formatting that breaks parsing

### How to Fix PDF Issues
- Use a proper text-based PDF
- Or manually extract text and use Transcript tab
- Or use desktop PDF reader to extract text first

---

## Feature Comparison

| Feature | Auto Works | Manual Method | Notes |
|---------|-----------|---------------|-------|
| YouTube with Captions | ✅ Sometimes | ✅ Always | Depends on CORS, use manual |
| YouTube Manual Paste | - | ✅ Always | Copy transcript → Paste |
| Text-Based PDFs | ✅ Works | ✅ Works | Best results |
| Scanned PDFs | ❌ No | ✅ Extract manually | Need OCR first |
| Protected PDFs | ❌ No | ❌ No | Requires unprotecting |
| Any Text/Transcript | - | ✅ Works | Best for guaranteed results |

---

## Best Practices ✅

### For YouTube
- ✅ Always have manual copy option as backup
- ✅ Use Transcript tab when auto-extract fails
- ✅ Ensure video has captions enabled

### For PDFs
- ✅ Use text-based PDFs (not scanned)
- ✅ Test text selection before uploading
- ✅ Split very large PDFs
- ✅ Fall back to manual text extraction if needed

### For Best Summaries
- ✅ Use clean, readable content
- ✅ Provide sufficient text (100+ characters minimum)
- ✅ Use Transcript tab for manually extracted content

---

## Quick Checklist

Before reporting issues, verify:

- [ ] PDF has **selectable text** (can copy text from it)
- [ ] YouTube video **has captions** (shows "CC" button)
- [ ] Content is in **English** (primarily supported)
- [ ] Internet connection is **working**
- [ ] API key is **valid** (check console for errors)
- [ ] Tried **manual methods** (copy → paste → summarize)

---

## Support

**Still having issues?**

1. Check browser **Console (F12)** for error messages
2. Look for **detailed error messages** in the extension
3. Try **alternative methods** (manual copy/paste)
4. Verify **file/content quality** first

**Error in Console?** Check:
- API key is correct
- File is not corrupted
- Content has enough text (50+ words minimum)

---

**Updated:** November 16, 2025
**Status:** Improved error handling and user guidance
