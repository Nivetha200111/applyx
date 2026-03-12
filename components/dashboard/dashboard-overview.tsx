"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  History,
  Sparkles,
} from "lucide-react";
import { CheckoutButton } from "@/components/billing/checkout-button";
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
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/lib/types";

// ── Types for API response ──

interface DashboardData {
  currentUser: { plan: PlanTier };
  trackerStats: {
    total: number;
    byStatus: Record<string, number>;
    responseRate: number;
    signalsReady: number;
    highConfidence: number;
  };
  resumes: Array<{ id: string; fileName: string; isPrimary: boolean }>;
  tailoredResumes: Array<{
    id: string;
    jobTitle: string | null;
    companyName: string | null;
    templateUsed: string;
    matchScoreAfter: number | null;
    createdAt: string;
  }>;
  remainingTailors: number;
  plan: { name: string; masterResumeLimit: number } | null;
  developerAdmin: boolean;
  hasDodo: boolean;
  upgradePlans: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    monthlyTailors: number;
    monthlyTrackerParses: number;
    formattedPrice: string;
  }>;
}

// ── Skeleton shown while data loads ──

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero card skeleton */}
      <div className="rounded-[24px] bg-slate-950 p-8 space-y-4">
        <div className="h-5 w-28 rounded bg-slate-800" />
        <div className="h-8 w-64 rounded-lg bg-slate-800" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 w-16 rounded bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>

      {/* Tailor card */}
      <div className="rounded-[24px] border border-border/50 bg-card/50 p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-3 w-72 max-w-full rounded bg-muted" />
        <div className="h-24 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}

// ── Main component ──

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-destructive">
          Failed to load dashboard: {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  const {
    currentUser,
    trackerStats,
    resumes,
    tailoredResumes,
    remainingTailors,
    plan,
    developerAdmin,
    hasDodo,
    upgradePlans,
  } = data;

  const inProgress =
    (trackerStats.byStatus.applied ?? 0) +
    (trackerStats.byStatus.screening ?? 0) +
    (trackerStats.byStatus.interviewing ?? 0);

  return (
    <div className="space-y-8">
      {/* Tracker summary card - primary CTA */}
      <AnimatedPanel>
        <Link href="/tracker" className="block">
          <Card className="overflow-hidden bg-slate-950 text-slate-50 transition-transform duration-200 hover:-translate-y-1">
            <CardHeader>
              <Badge variant="warning" className="w-fit">
                {currentUser.plan === "free"
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
                <div className="text-4xl font-semibold">{trackerStats.total}</div>
                <div className="text-sm text-slate-300">Tracked</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">{inProgress}</div>
                <div className="text-sm text-slate-300">In progress</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">{trackerStats.responseRate}%</div>
                <div className="text-sm text-slate-300">Response rate</div>
              </div>
              <div>
                <div className="text-4xl font-semibold">
                  {remainingTailors > 9999 ? "∞" : remainingTailors}
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
                {resumes.length} of {plan?.masterResumeLimit ?? 1} resume slots used.
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
                {resumes.length} of {plan?.masterResumeLimit ?? 1} resume slots used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadResumeForm
                currentCount={resumes.length}
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
              {resumes.length === 0
                ? "Upload a master resume first."
                : "Choose a saved resume and paste the target job description."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <p className="text-sm leading-7 text-muted-foreground">
                Once your first resume is uploaded, this workbench will create parsed job
                descriptions, tailored resumes, and downloadable outputs.
              </p>
            ) : (
              <TailorForm
                planName={plan?.name ?? "Free"}
                remainingTailors={remainingTailors}
                resumes={resumes.map((resume) => ({
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
          {tailoredResumes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm leading-7 text-muted-foreground">
                No tailored resumes yet. Upload a resume and paste a job description to
                generate your first version.
              </CardContent>
            </Card>
          ) : (
            tailoredResumes.map((item, index) => (
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

      <AnimatedPanel delay={0.18}>
        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="warning" className="w-fit">
                {currentUser.plan === "premium"
                  ? "Premium active"
                  : currentUser.plan === "basic"
                    ? "Upgrade available"
                    : "Unlock more"}
              </Badge>
              {currentUser.plan !== "premium" ? (
                <Badge variant="success" className="w-fit">
                  {remainingTailors > 9999
                    ? "Unlimited tailors unlocked on premium"
                    : `${remainingTailors} tailors left right now`}
                </Badge>
              ) : null}
            </div>
            <CardTitle>
              {developerAdmin
                ? "Developer access is active on this account."
                : currentUser.plan === "premium"
                  ? "You already have the highest tier."
                  : currentUser.plan === "basic"
                    ? "Go premium when you want better rewrites and more automation."
                    : "Upgrade when you want more resumes, more tailoring, and more automation."}
            </CardTitle>
            <CardDescription className="max-w-3xl">
              {developerAdmin
                ? "Checkout is bypassed for your allowlisted account, so you can use premium features without billing."
                : currentUser.plan === "premium"
                  ? "Premium keeps the tracker, auto-fill, tailoring, and export workflow fully unlocked for higher-volume application weeks."
                  : currentUser.plan === "basic"
                    ? "Basic already gives you speed. Premium adds higher-quality tailoring, deeper automation, and more room for competitive applications."
                    : "Free is enough to test the flow. Basic is the practical plan for active job searches, and Premium is for higher-volume or tougher roles."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {developerAdmin ? (
              <Card className="border-primary/20 bg-background/55">
                <CardHeader>
                  <CardTitle>Developer override</CardTitle>
                  <CardDescription>
                    Billing is intentionally disabled for this account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4 pt-0">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Use the product normally. No upgrade step is needed on this login.
                  </p>
                  <Link
                    className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
                    href="/settings"
                  >
                    Open settings
                  </Link>
                </CardContent>
              </Card>
            ) : currentUser.plan === "premium" ? (
              <Card className="border-primary/20 bg-background/55 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Premium is already active</CardTitle>
                  <CardDescription>
                    Your highest-value workflow is unlocked from tailoring through tracking and export.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-0 md:flex-row md:items-center md:justify-between">
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                    If you need billing details or renewal status, manage them from settings.
                  </p>
                  <Link className={cn(buttonVariants({ variant: "outline" }))} href="/settings">
                    Manage plan
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upgradePlans.map((upgradePlan) => (
                <Card
                  key={upgradePlan.id}
                  className={cn(
                    "border-border/70 bg-background/55",
                    upgradePlan.id === "premium" && "border-primary/25 bg-primary/5",
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{upgradePlan.name}</CardTitle>
                      {upgradePlan.id === "basic" ? (
                        <Badge variant="success">Best entry point</Badge>
                      ) : (
                        <Badge variant="warning">Best quality</Badge>
                      )}
                    </div>
                    <CardDescription>{upgradePlan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <div className="text-3xl font-semibold">
                        {upgradePlan.formattedPrice}
                      </div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {upgradePlan.monthlyTailors > 9999
                        ? "Unlimited tailoring"
                        : `${upgradePlan.monthlyTailors} tailored resumes / month`}
                      {" • "}
                      {upgradePlan.monthlyTrackerParses > 9999
                        ? "Unlimited AI auto-fills"
                        : `${upgradePlan.monthlyTrackerParses} AI auto-fills / month`}
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <CheckoutButton
                        disabled={!hasDodo}
                        label={
                          hasDodo
                            ? currentUser.plan === "basic" && upgradePlan.id === "premium"
                              ? "Upgrade to Premium"
                              : `Choose ${upgradePlan.name}`
                            : "Billing unavailable"
                        }
                        planId={upgradePlan.id as "basic" | "premium"}
                      />
                      <Link
                        className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
                        href="/settings"
                      >
                        Compare plans
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </AnimatedPanel>
    </div>
  );
}

