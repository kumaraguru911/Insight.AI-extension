// pdf-lib.js - Local PDF.js wrapper
// This file handles PDF extraction locally without external CDN dependencies

class PDFExtractor {
  static async extractText(file) {
    const arrayBuffer = await file.arrayBuffer();
    return PDFExtractor.parsePDF(arrayBuffer);
  }

  static parsePDF(arrayBuffer) {
    return new Promise((resolve, reject) => {
      try {
        const view = new Uint8Array(arrayBuffer);

        // Extract text from PDF
        const text = PDFExtractor.decodeBuffer(view);

        // If we got minimal text, try alternative extraction
        if (text.trim().length < 50) {
          console.warn("Limited text extracted, attempting alternative method");
          const altText = PDFExtractor.extractFromBinaryStream(view);
          if (altText.trim().length > text.trim().length) {
            const extractedPages = PDFExtractor.splitPages(altText);
            resolve({
              fullText: extractedPages.join("\n\n"),
              pages: extractedPages.map((pageText, index) => ({
                pageNumber: index + 1,
                text: pageText.trim(),
              })),
              totalPages: extractedPages.length,
            });
            return;
          }
        }

        const extractedPages = PDFExtractor.splitPages(text);

        resolve({
          fullText: extractedPages.join("\n\n"),
          pages: extractedPages.map((pageText, index) => ({
            pageNumber: index + 1,
            text: pageText.trim(),
          })),
          totalPages: extractedPages.length,
        });
      } catch (error) {
        reject(new Error("Failed to parse PDF: " + error.message));
      }
    });
  }

  static decodeBuffer(view) {
    // Convert bytes to string with better handling for binary content
    let text = "";
    for (let i = 0; i < view.length; i++) {
      const byte = view[i];
      if (byte >= 32 && byte <= 126) {
        text += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) {
        text += "\n";
      } else if (byte === 9) {
        text += " ";
      }
    }

    // Extract all text content from PDF
    // Look for text in various PDF structures
    let allText = "";

    // Method 1: Extract text between parentheses (TJ arrays)
    const textRegex = /\(([^)]*)\)/g;
    let match;
    while ((match = textRegex.exec(text)) !== null) {
      let extracted = match[1];
      // Decode escape sequences
      extracted = extracted
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\");
      allText += extracted + " ";
    }

    // Method 2: Extract text between BT and ET operators
    const btRegex = /BT([\s\S]*?)ET/g;
    while ((match = btRegex.exec(text)) !== null) {
      let btContent = match[1];
      // Extract strings from Tj and TJ operations
      const stringMatch = btContent.match(/\(([^)]*)\)/g);
      if (stringMatch) {
        stringMatch.forEach((s) => {
          let decoded = s.slice(1, -1);
          decoded = decoded
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\\(/g, "(")
            .replace(/\\\)/g, ")");
          allText += decoded + " ";
        });
      }
    }

    // Clean up extracted text
    allText = allText
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return allText || text;
  }

  static splitPages(text) {
    // Split by common page indicators
    const pageDelimiters = [
      /\f/g, // Form feed
      /%%Page:/g, // PDF page marker
      /showpage/g, // PostScript page indicator
    ];

    let pages = [text];
    pageDelimiters.forEach((delimiter) => {
      pages = pages.flatMap((page) => page.split(delimiter));
    });

    return pages.filter((page) => page.trim().length > 0);
  }

  static extractFromBinaryStream(view) {
    // Alternative extraction method for binary PDF streams
    let result = "";
    let inStream = false;
    let streamContent = "";

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const decodedText = decoder.decode(view);

    // Look for stream content
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;
    while ((match = streamRegex.exec(decodedText)) !== null) {
      streamContent += match[1] + " ";
    }

    // Try to extract from FlateDecode streams
    if (streamContent.length > 0) {
      result = PDFExtractor.cleanTextContent(streamContent);
    }

    // Fallback: extract any readable text with decent length
    if (result.length < 50) {
      result = decodedText
        .split("\n")
        .filter((line) => line.length > 10 && /[a-zA-Z]/.test(line))
        .join("\n");
    }

    return result;
  }

  static cleanTextContent(text) {
    // Remove null bytes and control characters
    let cleaned = text
      .replace(/\x00/g, "")
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
      .replace(/\\/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    return cleaned;
  }

  static getPageCount(arrayBuffer) {
    const view = new Uint8Array(arrayBuffer);
    const text = PDFExtractor.decodeBuffer(view);
    return PDFExtractor.splitPages(text).length;
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = PDFExtractor;
}
