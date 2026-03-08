import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTrackerStatsForUser } from "@/lib/data";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:stats",
      identifier: sessionUser.id,
      limit: 60,
      windowSeconds: 60,
      message: "Tracker stats rate limit reached. Please wait a minute and try again.",
    });

    const stats = await getTrackerStatsForUser(sessionUser.id);
    return NextResponse.json(stats);
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Failed to fetch tracker stats right now.",
      logLabel: "api/applications/stats",
    });
  }
}
