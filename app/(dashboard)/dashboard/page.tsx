import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

/**
 * 100% synchronous — zero server-side DB calls.
 *
 * Auth is handled by middleware.ts (cookie check at the edge).
 * All dashboard data is fetched client-side by the DashboardOverview
 * component via /api/dashboard, which means this page renders INSTANTLY
 * and never blocks on Neon DB cold starts.
 */
export default function DashboardPage() {
  return <DashboardOverview />;
}
