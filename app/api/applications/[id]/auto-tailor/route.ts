import { NextResponse } from "next/server";
import { parseJdWithAi } from "@/lib/ai/parse-jd";
import { tailorResumeWithAi } from "@/lib/ai/tailor-resume";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow, withTransaction } from "@/lib/db";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { notifyApplicationApplied } from "@/lib/notifications/openclaw";
import { getPlanById } from "@/lib/plans";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import type { ApplicationStatus, ParsedJD, ParsedResume } from "@/lib/types";

export const runtime = "nodejs";

type TrackedApplicationRow = {
  id: string;
  raw_jd_text: string | null;
  parsed_jd_data: ParsedJD | null;
  tailored_resume_id: string | null;
  company_name: string;
  role_title: string;
  source_url: string | null;
  applied_at: string | null;
  status: ApplicationStatus;
};

type MasterResumeRow = {
  id: string;
  parsed_data: ParsedResume;
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const startedAt = Date.now();

  try {
    const { id: applicationId } = await params;

    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const currentUser = await refreshUserAccess(sessionUser);

    await enforceRateLimit({
      key: "tracker:auto-tailor",
      identifier: currentUser.id,
      limit: 10,
      windowSeconds: 60,
      message: "Auto-tailor rate limit reached. Please wait a minute and try again.",
    });

    if (currentUser.plan === "free") {
      return NextResponse.json(
        { error: "Auto-tailor is available on paid plans only." },
        { status: 403 },
      );
    }

    const appResult = await dbQuery<TrackedApplicationRow>(
      `select id, raw_jd_text, parsed_jd_data, tailored_resume_id,
              company_name, role_title, source_url, applied_at, status::text
       from public.tracked_applications
       where id = $1 and user_id = $2 and is_archived = false
       limit 1`,
      [applicationId, currentUser.id],
    );
    const application = firstRow(appResult);

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (application.tailored_resume_id) {
      return NextResponse.json({ ok: true, skipped: true, reason: "already_tailored" });
    }

    if (!application.raw_jd_text) {
      return NextResponse.json(
        { ok: false, error: "No job description to tailor against." },
        { status: 400 },
      );
    }

    let resumeResult = await dbQuery<MasterResumeRow>(
      `select id, parsed_data
       from public.master_resumes
       where user_id = $1 and is_primary = true
       limit 1`,
      [currentUser.id],
    );
    let resume = firstRow(resumeResult);

    if (!resume) {
      resumeResult = await dbQuery<MasterResumeRow>(
        `select id, parsed_data
         from public.master_resumes
         where user_id = $1
         order by created_at desc
         limit 1`,
        [currentUser.id],
      );
      resume = firstRow(resumeResult);
    }

    if (!resume) {
      return NextResponse.json(
        { ok: false, error: "Upload a resume first." },
        { status: 400 },
      );
    }

    if (getRemainingTailors(currentUser) <= 0) {
      return NextResponse.json(
        { error: "Tailor limit reached for your current plan." },
        { status: 403 },
      );
    }

    const { parsedJd } = await parseJdWithAi(
      application.raw_jd_text,
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

    const developerAdmin = isDeveloperAdminUser(currentUser);

    const tailoredResumeId = await withTransaction(async (client) => {
      await client.query(
        `select id
         from public.users
         where id = $1
         for update`,
        [currentUser.id],
      );

      if (!developerAdmin) {
        if (currentUser.plan === "free") {
          const demoUsageResult = await client.query<{ id: string }>(
            `update public.users
             set demo_tailors_used = demo_tailors_used + 1,
                 updated_at = timezone('utc', now())
             where id = $1
               and demo_tailors_used < $2
             returning id`,
            [currentUser.id, plan.includedDemos],
          );

          if (demoUsageResult.rowCount === 0) {
            throw new HttpError(403, "Tailor limit reached for your current plan.");
          }
        } else {
          const monthlyLimit = currentUser.monthlyTailorLimit || plan.monthlyTailors;
          const monthlyUsageResult = await client.query<{ id: string }>(
            `update public.users
             set monthly_tailors_used = monthly_tailors_used + 1,
                 updated_at = timezone('utc', now())
             where id = $1
               and monthly_tailors_used < $2
             returning id`,
            [currentUser.id, monthlyLimit],
          );

          if (monthlyUsageResult.rowCount === 0) {
            throw new HttpError(403, "Tailor limit reached for your current plan.");
          }
        }
      }

      const jdResult = await client.query<{ id: string }>(
        `insert into public.job_descriptions (
          user_id,
          company_name,
          job_title,
          raw_text,
          parsed_data,
          source_url
        ) values ($1, $2, $3, $4, $5::jsonb, null)
        returning id`,
        [
          currentUser.id,
          parsedJd.company || null,
          parsedJd.title || null,
          application.raw_jd_text,
          JSON.stringify(parsedJd),
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
          $1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11, 'classic', 'database', $12, false
        )
        returning id`,
        [
          currentUser.id,
          resume.id,
          jdResult.rows[0]?.id,
          JSON.stringify(tailorResult.tailored_resume),
          JSON.stringify(tailorResult.changes),
          currentUser.plan,
          currentUser.preferredModelTier,
          plan.primaryModel,
          plan.fallbackModel ?? null,
          tailorResult.match_score_before,
          tailorResult.match_score_after,
          Date.now() - startedAt,
        ],
      );

      const newTailoredResumeId = tailoredResultInsert.rows[0]?.id ?? null;

      if (newTailoredResumeId) {
        await client.query(
          `update public.tracked_applications
           set
             tailored_resume_id = $1,
             status = case
               when status in ('bookmarked', 'applying') then 'applied'::application_status
               else status
             end,
             applied_at = coalesce(applied_at, timezone('utc', now())),
             follow_up_at = coalesce(follow_up_at, timezone('utc', now()) + interval '7 days'),
             last_activity_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
           where id = $2 and user_id = $3`,
          [newTailoredResumeId, applicationId, currentUser.id],
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
            masterResumeId: resume.id,
            matchScoreBefore: tailorResult.match_score_before,
            matchScoreAfter: tailorResult.match_score_after,
            source: "auto-tailor",
            applicationId,
          }),
        ],
      );

      return newTailoredResumeId;
    });

    if (!tailoredResumeId) {
      return NextResponse.json({ error: "Unable to save tailored resume." }, { status: 500 });
    }

    if (application.status === "bookmarked" || application.status === "applying") {
      await notifyApplicationApplied({
        applicationId,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        companyName: parsedJd.company || application.company_name || "Unknown company",
        roleTitle: parsedJd.title || application.role_title || "Untitled role",
        sourceUrl: application.source_url,
        appliedAt: application.applied_at ?? new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      tailoredResumeId,
      matchScoreBefore: tailorResult.match_score_before,
      matchScoreAfter: tailorResult.match_score_after,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to auto-tailor resume right now.",
      logLabel: "api/applications/auto-tailor",
    });
  }
}
