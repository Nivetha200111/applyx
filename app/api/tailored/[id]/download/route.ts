import { z } from "zod";
import { NextResponse } from "next/server";
import { generateResumeDocxBuffer } from "@/lib/docx/generate-docx";
import { generateResumePdfBuffer } from "@/lib/pdf/generate-pdf";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { getTailoredResumeForUser } from "@/lib/data";

export const runtime = "nodejs";

const formatSchema = z.enum(["pdf", "docx"]);

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = formatSchema.parse(url.searchParams.get("format") ?? "pdf");
    const tailored = await getTailoredResumeForUser(user.id, params.id);

    if (!tailored) {
      return NextResponse.json({ error: "Tailored resume not found." }, { status: 404 });
    }

    const buffer =
      format === "pdf"
        ? await generateResumePdfBuffer(tailored.tailoredData)
        : await generateResumeDocxBuffer(tailored.tailoredData);

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

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "content-type":
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "content-disposition": `attachment; filename="applyx-${tailored.id}.${format}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to download resume.",
      },
      { status: 400 },
    );
  }
}
