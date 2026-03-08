import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { requireUser } from "@/lib/auth";
import { getRemainingTailors, refreshUserAccess } from "@/lib/data";
import { isUnlimitedPlan } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await refreshUserAccess(await requireUser("/dashboard"));
  const remaining = getRemainingTailors(user);

  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar
        planLabel={`${user.plan[0].toUpperCase()}${user.plan.slice(1)} plan`}
        usageLabel={
          user.plan === "free"
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
