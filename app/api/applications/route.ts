import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const metrics = url.searchParams.get("metrics") === "true";

    // If Supabase is configured, try to fetch real data
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase-admin");
        const { data, error } = await supabaseAdmin
          .from("applications")
          .select("id, status, user_id, job_id, applied_at")
          .order("applied_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        if (metrics) {
          const submitted = data.filter((a: any) => a.status === "submitted").length;
          const interview = data.filter((a: any) => a.status === "interview").length;
          const successRate = data.length ? Math.round((interview / data.length) * 100) : 0;
          return NextResponse.json({ submitted, interview, successRate, applications: data });
        }

        return NextResponse.json({ applications: data });
      } catch {
        // fallthrough to stub
      }
    }

    // Stubbed response when DB is not configured
    const applications = [
      { id: "demo-1", status: "submitted", user_id: "demo", job_id: "job-1", applied_at: new Date().toISOString() },
      { id: "demo-2", status: "interview", user_id: "demo", job_id: "job-2", applied_at: new Date().toISOString() },
    ];
    if (metrics) {
      return NextResponse.json({ submitted: 1, interview: 1, successRate: 50, applications });
    }
    return NextResponse.json({ applications });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}


