import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { NextResponse } from "next/server";
import { parseResumeWithAi } from "@/lib/ai/parse-resume";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getCurrentUser } from "@/lib/auth";
import { firstRow, withTransaction } from "@/lib/db";
import { refreshUserAccess } from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { validateResumeFile } from "@/lib/security/files";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_RESUME_TEXT_CHARS = 24000;

function prepareResumeTextForAi(rawText: string) {
  const normalized = rawText
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length <= MAX_RESUME_TEXT_CHARS) {
    return normalized;
  }

  return normalized.slice(0, MAX_RESUME_TEXT_CHARS);
}

async function extractResumeText(buffer: Buffer, fileKind: "pdf" | "docx") {
  try {
    if (fileKind === "pdf") {
      const result = await pdfParse(buffer);
      return result.text;
    }

    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new HttpError(400, "We could not read that resume file. Upload a text-based PDF or DOCX.");
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await refreshUserAccess(sessionUser);
    const plan = getPlanById(user.plan);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan state." }, { status: 400 });
    }

    await enforceRateLimit({
      key: "resume:upload",
      identifier: user.id,
      limit: 10,
      windowSeconds: 60,
      message: "Resume upload rate limit reached. Please wait a minute and try again.",
    });

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File) || file.size === 0) {
      throw new HttpError(400, "Upload a resume file.");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new HttpError(400, "Resume file must be 5MB or smaller.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKind = validateResumeFile(buffer, file.name);

    if (!fileKind) {
      throw new HttpError(400, "Only valid PDF and DOCX resumes are supported.");
    }

    const rawText = await extractResumeText(buffer, fileKind);
    const aiReadyText = prepareResumeTextForAi(rawText);

    if (!aiReadyText) {
      throw new HttpError(400, "We could not extract readable text from that resume.");
    }

    const { parsedResume } = await parseResumeWithAi(aiReadyText);

    const created = await withTransaction(async (client) => {
      await client.query(
        `select id
         from public.users
         where id = $1
         for update`,
        [user.id],
      );

      const countResult = await client.query<{ total: string }>(
        `select count(*)::text as total
         from public.master_resumes
         where user_id = $1`,
        [user.id],
      );
      const currentCount = Number(firstRow(countResult)?.total ?? "0");

      if (!isDeveloperAdminUser(user) && currentCount >= plan.masterResumeLimit) {
        throw new HttpError(403, "Resume limit reached for your current plan.");
      }

      const result = await client.query<{ id: string }>(
        `insert into public.master_resumes (
          user_id,
          file_name,
          file_url,
          file_kind,
          parsed_data,
          raw_text,
          storage_provider,
          is_primary
        ) values ($1, $2, null, $3, $4::jsonb, $5, 'database', $6)
        returning id`,
        [user.id, file.name, fileKind, JSON.stringify(parsedResume), rawText, currentCount === 0],
      );

      await client.query(
        `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
         values ($1, 'parse_resume', $2, $3, $4::jsonb)`,
        [
          user.id,
          user.plan,
          user.preferredModelTier,
          JSON.stringify({ fileName: file.name, fileKind }),
        ],
      );

      return firstRow(result);
    });

    return NextResponse.json({
      ok: true,
      resumeId: created?.id,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to upload resume right now.",
      logLabel: "api/resumes",
    });
  }
}
