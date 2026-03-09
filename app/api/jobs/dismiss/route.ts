import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dismissJob } from "@/lib/jobs/dismissed";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const dismissJobSchema = z.object({
  externalJobId: z.string().trim().min(3).max(120),
  source: z.enum(["remoteok", "adzuna"]),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "jobs:dismiss",
      identifier: sessionUser.id,
      limit: 30,
      windowSeconds: 60,
      message: "Dismiss limit reached. Please wait a minute and try again.",
    });

    const payload = dismissJobSchema.parse(await request.json());
    await dismissJob(sessionUser.id, payload.externalJobId, payload.source);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to dismiss that job right now.",
      logLabel: "api/jobs/dismiss",
    });
  }
}
