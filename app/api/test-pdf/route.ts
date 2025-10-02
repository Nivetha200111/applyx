import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== PDF TEST START ===");
    
    const jsonData = await request.json();
    console.log("Test request received:", { 
      filename: jsonData.filename, 
      type: jsonData.type,
      contentLength: jsonData.content?.length 
    });
    
    if (!jsonData.content) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }
    
    const filename = jsonData.filename || 'unknown.pdf';
    const fileType = jsonData.type || 'application/pdf';
    
    // Convert base64 to buffer
    const base64Data = jsonData.content.includes(',') ? jsonData.content.split(',')[1] : jsonData.content;
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log("File received:", filename, buffer.length, "bytes");
    
    // Extract text from buffer using multiple methods
    const pdfText = buffer.toString('utf-8');
    console.log("PDF text length:", pdfText.length);
    
    // Method 1: Look for readable text patterns
    const readableText = pdfText.match(/[A-Za-z]{3,}/g);
    console.log("Readable words found:", readableText ? readableText.length : 0);
    
    // Method 2: Extract text between common PDF markers
    const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
    console.log("BT/ET matches found:", textMatches ? textMatches.length : 0);
    
    // Method 3: Look for stream content
    const streamMatches = pdfText.match(/stream\s+([^e]+)endstream/g);
    console.log("Stream matches found:", streamMatches ? streamMatches.length : 0);
    
    // Method 4: Extract any ASCII text
    const asciiText = pdfText
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.log("ASCII text length:", asciiText.length);
    
    // Method 5: Look for specific resume keywords
    const keywords = ['resume', 'cv', 'experience', 'education', 'skills', 'contact', 'email', 'phone', 'name'];
    const foundKeywords = keywords.filter(keyword => 
      pdfText.toLowerCase().includes(keyword.toLowerCase())
    );
    console.log("Keywords found:", foundKeywords);
    
    // Get a sample of the raw text
    const sampleText = pdfText.substring(0, 1000);
    console.log("Sample text:", sampleText);
    
    return NextResponse.json({
      success: true,
      debug: {
        filename,
        fileType,
        bufferSize: buffer.length,
        pdfTextLength: pdfText.length,
        readableWords: readableText ? readableText.length : 0,
        btEtMatches: textMatches ? textMatches.length : 0,
        streamMatches: streamMatches ? streamMatches.length : 0,
        asciiTextLength: asciiText.length,
        foundKeywords,
        sampleText: sampleText.substring(0, 500),
        asciiSample: asciiText.substring(0, 500)
      }
    });

  } catch (error: any) {
    console.error("=== PDF TEST ERROR ===");
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "PDF test failed", 
      details: error.message,
    }, { status: 500 });
  }
}
