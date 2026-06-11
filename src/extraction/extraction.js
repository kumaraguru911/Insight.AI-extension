// extraction.js - Utility functions for PDF and YouTube extraction
// Main functionality is in extraction-ui.js

// Extract YouTube transcript
// NOTE: Direct YouTube API has CORS restrictions from extensions
// Recommended: Users should manually copy transcript from YouTube
async function extractYouTubeTranscript(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return null;

    // Try multiple transcript endpoints
    const endpoints = [
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
      `https://www.youtube.com/api/timedtext?v=${videoId}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          }
        });
        
        if (response.ok) {
          const data = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const textNodes = xmlDoc.querySelectorAll('text');
          
          if (textNodes.length > 0) {
            let transcript = '';
            textNodes.forEach(node => {
              transcript += node.textContent + ' ';
            });
            const cleaned = transcript.trim();
            if (cleaned.length > 100) {
              console.log('YouTube transcript extracted successfully');
              return cleaned;
            }
          }
        }
      } catch (e) {
        console.log('Endpoint failed, trying next:', e.message);
      }
    }

    // If we get here, no transcript was found
    console.warn('Could not extract YouTube transcript - CORS or no captions available');
    return null;
  } catch (error) {
    console.error('Error extracting YouTube transcript:', error);
    return null;
  }
}

// Extract video ID from various YouTube URL formats
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

// Detect PDF chapters/sections based on text structure
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

// Check if text is likely a chapter title
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

