"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Returns a navigate function that wraps Next.js router.push
 * in the View Transitions API when available (Chrome/Edge 111+).
 * Falls back to normal navigation in unsupported browsers.
 */
export function useViewTransitionRouter() {
  const router = useRouter();

  const push = useCallback(
    (href: string) => {
      if (
        typeof document !== "undefined" &&
        "startViewTransition" in document &&
        typeof (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition === "function"
      ) {
        (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          router.push(href);
        });
      } else {
        router.push(href);
      }
    },
    [router],
  );

  return { push, router };
}
