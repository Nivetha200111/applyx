"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHydratedReducedMotion } from "@/components/ui/use-hydrated-reduced-motion";

interface AnimatedPanelProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function AnimatedPanel({
  children,
  className,
  delay = 0,
  hover = true,
}: AnimatedPanelProps) {
  const reduceMotion = useHydratedReducedMotion();

  return (
    <motion.div
      className={cn("h-full transform-gpu", className)}
      initial={reduceMotion ? undefined : { opacity: 0, y: 22, scale: 0.985, filter: "blur(8px)" }}
      transition={{
        duration: 0.52,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      viewport={{ once: true, amount: 0.18 }}
      whileHover={reduceMotion || !hover ? undefined : { y: -8, scale: 1.01 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    >
      {children}
    </motion.div>
  );
}
