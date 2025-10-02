import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const envCheck = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing",
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ? "✅ Set" : "❌ Missing",
      OPENAI_MODEL: process.env.OPENAI_MODEL ? "✅ Set" : "❌ Missing",
      SUPABASE_URL: process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
    };

    // Test OpenAI connection
    let openaiTest = "❌ Not tested";
    try {
      const { OpenAI } = await import("openai");
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      });
      
      const response = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "grok-2-1212",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      });
      
      openaiTest = `✅ Working - Response: ${response.choices[0]?.message?.content}`;
    } catch (error) {
      openaiTest = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Test Supabase connection
    let supabaseTest = "❌ Not tested";
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_KEY as string
      );
      
      const { data, error } = await supabase.from("profiles").select("count").limit(1);
      supabaseTest = error ? `❌ Error: ${error.message}` : "✅ Working";
    } catch (error) {
      supabaseTest = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    return NextResponse.json({
      environment: envCheck,
      openai: openaiTest,
      supabase: supabaseTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
