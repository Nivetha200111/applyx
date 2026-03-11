import { FollowUpReminders } from "@/components/tracker/follow-up-reminders";
import { TrackerView } from "@/components/tracker/tracker-view";
import { requireUser } from "@/lib/auth";
import {
  getTrackedApplicationsForUser,
  getTrackerStatsForUser,
  refreshUserAccess,
} from "@/lib/data";
import { getPlanById } from "@/lib/plans";

export default async function TrackerPage() {
  const sessionUser = await requireUser("/tracker");
  const user = await refreshUserAccess(sessionUser);
  const plan = getPlanById(user.plan);

  const [{ applications, total }, trackerStats] = await Promise.all([
    getTrackedApplicationsForUser(user.id),
    getTrackerStatsForUser(user.id),
  ]);

  const trackerParsesRemaining = Math.max(
    0,
    (plan?.monthlyTrackerParses ?? 5) - user.monthlyTrackerParsesUsed,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Application Tracker</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Track every job application in one place. Paste a job description to auto-fill
          company, role, skills, and salary with AI, then score whether the job looks
          credible and how well your resume fits. Click any cell to edit inline.
        </p>
      </div>

      <FollowUpReminders />

      <TrackerView
        initialApplications={applications}
        initialTotal={total}
        trackerParsesRemaining={trackerParsesRemaining}
        trackerStats={trackerStats}
        userPlan={user.plan}
      />
    </div>
  );
}
