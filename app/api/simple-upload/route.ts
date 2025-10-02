import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIMPLE UPLOAD START ===");
    
    const formData = await request.formData();
    const file = formData.get("resume");
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    console.log("File received:", file.name, file.size, "bytes");
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Simple text extraction
    let text = buffer.toString('utf-8');
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
      model: process.env.OPENAI_MODEL || "grok-2-1212",
      messages: [
        {
          role: "system",
          content: "Extract name, email, skills, and experience from this resume. Return JSON only.",
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
    } catch {
      profile = { name: "Unknown", email: "Unknown", skills: [], experience: [] };
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
