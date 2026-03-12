"use client";

import type { ReactNode } from "react";

/**
 * Retro scanline-wipe entrance — pure CSS, zero JS overhead.
 */
export function DashboardContentShell({ children }: { children: ReactNode }) {
  return (
    <div className="retro-page-enter" style={{ viewTransitionName: "page-content" }}>
      {children}
    </div>
  );
}
