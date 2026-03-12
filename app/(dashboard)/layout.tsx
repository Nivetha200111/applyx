import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContentShell } from "@/components/dashboard-content-shell";
import { requireUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { isUnlimitedPlan } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getCurrentUser() is wrapped with React.cache() so this single DB call
  // is shared with every page that also calls requireUser — zero duplication.
  const user = await requireUser("/dashboard");

  // refreshUserAccess is also cached — usually returns immediately
  // (only hits DB if billing cycle expired).
  const refreshed = await refreshUserAccess(user);
  const remaining = getRemainingTailors(refreshed);
  const developerAdmin = isDeveloperAdminUser(refreshed);

  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar
        planLabel={
          developerAdmin
            ? "Developer access"
            : `${refreshed.plan[0].toUpperCase()}${refreshed.plan.slice(1)} plan`
        }
        usageLabel={
          developerAdmin
            ? "Premium features unlocked. Billing bypass is active for this account."
            : refreshed.plan === "free"
            ? `${remaining} free demos remaining.`
            : isUnlimitedPlan(refreshed.monthlyTailorLimit)
              ? `Unlimited tailors. ${refreshed.monthlyTailorsUsed} used this cycle.`
              : `${remaining} of ${refreshed.monthlyTailorLimit} tailors remaining this billing cycle.`
        }
        userName={refreshed.fullName}
      />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <DashboardContentShell>{children}</DashboardContentShell>
      </main>
    </div>
  );
}
