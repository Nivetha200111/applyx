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
      "Manual status & follow-up tracking",
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
      "Unlimited tracker, 50 AI auto-fills, and 20 fast tailors for high-volume application weeks.",
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
      "Auto-set status & follow-up on parse",
      "Follow-up reminders & snooze",
      "Fast tailoring with Grok 3 Mini",
      "Analytics, templates & interview prep",
      "PDF and DOCX export",
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
      "Unlimited tracker, unlimited AI auto-fills, and 100 higher-quality tailors for nuanced or competitive roles.",
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
      "Full automation: parse → tailor → status → follow-up",
      "Auto-tailor primary resume on JD paste",
      "Grok 4 Fast primary for higher-quality rewrites",
      "Analytics, templates & interview prep",
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
  modelAccess:
    plan.id === "premium"
      ? "Grok 4 Fast primary for deeper rewrites on tougher JDs, with Grok 3 Mini as fallback."
      : plan.id === "basic"
        ? "Grok 3 Mini primary for faster, efficient tailoring, with Grok 4 Fast as fallback."
        : "Demo access with Grok 3 Mini primary and Grok 4 Fast fallback.",
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
