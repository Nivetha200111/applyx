import { z } from "zod";
import { NextResponse } from "next/server";
import { generateResumeDocxBuffer } from "@/lib/docx/generate-docx";
import { generateResumePdfBuffer } from "@/lib/pdf/generate-pdf";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { getTailoredResumeForUser } from "@/lib/data";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const formatSchema = z.enum(["pdf", "docx"]);

function slugPart(value: string | null | undefined, fallback: string) {
  const normalized = (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, 48);
}

function buildDownloadFileName(input: {
  jobTitle?: string | null;
  companyName?: string | null;
  resumeId: string;
  format: "pdf" | "docx";
}) {
  const role = slugPart(input.jobTitle, "untitled-role");
  const company = slugPart(input.companyName, "company");

  return `applyx-${role}-${company}-${input.resumeId}.${input.format}`;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tailored:download",
      identifier: user.id,
      limit: 20,
      windowSeconds: 60,
      message: "Download rate limit reached. Please wait a minute and try again.",
    });

    const url = new URL(request.url);
    const format = formatSchema.parse(url.searchParams.get("format") ?? "pdf");
    const tailored = await getTailoredResumeForUser(user.id, params.id);

    if (!tailored) {
      return NextResponse.json({ error: "Tailored resume not found." }, { status: 404 });
    }

    const buffer =
      format === "pdf"
        ? await generateResumePdfBuffer(tailored.tailoredData, tailored.templateUsed)
        : await generateResumeDocxBuffer(tailored.tailoredData, tailored.templateUsed);

    await dbQuery(
      `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
       values ($1, $2, $3, $4, $5::jsonb)`,
      [
        user.id,
        format === "pdf" ? "generate_pdf" : "generate_docx",
        user.plan,
        user.preferredModelTier,
        JSON.stringify({ tailoredResumeId: tailored.id, format }),
      ],
    );

    await dbQuery(
      `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
       values ($1, 'download', $2, $3, $4::jsonb)`,
      [
        user.id,
        user.plan,
        user.preferredModelTier,
        JSON.stringify({ tailoredResumeId: tailored.id, format }),
      ],
    );

    const fileName = buildDownloadFileName({
      jobTitle: tailored.jobTitle,
      companyName: tailored.companyName,
      resumeId: tailored.id,
      format,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "content-type":
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to download that resume right now.",
      logLabel: "api/tailored/download",
    });
  }
}
