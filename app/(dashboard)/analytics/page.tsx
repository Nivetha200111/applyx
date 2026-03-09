import { requireUser } from "@/lib/auth";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
  await requireUser("/analytics");
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Track your application performance, skills trends, and salary landscape.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
