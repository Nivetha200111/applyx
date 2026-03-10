"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

export function MarketingContentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      key={pathname}
      animate={reduceMotion ? undefined : {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      initial={reduceMotion ? false : {
        opacity: 0,
        y: 28,
        scale: 0.985,
        filter: "blur(10px)",
      }}
      transition={reduceMotion ? undefined : {
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
