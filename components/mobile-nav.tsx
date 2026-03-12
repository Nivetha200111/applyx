"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        className="text-neon-cyan hover:text-neon-pink"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 border-b-2 border-neon-pink/30 bg-retro-darker/95 px-4 pb-6 pt-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-3">
            <Link
              className="rounded-sm border border-neon-cyan/20 px-4 py-3 font-retro text-lg text-neon-cyan/70 transition-all hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-neon-cyan"
              href="/pricing"
              onClick={() => setOpen(false)}
            >
              ★ Pricing
            </Link>
            {isLoggedIn ? (
              <Link
                className="retro-btn retro-btn-cyan text-center font-pixel text-[10px]"
                href="/dashboard"
                onClick={() => setOpen(false)}
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  className="rounded-sm border border-neon-pink/20 px-4 py-3 font-retro text-lg text-neon-pink/70 transition-all hover:border-neon-pink/50 hover:bg-neon-pink/10 hover:text-neon-pink"
                  href="/login"
                  onClick={() => setOpen(false)}
                >
                  ★ Sign In
                </Link>
                <Link
                  className="retro-btn text-center font-pixel text-[10px]"
                  href="/signup"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
