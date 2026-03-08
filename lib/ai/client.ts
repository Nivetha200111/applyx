import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ModelTier } from "@/lib/types";
import { getModelsForTier, type ModelConfig } from "@/lib/ai/models";

interface ModelTarget {
  provider: "anthropic" | "openai";
  modelId: string;
  label: string;
}

interface CompletionOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  modelTier: ModelTier;
}

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openAiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function toTarget(config: ModelConfig): ModelTarget {
  return {
    provider: config.provider,
    modelId: config.modelId,
    label: config.label,
  };
}

function getModelTargets(modelTier: ModelTier): [ModelTarget, ModelTarget | null] {
  const { primary, fallback } = getModelsForTier(modelTier);
  return [toTarget(primary), toTarget(fallback)];
}

function getTextFromAnthropicResponse(
  response: {
    content: Array<{ type: string; text?: string }>;
  },
) {
  return response.content
    .map((block) => (block.type === "text" ? block.text ?? "" : ""))
    .join("\n")
    .trim();
}

function extractJsonCandidate(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await wait(400 * 2 ** attempt);
      }
    }
  }

  throw lastError;
}

async function callProvider(target: ModelTarget, options: CompletionOptions) {
  if (target.provider === "anthropic") {
    if (!anthropicClient) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const response = await anthropicClient.messages.create({
      model: target.modelId,
      max_tokens: options.maxTokens ?? 2200,
      temperature: options.temperature ?? 0.2,
      messages: [{ role: "user", content: options.prompt }],
    });

    return getTextFromAnthropicResponse(response);
  }

  if (!openAiClient) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await openAiClient.chat.completions.create({
    model: target.modelId,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 2200,
    messages: [{ role: "user", content: options.prompt }],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function completeJson<T>(
  options: CompletionOptions & {
    validate: (value: unknown) => T;
  },
) {
  const [primary, fallback] = getModelTargets(options.modelTier);
  let rawText = "";
  let usedPrimary = primary;

  try {
    rawText = await withRetry(() => callProvider(primary, options));
  } catch (primaryError) {
    if (!fallback) {
      throw primaryError;
    }

    usedPrimary = fallback;
    rawText = await withRetry(() => callProvider(fallback, options));
  }

  const parsed = options.validate(JSON.parse(extractJsonCandidate(rawText)));

  return {
    data: parsed,
    primaryModel: primary.label,
    fallbackModel: fallback?.label ?? null,
    usedModel: usedPrimary.label,
    usedModelTier: options.modelTier,
  };
}
