import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIMPLE UPLOAD START ===");
    
    let buffer: Buffer;
    let filename: string;
    let fileType: string;
    
    // Check if request is JSON (from Chrome extension) or FormData (from web)
    const contentType = request.headers.get('content-type');
    console.log("Content-Type:", contentType);
    
    if (contentType?.includes('application/json')) {
      // Handle JSON request from Chrome extension
      const jsonData = await request.json();
      console.log("JSON request received:", { filename: jsonData.filename, type: jsonData.type });
      
      if (!jsonData.content) {
        return NextResponse.json({ error: "No file content provided" }, { status: 400 });
      }
      
      filename = jsonData.filename || 'unknown.pdf';
      fileType = jsonData.type || 'application/pdf';
      
      // Convert base64 to buffer
      const base64Data = jsonData.content.includes(',') ? jsonData.content.split(',')[1] : jsonData.content;
      buffer = Buffer.from(base64Data, 'base64');
      
      console.log("File received from extension:", filename, buffer.length, "bytes");
    } else {
      // Handle FormData request from web
      const formData = await request.formData();
      const file = formData.get("resume");
      
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      
      filename = file.name;
      fileType = file.type;
      
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      
      console.log("File received from web:", filename, buffer.length, "bytes");
    }
    
    // Extract text from buffer
    let text: string;
    
    if (fileType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      // PDF text extraction
      const pdfText = buffer.toString('utf-8');
      const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
      if (textMatches) {
        text = textMatches
          .map(match => match.replace(/BT\s+/, '').replace(/ET/, ''))
          .join(' ')
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        text = pdfText
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000);
      }
      
      if (!text || text.length < 50) {
        text = 'PDF content extracted but may be incomplete.';
      }
    } else {
      // Regular text extraction
      text = buffer.toString('utf-8');
    }
    
    if (text.length > 10000) {
      text = text.substring(0, 10000) + "...";
    }
    
    console.log("Text extracted:", text.substring(0, 200) + "...");
    
    // Heuristic extraction (no AI)
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const joined = text;

    const emailMatch = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = joined.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/);

    // Name: look for explicit label or first non-empty line before email
    let name: string | undefined;
    const labeledName = joined.match(/\bname\s*[:|-]\s*([^\n\r]+)/i);
    if (labeledName) {
      name = labeledName[1].trim();
    } else if (emailMatch) {
      const emailLineIdx = lines.findIndex((l) => l.includes(emailMatch[0]));
      if (emailLineIdx > 0) {
        // pick a preceding line that looks like a person name (<= 5 words, letters)
        for (let i = emailLineIdx - 1; i >= Math.max(0, emailLineIdx - 3); i--) {
          const candidate = lines[i];
          if (/^[A-Za-z][A-Za-z .'-]{1,60}$/.test(candidate) && candidate.split(/\s+/).length <= 5) {
            name = candidate;
            break;
          }
        }
      }
    }

    // Experience years
    let experience_years = 0;
    const yearsPatterns = [
      /(experience|exp|overall experience|total experience)\s*[:\-]?\s*(\d{1,2})\+?\s*(years?|yrs?)/i,
      /\b(\d{1,2})\+?\s*(years?|yrs?)\b/i,
    ];
    for (const re of yearsPatterns) {
      const m = joined.match(re);
      if (m) {
        const num = Number(m[2] ?? m[1]);
        if (!Number.isNaN(num)) {
          experience_years = num;
          break;
        }
      }
    }

    console.log("=== SIMPLE UPLOAD SUCCESS ===");
    return NextResponse.json({
      success: true,
      profile: {
        name,
        email: emailMatch?.[0],
        phone: phoneMatch?.[0],
        location: undefined,
        skills: [],
        experience: [],
        education: [],
        desired_roles: [],
        experience_years,
        preview: text.substring(0, 500),
      },
      textPreview: text.substring(0, 200),
    });

  } catch (error) {
    console.error("=== SIMPLE UPLOAD ERROR ===");
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "Simple upload failed", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
