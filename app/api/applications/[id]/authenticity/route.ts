import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { refreshTrackedApplicationAuthenticityAssessment } from "@/lib/job-authenticity";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:authenticity",
      identifier: sessionUser.id,
      limit: 8,
      windowSeconds: 60,
      message: "Job signal refresh limit reached. Please wait a minute and try again.",
    });

    const application = await refreshTrackedApplicationAuthenticityAssessment(
      sessionUser.id,
      params.id,
      { allowExternalSourceCheck: true },
    );

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      application,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to refresh the job signal right now.",
      logLabel: "api/applications/authenticity",
    });
  }
}
