import {
  buildResumeParsingPrompt,
  buildResumeParsingRepairPrompt,
} from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { parsedResumeSchema } from "@/lib/ai/schemas";
import { HttpError } from "@/lib/security/api";
import type { ParsedResume } from "@/lib/types";

const RESUME_PARSE_MAX_TOKENS = 4800;

function isStructuredParseFailure(error: unknown) {
  return error instanceof SyntaxError || (error instanceof Error && /zod/i.test(error.name));
}

export async function parseResumeWithAi(rawText: string): Promise<{
  parsedResume: ParsedResume;
  usedModel: string;
}> {
  async function runParse(prompt: string) {
    return completeJson({
      prompt,
      modelTier: "basic",
      maxTokens: RESUME_PARSE_MAX_TOKENS,
      temperature: 0,
      validate: (value) => parsedResumeSchema.parse(value),
    });
  }

  let result;

  try {
    result = await runParse(buildResumeParsingPrompt(rawText));
  } catch (error) {
    if (!isStructuredParseFailure(error)) {
      throw error;
    }

    try {
      result = await runParse(buildResumeParsingRepairPrompt(rawText));
    } catch (repairError) {
      if (isStructuredParseFailure(repairError)) {
        throw new HttpError(
          502,
          "We extracted the resume text, but the AI parser returned an invalid structure. Please retry once.",
        );
      }

      throw repairError;
    }
  }

  return {
    parsedResume: result.data,
    usedModel: result.usedModel,
  };
}
