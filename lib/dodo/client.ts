import DodoPayments from "dodopayments";
import type { PlanTier } from "@/lib/types";
import { getSiteUrl } from "@/lib/site-url";

type PaidPlanTier = Exclude<PlanTier, "free">;
type DodoEnvironment = "test_mode" | "live_mode";

const planEnvMap: Record<PaidPlanTier, string> = {
  basic: "DODO_BASIC_PRODUCT_ID",
  premium: "DODO_PREMIUM_PRODUCT_ID",
};

export function getDodoEnvironment(): DodoEnvironment {
  return process.env.DODO_ENVIRONMENT?.trim() === "test_mode" ? "test_mode" : "live_mode";
}

export function getDodoClient() {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY?.trim();

  if (!bearerToken) {
    throw new Error("Dodo Payments API key is not configured.");
  }

  return new DodoPayments({
    bearerToken,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim() ?? null,
    environment: getDodoEnvironment(),
    timeout: 15_000,
    maxRetries: 2,
  });
}

export function getDodoProductId(planId: PaidPlanTier) {
  const envName = planEnvMap[planId];
  const productId = process.env[envName]?.trim();

  if (!productId) {
    throw new Error(`${envName} is not configured.`);
  }

  return productId;
}

export function getPlanIdForDodoProductId(productId: string | null | undefined): PaidPlanTier | null {
  if (!productId) {
    return null;
  }

  for (const [planId, envName] of Object.entries(planEnvMap) as Array<[PaidPlanTier, string]>) {
    if (process.env[envName]?.trim() === productId) {
      return planId;
    }
  }

  return null;
}

export function getDodoReturnUrl(planId: PaidPlanTier) {
  const siteUrl = getSiteUrl();
  const params = new URLSearchParams({
    billing: "return",
    provider: "dodo",
    plan: planId,
  });

  return `${siteUrl}/settings?${params.toString()}`;
}
