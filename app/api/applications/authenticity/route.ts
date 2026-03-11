import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { refreshTrackedApplicationAuthenticityBatch } from "@/lib/job-authenticity";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const refreshSchema = z.object({
  mode: z.enum(["baseline", "enriched"]).default("baseline"),
  limit: z.number().int().min(1).max(50).default(25),
  force: z.boolean().default(false),
});

type ApplicationRow = {
  id: string;
};

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:authenticity:batch",
      identifier: sessionUser.id,
      limit: 4,
      windowSeconds: 60,
      message: "Batch signal refresh limit reached. Please wait a minute and try again.",
    });

    const payload = refreshSchema.parse(await request.json().catch(() => ({})));
    const result = await dbQuery<ApplicationRow>(
      `select id
       from public.tracked_applications
       where user_id = $1
         and is_archived = false
         and ($2::boolean or authenticity_checked_at is null)
       order by authenticity_checked_at asc nulls first, updated_at desc
       limit $3`,
      [sessionUser.id, payload.force, payload.limit],
    );

    const targets = result.rows.map((row) => ({
      userId: sessionUser.id,
      applicationId: row.id,
    }));

    if (targets.length === 0) {
      return NextResponse.json({
        ok: true,
        updatedCount: 0,
        failedCount: 0,
        remaining: 0,
      });
    }

    const refreshed = await refreshTrackedApplicationAuthenticityBatch(targets, {
      allowExternalSourceCheck: payload.mode === "enriched",
      concurrency: payload.mode === "enriched" ? 2 : 4,
    });

    const remainingResult = await dbQuery<{ count: string }>(
      `select count(*)::text as count
       from public.tracked_applications
       where user_id = $1
         and is_archived = false
         and authenticity_checked_at is null`,
      [sessionUser.id],
    );

    return NextResponse.json({
      ok: true,
      updatedCount: refreshed.updatedCount,
      failedCount: refreshed.failedCount,
      remaining: Number.parseInt(remainingResult.rows[0]?.count ?? "0", 10),
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to refresh job signals right now.",
      logLabel: "api/applications/authenticity/batch",
    });
  }
}
