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

export interface PricingTier {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  ctaLabel: string;
  href: string;
  highlighted?: boolean;
}
