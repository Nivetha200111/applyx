import { buildResumeParsingPrompt } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { parsedResumeSchema } from "@/lib/ai/schemas";
import type { ParsedResume } from "@/lib/types";

export async function parseResumeWithAi(rawText: string): Promise<{
  parsedResume: ParsedResume;
  usedModel: string;
}> {
  const result = await completeJson({
    prompt: buildResumeParsingPrompt(rawText),
    modelTier: "basic",
    validate: (value) => parsedResumeSchema.parse(value),
  });

  return {
    parsedResume: result.data,
    usedModel: result.usedModel,
  };
}
