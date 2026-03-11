"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";
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
  onClick,
}: {
  app: TrackedApplicationRecord;
  className?: string;
  onClick?: () => void;
}) {
  const tone = getTone(app);
  const reduceMotion = useHydratedReducedMotion();
  const [bursts, setBursts] = useState<number[]>([]);
  const clickable = typeof onClick === "function";
  const content = useMemo(
    () => (app.authenticityScore === null ? tone.label : `${app.authenticityScore} · ${tone.label}`),
    [app.authenticityScore, tone.label],
  );

  function handleClick() {
    if (!clickable) {
      return;
    }

    if (!reduceMotion) {
      const id = Date.now();
      setBursts((current) => [...current, id]);
      window.setTimeout(() => {
        setBursts((current) => current.filter((entry) => entry !== id));
      }, 550);
    }

    onClick?.();
  }

  return (
    <motion.button
      className={cn(
        "relative inline-flex items-center gap-1 overflow-visible rounded-full border px-2.5 py-1 text-xs font-semibold",
        clickable && "cursor-pointer",
        tone.className,
        className,
      )}
      onClick={handleClick}
      title={clickable ? "Open signal details" : undefined}
      type="button"
      whileHover={reduceMotion || !clickable ? undefined : { scale: 1.04, y: -1 }}
      whileTap={reduceMotion || !clickable ? undefined : { scale: 0.9, rotate: -2 }}
    >
      <AnimatePresence>
        {!reduceMotion
          ? bursts.map((id) => (
              <motion.span
                key={id}
                animate={{ opacity: 0, scale: 1.9 }}
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-full border",
                  tone.className,
                )}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0.45, scale: 0.88 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            ))
          : null}
      </AnimatePresence>
      <motion.span
        animate={reduceMotion || !clickable ? undefined : { boxShadow: [
          "0 0 0 rgba(0,0,0,0)",
          "0 0 0 rgba(0,0,0,0)",
        ] }}
        className="relative z-[1]"
      >
        {content}
      </motion.span>
    </motion.button>
  );
}
