import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ClipboardList, Sparkles } from "lucide-react";
import { AnimatedPanel } from "@/components/ui/animated-panel";
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
import { cn } from "@/lib/utils";

export default async function JobsPage() {
  await requireUser("/jobs");

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="warning" className="w-fit">
          Coming soon
        </Badge>
        <h1 className="text-3xl font-semibold">Jobs For You</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Personalized job discovery is being rebuilt. I want this page to feel useful,
          not noisy, so it will come back once the recommendations and matching quality
          are where they need to be.
        </p>
      </div>

      <AnimatedPanel>
        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Smarter job discovery is on the way</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7 text-muted-foreground">
                The next version will use your resume, recent tailoring activity, and
                tracker context to surface roles worth chasing instead of dumping a generic
                feed in front of you.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Better matching</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Relevance based on your actual resume signal and the roles you keep
                tailoring toward.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Cleaner handoff</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                One click from discovery into tracker, tailoring, and follow-up instead of
                another disconnected jobs board.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-background/50 p-5">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">Less noise</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Fewer low-fit listings, more roles that actually justify opening a new
                tailoring session.
              </p>
            </div>
          </CardContent>
        </Card>
      </AnimatedPanel>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Use the tracker for now</CardTitle>
            <CardDescription>
              Keep applications organized, paste JDs, and stay on top of follow-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants(), "gap-2")} href="/tracker">
              Open tracker
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailor resumes directly</CardTitle>
            <CardDescription>
              Skip discovery for now and generate targeted resumes from roles you already
              care about.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={cn(buttonVariants({ variant: "outline" }), "gap-2")} href="/dashboard">
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
