import Link from "next/link";
import { ArrowRight, FileText, Sparkles, TimerReset } from "lucide-react";
import { tailoredResumeCards } from "@/lib/demo-data";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    href: "/resumes",
    title: "Upload master resume",
    description: "Store one source resume and reuse it across every application.",
    icon: FileText,
  },
  {
    href: "/tailored",
    title: "Tailor a new resume",
    description: "Paste a JD, generate a tailored version, and inspect the score uplift.",
    icon: Sparkles,
  },
  {
    href: "/history",
    title: "Track application history",
    description: "Keep a clean record of submitted versions and recruiter outcomes.",
    icon: TimerReset,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden bg-slate-950 text-slate-50">
          <CardHeader>
            <Badge variant="warning" className="w-fit">
              Basic plan
            </Badge>
            <CardTitle className="text-3xl">Resume tailoring dashboard</CardTitle>
            <CardDescription className="text-slate-300">
              Built to move from job description to ATS-ready resume without a manual
              prompt-engineering loop.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-4xl font-semibold">12</div>
              <div className="text-sm text-slate-300">Tailors used this month</div>
            </div>
            <div>
              <div className="text-4xl font-semibold">18</div>
              <div className="text-sm text-slate-300">Remaining this cycle</div>
            </div>
            <div>
              <div className="text-4xl font-semibold">84</div>
              <div className="text-sm text-slate-300">Average current match score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage meter</CardTitle>
            <CardDescription>
              Tailors reset on your next billing cycle starting March 28, 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-3 rounded-full bg-muted">
              <div className="h-3 w-2/5 rounded-full bg-primary" />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              12 of 30 tailored resumes used this month. Upgrade to Pro for unlimited
              tailoring and bulk processing.
            </p>
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/settings">
              Manage billing
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title}>
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {action.description}
                </p>
                <Link
                  className={cn(buttonVariants({ variant: "ghost" }), "px-0")}
                  href={action.href}
                >
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Recent tailored resumes</h2>
            <p className="text-sm text-muted-foreground">
              Sample data wired into the new dashboard shell for Step 1 verification.
            </p>
          </div>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/tailored">
            View all
          </Link>
        </div>
        <div className="grid gap-4">
          {tailoredResumeCards.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">
                    {item.company} • {item.role}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {item.template} template • Generated {item.createdAt}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="success">{item.matchScore} match</Badge>
                  <Link
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    href={`/tailored/${item.id}`}
                  >
                    Open
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
