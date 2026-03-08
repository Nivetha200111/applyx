import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, History, Sparkles } from "lucide-react";
import { AnimatedPanel } from "@/components/ui/animated-panel";
import { UploadResumeForm } from "@/components/dashboard/upload-resume-form";
import { TailorForm } from "@/components/dashboard/tailor-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/data";
import { getPlanById } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const snapshot = await getDashboardSnapshot(user);
  const plan = getPlanById(snapshot.currentUser.plan);

  return (
    <div className="space-y-8">
      {/* Tracker summary card - primary CTA */}
      <AnimatedPanel>
        <Link href="/tracker" className="block">
          <Card className="overflow-hidden bg-slate-950 text-slate-50 transition-transform duration-200 hover:-translate-y-1">
            <CardHeader>
              <Badge variant="warning" className="w-fit">
                {snapshot.currentUser.plan === "free"
                  ? "Free demo access"
                  : `${plan?.name ?? "Active"} plan`}
              </Badge>
              <CardTitle className="text-3xl">Job Application Tracker</CardTitle>
              <CardDescription className="text-slate-300">
                Track every application, paste JDs to auto-fill with AI, and prep for
                interviews — all in one sheet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-4">
              <div>
                <div className="text-4xl font-semibold">{snapshot.trackerStats.total}</div>
                <div className="text-sm text-slate-300">Tracked</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">
                  {(snapshot.trackerStats.byStatus.applied ?? 0) +
                    (snapshot.trackerStats.byStatus.screening ?? 0) +
                    (snapshot.trackerStats.byStatus.interviewing ?? 0)}
                </div>
                <div className="text-sm text-slate-300">In progress</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">{snapshot.trackerStats.responseRate}%</div>
                <div className="text-sm text-slate-300">Response rate</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">
                  {snapshot.remainingTailors > 9999 ? "∞" : snapshot.remainingTailors}
                </div>
                <div className="text-sm text-slate-300">Tailors left</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </AnimatedPanel>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AnimatedPanel delay={0.04}>
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                {snapshot.resumes.length} of {plan?.masterResumeLimit ?? 1} resume slots used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                className={cn(buttonVariants(), "w-full gap-2 shimmer")}
                href="/tracker"
              >
                <ClipboardList className="h-4 w-4" />
                Open Tracker
              </Link>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "w-full gap-2")}
                href="/resumes"
              >
                <FileText className="h-4 w-4" />
                Manage Resumes
              </Link>
            </CardContent>
          </Card>
        </AnimatedPanel>

        <AnimatedPanel delay={0.06}>
          <Card>
            <CardHeader>
              <CardTitle>Upload master resume</CardTitle>
              <CardDescription>
                {snapshot.resumes.length} of {plan?.masterResumeLimit ?? 1} resume slots used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadResumeForm
                currentCount={snapshot.resumes.length}
                limit={plan?.masterResumeLimit ?? 1}
              />
            </CardContent>
          </Card>
        </AnimatedPanel>
      </section>

      <AnimatedPanel delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Tailor a new resume</CardTitle>
            <CardDescription>
              {snapshot.resumes.length === 0
                ? "Upload a master resume first."
                : "Choose a saved resume and paste the target job description."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {snapshot.resumes.length === 0 ? (
              <p className="text-sm leading-7 text-muted-foreground">
                Once your first resume is uploaded, this workbench will create parsed job
                descriptions, tailored resumes, and downloadable outputs.
              </p>
            ) : (
              <TailorForm
                planName={plan?.name ?? "Free"}
                remainingTailors={snapshot.remainingTailors}
                resumes={snapshot.resumes.map((resume) => ({
                  id: resume.id,
                  label: `${resume.fileName}${resume.isPrimary ? " • Primary" : ""}`,
                }))}
              />
            )}
          </CardContent>
        </Card>
      </AnimatedPanel>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnimatedPanel delay={0.02}>
          <Card>
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <CardTitle>Application Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Track applications like a spreadsheet. Paste JDs, auto-fill with AI,
                sort, filter, and prep for interviews.
              </p>
              <Link className={cn(buttonVariants({ variant: "ghost" }), "px-0")} href="/tracker">
                Open tracker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedPanel>

        <AnimatedPanel delay={0.08}>
          <Card>
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle>AI Resume Tailoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Generate ATS-optimized resumes for specific jobs with match score uplift.
              </p>
              <Link className={cn(buttonVariants({ variant: "ghost" }), "px-0")} href="/tailored">
                Open tailored resumes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedPanel>

        <AnimatedPanel delay={0.14}>
          <Card>
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <CardTitle>Activity & History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Track resume parsing, tailoring, and billing activity.
              </p>
              <Link className={cn(buttonVariants({ variant: "ghost" }), "px-0")} href="/history">
                Open activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedPanel>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Recent tailored resumes</h2>
            <p className="text-sm text-muted-foreground">
              Your latest generated versions, ordered by most recent.
            </p>
          </div>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/tailored">
            View all
          </Link>
        </div>
        <div className="grid gap-4">
          {snapshot.tailoredResumes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm leading-7 text-muted-foreground">
                No tailored resumes yet. Upload a resume and paste a job description to
                generate your first version.
              </CardContent>
            </Card>
          ) : (
            snapshot.tailoredResumes.slice(0, 3).map((item, index) => (
              <AnimatedPanel key={item.id} delay={0.04 * index}>
                <Card>
                  <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">
                        {item.jobTitle ?? "Untitled role"} • {item.companyName ?? "Company"}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {item.templateUsed} template • Generated{" "}
                        {new Date(item.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="success">
                        {item.matchScoreAfter ?? 0}% match
                      </Badge>
                      <Link
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        href={`/tailored/${item.id}`}
                      >
                        Open
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedPanel>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
