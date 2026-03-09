"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export function MarketingContentShell({ children }: { children: ReactNode }) {
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
        scale: 1,
        filter: "blur(0px)",
      }}
      initial={{
        opacity: 0,
        y: 28,
        scale: 0.985,
        filter: "blur(10px)",
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 26,
        mass: 0.9,
        filter: { duration: 0.35, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}
