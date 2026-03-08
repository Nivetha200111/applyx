import { z } from "zod";
import { NextResponse } from "next/server";
import { parseJdForTracker } from "@/lib/ai/parse-jd-tracker";
import { getCurrentUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import {
  getActiveTrackedApplicationCount,
  getTrackedApplicationsForUser,
  refreshUserAccess,
} from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import { suggestPrepResources } from "@/lib/prep-resources";
import type { ApplicationStatus } from "@/lib/types";

export const runtime = "nodejs";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const createApplicationSchema = z.object({
  companyName: z.string().max(200).optional(),
  roleTitle: z.string().max(200).optional(),
  status: z
    .enum([
      "bookmarked", "applying", "applied", "screening",
      "interviewing", "offer", "accepted", "rejected",
      "withdrawn", "ghosted",
    ])
    .default("bookmarked"),
  sourceUrl: z.string().max(2000).optional(),
  rawJdText: z.string().min(50).max(30000).optional(),
  notes: z.string().max(5000).optional(),
  location: z.string().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const status = statusParam ? statusParam.split(",") as ApplicationStatus[] : undefined;

    const result = await getTrackedApplicationsForUser(sessionUser.id, {
      status,
      archived: url.searchParams.get("archived") === "true",
      search: url.searchParams.get("search") || undefined,
      sort: url.searchParams.get("sort") || undefined,
      order: (url.searchParams.get("order") as "asc" | "desc") || undefined,
      limit: parseInt(url.searchParams.get("limit") ?? "50", 10),
      offset: parseInt(url.searchParams.get("offset") ?? "0", 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch applications." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const currentUser = await refreshUserAccess(sessionUser);
    const payload = createApplicationSchema.parse(await request.json());
    const plan = getPlanById(currentUser.plan);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    // Check row limit
    const activeCount = await getActiveTrackedApplicationCount(currentUser.id);
    if (activeCount >= plan.trackerRowLimit) {
      return NextResponse.json(
        { error: `You've reached the ${plan.name} plan limit of ${plan.trackerRowLimit} active applications. Upgrade or archive existing ones.` },
        { status: 403 },
      );
    }

    let companyName = payload.companyName ?? "";
    let roleTitle = payload.roleTitle ?? "";
    let location = payload.location ?? null;
    let workMode: string = "unknown";
    let salaryMin: number | null = null;
    let salaryMax: number | null = null;
    let salaryCurrency = "INR";
    let requiredSkills: string[] = [];
    let preferredSkills: string[] = [];
    let experienceRequired: string | null = null;
    let parsedJdData: unknown = null;
    let prepResources: unknown[] = [];
    let sourcePlatform: string | null = null;
    const rawJdText = payload.rawJdText?.trim() ?? "";
    const usedAiParse = rawJdText.length > 0;

    if (usedAiParse) {
      const trackerParsesRemaining =
        plan.monthlyTrackerParses - currentUser.monthlyTrackerParsesUsed;
      if (trackerParsesRemaining <= 0) {
        return NextResponse.json(
          { error: `AI auto-fill limit reached for your ${plan.name} plan. You can still add rows manually.` },
          { status: 403 },
        );
      }

      const { parsed } = await parseJdForTracker(rawJdText);

      companyName = companyName || parsed.company || "";
      roleTitle = roleTitle || parsed.title || "";
      location = location || parsed.location || null;
      workMode = parsed.workMode ?? "unknown";
      requiredSkills = parsed.requiredSkills ?? [];
      preferredSkills = parsed.preferredSkills ?? [];
      experienceRequired = parsed.requiredExperience ?? null;
      parsedJdData = parsed;
      sourcePlatform = parsed.sourcePlatform ?? null;

      if (parsed.salaryRange) {
        salaryMin = parsed.salaryRange.min;
        salaryMax = parsed.salaryRange.max;
        salaryCurrency = parsed.salaryRange.currency ?? "INR";
      }

      prepResources = suggestPrepResources(requiredSkills);
    }

    const created = await withTransaction(async (client) => {
      await client.query(
        `select id
         from public.users
         where id = $1
         for update`,
        [currentUser.id],
      );

      const countResult = await client.query<{ count: string }>(
        `select count(*)::text as count
         from public.tracked_applications
         where user_id = $1 and is_archived = false`,
        [currentUser.id],
      );
      const lockedActiveCount = parseInt(countResult.rows[0]?.count ?? "0", 10);

      if (lockedActiveCount >= plan.trackerRowLimit) {
        throw new HttpError(
          403,
          `You've reached the ${plan.name} plan limit of ${plan.trackerRowLimit} active applications. Upgrade or archive existing ones.`,
        );
      }

      if (usedAiParse) {
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
          throw new HttpError(
            403,
            `AI auto-fill limit reached for your ${plan.name} plan. You can still add rows manually.`,
          );
        }
      }

      const result = await client.query<{ id: string }>(
        `insert into public.tracked_applications (
          user_id, company_name, role_title, location, work_mode,
          salary_min, salary_max, salary_currency, status, source_url,
          source_platform, raw_jd_text, parsed_jd_data,
          required_skills, preferred_skills, experience_required,
          notes, prep_resources
        ) values (
          $1, $2, $3, $4, $5::work_mode,
          $6, $7, $8, $9::application_status, $10,
          $11, $12, $13::jsonb,
          $14, $15, $16,
          $17, $18::jsonb
        )
        returning id`,
        [
          currentUser.id, companyName, roleTitle, location, workMode,
          salaryMin, salaryMax, salaryCurrency, payload.status, payload.sourceUrl || null,
          sourcePlatform, rawJdText || null, parsedJdData ? JSON.stringify(parsedJdData) : null,
          requiredSkills, preferredSkills, experienceRequired,
          payload.notes || null, JSON.stringify(prepResources),
        ],
      );

      if (usedAiParse) {
        await client.query(
          `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
           values ($1, 'parse_tracker_jd', $2, 'demo', $3::jsonb)`,
          [
            currentUser.id,
            currentUser.plan,
            JSON.stringify({ company: companyName, role: roleTitle }),
          ],
        );
      }

      return result.rows[0]?.id;
    });

    return NextResponse.json({ ok: true, applicationId: created });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create application." },
      { status: 400 },
    );
  }
}
