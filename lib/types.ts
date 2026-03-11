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
  | "purchase"
  | "parse_tracker_jd";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  price: number;
  currency: string;
  cadence: "one-time" | "month";
  description: string;
  includedDemos: number;
  monthlyTailors: number;
  masterResumeLimit: number;
  monthlyTrackerParses: number;
  trackerRowLimit: number;
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
  monthlyTrackerParsesUsed: number;
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

export type ApplicationStatus =
  | "bookmarked"
  | "applying"
  | "applied"
  | "screening"
  | "interviewing"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "ghosted";

export type WorkMode = "remote" | "hybrid" | "onsite" | "unknown";

export interface PrepResource {
  label: string;
  url: string;
  category: "dsa" | "system-design" | "behavioral" | "company-specific" | "general";
}

export type JobSignalRecommendation =
  | "strong_apply"
  | "apply_with_focus"
  | "investigate_first"
  | "avoid";

export type AuthenticityVerdict = "credible" | "mixed" | "risky";

export type CandidateFitVerdict = "strong" | "partial" | "weak" | "unknown";

export interface JobSignalEvidenceItem {
  source: "job_post" | "resume" | "source_url" | "manual";
  sentiment: "positive" | "warning" | "negative" | "neutral";
  label: string;
  detail: string;
}

export interface JobSourceCheck {
  domain: string | null;
  finalUrl: string | null;
  reachable: boolean | null;
  httpStatus: number | null;
  siteName: string | null;
  title: string | null;
  foundStructuredJobPosting: boolean;
  datePosted: string | null;
  validThrough: string | null;
  hiringOrganization: string | null;
}

export interface JobAuthenticityAssessment {
  version: 1;
  provider: "rules-v1";
  mode: "baseline" | "enriched";
  generatedAt: string;
  summary: string;
  recommendation: JobSignalRecommendation;
  overallScore: number;
  authenticityScore: number;
  authenticityVerdict: AuthenticityVerdict;
  candidateFitScore: number | null;
  candidateFitVerdict: CandidateFitVerdict;
  matchedSkills: string[];
  missingSkills: string[];
  positiveSignals: string[];
  riskSignals: string[];
  nextSteps: string[];
  evidence: JobSignalEvidenceItem[];
  sourceCheck: JobSourceCheck | null;
}

export interface TrackedApplicationRecord {
  id: string;
  userId: string;
  companyName: string;
  roleTitle: string;
  location: string | null;
  workMode: WorkMode;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  status: ApplicationStatus;
  priority: number;
  sourceUrl: string | null;
  sourcePlatform: string | null;
  rawJdText: string | null;
  parsedJdData: TrackerParsedJD | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequired: string | null;
  appliedAt: string | null;
  deadlineAt: string | null;
  followUpAt: string | null;
  lastActivityAt: string | null;
  notes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  tailoredResumeId: string | null;
  prepResources: PrepResource[];
  authenticityScore: number | null;
  authenticityAssessment: JobAuthenticityAssessment | null;
  authenticityCheckedAt: string | null;
  followedUp: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerParsedJD extends ParsedJD {
  salaryRange?: { min: number; max: number; currency: string } | null;
  workMode?: WorkMode;
  applicationDeadline?: string | null;
  sourcePlatform?: string | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  planTier: PlanTier;
  amount: number;
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
