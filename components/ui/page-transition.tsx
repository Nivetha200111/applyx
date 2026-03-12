"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

/**
 * Lightweight page wrapper — no AnimatePresence, no exit blocking.
 * Each layout's content shell handles its own entrance animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Stagger wrapper — wrap dashboard page content to cascade in
export function StaggerChildren({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : "animate"}
      className={className}
      initial={reduceMotion ? false : "initial"}
      variants={reduceMotion ? undefined : {
        initial: {},
        animate: {
          transition: { staggerChildren: 0.07, delayChildren: 0.04 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : {
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
