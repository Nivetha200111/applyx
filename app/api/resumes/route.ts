import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { NextResponse } from "next/server";
import { parseResumeWithAi } from "@/lib/ai/parse-resume";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow } from "@/lib/db";
import { refreshUserAccess } from "@/lib/data";
import { getPlanById } from "@/lib/plans";

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

async function extractResumeText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    const result = await pdfParse(buffer);
    return {
      fileKind: "pdf" as const,
      rawText: result.text,
    };
  }

  if (lowerName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return {
      fileKind: "docx" as const,
      rawText: result.value,
    };
  }

  throw new Error("Only PDF and DOCX resumes are supported.");
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

    const countResult = await dbQuery<{ total: string }>(
      "select count(*)::text as total from public.master_resumes where user_id = $1",
      [user.id],
    );
    const currentCount = Number(firstRow(countResult)?.total ?? "0");

    if (currentCount >= plan.masterResumeLimit) {
      return NextResponse.json(
        { error: "Resume limit reached for your current plan." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Upload a resume file." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Resume file must be 5MB or smaller." }, { status: 400 });
    }

    const { fileKind, rawText } = await extractResumeText(file);
    const aiReadyText = prepareResumeTextForAi(rawText);

    if (!aiReadyText) {
      return NextResponse.json(
        { error: "We could not extract readable text from that resume." },
        { status: 400 },
      );
    }

    const { parsedResume } = await parseResumeWithAi(aiReadyText);

    const result = await dbQuery<{ id: string }>(
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

    const created = firstRow(result);

    await dbQuery(
      `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
       values ($1, 'parse_resume', $2, $3, $4::jsonb)`,
      [
        user.id,
        user.plan,
        user.preferredModelTier,
        JSON.stringify({ fileName: file.name, fileKind }),
      ],
    );

    return NextResponse.json({
      ok: true,
      resumeId: created?.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to upload resume.",
      },
      { status: 400 },
    );
  }
}
