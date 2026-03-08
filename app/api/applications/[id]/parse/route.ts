import { z } from "zod";
import { NextResponse } from "next/server";
import { parseJdForTracker } from "@/lib/ai/parse-jd-tracker";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getCurrentUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { refreshUserAccess } from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import { suggestPrepResources } from "@/lib/prep-resources";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const parseRequestSchema = z.object({
  rawJdText: z.string().min(50).max(30000),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const currentUser = await refreshUserAccess(sessionUser);
    await enforceRateLimit({
      key: "tracker:parse",
      identifier: currentUser.id,
      limit: 10,
      windowSeconds: 60,
      message: "Tracker parse rate limit reached. Please wait a minute and try again.",
    });

    const plan = getPlanById(currentUser.plan);
    const developerAdmin = isDeveloperAdminUser(currentUser);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const remaining = plan.monthlyTrackerParses - currentUser.monthlyTrackerParsesUsed;
    if (!developerAdmin && remaining <= 0) {
      return NextResponse.json(
        { error: `AI auto-fill limit reached for your ${plan.name} plan.` },
        { status: 403 },
      );
    }

    const payload = parseRequestSchema.parse(await request.json());
    const { parsed } = await parseJdForTracker(payload.rawJdText);
    const prepResources = suggestPrepResources(parsed.requiredSkills ?? []);

    await withTransaction(async (client) => {
      await client.query(
        `select id
         from public.users
         where id = $1
         for update`,
        [currentUser.id],
      );

      const updateResult = await client.query(
        `update public.tracked_applications
         set
           company_name = coalesce(nullif(company_name, ''), $1),
           role_title = coalesce(nullif(role_title, ''), $2),
           location = coalesce(location, $3),
           work_mode = $4::work_mode,
           salary_min = coalesce(salary_min, $5),
           salary_max = coalesce(salary_max, $6),
           salary_currency = coalesce(salary_currency, $7),
           required_skills = $8,
           preferred_skills = $9,
           experience_required = $10,
           raw_jd_text = $11,
           parsed_jd_data = $12::jsonb,
           source_platform = coalesce(source_platform, $13),
           prep_resources = $14::jsonb
         where id = $15 and user_id = $16`,
        [
          parsed.company || "",
          parsed.title || "",
          parsed.location || null,
          parsed.workMode ?? "unknown",
          parsed.salaryRange?.min ?? null,
          parsed.salaryRange?.max ?? null,
          parsed.salaryRange?.currency ?? "INR",
          parsed.requiredSkills ?? [],
          parsed.preferredSkills ?? [],
          parsed.requiredExperience ?? null,
          payload.rawJdText,
          JSON.stringify(parsed),
          parsed.sourcePlatform ?? null,
          JSON.stringify(prepResources),
          params.id,
          currentUser.id,
        ],
      );

      if (updateResult.rowCount === 0) {
        throw new HttpError(404, "Application not found.");
      }

      if (!developerAdmin) {
        const usageResult = await client.query<{ id: string }>(
          `update public.users
           set monthly_tracker_parses_used = monthly_tracker_parses_used + 1,
               updated_at = timezone('utc', now())
           where id = $1
             and monthly_tracker_parses_used < $2
           returning id`,
          [currentUser.id, plan.monthlyTrackerParses],
        );

        if (usageResult.rowCount === 0) {
          throw new HttpError(403, `AI auto-fill limit reached for your ${plan.name} plan.`);
        }

        await client.query(
          `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
           values ($1, 'parse_tracker_jd', $2, 'demo', $3::jsonb)`,
          [currentUser.id, currentUser.plan, JSON.stringify({ company: parsed.company, role: parsed.title })],
        );
      }
    });

    return NextResponse.json({ ok: true, parsed });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to parse that job description right now.",
      logLabel: "api/applications/parse",
    });
  }
}
