"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};

const variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...spring,
      filter: { duration: 0.3, ease: "easeOut" },
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.99,
    filter: "blur(6px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={pathname}
        animate="animate"
        className="will-change-transform"
        exit="exit"
        initial="initial"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Stagger wrapper — wrap dashboard page content to cascade in
export function StaggerChildren({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate="animate"
      className={className}
      initial="initial"
      variants={{
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
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        initial: { opacity: 0, y: 18, filter: "blur(6px)" },
        animate: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            ...spring,
            filter: { duration: 0.25, ease: "easeOut" },
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
