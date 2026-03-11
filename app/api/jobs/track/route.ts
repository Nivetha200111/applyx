import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { getActiveTrackedApplicationCount, refreshUserAccess } from "@/lib/data";
import { canonicalizeSkill } from "@/lib/jobs/matcher";
import { refreshTrackedApplicationAuthenticityAssessment } from "@/lib/job-authenticity";
import { getPlanById } from "@/lib/plans";
import { suggestPrepResources } from "@/lib/prep-resources";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { isDeveloperAdminUser } from "@/lib/developer-access";

export const runtime = "nodejs";

const trackJobSchema = z.object({
  externalJobId: z.string().trim().min(3).max(120),
  source: z.enum(["remoteok", "adzuna"]),
  title: z.string().trim().min(2).max(200),
  company: z.string().trim().min(1).max(200),
  location: z.string().trim().max(200).nullable().optional(),
  applyUrl: z.string().trim().min(5).max(2000),
  tags: z.array(z.string().trim().min(1).max(60)).max(20),
  description: z.string().trim().max(5000).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().trim().max(16).optional(),
  workMode: z.enum(["remote", "hybrid", "onsite", "unknown"]).default("unknown"),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await refreshUserAccess(sessionUser);
    await enforceRateLimit({
      key: "jobs:track",
      identifier: user.id,
      limit: 10,
      windowSeconds: 60,
      message: "Add-to-tracker limit reached. Please wait a minute and try again.",
    });

    const payload = trackJobSchema.parse(await request.json());
    const plan = getPlanById(user.plan);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const developerAdmin = isDeveloperAdminUser(user);
    const activeCount = await getActiveTrackedApplicationCount(user.id);

    if (!developerAdmin && activeCount >= plan.trackerRowLimit) {
      return NextResponse.json(
        { error: `You've reached the ${plan.name} plan limit of ${plan.trackerRowLimit} active applications. Upgrade or archive existing ones.` },
        { status: 403 },
      );
    }

    const normalizedTags = [...new Set(
      payload.tags
        .map((tag) => canonicalizeSkill(tag))
        .filter(Boolean),
    )];
    const prepResources = suggestPrepResources(normalizedTags);

    const result = await withTransaction(async (client) => {
      await client.query(
        `select id
         from public.users
         where id = $1
         for update`,
        [user.id],
      );

      const countResult = await client.query<{ count: string }>(
        `select count(*)::text as count
         from public.tracked_applications
         where user_id = $1 and is_archived = false`,
        [user.id],
      );
      const lockedActiveCount = parseInt(countResult.rows[0]?.count ?? "0", 10);

      if (!developerAdmin && lockedActiveCount >= plan.trackerRowLimit) {
        throw new HttpError(
          403,
          `You've reached the ${plan.name} plan limit of ${plan.trackerRowLimit} active applications. Upgrade or archive existing ones.`,
        );
      }

      let existingId: string | null = null;

      const existingByUrl = await client.query<{ id: string }>(
        `select id
         from public.tracked_applications
         where user_id = $1
           and is_archived = false
           and source_url = $2
         limit 1`,
        [user.id, payload.applyUrl],
      );
      existingId = existingByUrl.rows[0]?.id ?? null;

      if (!existingId) {
        const existingByCompanyRole = await client.query<{ id: string }>(
          `select id
           from public.tracked_applications
           where user_id = $1
             and is_archived = false
             and lower(company_name) = lower($2)
             and lower(role_title) = lower($3)
           limit 1`,
          [user.id, payload.company, payload.title],
        );
        existingId = existingByCompanyRole.rows[0]?.id ?? null;
      }

      await client.query(
        `insert into public.dismissed_jobs (user_id, external_job_id, source)
         values ($1, $2, $3)
         on conflict (user_id, external_job_id) do nothing`,
        [user.id, payload.externalJobId, payload.source],
      );

      if (existingId) {
        return {
          applicationId: existingId,
          alreadyTracked: true,
        };
      }

      const insertResult = await client.query<{ id: string }>(
        `insert into public.tracked_applications (
          user_id,
          company_name,
          role_title,
          location,
          work_mode,
          salary_min,
          salary_max,
          salary_currency,
          status,
          source_url,
          source_platform,
          required_skills,
          preferred_skills,
          notes,
          prep_resources,
          last_activity_at
        ) values (
          $1, $2, $3, $4, $5::work_mode,
          $6, $7, $8, 'bookmarked'::application_status, $9,
          $10, $11::text[], $12::text[], $13, $14::jsonb, timezone('utc', now())
        )
        returning id`,
        [
          user.id,
          payload.company,
          payload.title,
          payload.location?.trim() || null,
          payload.workMode,
          payload.salaryMin ?? null,
          payload.salaryMax ?? null,
          payload.salaryCurrency?.trim() || "USD",
          payload.applyUrl,
          payload.source,
          normalizedTags,
          [],
          payload.description || null,
          JSON.stringify(prepResources),
        ],
      );

      return {
        applicationId: insertResult.rows[0]?.id ?? null,
        alreadyTracked: false,
      };
    });

    if (result.applicationId && !result.alreadyTracked) {
      try {
        await refreshTrackedApplicationAuthenticityAssessment(user.id, result.applicationId, {
          allowExternalSourceCheck: false,
        });
      } catch (error) {
        console.error(
          `[job-authenticity] Failed to create baseline signal for ${result.applicationId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      applicationId: result.applicationId,
      alreadyTracked: result.alreadyTracked,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to add that job to your tracker right now.",
      logLabel: "api/jobs/track",
    });
  }
}
