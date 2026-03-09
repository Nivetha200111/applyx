"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const contentSpring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 32,
  mass: 0.85,
};

export function DashboardContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      animate={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      initial={{
        opacity: 0,
        y: 16,
        filter: "blur(8px)",
      }}
      style={{ viewTransitionName: "page-content" }}
      transition={{
        ...contentSpring,
        filter: { duration: 0.28, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
