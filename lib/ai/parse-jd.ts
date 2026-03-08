import { buildJdAnalysisPrompt } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { parsedJdSchema } from "@/lib/ai/schemas";
import type { ParsedJD, ModelTier } from "@/lib/types";

export async function parseJdWithAi(
  jdText: string,
  modelTier: ModelTier,
): Promise<{
  parsedJd: ParsedJD;
  usedModel: string;
}> {
  const result = await completeJson({
    prompt: buildJdAnalysisPrompt(jdText),
    modelTier,
    validate: (value) => parsedJdSchema.parse(value),
  });

  return {
    parsedJd: result.data,
    usedModel: result.usedModel,
  };
}
