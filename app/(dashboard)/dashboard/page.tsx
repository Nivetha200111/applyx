import Link from "next/link";
import { ArrowRight, FileText, History, Sparkles } from "lucide-react";
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
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AnimatedPanel>
          <Card className="overflow-hidden bg-slate-950 text-slate-50">
            <CardHeader>
              <Badge variant="warning" className="w-fit">
                {snapshot.currentUser.plan === "free"
                  ? "Free demo access"
                  : `${plan?.name ?? "Active"} plan`}
              </Badge>
              <CardTitle className="text-3xl">Resume tailoring workbench</CardTitle>
              <CardDescription className="text-slate-300">
                Upload one master resume, paste a job description, and generate an
                ATS-ready tailored version with tracked usage.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-4xl font-semibold">
                  {snapshot.currentUser.plan === "free"
                    ? snapshot.currentUser.demoTailorsUsed
                    : snapshot.currentUser.monthlyTailorsUsed}
                </div>
                <div className="text-sm text-slate-300">Tailors used</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">
                  {snapshot.remainingTailors > 9999 ? "∞" : snapshot.remainingTailors}
                </div>
                <div className="text-sm text-slate-300">Remaining</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">{snapshot.resumes.length}</div>
                <div className="text-sm text-slate-300">Master resumes</div>
              </div>
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
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>Resume library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Review parsed master resumes, primary designation, and raw extracted data.
              </p>
              <Link className={cn(buttonVariants({ variant: "ghost" }), "px-0")} href="/resumes">
                Open resumes
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
              <CardTitle>Tailored outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Compare match scores and open generated versions for download.
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
              <CardTitle>Usage history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                Track resume parsing, tailoring actions, and billing events.
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
                        {item.matchScoreAfter ?? 0} match
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
