import { z } from "zod";
import { embedText, cosineSimilarity, generateJsonContent } from "./gemini";

// ── Schemas ──

const interviewQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.number(),
      question: z.string(),
      type: z.enum(["behavioral", "technical", "situational", "role-specific"]),
      difficulty: z.enum(["easy", "medium", "hard"]),
      idealAnswer: z.string(),
      keyPoints: z.array(z.string()),
    }),
  ),
});

const answerFeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  sampleResponse: z.string(),
  keyPointsCovered: z.array(z.string()),
  keyPointsMissed: z.array(z.string()),
});

const interviewSummarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  overallFeedback: z.string(),
  topStrengths: z.array(z.string()),
  areasToImprove: z.array(z.string()),
  recommendations: z.array(z.string()),
  hiringLikelihood: z.enum(["strong_yes", "yes", "maybe", "no", "strong_no"]),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionsSchema>["questions"][number];
export type AnswerFeedback = z.infer<typeof answerFeedbackSchema>;
export type InterviewSummary = z.infer<typeof interviewSummarySchema>;

// ── Generate Interview Questions ──

export async function generateInterviewQuestions(
  jobTitle: string,
  jobDescription: string,
  resumeContext?: string,
): Promise<InterviewQuestion[]> {
  const resumeNote = resumeContext
    ? `\n\nCandidate resume context:\n${resumeContext}`
    : "";

  const prompt = `You are an expert interviewer conducting a mock job interview.

Job Title: ${jobTitle}
Job Description: ${jobDescription}${resumeNote}

Generate exactly 8 interview questions for this role. Include a mix of:
- 2 behavioral questions (STAR method appropriate)
- 2 technical questions specific to the role
- 2 situational questions (hypothetical scenarios)
- 2 role-specific questions about domain knowledge

For each question, provide:
- A clear question
- The type (behavioral/technical/situational/role-specific)
- Difficulty level (easy/medium/hard)
- An ideal answer that would score perfectly (2-3 paragraphs)
- 3-5 key points that a strong answer should cover

Return JSON matching this schema:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "type": "behavioral",
      "difficulty": "medium",
      "idealAnswer": "...",
      "keyPoints": ["...", "..."]
    }
  ]
}`;

  const result = await generateJsonContent(prompt, (v) =>
    interviewQuestionsSchema.parse(v),
  );

  return result.questions;
}

// ── Evaluate Answer with Embedding Similarity + LLM Feedback ──

export async function evaluateAnswer(
  question: InterviewQuestion,
  userAnswer: string,
): Promise<AnswerFeedback & { semanticScore: number }> {
  // Step 1: Use Gemini Embedding 2 to compute semantic similarity
  // between user's answer and the ideal answer
  const [userEmbedding, idealEmbedding] = await Promise.all([
    embedText(userAnswer),
    embedText(question.idealAnswer),
  ]);

  const semanticScore = Math.round(
    Math.max(0, cosineSimilarity(userEmbedding, idealEmbedding)) * 100,
  );

  // Step 2: Use Gemini generative model for detailed feedback
  const prompt = `You are an expert interview coach evaluating a candidate's answer.

Interview Question: ${question.question}
Question Type: ${question.type}
Difficulty: ${question.difficulty}

Key Points Expected: ${question.keyPoints.join(", ")}

Ideal Answer: ${question.idealAnswer}

Candidate's Answer: ${userAnswer}

Semantic Similarity Score (from embedding comparison): ${semanticScore}%

Evaluate the candidate's answer and provide detailed feedback. Consider:
1. Content relevance and accuracy
2. Structure and clarity
3. Specific examples and evidence
4. Coverage of key points
5. Communication quality

Return JSON:
{
  "score": <0-100 overall score>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "sampleResponse": "A brief example of how they could improve their answer...",
  "keyPointsCovered": ["covered point 1"],
  "keyPointsMissed": ["missed point 1"]
}`;

  const feedback = await generateJsonContent(prompt, (v) =>
    answerFeedbackSchema.parse(v),
  );

  return { ...feedback, semanticScore };
}

// ── Generate Interview Summary ──

export async function generateInterviewSummary(
  jobTitle: string,
  questionsAndAnswers: Array<{
    question: InterviewQuestion;
    answer: string;
    feedback: AnswerFeedback & { semanticScore: number };
  }>,
): Promise<InterviewSummary> {
  const qaText = questionsAndAnswers
    .map(
      (qa, i) =>
        `Q${i + 1} [${qa.question.type}/${qa.question.difficulty}]: ${qa.question.question}\nAnswer: ${qa.answer}\nScore: ${qa.feedback.score}/100 (Semantic: ${qa.feedback.semanticScore}%)\nStrengths: ${qa.feedback.strengths.join(", ")}\nImprovements: ${qa.feedback.improvements.join(", ")}`,
    )
    .join("\n\n");

  const avgScore = Math.round(
    questionsAndAnswers.reduce((sum, qa) => sum + qa.feedback.score, 0) /
      questionsAndAnswers.length,
  );

  const prompt = `You are an expert hiring manager summarizing a mock interview.

Job Title: ${jobTitle}
Average Score: ${avgScore}/100

Questions and Answers:
${qaText}

Provide a comprehensive interview summary. Return JSON:
{
  "overallScore": <0-100>,
  "overallFeedback": "2-3 paragraph summary of their performance...",
  "topStrengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "recommendations": ["specific actionable recommendation 1", "recommendation 2"],
  "hiringLikelihood": "strong_yes|yes|maybe|no|strong_no"
}`;

  return generateJsonContent(prompt, (v) => interviewSummarySchema.parse(v));
}

