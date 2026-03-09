import { JobsForYouView } from "@/components/jobs/jobs-for-you-view";
import { requireUser } from "@/lib/auth";
import { getMasterResumesForUser, refreshUserAccess } from "@/lib/data";

export default async function JobsPage() {
  const sessionUser = await requireUser("/jobs");
  const user = await refreshUserAccess(sessionUser);
  const resumes = await getMasterResumesForUser(user.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Jobs For You</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Personalized job discovery based on your resume skills, recent titles, and the
          roles you are most likely to match right now.
        </p>
      </div>

      <JobsForYouView
        hasResume={resumes.length > 0}
        userPlan={user.plan}
      />
    </div>
  );
}
