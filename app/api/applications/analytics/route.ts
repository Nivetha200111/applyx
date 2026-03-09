import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
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
      key: "tracker:analytics",
      identifier: sessionUser.id,
      limit: 30,
      windowSeconds: 60,
      message: "Analytics rate limit reached. Please wait a minute and try again.",
    });

    const [statusResult, velocityResult, skillsResult, salaryResult] =
      await Promise.all([
        dbQuery<{ status: string; count: number }>(
          `SELECT status::text, count(*)::int as count
           FROM public.tracked_applications
           WHERE user_id = $1 AND is_archived = false
           GROUP BY status
           ORDER BY count DESC`,
          [sessionUser.id],
        ),
        dbQuery<{ week: string; count: number }>(
          `SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week,
                  count(*)::int as count
           FROM public.tracked_applications
           WHERE user_id = $1 AND created_at > now() - interval '12 weeks'
           GROUP BY 1
           ORDER BY 1`,
          [sessionUser.id],
        ),
        dbQuery<{ skill: string; cnt: number }>(
          `SELECT unnest(required_skills) as skill, count(*)::int as cnt
           FROM public.tracked_applications
           WHERE user_id = $1 AND is_archived = false
           GROUP BY skill
           ORDER BY cnt DESC
           LIMIT 15`,
          [sessionUser.id],
        ),
        dbQuery<{
          company_name: string;
          role_title: string;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          status: string;
        }>(
          `SELECT company_name, role_title, salary_min, salary_max,
                  salary_currency, status::text
           FROM public.tracked_applications
           WHERE user_id = $1
             AND is_archived = false
             AND (salary_min IS NOT NULL OR salary_max IS NOT NULL)
           ORDER BY salary_max DESC NULLS LAST
           LIMIT 30`,
          [sessionUser.id],
        ),
      ]);

    return NextResponse.json({
      statusBreakdown: statusResult.rows,
      weeklyVelocity: velocityResult.rows,
      topSkills: skillsResult.rows.map((r) => ({
        skill: r.skill,
        count: r.cnt,
      })),
      salaryInsights: salaryResult.rows.map((r) => ({
        companyName: r.company_name,
        roleTitle: r.role_title,
        salaryMin: r.salary_min,
        salaryMax: r.salary_max,
        salaryCurrency: r.salary_currency,
        status: r.status,
      })),
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Failed to fetch analytics right now.",
      logLabel: "api/applications/analytics",
    });
  }
}
