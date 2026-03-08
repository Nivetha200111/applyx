import { z } from "zod";
import { NextResponse } from "next/server";
import { parseJdWithAi } from "@/lib/ai/parse-jd";
import { tailorResumeWithAi } from "@/lib/ai/tailor-resume";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow, withTransaction } from "@/lib/db";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import { suggestPrepResources } from "@/lib/prep-resources";
import type { ParsedJD, ParsedResume, ResumeTemplate } from "@/lib/types";

export const runtime = "nodejs";

const tailorRequestSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().trim().min(100, "Paste a fuller job description."),
  sourceUrl: z.string().trim().nullable().optional(),
  templateUsed: z.enum(["classic", "modern", "minimal"]).default("classic"),
});

type ResumeRow = {
  id: string;
  user_id: string;
  parsed_data: ParsedResume;
};

type TrackerSyncResult = {
  status: "created" | "updated" | "skipped";
  applicationId: string | null;
  message: string | null;
};

async function syncTailoredResumeToTracker(params: {
  userId: string;
  tailoredResumeId: string;
  sourceUrl: string | null;
  jobDescription: string;
  parsedJd: ParsedJD;
  trackerRowLimit: number;
  planName: string;
}) {
  const companyName = params.parsedJd.company?.trim() ?? "";
  const roleTitle = params.parsedJd.title?.trim() ?? "";
  const location = params.parsedJd.location?.trim() || null;
  const requiredSkills = params.parsedJd.requiredSkills ?? [];
  const preferredSkills = params.parsedJd.preferredSkills ?? [];
  const experienceRequired = params.parsedJd.requiredExperience?.trim() || null;
  const prepResources = suggestPrepResources(requiredSkills);
  const parsedJdJson = JSON.stringify(params.parsedJd);
  const prepResourcesJson = JSON.stringify(prepResources);

  try {
    return await withTransaction<TrackerSyncResult>(async (client) => {
      let existingId: string | null = null;

      if (params.sourceUrl) {
        const existingBySource = await client.query<{ id: string }>(
          `select id
           from public.tracked_applications
           where user_id = $1
             and is_archived = false
             and source_url = $2
           order by updated_at desc
           limit 1`,
          [params.userId, params.sourceUrl],
        );

        existingId = existingBySource.rows[0]?.id ?? null;
      }

      if (!existingId && companyName && roleTitle) {
        const existingByRole = await client.query<{ id: string }>(
          `select id
           from public.tracked_applications
           where user_id = $1
             and is_archived = false
             and lower(company_name) = lower($2)
             and lower(role_title) = lower($3)
           order by updated_at desc
           limit 1`,
          [params.userId, companyName, roleTitle],
        );

        existingId = existingByRole.rows[0]?.id ?? null;
      }

      if (existingId) {
        await client.query(
          `update public.tracked_applications
           set
             company_name = case when nullif($2, '') is not null then $2 else company_name end,
             role_title = case when nullif($3, '') is not null then $3 else role_title end,
             location = coalesce($4, location),
             source_url = coalesce($5, source_url),
             raw_jd_text = case when nullif($6, '') is not null then $6 else raw_jd_text end,
             parsed_jd_data = $7::jsonb,
             required_skills = case when cardinality($8::text[]) > 0 then $8::text[] else required_skills end,
             preferred_skills = case when cardinality($9::text[]) > 0 then $9::text[] else preferred_skills end,
             experience_required = coalesce($10, experience_required),
             prep_resources = case when jsonb_array_length($11::jsonb) > 0 then $11::jsonb else prep_resources end,
             tailored_resume_id = $12,
             status = case when status = 'bookmarked' then 'applying'::application_status else status end,
             last_activity_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
           where id = $1`,
          [
            existingId,
            companyName,
            roleTitle,
            location,
            params.sourceUrl,
            params.jobDescription,
            parsedJdJson,
            requiredSkills,
            preferredSkills,
            experienceRequired,
            prepResourcesJson,
            params.tailoredResumeId,
          ],
        );

        return {
          status: "updated",
          applicationId: existingId,
          message: "Linked this tailored resume to your existing tracker entry.",
        };
      }

      const activeCountResult = await client.query<{ count: string }>(
        `select count(*)::text as count
         from public.tracked_applications
         where user_id = $1 and is_archived = false`,
        [params.userId],
      );
      const activeCount = Number(activeCountResult.rows[0]?.count ?? "0");

      if (activeCount >= params.trackerRowLimit) {
        return {
          status: "skipped",
          applicationId: null,
          message: `Tracker not updated because your ${params.planName} plan has reached its active application limit.`,
        };
      }

      const insertResult = await client.query<{ id: string }>(
        `insert into public.tracked_applications (
          user_id,
          company_name,
          role_title,
          location,
          work_mode,
          status,
          source_url,
          raw_jd_text,
          parsed_jd_data,
          required_skills,
          preferred_skills,
          experience_required,
          tailored_resume_id,
          prep_resources,
          last_activity_at
        ) values (
          $1, $2, $3, $4, 'unknown'::work_mode, 'applying'::application_status,
          $5, $6, $7::jsonb, $8::text[], $9::text[], $10, $11, $12::jsonb, timezone('utc', now())
        )
        returning id`,
        [
          params.userId,
          companyName,
          roleTitle,
          location,
          params.sourceUrl,
          params.jobDescription,
          parsedJdJson,
          requiredSkills,
          preferredSkills,
          experienceRequired,
          params.tailoredResumeId,
          prepResourcesJson,
        ],
      );

      return {
        status: "created",
        applicationId: insertResult.rows[0]?.id ?? null,
        message: "Added this tailored resume to your job tracker.",
      };
    });
  } catch (error) {
    console.error(
      `[Tracker sync] Failed for tailored resume ${params.tailoredResumeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );

    return {
      status: "skipped",
      applicationId: null,
      message: "Tailored resume created, but tracker sync failed.",
    } satisfies TrackerSyncResult;
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const currentUser = await refreshUserAccess(sessionUser);
    const payload = tailorRequestSchema.parse(await request.json());

    if (getRemainingTailors(currentUser) <= 0) {
      return NextResponse.json(
        { error: "Tailor limit reached for your current plan." },
        { status: 403 },
      );
    }

    const resumeResult = await dbQuery<ResumeRow>(
      `select id, user_id, parsed_data
       from public.master_resumes
       where id = $1 and user_id = $2
       limit 1`,
      [payload.resumeId, currentUser.id],
    );
    const resume = firstRow(resumeResult);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found." }, { status: 404 });
    }

    const { parsedJd } = await parseJdWithAi(
      payload.jobDescription,
      currentUser.preferredModelTier,
    );
    const { tailorResult } = await tailorResumeWithAi(
      resume.parsed_data,
      parsedJd,
      currentUser.preferredModelTier,
    );

    const plan = getPlanById(currentUser.plan);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan configuration." }, { status: 400 });
    }

    const tailoredResumeId = await withTransaction(async (client) => {
      const jdResult = await client.query<{ id: string }>(
        `insert into public.job_descriptions (
          user_id,
          company_name,
          job_title,
          raw_text,
          parsed_data,
          source_url
        ) values ($1, $2, $3, $4, $5::jsonb, $6)
        returning id`,
        [
          currentUser.id,
          parsedJd.company || null,
          parsedJd.title || null,
          payload.jobDescription,
          JSON.stringify(parsedJd),
          payload.sourceUrl || null,
        ],
      );

      const tailoredResultInsert = await client.query<{ id: string }>(
        `insert into public.tailored_resumes (
          user_id,
          master_resume_id,
          job_description_id,
          tailored_data,
          changes,
          plan_tier,
          model_tier,
          primary_model,
          fallback_model,
          match_score_before,
          match_score_after,
          template_used,
          storage_provider,
          generation_latency_ms,
          is_demo
        ) values (
          $1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, 'database', $13, $14
        )
        returning id`,
        [
          currentUser.id,
          payload.resumeId,
          jdResult.rows[0]?.id,
          JSON.stringify(tailorResult.tailored_resume),
          JSON.stringify(tailorResult.changes),
          currentUser.plan,
          currentUser.preferredModelTier,
          plan.primaryModel,
          plan.fallbackModel ?? null,
          tailorResult.match_score_before,
          tailorResult.match_score_after,
          payload.templateUsed as ResumeTemplate,
          Date.now() - startedAt,
          currentUser.plan === "free",
        ],
      );

      if (currentUser.plan === "free") {
        await client.query(
          `update public.users
           set demo_tailors_used = demo_tailors_used + 1,
               updated_at = timezone('utc', now())
           where id = $1`,
          [currentUser.id],
        );
      } else {
        await client.query(
          `update public.users
           set monthly_tailors_used = monthly_tailors_used + 1,
               updated_at = timezone('utc', now())
           where id = $1`,
          [currentUser.id],
        );
      }

      await client.query(
        `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
         values ($1, 'parse_job_description', $2, $3, $4::jsonb),
                ($1, 'tailor_resume', $2, $3, $5::jsonb)`,
        [
          currentUser.id,
          currentUser.plan,
          currentUser.preferredModelTier,
          JSON.stringify({ jobTitle: parsedJd.title, company: parsedJd.company }),
          JSON.stringify({
            masterResumeId: payload.resumeId,
            matchScoreBefore: tailorResult.match_score_before,
            matchScoreAfter: tailorResult.match_score_after,
          }),
        ],
      );

      return tailoredResultInsert.rows[0]?.id ?? null;
    });

    if (!tailoredResumeId) {
      return NextResponse.json({ error: "Unable to save tailored resume." }, { status: 500 });
    }

    const trackerSync = await syncTailoredResumeToTracker({
      userId: currentUser.id,
      tailoredResumeId,
      sourceUrl: payload.sourceUrl || null,
      jobDescription: payload.jobDescription,
      parsedJd,
      trackerRowLimit: plan.trackerRowLimit,
      planName: plan.name,
    });

    return NextResponse.json({
      ok: true,
      tailoredResumeId,
      trackerSyncStatus: trackerSync.status,
      trackerApplicationId: trackerSync.applicationId,
      trackerMessage: trackerSync.message,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to tailor resume.",
      },
      { status: 400 },
    );
  }
}
