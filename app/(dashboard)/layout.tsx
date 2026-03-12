import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContentShell } from "@/components/dashboard-content-shell";
import { hasSessionCookie, requireUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { isUnlimitedPlan } from "@/lib/plans";

// ── Sidebar skeleton (shows instantly while user data streams in) ──
function SidebarSkeleton() {
  return (
    <>
      {/* Desktop skeleton */}
      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-card/70 px-6 py-8 backdrop-blur-xl lg:block">
        <div className="h-8 w-28 rounded bg-muted animate-pulse" />
        <div className="mt-6 rounded-[24px] border border-border/70 bg-background/65 p-4 space-y-2 animate-pulse">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="mt-10 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </aside>
      {/* Mobile skeleton */}
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
          <div className="h-6 w-6 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-muted/50" />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Async server component that fetches user data for sidebar ──
async function SidebarWithData() {
  const user = await refreshUserAccess(await requireUser("/dashboard"));
  const remaining = getRemainingTailors(user);
  const developerAdmin = isDeveloperAdminUser(user);

  return (
    <DashboardSidebar
      planLabel={
        developerAdmin
          ? "Developer access"
          : `${user.plan[0].toUpperCase()}${user.plan.slice(1)} plan`
      }
      usageLabel={
        developerAdmin
          ? "Premium features unlocked. Billing bypass is active for this account."
          : user.plan === "free"
          ? `${remaining} free demos remaining.`
          : isUnlimitedPlan(user.monthlyTailorLimit)
            ? `Unlimited tailors. ${user.monthlyTailorsUsed} used this cycle.`
            : `${remaining} of ${user.monthlyTailorLimit} tailors remaining this billing cycle.`
      }
      userName={user.fullName}
    />
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fast synchronous cookie check — no DB call, no network round-trip.
  // If there's no session cookie the user is definitely not logged in.
  if (!hasSessionCookie()) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar streams in — page shell renders INSTANTLY */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWithData />
      </Suspense>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <DashboardContentShell>{children}</DashboardContentShell>
      </main>
    </div>
  );
}
