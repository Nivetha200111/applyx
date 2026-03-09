import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

type ReminderRow = {
  id: string;
  company_name: string;
  role_title: string;
  status: string;
  applied_at: string | null;
  follow_up_at: string;
  followed_up: boolean;
};

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:reminders",
      identifier: sessionUser.id,
      limit: 30,
      windowSeconds: 60,
      message: "Too many requests.",
    });

    let rows: ReminderRow[] = [];

    try {
      const result = await dbQuery<ReminderRow>(
        `SELECT id, company_name, role_title, status::text, applied_at, follow_up_at, followed_up
         FROM public.tracked_applications
         WHERE user_id = $1
           AND is_archived = false
           AND followed_up = false
           AND follow_up_at IS NOT NULL
           AND follow_up_at <= now()
           AND status IN ('applied', 'screening', 'interviewing')
         ORDER BY follow_up_at ASC
         LIMIT 20`,
        [sessionUser.id],
      );
      rows = result.rows;
    } catch (queryError) {
      // The followed_up column may not exist yet if the migration hasn't run.
      // Gracefully return empty reminders instead of failing.
      if (
        queryError instanceof Error &&
        /column/i.test(queryError.message)
      ) {
        return NextResponse.json({ reminders: [] });
      }
      throw queryError;
    }

    const reminders = rows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      roleTitle: row.role_title,
      status: row.status,
      appliedAt: row.applied_at,
      followUpAt: row.follow_up_at,
      followedUp: row.followed_up,
    }));

    return NextResponse.json({ reminders });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to fetch follow-up reminders right now.",
      logLabel: "api/applications/reminders",
    });
  }
}
