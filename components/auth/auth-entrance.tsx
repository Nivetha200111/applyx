"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

export function AuthEntrance({ children }: { children: ReactNode }) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      initial={reduceMotion ? false : {
        opacity: 0,
        y: 24,
        scale: 0.96,
        filter: "blur(10px)",
      }}
      transition={reduceMotion ? undefined : {
        type: "spring",
        stiffness: 320,
        damping: 28,
        mass: 0.9,
        filter: { duration: 0.35, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
