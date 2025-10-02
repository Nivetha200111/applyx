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
    
    // Simple AI parsing
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are a resume parser. Extract comprehensive information from this resume text and return ONLY valid JSON with these exact keys: name, email, phone, location, skills (array), experience (array of {company, role, duration, description}), education (array), desired_roles (array), experience_years (number), salary_preference (object with min/max). Example: {\"name\": \"Nivetha Sivakumar\", \"email\": \"nivetha@email.com\", \"phone\": \"+1234567890\", \"location\": \"City, State\", \"skills\": [\"JavaScript\", \"React\", \"Node.js\"], \"experience\": [{\"company\": \"Tech Corp\", \"role\": \"Software Engineer\", \"duration\": \"2 years\", \"description\": \"Developed web applications\"}], \"education\": [\"Bachelor's in Computer Science\"], \"desired_roles\": [\"Software Engineer\", \"Full Stack Developer\"], \"experience_years\": 3, \"salary_preference\": {\"min\": 80000, \"max\": 120000}}",
        },
        { role: "user", content: text },
      ],
      max_tokens: 1000,
    });
    
    const result = response.choices[0]?.message?.content || "{}";
    console.log("AI response:", result);
    
    // Parse JSON
    let profile;
    try {
      profile = JSON.parse(result);
    } catch (parseError) {
      console.log("JSON parse error:", parseError);
      console.log("Raw AI response:", result);
      
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          profile = JSON.parse(jsonMatch[0]);
        } catch {
          profile = { name: "Unknown", email: "Unknown", skills: [], experience_years: 0 };
        }
      } else {
        profile = { name: "Unknown", email: "Unknown", skills: [], experience_years: 0 };
      }
    }
    
    console.log("=== SIMPLE UPLOAD SUCCESS ===");
    return NextResponse.json({ 
      success: true, 
      profile,
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
