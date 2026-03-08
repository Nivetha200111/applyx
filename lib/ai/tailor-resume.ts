import { buildResumeTailoringPrompt } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { tailorResultSchema } from "@/lib/ai/schemas";
import type { ModelTier, ParsedJD, ParsedResume, TailorResult } from "@/lib/types";

export async function tailorResumeWithAi(
  parsedResume: ParsedResume,
  parsedJd: ParsedJD,
  modelTier: ModelTier,
): Promise<{
  tailorResult: TailorResult;
  usedModel: string;
}> {
  const result = await completeJson({
    prompt: buildResumeTailoringPrompt(parsedResume, parsedJd),
    modelTier,
    maxTokens: 2800,
    validate: (value) => tailorResultSchema.parse(value),
  });

  return {
    tailorResult: result.data,
    usedModel: result.usedModel,
  };
}
