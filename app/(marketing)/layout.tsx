import Link from "next/link";
import { MarketingContentShell } from "@/components/marketing/marketing-content-shell";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApplyxLogo } from "@/components/ui/applyx-logo";
import { buttonVariants } from "@/components/ui/button";
import { hasSessionCookie } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = hasSessionCookie();

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-2xl transition-all duration-300">
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link className="inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]" href="/">
            <ApplyxLogo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <Link className="transition-colors duration-200 hover:text-foreground" href="/pricing">
                Pricing
              </Link>
              {isLoggedIn ? (
                <Link className={cn(buttonVariants(), "shimmer")} href="/dashboard">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link className="transition-colors duration-200 hover:text-foreground" href="/login">
                    Sign in
                  </Link>
                  <Link className={cn(buttonVariants(), "shimmer")} href="/signup">
                    Get Started
                  </Link>
                </>
              )}
            </nav>
            <MobileNav isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </header>
      <main>
        <MarketingContentShell>{children}</MarketingContentShell>
      </main>
      <footer className="border-t border-border/40 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-2">
            <ApplyxLogo className="gap-2" size="sm" subtitle="Built for fast, focused job searches." />
          </div>
          <div className="flex items-center gap-6">
            <Link className="transition-colors duration-200 hover:text-foreground" href="/pricing">
              Pricing
            </Link>
            <Link className="transition-colors duration-200 hover:text-foreground" href={isLoggedIn ? "/dashboard" : "/signup"}>
              {isLoggedIn ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
