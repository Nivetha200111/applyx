"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isLoggedIn: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        size="sm"
        variant="ghost"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-border/40 bg-background/95 px-4 pb-6 pt-4 backdrop-blur-2xl">
          <nav className="flex flex-col gap-3">
            <Link
              className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              href="/pricing"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            {isLoggedIn ? (
              <Link
                className={cn(buttonVariants(), "shimmer")}
                href="/dashboard"
                onClick={() => setOpen(false)}
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  className={cn(buttonVariants(), "shimmer")}
                  href="/signup"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
