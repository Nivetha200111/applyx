"use client";

import type { ReactNode } from "react";

/**
 * Auth page entrance animation — pure CSS, no JS dependency.
 *
 * Previously used framer-motion which meant server-rendered HTML had
 * opacity:0 until the full JS bundle loaded + React hydrated. Now
 * the animation runs immediately from the server-rendered HTML via
 * a CSS keyframe, so the login form is visible in < 100ms.
 */
export function AuthEntrance({ children }: { children: ReactNode }) {
  return (
    <div className="auth-entrance">
      {children}
    </div>
  );
}
