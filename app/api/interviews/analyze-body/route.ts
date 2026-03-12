import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { analyzeBodyLanguage } from "@/lib/ai/mock-interview";

export const maxDuration = 30;

const requestSchema = z.object({
  // Base64-encoded image data (without the data: prefix)
  image: z.string().min(100).max(2_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 503 },
      );
    }

    const payload = requestSchema.parse(await request.json());
    const analysis = await analyzeBodyLanguage(payload.image, payload.mimeType);

    return NextResponse.json({ analysis });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? `Validation error: ${error.issues.map((i) => i.message).join(", ")}`
        : error instanceof Error
          ? error.message
          : "Unknown error analyzing body language.";

    console.error("[api/interviews/analyze-body]", message, error);

    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

