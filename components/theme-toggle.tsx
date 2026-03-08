"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "applyx-theme";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const resolvedTheme = getPreferredTheme();
    setTheme(resolvedTheme);
    applyTheme(resolvedTheme);
    setMounted(true);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = mounted && theme === "dark" ? SunMedium : MoonStar;
  const label = mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      aria-label={label}
      className="gap-2"
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
      size="sm"
      variant="outline"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{mounted ? label.replace("Switch to ", "") : "Theme"}</span>
    </Button>
  );
}
