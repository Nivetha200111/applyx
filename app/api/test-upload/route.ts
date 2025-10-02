import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("=== TEST UPLOAD START ===");
    
    // Step 1: Check environment variables
    console.log("Checking environment variables...");
    const envVars = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: !!process.env.OPENAI_BASE_URL,
      OPENAI_MODEL: !!process.env.OPENAI_MODEL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
    };
    console.log("Environment variables:", envVars);

    // Step 2: Test file upload
    console.log("Testing file upload...");
    const formData = await request.formData();
    const file = formData.get("resume");
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    console.log("File received:", file.name, file.size, "bytes");

    // Step 3: Test OpenAI connection
    console.log("Testing OpenAI connection...");
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });

    const testResponse = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-2-1212",
      messages: [{ role: "user", content: "Say 'test successful'" }],
      max_tokens: 10,
    });
    
    console.log("OpenAI test successful:", testResponse.choices[0]?.message?.content);

    // Step 4: Test Supabase connection
    console.log("Testing Supabase connection...");
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_KEY as string
    );

    const { data, error } = await supabase.from("profiles").select("count").limit(1);
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Supabase connection failed", details: error.message }, { status: 500 });
    }
    
    console.log("Supabase test successful");

    console.log("=== TEST UPLOAD SUCCESS ===");
    return NextResponse.json({ 
      success: true, 
      message: "All tests passed",
      envVars,
      openaiResponse: testResponse.choices[0]?.message?.content,
    });

  } catch (error) {
    console.error("=== TEST UPLOAD ERROR ===");
    console.error("Error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
