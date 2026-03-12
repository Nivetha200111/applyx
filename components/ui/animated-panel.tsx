"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedPanelProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

/**
 * Lightweight entrance animation for dashboard panels.
 *
 * Uses `animate` (not `whileInView`) so panels always become visible
 * even when wrapped in CSS animations (crt-power-on, etc.) that may
 * interfere with IntersectionObserver triggering.
 */
export function AnimatedPanel({
  children,
  className,
  delay = 0,
  hover = true,
}: AnimatedPanelProps) {
  return (
    <motion.div
      className={cn("h-full transform-gpu", className)}
      initial={{ opacity: 0, y: 18, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={hover ? { y: -6, scale: 1.008 } : undefined}
    >
      {children}
    </motion.div>
  );
}
