import { z } from "zod";
import { NextResponse } from "next/server";
import { parseJdWithAi } from "@/lib/ai/parse-jd";
import { tailorResumeWithAi } from "@/lib/ai/tailor-resume";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow, withTransaction } from "@/lib/db";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import type { ParsedResume, ResumeTemplate } from "@/lib/types";

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

    const created = await withTransaction(async (client) => {
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

      return tailoredResultInsert.rows[0]?.id;
    });

    return NextResponse.json({
      ok: true,
      tailoredResumeId: created,
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
