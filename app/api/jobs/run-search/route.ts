import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId, searchQuery } = await request.json();

    // Minimal stub: in a real implementation, call scraper logic or a worker
    const jobs = [
      {
        id: "demo-job-1",
        platform: "linkedin",
        title: `Software Engineer - ${searchQuery}`,
        company: "Demo Corp",
        url: "https://www.linkedin.com/jobs/view/demo",
      },
    ];

    // If Supabase configured, upsert jobs
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase-admin");
        await supabaseAdmin.from("jobs").upsert(
          jobs.map((j) => ({
            platform: j.platform,
            external_id: j.id,
            title: j.title,
            company: j.company,
            url: j.url,
          }))
        );
      } catch {
        // ignore errors in stub
      }
    }

    return NextResponse.json({ userId, count: jobs.length, jobs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to run job search" }, { status: 500 });
  }
}


