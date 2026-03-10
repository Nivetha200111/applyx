"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

const contentSpring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 32,
  mass: 0.85,
};

export function DashboardContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      key={pathname}
      animate={reduceMotion ? undefined : {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      initial={reduceMotion ? false : {
        opacity: 0,
        y: 16,
        filter: "blur(8px)",
      }}
      style={{ viewTransitionName: "page-content" }}
      transition={reduceMotion ? undefined : {
        ...contentSpring,
        filter: { duration: 0.28, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
