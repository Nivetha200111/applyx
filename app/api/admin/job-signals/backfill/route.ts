import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { dbQuery } from "@/lib/db";
import { refreshTrackedApplicationAuthenticityBatch } from "@/lib/job-authenticity";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const backfillSchema = z.object({
  mode: z.enum(["baseline", "enriched"]).default("baseline"),
  limit: z.number().int().min(1).max(100).default(50),
  force: z.boolean().default(false),
});

type ApplicationRow = {
  user_id: string;
  id: string;
};

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isDeveloperAdminUser(sessionUser)) {
      throw new HttpError(403, "Developer admin access required.");
    }

    await enforceRateLimit({
      key: "admin:job-signals:backfill",
      identifier: sessionUser.id,
      limit: 3,
      windowSeconds: 60,
      message: "Backfill limit reached. Please wait a minute and try again.",
    });

    const payload = backfillSchema.parse(await request.json().catch(() => ({})));
    const queued = await dbQuery<ApplicationRow>(
      `select user_id, id
       from public.tracked_applications
       where is_archived = false
         and ($1::boolean or authenticity_checked_at is null)
       order by authenticity_checked_at asc nulls first, updated_at desc
       limit $2`,
      [payload.force, payload.limit],
    );

    const refreshed = await refreshTrackedApplicationAuthenticityBatch(
      queued.rows.map((row) => ({
        userId: row.user_id,
        applicationId: row.id,
      })),
      {
        allowExternalSourceCheck: payload.mode === "enriched",
        concurrency: payload.mode === "enriched" ? 2 : 5,
      },
    );

    const remainingResult = await dbQuery<{ count: string }>(
      `select count(*)::text as count
       from public.tracked_applications
       where is_archived = false
         and authenticity_checked_at is null`,
    );

    return NextResponse.json({
      ok: true,
      processed: queued.rowCount,
      updatedCount: refreshed.updatedCount,
      failedCount: refreshed.failedCount,
      remaining: Number.parseInt(remainingResult.rows[0]?.count ?? "0", 10),
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to backfill job signals right now.",
      logLabel: "api/admin/job-signals/backfill",
    });
  }
}
