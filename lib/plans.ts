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
    fallbackModel: "GPT-4o mini",
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
    priceInr: 199,
    cadence: "month",
    description:
      "Unlimited tracker, 100 AI auto-fills, and 40 resume tailors for active job seekers.",
    includedDemos: 0,
    monthlyTailors: 40,
    masterResumeLimit: 3,
    monthlyTrackerParses: 100,
    trackerRowLimit: 99999,
    modelTier: "basic",
    primaryModel: "GPT-4o mini",
    fallbackModel: "Grok 3 Mini",
    features: [
      "Unlimited tracked applications",
      "100 AI auto-fills per month",
      "40 tailored resumes per month",
      "3 master resumes",
      "PDF and DOCX export",
      "All prep resources",
      "GST included",
    ],
    ctaLabel: "Choose Basic",
    href: "/signup",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    priceInr: 699,
    cadence: "month",
    description:
      "Unlimited tracker, 300 AI auto-fills, 50 premium tailors with Grok 4 Fast.",
    includedDemos: 0,
    monthlyTailors: 50,
    masterResumeLimit: 10,
    monthlyTrackerParses: 300,
    trackerRowLimit: 99999,
    modelTier: "premium",
    primaryModel: "Grok 4 Fast",
    fallbackModel: "GPT-4o",
    features: [
      "Unlimited tracked applications",
      "300 AI auto-fills per month",
      "50 premium tailored resumes per month",
      "10 master resumes",
      "Premium AI (Grok 4 Fast / GPT-4o)",
      "All templates and prep resources",
      "GST included",
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
