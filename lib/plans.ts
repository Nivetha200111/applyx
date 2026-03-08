import type { PlanDefinition, PlanTier, PricingTier } from "@/lib/types";

export const planCatalog: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceInr: 0,
    cadence: "one-time",
    description:
      "A lightweight try-before-you-buy tier for job seekers who want to validate the flow first.",
    includedDemos: 2,
    monthlyTailors: 0,
    masterResumeLimit: 1,
    modelTier: "demo",
    primaryModel: "OpenAI GPT-4.1 mini",
    fallbackModel: "Claude 3.5 Haiku",
    features: [
      "2 live demo tailors",
      "1 master resume",
      "Preview ATS score uplift before paying",
    ],
    ctaLabel: "Try 2 Free Demos",
    href: "/signup",
  },
  {
    id: "basic",
    name: "Basic",
    priceInr: 149,
    cadence: "month",
    description:
      "Low-cost ATS tailoring for active job seekers who care about volume and affordability.",
    includedDemos: 0,
    monthlyTailors: 40,
    masterResumeLimit: 2,
    modelTier: "basic",
    primaryModel: "OpenAI GPT-4.1 mini",
    fallbackModel: "Claude 3.5 Haiku",
    features: [
      "40 tailored resumes per month",
      "2 master resumes",
      "PDF and DOCX export",
      "ATS match score tracking",
    ],
    ctaLabel: "Choose Basic",
    href: "/signup",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceInr: 399,
    cadence: "month",
    description:
      "Higher-quality rewrites and stronger reasoning for applicants targeting their best-fit roles.",
    includedDemos: 0,
    monthlyTailors: 80,
    masterResumeLimit: 5,
    modelTier: "premium",
    primaryModel: "Claude Sonnet 4",
    fallbackModel: "OpenAI GPT-4.1",
    features: [
      "80 premium tailored resumes per month",
      "5 master resumes",
      "Bulk tailoring queue",
      "All templates with priority generation",
    ],
    ctaLabel: "Go Premium",
    href: "/signup",
  },
];

export const pricingTiers: PricingTier[] = planCatalog.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: plan.priceInr === 0 ? "₹0" : `₹${plan.priceInr}`,
  cadence: plan.cadence === "month" ? "/month" : "/demo access",
  description: plan.description,
  usage:
    plan.includedDemos > 0
      ? `${plan.includedDemos} live demo tailors`
      : `${plan.monthlyTailors} tailored resumes / month`,
  modelAccess: plan.fallbackModel
    ? `${plan.primaryModel} primary, ${plan.fallbackModel} fallback`
    : plan.primaryModel,
  features: plan.features,
  ctaLabel: plan.ctaLabel,
  href: plan.href,
  highlighted: plan.highlighted,
}));

export function getPlanById(planId: PlanTier) {
  return planCatalog.find((plan) => plan.id === planId);
}
