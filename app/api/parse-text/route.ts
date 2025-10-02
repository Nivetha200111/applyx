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
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are a resume parser. Extract REAL information from this resume text. Do NOT use placeholder data like 'Unknown' or 'John Doe'. If you cannot find specific information, use empty strings or empty arrays. Return ONLY valid JSON with these exact keys: name, email, phone, location, skills (array), experience (array of {company, role, duration, description}), education (array), desired_roles (array), experience_years (number), salary_preference (object with min/max). Example: {\"name\": \"Nivetha Sivakumar\", \"email\": \"nivetha@email.com\", \"phone\": \"+1234567890\", \"location\": \"City, State\", \"skills\": [\"JavaScript\", \"React\", \"Node.js\"], \"experience\": [{\"company\": \"Tech Corp\", \"role\": \"Software Engineer\", \"duration\": \"2 years\", \"description\": \"Developed web applications\"}], \"education\": [\"Bachelor's in Computer Science\"], \"desired_roles\": [\"Software Engineer\", \"Full Stack Developer\"], \"experience_years\": 3, \"salary_preference\": {\"min\": 80000, \"max\": 120000}}",
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
