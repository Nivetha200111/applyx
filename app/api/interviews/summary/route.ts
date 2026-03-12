import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isGeminiConfigured } from "@/lib/ai/gemini";
import { generateInterviewSummary } from "@/lib/ai/mock-interview";
import { toErrorResponse } from "@/lib/security/api";

const questionSchema = z.object({
  id: z.number(),
  question: z.string(),
  type: z.enum(["behavioral", "technical", "situational", "role-specific"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  idealAnswer: z.string(),
  keyPoints: z.array(z.string()),
});

const feedbackSchema = z.object({
  score: z.number(),
  semanticScore: z.number(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sampleResponse: z.string(),
  keyPointsCovered: z.array(z.string()),
  keyPointsMissed: z.array(z.string()),
});

const requestSchema = z.object({
  jobTitle: z.string(),
  questionsAndAnswers: z.array(
    z.object({
      question: questionSchema,
      answer: z.string(),
      feedback: feedbackSchema,
    }),
  ),
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
    const summary = await generateInterviewSummary(
      payload.jobTitle,
      payload.questionsAndAnswers,
    );

    return NextResponse.json({ summary });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Failed to generate interview summary.",
      logLabel: "api/interviews/summary",
    });
  }
}

