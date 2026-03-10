import OpenAI from "openai";
import { ZodError } from "zod";
import type { ModelTier } from "@/lib/types";
import {
  getEmergencyFallbackModel,
  getModelsForTier,
  type ModelConfig,
} from "@/lib/ai/models";

interface ModelTarget {
  provider: "openai" | "xai";
  modelId: string;
  label: string;
}

interface CompletionOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  modelTier: ModelTier;
}

const openAiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      // Ignore stale OPENAI_BASE_URL env overrides left from prior provider experiments.
      baseURL: "https://api.openai.com/v1",
    })
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

function getStructuredOutputErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Schema validation failed.";
  }

  if (error instanceof SyntaxError) {
    return "Provider returned malformed JSON.";
  }

  return getErrorMessage(error) || "Provider returned invalid structured output.";
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
  const client = target.provider === "xai" ? xAiClient : openAiClient;
  const keyName = target.provider === "xai" ? "XAI_API_KEY" : "OPENAI_API_KEY";

  if (!client) {
    throw new Error(`${keyName} is not configured.`);
  }

  const response = await client.chat.completions.create({
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
  const failedTargets: string[] = [];
  const failureDetails: string[] = [];

  for (const target of targets) {
    try {
      const rawText = await withRetry(() => callProvider(target, options));

      try {
        const parsed = options.validate(JSON.parse(extractJsonCandidate(rawText)));

        return {
          data: parsed,
          primaryModel: primary.label,
          fallbackModel: fallback?.label ?? null,
          usedModel: target.label,
          usedModelTier: options.modelTier,
        };
      } catch (error) {
        failedTargets.push(target.label);
        const message = getStructuredOutputErrorMessage(error);
        failureDetails.push(`${target.label}: ${message}`);
        console.error(`[AI] ${target.label} returned invalid structured output: ${message}`);
      }
    } catch (error) {
      failedTargets.push(target.label);
      const message = getErrorMessage(error) || "Unknown error";
      failureDetails.push(`${target.label}: ${message}`);
      console.error(`[AI] ${target.label} failed: ${message}`);
    }
  }

  throw new Error(
    `AI generation failed across ${failedTargets.join(", ")}. ${failureDetails.join(" | ")}`,
  );
}
