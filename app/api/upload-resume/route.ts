import { NextRequest, NextResponse } from "next/server";
import { ResumeParser } from "@/lib/resume-parser";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parser = new ResumeParser();
    const profile = await parser.parseResume(buffer);

    // TODO: replace with authenticated user id when auth is wired
    const userId = request.headers.get("x-user-id") ?? "anonymous-user";

    await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      resume_data: profile as any,
      skills: profile.skills ?? [],
      experience_years: profile.experience_years ?? null,
    });

    // In free setup, we do not enqueue. GitHub Actions periodic job will scrape.

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}



