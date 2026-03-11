"use client";

import { cn } from "@/lib/utils";
import type { AuthenticityVerdict, TrackedApplicationRecord } from "@/lib/types";

function getVerdictLabel(value: AuthenticityVerdict) {
  switch (value) {
    case "credible":
      return "Credible";
    case "mixed":
      return "Mixed";
    case "risky":
      return "Risky";
  }
}

function getTone(app: TrackedApplicationRecord) {
  const verdict = app.authenticityAssessment?.authenticityVerdict;

  if (!verdict || app.authenticityScore === null) {
    return {
      label: "Pending",
      className:
        "border-border/70 bg-card/70 text-muted-foreground",
    };
  }

  if (verdict === "credible") {
    return {
      label: getVerdictLabel(verdict),
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
    };
  }

  if (verdict === "mixed") {
    return {
      label: getVerdictLabel(verdict),
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
    };
  }

  return {
    label: getVerdictLabel(verdict),
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
