import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { evaluateAnswer, type InterviewQuestion } from "@/lib/ai/mock-interview";

const questionSchema = z.object({
  id: z.number(),
  question: z.string(),
  type: z.enum(["behavioral", "technical", "situational", "role-specific"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  idealAnswer: z.string(),
  keyPoints: z.array(z.string()),
});

const requestSchema = z.object({
  question: questionSchema,
  answer: z.string().min(1).max(10000),
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
    const feedback = await evaluateAnswer(
      payload.question as InterviewQuestion,
      payload.answer,
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? `Validation error: ${error.issues.map((i) => i.message).join(", ")}`
        : error instanceof Error
          ? error.message
          : "Unknown error evaluating answer.";

    console.error("[api/interviews/evaluate]", message, error);

    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

