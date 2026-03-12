"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

/**
 * Quick fade-in for marketing pages — no exit animation, no blocking.
 */
export function MarketingContentShell({ children }: { children: ReactNode }) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      transition={reduceMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
