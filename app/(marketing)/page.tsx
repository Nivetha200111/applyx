import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
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

const steps = [
  {
    title: "Upload once",
    description:
      "Drop in your master resume and let ApplyX parse it into structured data you can reuse across every application.",
  },
  {
    title: "Paste any JD",
    description:
      "Paste a LinkedIn, Naukri, or Instahyre job description and extract ATS-critical keywords in seconds.",
  },
  {
    title: "Download tailored resume",
    description:
      "Generate a clean ATS-safe PDF or DOCX with higher relevance, better ordering, and a measurable match score uplift.",
  },
];

const metrics = [
  { label: "Average turnaround", value: "<15 sec" },
  { label: "Free plan included", value: "3 tailors" },
  { label: "Built for India", value: "₹199/mo" },
];

export default function MarketingHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <Badge variant="warning" className="w-fit">
            India-first ATS resume tailoring
          </Badge>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Tailor every resume to the job description in one click.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              ApplyX turns one master resume into ATS-optimized, job-specific resumes
              for LinkedIn, Naukri, Instahyre, and direct company applications without
              prompt engineering or manual formatting.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={cn(buttonVariants({ size: "lg" }), "gap-2")} href="/signup">
              Tailor Your First Resume Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              href="/pricing"
            >
              View Pricing
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[26px] border border-border/70 bg-white/80 p-5"
              >
                <div className="text-2xl font-semibold">{metric.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Tailoring snapshot</CardTitle>
                <CardDescription>
                  Match score jumps before the recruiter even opens the file.
                </CardDescription>
              </div>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border/70 bg-background p-5">
                <div className="text-sm text-muted-foreground">Before</div>
                <div className="mt-2 text-4xl font-semibold">61</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Generic summary, buried skills, and missing ATS keywords.
                </p>
              </div>
              <div className="rounded-[24px] border border-primary/30 bg-primary/10 p-5">
                <div className="text-sm text-primary">After</div>
                <div className="mt-2 text-4xl font-semibold">87</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Tailored summary, reordered bullets, and JD-aligned skill prioritization.
                </p>
              </div>
            </div>
            <div className="space-y-4 rounded-[28px] bg-slate-950 p-6 text-slate-50">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Zap className="h-4 w-4 text-amber-300" />
                Claude-powered tailoring with OpenAI fallback
              </div>
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Preserves authentic experience while mirroring JD language.</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Optimized for ATS-safe single-column templates and Indian job portals.</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Built for job seekers sending 50 to 100 applications per cycle.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold sm:text-4xl">How ApplyX works</h2>
          <p className="text-lg leading-8 text-muted-foreground">
            A single flow designed for speed, consistency, and solo-maintainability.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <Badge className="w-fit">{`0${index + 1}`}</Badge>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>One-click, not a chatbot</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            The interface is built around upload, paste, tailor, and download so users do
            not waste time prompt-engineering every application.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ATS match score visibility</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Every tailored version shows score uplift and a clear audit trail of rewritten
            bullets, reordered sections, and inserted keywords.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Priced for India</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            Monthly pricing starts at ₹199 so active applicants can tailor aggressively
            without enterprise SaaS pricing overhead.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
