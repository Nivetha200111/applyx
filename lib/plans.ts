import type { PlanDefinition, PlanTier, PricingTier } from "@/lib/types";

export const planCatalog: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceInr: 0,
    cadence: "one-time",
    description:
      "Try before you buy. Track 10 applications and get 2 free demo tailors.",
    includedDemos: 2,
    monthlyTailors: 0,
    masterResumeLimit: 1,
    monthlyTrackerParses: 5,
    trackerRowLimit: 10,
    modelTier: "demo",
    primaryModel: "Grok 3 Mini",
    fallbackModel: "Grok 4 Fast",
    features: [
      "10 tracked applications",
      "5 AI auto-fills from JD",
      "2 live demo tailors",
      "1 master resume",
      "Prep resource links",
    ],
    ctaLabel: "Try 2 Free Demos",
    href: "/signup",
  },
  {
    id: "basic",
    name: "Basic",
    priceInr: 249,
    cadence: "month",
    description:
      "Unlimited tracker, 50 AI auto-fills, and 20 resume tailors for active job seekers.",
    includedDemos: 0,
    monthlyTailors: 20,
    masterResumeLimit: 3,
    monthlyTrackerParses: 50,
    trackerRowLimit: 99999,
    modelTier: "basic",
    primaryModel: "Grok 3 Mini",
    fallbackModel: "Grok 4 Fast",
    features: [
      "Unlimited tracked applications",
      "50 AI auto-fills per month",
      "20 tailored resumes per month",
      "3 master resumes",
      "PDF and DOCX export",
      "All prep resources",
      "Taxes included where applicable",
    ],
    ctaLabel: "Choose Basic",
    href: "/signup",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceInr: 599,
    cadence: "month",
    description:
      "Unlimited tracker, unlimited AI auto-fills, 100 premium tailors with Grok 4 Fast.",
    includedDemos: 0,
    monthlyTailors: 100,
    masterResumeLimit: 99999,
    monthlyTrackerParses: 99999,
    trackerRowLimit: 99999,
    modelTier: "premium",
    primaryModel: "Grok 4 Fast",
    fallbackModel: "Grok 3 Mini",
    features: [
      "Unlimited tracked applications",
      "Unlimited AI auto-fills",
      "100 premium tailored resumes per month",
      "Unlimited master resumes",
      "Premium AI (Grok 4 Fast / Grok 3 Mini)",
      "All templates and prep resources",
      "Taxes included where applicable",
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

export function isUnlimitedPlan(monthlyTailorLimit: number) {
  return monthlyTailorLimit > 9999;
}
