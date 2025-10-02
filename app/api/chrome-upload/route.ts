import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHROME UPLOAD START ===");
    
    const jsonData = await request.json();
    console.log("Chrome extension request received:", { 
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
    
    console.log("File received from Chrome extension:", filename, buffer.length, "bytes");
    
    // Extract text from buffer
    let text: string;
    
    if (fileType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      // PDF text extraction
      const pdfText = buffer.toString('utf-8');
      console.log("PDF text length:", pdfText.length);
      
      const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
      if (textMatches) {
        text = textMatches
          .map(match => match.replace(/BT\s+/, '').replace(/ET/, ''))
          .join(' ')
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        console.log("Extracted text from PDF objects:", text.length);
      } else {
        text = pdfText
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 5000);
        console.log("Fallback text extraction:", text.length);
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
    
    console.log("Final text preview:", text.substring(0, 200) + "...");
    
    // AI parsing
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const model = process.env.OPENAI_MODEL || "grok-2-1212";
    console.log("Using AI model:", model);

    const response = await openai.chat.completions.create({
      model,
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
          profile = { 
            name: "Unknown", 
            email: "Unknown", 
            phone: "Unknown",
            location: "Unknown",
            skills: [], 
            experience: [],
            education: [],
            desired_roles: [],
            experience_years: 0,
            salary_preference: { min: 0, max: 0 }
          };
        }
      } else {
        profile = { 
          name: "Unknown", 
          email: "Unknown", 
          phone: "Unknown",
          location: "Unknown",
          skills: [], 
          experience: [],
          education: [],
          desired_roles: [],
          experience_years: 0,
          salary_preference: { min: 0, max: 0 }
        };
      }
    }
    
    console.log("Final profile:", profile);
    console.log("=== CHROME UPLOAD SUCCESS ===");
    
    return NextResponse.json({ 
      success: true, 
      profile,
      textPreview: text.substring(0, 200),
    });

  } catch (error: any) {
    console.error("=== CHROME UPLOAD ERROR ===");
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "Chrome upload failed", 
      details: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
