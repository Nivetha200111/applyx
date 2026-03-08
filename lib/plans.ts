import type { PlanDefinition, PlanTier, PricingTier } from "@/lib/types";

export const planCatalog: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceInr: 0,
    cadence: "one-time",
    description:
      "Try before you buy. Get 2 free demo tailors to see the ATS score uplift for yourself.",
    includedDemos: 2,
    monthlyTailors: 0,
    masterResumeLimit: 1,
    modelTier: "demo",
    primaryModel: "Claude Haiku 4.5",
    fallbackModel: "GPT-4o mini",
    features: [
      "2 live demo tailors",
      "1 master resume",
      "Basic AI (Haiku / GPT-4o mini)",
      "Preview ATS score uplift",
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
      "GST-inclusive launch pricing for active job seekers who need affordable weekly tailoring.",
    includedDemos: 0,
    monthlyTailors: 40,
    masterResumeLimit: 3,
    modelTier: "basic",
    primaryModel: "GPT-4o mini",
    fallbackModel: "Claude Haiku 4.5",
    features: [
      "40 tailored resumes per month",
      "3 master resumes",
      "PDF and DOCX export",
      "ATS match score tracking",
      "GST included",
      "Affordable AI (GPT-4o mini / Haiku)",
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
      "GST-inclusive premium tier with Claude Sonnet 4 quality and a sustainable monthly cap.",
    includedDemos: 0,
    monthlyTailors: 50,
    masterResumeLimit: 10,
    modelTier: "premium",
    primaryModel: "Claude Sonnet 4",
    fallbackModel: "GPT-4o",
    features: [
      "50 premium tailored resumes per month",
      "10 master resumes",
      "Premium AI (Claude Sonnet 4 / GPT-4o)",
      "Priority generation speed",
      "All templates",
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
