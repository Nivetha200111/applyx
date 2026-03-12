"use client";

import type { ReactNode } from "react";

/**
 * Lightweight passthrough — page transitions handled by CSS View Transitions
 * and each content shell's own CSS entrance animation.
 * No AnimatePresence, no JS animation blocking.
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
  return (
    <div className={className} style={{ animation: "retro-fade-in 0.3s ease-out" }}>
      {children}
    </div>
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
  return (
    <div className={className} style={{ animation: "retro-slide-up 0.25s ease-out both" }}>
      {children}
    </div>
  );
}
