import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ModelTier } from "@/lib/types";
import {
  getEmergencyFallbackModel,
  getModelsForTier,
  type ModelConfig,
} from "@/lib/ai/models";

interface ModelTarget {
  provider: "anthropic" | "openai" | "xai";
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

const xAiClient = process.env.XAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: "https://api.x.ai/v1",
    })
  : null;

function toTarget(config: ModelConfig): ModelTarget {
  return {
    provider: config.provider,
    modelId: config.modelId,
    label: config.label,
  };
}

function getModelTargets(modelTier: ModelTier) {
  const { primary, fallback } = getModelsForTier(modelTier);
  const emergencyFallback = getEmergencyFallbackModel();

  return [primary, fallback, emergencyFallback].map(toTarget).filter((target, index, targets) => (
    targets.findIndex((candidate) => (
      candidate.provider === target.provider && candidate.modelId === target.modelId
    )) === index
  ));
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : "";
  }

  return "";
}

function isNonRetriableProviderError(error: unknown) {
  const message = getErrorMessage(error);

  return /credit balance is too low|insufficient credits|billing|quota|invalid[_ ]request/i.test(
    message,
  );
}

async function withRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (isNonRetriableProviderError(error)) {
        throw error;
      }

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

  if (target.provider === "openai") {
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

  if (!xAiClient) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const response = await xAiClient.chat.completions.create({
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
  const targets = getModelTargets(options.modelTier);
  const primary = targets[0];
  const fallback = targets[1] ?? null;
  let rawText = "";
  let usedTarget = primary;
  const failedTargets: string[] = [];

  for (const target of targets) {
    try {
      rawText = await withRetry(() => callProvider(target, options));
      usedTarget = target;
      break;
    } catch {
      failedTargets.push(target.label);
    }
  }

  if (!rawText) {
    throw new Error(
      `AI generation failed across ${failedTargets.join(", ")}. Check provider credits and API keys.`,
    );
  }

  const parsed = options.validate(JSON.parse(extractJsonCandidate(rawText)));

  return {
    data: parsed,
    primaryModel: primary.label,
    fallbackModel: fallback?.label ?? null,
    usedModel: usedTarget.label,
    usedModelTier: options.modelTier,
  };
}
