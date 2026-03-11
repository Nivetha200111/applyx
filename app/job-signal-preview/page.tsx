"use client";

import Link from "next/link";
import { useState } from "react";
import { JobAuthenticityCard } from "@/components/tracker/job-authenticity-card";
import { buttonVariants } from "@/components/ui/button";
import type { TrackedApplicationRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const previewApplication: TrackedApplicationRecord = {
  id: "preview-job-authenticity-signal",
  userId: "preview-user",
  companyName: "Figma",
  roleTitle: "Product Engineer",
  location: "Bengaluru, India",
  workMode: "hybrid",
  salaryMin: 32,
  salaryMax: 45,
  salaryCurrency: "LPA",
  status: "bookmarked",
  priority: 4,
  sourceUrl: "https://boards.greenhouse.io/figma/jobs/1234567",
  sourcePlatform: "greenhouse",
  rawJdText:
    "Figma is hiring a Product Engineer to work across React, TypeScript, design systems, experimentation, and backend APIs. You will partner with product and design, own features end to end, and improve collaboration tooling.",
  parsedJdData: {
    title: "Product Engineer",
    company: "Figma",
    location: "Bengaluru, India",
    type: "Full-time",
    requiredSkills: ["React", "TypeScript", "Design Systems", "Node.js", "Experimentation"],
    preferredSkills: ["GraphQL", "Analytics", "Product Thinking"],
    requiredExperience: "3+ years",
    keyResponsibilities: [
      "Own product features end to end",
      "Partner closely with design and product",
      "Improve collaboration workflows",
    ],
    keywords: ["React", "TypeScript", "frontend", "experimentation", "design systems"],
    industryTerms: ["product engineering", "collaboration tooling"],
    educationRequirement: "Not specified",
    salaryRange: { min: 32, max: 45, currency: "LPA" },
    workMode: "hybrid",
    applicationDeadline: "2026-04-10T00:00:00.000Z",
    sourcePlatform: "greenhouse",
  },
  requiredSkills: ["React", "TypeScript", "Design Systems", "Node.js", "Experimentation"],
  preferredSkills: ["GraphQL", "Analytics", "Product Thinking"],
  experienceRequired: "3+ years",
  appliedAt: null,
  deadlineAt: "2026-04-10T00:00:00.000Z",
  followUpAt: null,
  lastActivityAt: null,
  notes: "Strong product + frontend role with clear hiring loop and recent ATS page.",
  contactName: null,
  contactEmail: "careers@figma.com",
  tailoredResumeId: null,
  prepResources: [],
  authenticityScore: 86,
  authenticityAssessment: {
    version: 1,
    provider: "rules-v1",
    mode: "enriched",
    generatedAt: "2026-03-11T14:30:00.000Z",
    summary:
      "The posting has enough structure and sourcing detail to look credible. Your resume looks like a partial fit.",
    recommendation: "apply_with_focus",
    overallScore: 79,
    authenticityScore: 86,
    authenticityVerdict: "credible",
    candidateFitScore: 67,
    candidateFitVerdict: "partial",
    matchedSkills: ["react", "typescript", "design systems"],
    missingSkills: ["node", "experimentation"],
    positiveSignals: [
      "The company name is present.",
      "A source URL is attached to the application.",
      "The application points to a recognized job platform or company-owned domain.",
      "The posting appears to be recent.",
    ],
    riskSignals: [
      "You still need stronger evidence for backend ownership.",
      "Experimentation experience is not yet proven on the primary resume.",
    ],
    nextSteps: [
      "Tailor your resume to the missing skills before you apply.",
      "Add one bullet that shows experimentation or product metrics ownership.",
      "Use the real tracker flow to run live source verification against the posting URL.",
    ],
    evidence: [
      {
        source: "job_post",
        sentiment: "positive",
        label: "Company identified",
        detail: "Figma",
      },
      {
        source: "resume",
        sentiment: "neutral",
        label: "Resume fit",
        detail: "Matched 3/5 core skills",
      },
      {
        source: "source_url",
        sentiment: "positive",
        label: "Posting date",
        detail: "2026-03-08T00:00:00.000Z",
      },
    ],
    sourceCheck: {
      domain: "boards.greenhouse.io",
      finalUrl: "https://boards.greenhouse.io/figma/jobs/1234567",
      reachable: true,
      httpStatus: 200,
      siteName: "Greenhouse",
      title: "Product Engineer at Figma",
      foundStructuredJobPosting: true,
      datePosted: "2026-03-08T00:00:00.000Z",
      validThrough: "2026-04-10T00:00:00.000Z",
      hiringOrganization: "Figma",
    },
  },
  authenticityCheckedAt: "2026-03-11T14:30:00.000Z",
  followedUp: false,
  isArchived: false,
  createdAt: "2026-03-11T14:25:00.000Z",
  updatedAt: "2026-03-11T14:30:00.000Z",
};

export default function JobSignalPreviewPage() {
  const [application, setApplication] = useState(previewApplication);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Local Preview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Job Authenticity Signal
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            This is a static preview of the tracker card on
            `feature/job-authenticity-signal`. The live version appears inside tracked
            applications and can run a real source check against the job URL.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className={cn(buttonVariants())} href="/tracker">
              Open Tracker
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
              Back Home
            </Link>
          </div>
        </div>

        <JobAuthenticityCard
          app={application}
          onApplicationReplace={setApplication}
          refreshEnabled={false}
        />
      </div>
    </main>
  );
}
