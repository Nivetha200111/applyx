import type { ModelTier } from "@/lib/types";

export interface ModelConfig {
  provider: "openai" | "xai";
  modelId: string;
  label: string;
  maxTokens: number;
}

const MODELS = {
  "grok-3-mini": {
    provider: "xai" as const,
    modelId: "grok-3-mini",
    label: "Grok 3 Mini",
    maxTokens: 2200,
  },
  "gpt-4o-mini": {
    provider: "openai" as const,
    modelId: "gpt-4o-mini",
    label: "GPT-4o mini",
    maxTokens: 2200,
  },
  "grok-4-fast": {
    provider: "xai" as const,
    modelId: "grok-4-fast-non-reasoning",
    label: "Grok 4 Fast",
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
    primary: MODELS["grok-3-mini"],
    fallback: MODELS["gpt-4o-mini"],
  },
  basic: {
    primary: MODELS["gpt-4o-mini"],
    fallback: MODELS["grok-3-mini"],
  },
  premium: {
    primary: MODELS["grok-4-fast"],
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

export function getEmergencyFallbackModel() {
  return MODELS["grok-4-fast"];
}
