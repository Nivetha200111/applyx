import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTrackerStatsForUser } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const stats = await getTrackerStatsForUser(sessionUser.id);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats." },
      { status: 400 },
    );
  }
}
