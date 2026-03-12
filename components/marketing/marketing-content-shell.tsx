"use client";

import type { ReactNode } from "react";

/**
 * Retro CRT power-on entrance — pure CSS, zero JS overhead.
 */
export function MarketingContentShell({ children }: { children: ReactNode }) {
  return (
    <div className="retro-page-enter">
      {children}
    </div>
  );
}
