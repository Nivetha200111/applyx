import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContentShell } from "@/components/dashboard-content-shell";

/**
 * 100% synchronous layout — zero DB calls, zero async.
 *
 * Auth is handled by middleware.ts (cookie check at the edge).
 * Sidebar user data (name, plan, usage) is fetched client-side via /api/me.
 *
 * This means loading.tsx skeletons render INSTANTLY on every navigation.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <DashboardSidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <DashboardContentShell>{children}</DashboardContentShell>
      </main>
    </div>
  );
}
