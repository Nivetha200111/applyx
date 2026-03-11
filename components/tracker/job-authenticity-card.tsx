"use client";

import { useState } from "react";
import { RefreshCw, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  JobAuthenticityAssessment,
  JobSignalRecommendation,
  TrackedApplicationRecord,
} from "@/lib/types";

interface JobAuthenticityCardProps {
  app: TrackedApplicationRecord;
  onApplicationReplace: (application: TrackedApplicationRecord) => void;
  refreshEnabled?: boolean;
}

const checkedAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function getRecommendationLabel(value: JobSignalRecommendation) {
  switch (value) {
    case "strong_apply":
      return "Strong apply";
    case "apply_with_focus":
      return "Apply with focus";
    case "investigate_first":
      return "Investigate first";
    case "avoid":
      return "Avoid";
  }
}

function getVerdictTone(assessment: JobAuthenticityAssessment | null) {
  if (!assessment) {
    return {
      accent: "border-border/70 bg-background/30 text-foreground",
      badge: "border-border/70 text-muted-foreground",
      icon: ShieldQuestion,
    };
  }

  if (assessment.authenticityVerdict === "credible") {
    return {
      accent: "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100",
      badge: "border-emerald-300/80 text-emerald-700 dark:border-emerald-700 dark:text-emerald-200",
      icon: ShieldCheck,
    };
  }

  if (assessment.authenticityVerdict === "mixed") {
    return {
      accent: "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
      badge: "border-amber-300/80 text-amber-700 dark:border-amber-700 dark:text-amber-200",
      icon: ShieldQuestion,
    };
  }

  return {
    accent: "border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100",
    badge: "border-rose-300/80 text-rose-700 dark:border-rose-700 dark:text-rose-200",
    icon: ShieldAlert,
  };
}

function formatCheckedAt(value: string | null) {
  if (!value) {
    return "Not checked yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not checked yet";
  }

  return checkedAtFormatter.format(date);
}

function renderScore(value: number | null) {
  return value === null ? "Unknown" : `${value}/100`;
}

export function JobAuthenticityCard({
  app,
  onApplicationReplace,
  refreshEnabled = true,
}: JobAuthenticityCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const assessment = app.authenticityAssessment;
  const tone = getVerdictTone(assessment);
  const Icon = tone.icon;

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      const response = await fetch(`/api/applications/${app.id}/authenticity`, {
        method: "POST",
      });
      const body = await response.json() as {
        application?: TrackedApplicationRecord;
        error?: string;
      };

      if (!response.ok || !body.application) {
        toast.error(body.error ?? "Unable to refresh the job signal.");
        return;
      }

      onApplicationReplace(body.application);
      toast.success("Job signal refreshed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to refresh the job signal.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className={cn("space-y-4 rounded-[24px] border p-4", tone.accent)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <div className="text-xs font-medium uppercase tracking-wider">
              Authenticity & Hiring Signal
            </div>
          </div>
          <div className="text-sm leading-6">
            {assessment?.summary ?? "Run a signal check to score posting credibility, freshness, and resume fit."}
          </div>
        </div>
        {refreshEnabled ? (
          <Button
            className="gap-2 self-start"
            disabled={isRefreshing}
            onClick={handleRefresh}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            {assessment ? "Refresh" : "Analyze"}
          </Button>
        ) : null}
      </div>

      {assessment ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border bg-transparent", tone.badge)} variant="outline">
              Overall {assessment.overallScore}/100
            </Badge>
            <Badge className={cn("border bg-transparent", tone.badge)} variant="outline">
              {getRecommendationLabel(assessment.recommendation)}
            </Badge>
            <Badge className={cn("border bg-transparent", tone.badge)} variant="outline">
              {assessment.mode === "enriched" ? "Enriched check" : "Baseline check"}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Posting credibility
              </div>
              <div className="mt-1 text-base font-semibold">
                {assessment.authenticityVerdict} · {assessment.authenticityScore}/100
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Checked {formatCheckedAt(app.authenticityCheckedAt)}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Candidate fit
              </div>
              <div className="mt-1 text-base font-semibold">
                {assessment.candidateFitVerdict} · {renderScore(assessment.candidateFitScore)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Uses your primary resume when available.
              </div>
            </div>
          </div>

          {assessment.sourceCheck ? (
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 text-sm dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Source evidence
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Domain</div>
                  <div>{assessment.sourceCheck.domain ?? "Unknown"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Posting date</div>
                  <div>{assessment.sourceCheck.datePosted ?? "Not found"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Structured metadata</div>
                  <div>{assessment.sourceCheck.foundStructuredJobPosting ? "Found" : "Not found"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Hiring org</div>
                  <div>{assessment.sourceCheck.hiringOrganization ?? "Not found"}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Positive signals
              </div>
              <ul className="mt-2 space-y-1.5 text-sm leading-6">
                {(assessment.positiveSignals.length > 0 ? assessment.positiveSignals : ["No positive signals recorded yet."])
                  .slice(0, 4)
                  .map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Risk signals
              </div>
              <ul className="mt-2 space-y-1.5 text-sm leading-6">
                {(assessment.riskSignals.length > 0 ? assessment.riskSignals : ["No obvious risk signals recorded yet."])
                  .slice(0, 4)
                  .map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
              </ul>
            </div>
          </div>

          {assessment.matchedSkills.length > 0 || assessment.missingSkills.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Matched skills
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {assessment.matchedSkills.slice(0, 8).map((skill) => (
                    <Badge key={skill} className="border-emerald-300/80 bg-transparent text-emerald-700 dark:border-emerald-700 dark:text-emerald-200" variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Missing skills
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {assessment.missingSkills.slice(0, 8).map((skill) => (
                    <Badge key={skill} className="border-amber-300/80 bg-transparent text-amber-700 dark:border-amber-700 dark:text-amber-200" variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {assessment.nextSteps.length > 0 ? (
            <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Next actions
              </div>
              <ul className="mt-2 space-y-1.5 text-sm leading-6">
                {assessment.nextSteps.slice(0, 3).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
