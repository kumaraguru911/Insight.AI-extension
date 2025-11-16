# Troubleshooting Guide

## Common Issues and Solutions

### Issue: "PDF processing error" or blank results
**Cause:** PDF file might be image-based (scanned) rather than text-based
**Solution:** 
- Try with a different PDF that has selectable text
- Check browser console for specific error message

### Issue: "Could not extract transcript" for YouTube
**Cause:** Video doesn't have publicly available captions
**Solution:**
- Use the Transcript tab instead
- Manually paste the transcript from another source

### Issue: API Error responses
**Cause:** API key might be invalid or rate limited
**Solution:**
- Check the API key in `background.js` and `extraction-ui.js`
- Ensure you have an active Gemini API key from Google AI Studio
- Check if quota is exceeded

### Issue: Styles not loading correctly
**Cause:** CSS files might not be properly linked
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Reload the extension (chrome://extensions)
- Check DevTools for CSS loading errors

### Issue: Copy/Download buttons not working
**Cause:** Browser permissions or clipboard access issue
**Solution:**
- Grant clipboard permissions if prompted
- Try downloading instead of copying
- Check browser permissions for the extension

## Debugging Steps

1. **Open Browser Console**
   - Right-click → Inspect → Console tab
   - Look for red error messages

2. **Check Extension Background**
   - Go to chrome://extensions/
   - Find Insight.AI extension
   - Click "Service Worker" link
   - View background.js console output

3. **Enable Verbose Logging**
   - Already enabled in extraction files
   - Check console.log() outputs for API calls

4. **Verify Files**
   ```powershell
   cd "c:\Users\Kumaraguru\Insight.AI-extension"
   Get-ChildItem -Include *.js, *.html, *.css, manifest.json
   ```

## File Dependencies

```
extraction.html
  ├── pdf-lib.js (must load first)
  ├── extraction.js (utility functions)
  └── extraction-ui.js (main logic)

background.js
  └── Contains API calls and storage logic

popup.html
  └── popup.js (event handlers)
```

## API Testing

To test if the API is working:

1. Open browser console
2. Run this command:
```javascript
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=AIzaSyDkDH_sjEFhrNmbLe8TnNEj_9zbEJR_kq0', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: 'Say hello' }]
    }]
  })
}).then(r => r.json()).then(console.log)
```

If successful, you'll see a response with content. If not, the API key or endpoint is wrong.

## Performance Tips

- Large PDFs (100+ pages) may take longer
- YouTube extraction depends on available captions
- API calls have rate limits - don't make too many rapid requests
- Results are displayed with typing animation - this is intentional

## Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| "API key not valid" | API key is wrong | Check manifest and extraction files |
| "Request blocked by API" | Content policy violation | Rephrase or split request |
| "No response from API" | API timeout or no response | Retry or check internet |
| "Failed to extract PDF" | PDF unreadable | Use text-based PDF, not scanned |
| "CSP violation" | External resource blocked | Ensure all files are local |

## Getting Help

Check these files for more info:
- `EXTRACTION_FEATURE.md` - Feature documentation
- `manifest.json` - Extension configuration
- Console errors - Browser DevTools console

## Reset Extension

If everything breaks:
1. chrome://extensions/
2. Click "Remove" on Insight.AI
3. Reload the extension from manifest.json
4. Clear extension data in DevTools
