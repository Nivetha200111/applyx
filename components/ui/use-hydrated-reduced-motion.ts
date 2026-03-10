"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useHydratedReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated ? Boolean(prefersReducedMotion) : false;
}
