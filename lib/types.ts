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

export type ResumeTemplate = "classic" | "modern" | "minimal";

export type UsageAction =
  | "demo"
  | "parse_resume"
  | "parse_job_description"
  | "tailor_resume"
  | "generate_pdf"
  | "generate_docx"
  | "download"
  | "login"
  | "purchase";

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

export interface AppUser {
  id: string;
  fullName: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  plan: PlanTier;
  billingProvider: string;
  billingCycleStart: string;
  billingCycleEnd: string | null;
  demoTailorsUsed: number;
  monthlyTailorsUsed: number;
  monthlyTailorLimit: number;
  preferredModelTier: ModelTier;
  billingCustomerId: string | null;
  billingSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: string;
}

export interface MasterResumeRecord {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string | null;
  fileKind: "pdf" | "docx";
  parsedData: ParsedResume;
  rawText: string | null;
  storageProvider: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescriptionRecord {
  id: string;
  userId: string;
  companyName: string | null;
  jobTitle: string | null;
  rawText: string;
  parsedData: ParsedJD | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TailoredResumeRecord {
  id: string;
  userId: string;
  masterResumeId: string | null;
  jobDescriptionId: string | null;
  tailoredData: ParsedResume;
  changes: TailorChange[];
  planTier: PlanTier;
  modelTier: ModelTier;
  primaryModel: string;
  fallbackModel: string | null;
  matchScoreBefore: number | null;
  matchScoreAfter: number | null;
  templateUsed: ResumeTemplate;
  pdfUrl: string | null;
  docxUrl: string | null;
  storageProvider: string;
  generationLatencyMs: number | null;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  companyName?: string | null;
  jobTitle?: string | null;
}

export interface UsageLogRecord {
  id: string;
  userId: string;
  action: UsageAction;
  planTier: PlanTier;
  modelTier: ModelTier;
  requestCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  planTier: PlanTier;
  amountInr: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  billingProvider: string;
  providerCheckoutId: string | null;
  providerPaymentId: string | null;
  providerSubscriptionId: string | null;
  providerCustomerId: string | null;
  providerSignature: string | null;
  providerEventType: string | null;
  paymentMetadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}
