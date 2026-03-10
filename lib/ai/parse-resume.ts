import { buildResumeParsingPrompt } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { parsedResumeSchema } from "@/lib/ai/schemas";
import { HttpError } from "@/lib/security/api";
import type { ParsedResume } from "@/lib/types";

export async function parseResumeWithAi(rawText: string): Promise<{
  parsedResume: ParsedResume;
  usedModel: string;
}> {
  let result;

  try {
    result = await completeJson({
      prompt: buildResumeParsingPrompt(rawText),
      modelTier: "basic",
      validate: (value) => parsedResumeSchema.parse(value),
    });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && /zod/i.test(error.name))) {
      throw new HttpError(
        502,
        "We extracted the resume text, but the AI parser returned an invalid structure. Please retry once.",
      );
    }

    throw error;
  }

  return {
    parsedResume: result.data,
    usedModel: result.usedModel,
  };
}
