"use client";

import { cn } from "@/lib/utils";
import type { JobSignalRecommendation, TrackedApplicationRecord } from "@/lib/types";

function getRecommendationLabel(value: JobSignalRecommendation) {
  switch (value) {
    case "strong_apply":
      return "Strong";
    case "apply_with_focus":
      return "Focus";
    case "investigate_first":
      return "Review";
    case "avoid":
      return "Avoid";
  }
}

function getTone(app: TrackedApplicationRecord) {
  const recommendation = app.authenticityAssessment?.recommendation;

  if (!recommendation || app.authenticityScore === null) {
    return {
      label: "Pending",
      className:
        "border-border/70 bg-card/70 text-muted-foreground",
    };
  }

  if (recommendation === "strong_apply") {
    return {
      label: getRecommendationLabel(recommendation),
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
    };
  }

  if (recommendation === "apply_with_focus") {
    return {
      label: getRecommendationLabel(recommendation),
      className:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200",
    };
  }

  if (recommendation === "investigate_first") {
    return {
      label: getRecommendationLabel(recommendation),
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
    };
  }

  return {
    label: getRecommendationLabel(recommendation),
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200",
  };
}

export function JobSignalBadge({
  app,
  className,
}: {
  app: TrackedApplicationRecord;
  className?: string;
}) {
  const tone = getTone(app);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone.className,
        className,
      )}
    >
      {app.authenticityScore === null ? tone.label : `${app.authenticityScore} · ${tone.label}`}
    </span>
  );
}
