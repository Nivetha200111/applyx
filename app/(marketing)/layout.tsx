import Link from "next/link";
import { MarketingContentShell } from "@/components/marketing/marketing-content-shell";
import { MobileNav } from "@/components/mobile-nav";
import { ApplyxLogo } from "@/components/ui/applyx-logo";
import { hasSessionCookie } from "@/lib/auth";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = hasSessionCookie();

  return (
    <div className="page-shell bg-retro-dark">
      {/* Retro header */}
      <header className="sticky top-0 z-30 border-b-2 border-neon-pink/30 bg-retro-darker/90 backdrop-blur-xl">
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="group inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.05]"
            href="/"
          >
            <ApplyxLogo />
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                className="font-pixel text-[10px] uppercase tracking-widest text-neon-cyan/70 transition-all duration-200 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                href="/pricing"
              >
                Pricing
              </Link>
              {isLoggedIn ? (
                <Link
                  className="retro-btn retro-btn-cyan font-pixel text-[10px]"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    className="font-pixel text-[10px] uppercase tracking-widest text-neon-pink/70 transition-all duration-200 hover:text-neon-pink hover:drop-shadow-[0_0_8px_rgba(255,45,149,0.6)]"
                    href="/login"
                  >
                    Sign In
                  </Link>
                  <Link
                    className="retro-btn font-pixel text-[10px]"
                    href="/signup"
                  >
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

      {/* Retro footer */}
      <footer className="border-t-2 border-neon-cyan/20 bg-retro-darker">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-2">
            <ApplyxLogo className="gap-2" size="sm" subtitle="Built for job seekers who mean business." />
            <p className="font-retro text-sm text-white/30">
              © {new Date().getFullYear()} ApplyX • Best viewed at 1024x768 • Netscape Navigator 4.0+
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link
              className="font-retro text-lg text-neon-cyan/50 transition-all duration-200 hover:text-neon-cyan hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
              href="/pricing"
            >
              ★ Pricing
            </Link>
            <Link
              className="font-retro text-lg text-neon-pink/50 transition-all duration-200 hover:text-neon-pink hover:drop-shadow-[0_0_8px_rgba(255,45,149,0.5)]"
              href={isLoggedIn ? "/dashboard" : "/signup"}
            >
              ★ {isLoggedIn ? "Dashboard" : "Get Started"}
            </Link>
          </div>
        </div>
        {/* Rainbow divider at the very bottom */}
        <div className="h-px bg-gradient-to-r from-neon-pink/40 via-neon-cyan/40 to-neon-green/40" />
      </footer>
    </div>
  );
}
