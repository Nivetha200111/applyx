import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEXT PARSING START ===");
    
    const body = await request.json();
    const { text, filename } = body;
    
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }
    
    console.log("Text received:", text.substring(0, 200) + "...");
    
    // Simple AI parsing
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "You are a resume parser. Extract information from this resume text and return ONLY valid JSON with these exact keys: name, email, skills (array), experience_years (number). Example: {\"name\": \"John Doe\", \"email\": \"john@email.com\", \"skills\": [\"JavaScript\", \"React\"], \"experience_years\": 5}",
        },
        { role: "user", content: text },
      ],
      max_tokens: 500,
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
    
    console.log("=== TEXT PARSING SUCCESS ===");
    return NextResponse.json({ 
      success: true, 
      profile,
      textPreview: text.substring(0, 200),
    });

  } catch (error) {
    console.error("=== TEXT PARSING ERROR ===");
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "Text parsing failed", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
