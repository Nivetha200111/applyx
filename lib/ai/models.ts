import type { ModelTier } from "@/lib/types";

export interface ModelConfig {
  provider: "anthropic" | "openai";
  modelId: string;
  label: string;
  maxTokens: number;
}

const MODELS = {
  "claude-haiku-4-5": {
    provider: "anthropic" as const,
    modelId: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    maxTokens: 2200,
  },
  "gpt-4o-mini": {
    provider: "openai" as const,
    modelId: "gpt-4o-mini",
    label: "GPT-4o mini",
    maxTokens: 2200,
  },
  "claude-sonnet-4": {
    provider: "anthropic" as const,
    modelId: "claude-sonnet-4-20250514",
    label: "Claude Sonnet 4",
    maxTokens: 2800,
  },
  "gpt-4o": {
    provider: "openai" as const,
    modelId: "gpt-4o",
    label: "GPT-4o",
    maxTokens: 2800,
  },
} as const;

const PLAN_MODEL_MAP: Record<
  ModelTier,
  { primary: ModelConfig; fallback: ModelConfig }
> = {
  demo: {
    primary: MODELS["claude-haiku-4-5"],
    fallback: MODELS["gpt-4o-mini"],
  },
  basic: {
    primary: MODELS["gpt-4o-mini"],
    fallback: MODELS["claude-haiku-4-5"],
  },
  premium: {
    primary: MODELS["claude-sonnet-4"],
    fallback: MODELS["gpt-4o"],
  },
};

export function getModelsForTier(modelTier: ModelTier) {
  return PLAN_MODEL_MAP[modelTier];
}

export function getPrimaryModelLabel(modelTier: ModelTier) {
  return PLAN_MODEL_MAP[modelTier].primary.label;
}

export function getFallbackModelLabel(modelTier: ModelTier) {
  return PLAN_MODEL_MAP[modelTier].fallback.label;
}
