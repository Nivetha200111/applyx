import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { filename, content, type } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }

    console.log("PDF Parse: Starting...");
    console.log("PDF Parse: Filename:", filename);
    console.log("PDF Parse: Type:", type);
    console.log("PDF Parse: Content length:", content.length);

    // Convert base64 to buffer
    const base64Data = content.includes(',') ? content.split(',')[1] : content;
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log("PDF Parse: Buffer size:", buffer.length);

    // Extract text from PDF buffer
    let text: string;
    try {
      // Check if it's a PDF by looking at the header
      const isPDF = buffer.toString('ascii', 0, 4) === '%PDF';
      console.log("PDF Parse: Is PDF:", isPDF);

      if (isPDF) {
        // For PDFs, extract readable text
        const pdfText = buffer.toString('utf-8');
        console.log("PDF Parse: PDF text length:", pdfText.length);
        
        // Extract text between PDF objects
        const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
        if (textMatches) {
          text = textMatches
            .map(match => match.replace(/BT\s+/, '').replace(/ET/, ''))
            .join(' ')
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          console.log("PDF Parse: Extracted text length:", text.length);
        } else {
          // Fallback: extract any readable text
          text = pdfText
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000); // Limit size
          console.log("PDF Parse: Fallback text length:", text.length);
        }

        if (!text || text.length < 50) {
          text = 'PDF content extracted but may be incomplete. Please provide a text version for better parsing.';
        }
      } else {
        // For non-PDF files, use as-is
        text = buffer.toString('utf-8');
        console.log("PDF Parse: Non-PDF text length:", text.length);
      }
    } catch (error) {
      console.error('PDF Parse: File parsing error:', error);
      text = 'Unable to parse file content';
    }

    console.log("PDF Parse: Final text preview:", text.substring(0, 200));

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const model = process.env.OPENAI_MODEL || "grok-2-1212";
    console.log("PDF Parse: Using model:", model);

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
    console.log("PDF Parse: AI response:", result);

    // Parse JSON
    let profile;
    try {
      profile = JSON.parse(result);
    } catch (parseError) {
      console.log("PDF Parse: JSON parse error:", parseError);
      console.log("PDF Parse: Raw AI response:", result);

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

    console.log("PDF Parse: Final profile:", profile);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("PDF Parse: Error during processing:", error);
    return NextResponse.json({
      error: "Failed to process PDF resume",
      details: error.message,
    }, { status: 500 });
  }
}
