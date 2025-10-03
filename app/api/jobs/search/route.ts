import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || request.headers.get("x-user-id") || "anonymous-user";
    const searchQuery = body.searchQuery || "software engineer";
    const scheduleOnly = body.schedule === true;

    // If QStash configured and scheduleOnly, enqueue a job to run scraper
    if (scheduleOnly && process.env.QSTASH_TOKEN && process.env.NEXT_PUBLIC_URL) {
      const url = `${process.env.NEXT_PUBLIC_URL}/api/jobs/run-search`;
      const res = await fetch("https://qstash.upstash.io/v2/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, body: { userId, searchQuery } }),
      });
      const json = await res.json().catch(() => ({}));
      return NextResponse.json({ queued: true, details: json });
    }

    // Immediate run: call local consumer
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/jobs/run-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, searchQuery }),
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Failed to schedule job search" }, { status: 500 });
  }
}

