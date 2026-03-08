export interface ParsedResume {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
    highlights?: string[];
  }>;
  skills: {
    technical: string[];
    tools: string[];
    soft?: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    techStack: string[];
    link?: string;
    bullets?: string[];
  }>;
  achievements?: string[];
  publications?: string[];
}

export interface ParsedJD {
  title: string;
  company: string;
  location?: string;
  type?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: string;
  keyResponsibilities: string[];
  keywords: string[];
  industryTerms: string[];
  educationRequirement?: string;
}

export interface TailorChange {
  type: "rewrite" | "reorder" | "add" | "remove";
  section: string;
  description: string;
}

export interface TailorResult {
  tailored_resume: ParsedResume;
  match_score_before: number;
  match_score_after: number;
  changes: TailorChange[];
}

export type PlanTier = "free" | "basic" | "premium";

export type ModelTier = "demo" | "basic" | "premium";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  priceInr: number;
  cadence: "one-time" | "month";
  description: string;
  includedDemos: number;
  monthlyTailors: number;
  masterResumeLimit: number;
  modelTier: ModelTier;
  primaryModel: string;
  fallbackModel?: string;
  features: string[];
  ctaLabel: string;
  href: string;
  highlighted?: boolean;
}

export interface PricingTier {
  id: PlanTier;
  name: string;
  price: string;
  cadence: string;
  description: string;
  usage: string;
  modelAccess: string;
  features: string[];
  ctaLabel: string;
  href: string;
  highlighted?: boolean;
}
