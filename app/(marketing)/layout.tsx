import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link className="inline-flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
              A
            </span>
            <div>
              <div className="font-semibold">ApplyX</div>
              <div className="text-sm text-muted-foreground">AI Resume Tailoring</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              <Link href="/pricing">Pricing</Link>
              {user ? (
                <Link className={cn(buttonVariants())} href="/dashboard">
                  Open Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login">Sign in</Link>
                  <Link className={cn(buttonVariants())} href="/signup">
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/70 bg-background/55 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Built for Indian job seekers applying at scale.</p>
          <div className="flex gap-4">
            <Link href="/pricing">Pricing</Link>
            <Link href={user ? "/dashboard" : "/signup"}>{user ? "Dashboard" : "Get Started"}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
