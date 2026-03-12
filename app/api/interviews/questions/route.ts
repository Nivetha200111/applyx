import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { generateInterviewQuestions } from "@/lib/ai/mock-interview";

// Allow up to 30s for Gemini to generate questions (Vercel Pro: 60s, Hobby: 10s)
export const maxDuration = 30;

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
        {
          error:
            "Gemini API is not configured. Add GEMINI_API_KEY to your environment variables.",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const payload = requestSchema.parse(body);
    const questions = await generateInterviewQuestions(
      payload.jobTitle,
      payload.jobDescription,
      payload.resumeContext,
    );

    return NextResponse.json({ questions });
  } catch (error) {
    // Return the actual error message so we can debug on the client
    const message =
      error instanceof z.ZodError
        ? `Validation error: ${error.issues.map((i) => i.message).join(", ")}`
        : error instanceof Error
          ? error.message
          : "Unknown error generating interview questions.";

    console.error("[api/interviews/questions]", message, error);

    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

