import { NextRequest, NextResponse } from "next/server";
import { ResumeParser } from "@/lib/resume-parser";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("Starting resume upload process...");
    
    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Missing API configuration" }, { status: 500 });
    }
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: "Missing database configuration" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", file.name, file.size, "bytes");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Parsing resume with AI...");
    const parser = new ResumeParser();
    const profile = await parser.parseResume(buffer);
    console.log("Resume parsed successfully:", Object.keys(profile));

    // TODO: replace with authenticated user id when auth is wired
    const userId = request.headers.get("x-user-id") ?? "anonymous-user";

    console.log("Saving to database...");
    const { error: dbError } = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      resume_data: profile as Record<string, unknown>,
      skills: profile.skills ?? [],
      experience_years: profile.experience_years ?? null,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    console.log("Profile saved successfully");
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Failed to process resume", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}



