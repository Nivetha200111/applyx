import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { isUnlimitedPlan } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await refreshUserAccess(await requireUser("/dashboard"));
  const remaining = getRemainingTailors(user);
  const developerAdmin = isDeveloperAdminUser(user);

  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar
        planLabel={developerAdmin ? "Developer access" : `${user.plan[0].toUpperCase()}${user.plan.slice(1)} plan`}
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
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {children}
      </main>
    </div>
  );
}
