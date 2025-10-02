import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // In a real system, push search task into queue or trigger scraper
    // Here we simply acknowledge receipt
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ error: "Failed to start job search" }, { status: 500 });
  }
}


