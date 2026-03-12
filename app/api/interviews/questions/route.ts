import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { generateInterviewQuestions } from "@/lib/ai/mock-interview";
import { toErrorResponse } from "@/lib/security/api";

const requestSchema = z.object({
  jobTitle: z.string().min(1).max(200),
  jobDescription: z.string().min(10).max(10000),
  resumeContext: z.string().max(5000).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: "Gemini API is not configured. Add GEMINI_API_KEY to enable mock interviews." },
        { status: 503 },
      );
    }

    const payload = requestSchema.parse(await request.json());
    const questions = await generateInterviewQuestions(
      payload.jobTitle,
      payload.jobDescription,
      payload.resumeContext,
    );

    return NextResponse.json({ questions });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Failed to generate interview questions.",
      logLabel: "api/interviews/questions",
    });
  }
}

