"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

/**
 * Quick fade-in for dashboard pages — no exit animation, no blocking.
 */
export function DashboardContentShell({ children }: { children: ReactNode }) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      style={{ viewTransitionName: "page-content" }}
      transition={reduceMotion ? undefined : { duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
