import type { WorkMode } from "@/lib/types";

export type ExternalJobSource = "remoteok" | "adzuna";

export interface ExternalJob {
  externalId: string;
  source: ExternalJobSource;
  title: string;
  company: string;
  location: string | null;
  tags: string[];
  description: string;
  applyUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  postedAt: string;
  workMode: WorkMode;
}

export interface ScoredJob extends ExternalJob {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface JobFeedResponse {
  jobs: ScoredJob[];
  skills: string[];
  sources: ExternalJobSource[];
  error?: string;
}
