"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AuthEntrance({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      initial={{
        opacity: 0,
        y: 24,
        scale: 0.96,
        filter: "blur(10px)",
      }}
      transition={{
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
