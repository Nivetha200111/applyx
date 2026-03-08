import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { AnimatedPanel } from "@/components/ui/animated-panel";
import { AnimatedText, AnimatedCounter } from "@/components/ui/animated-text";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { SpotlightCard } from "@/components/ui/spotlight";
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
    icon: Upload,
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    title: "Paste any JD",
    description:
      "Paste a LinkedIn, Naukri, or Instahyre job description and extract ATS-critical keywords in seconds.",
    icon: FileText,
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    title: "Download tailored resume",
    description:
      "Generate a clean ATS-safe PDF or DOCX with higher relevance, better ordering, and a measurable match score uplift.",
    icon: Sparkles,
    gradient: "from-primary/20 to-emerald-500/20",
  },
];

const stats = [
  { value: 15, suffix: "s", prefix: "<", label: "Average turnaround" },
  { value: 2, suffix: "", prefix: "", label: "Free demos included" },
  { value: 199, suffix: "", prefix: "₹", label: "Starting price/mo" },
];

export default function MarketingHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-28 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* ─── Hero ─── */}
      <section className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <FloatingParticles />

        <div className="relative space-y-8">
          <AnimatedPanel delay={0} hover={false}>
            <Badge variant="warning" className="w-fit">
              India-first ATS resume tailoring
            </Badge>
          </AnimatedPanel>

          <div className="space-y-5">
            <AnimatedText
              as="h1"
              className="max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl"
              delay={0.1}
              text="Tailor every resume to the job description in one click."
            />
            <AnimatedPanel delay={0.45} hover={false}>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                ApplyX turns one master resume into ATS-optimized, job-specific resumes
                for LinkedIn, Naukri, Instahyre, and direct company applications without
                prompt engineering or manual formatting.
              </p>
            </AnimatedPanel>
          </div>

          <AnimatedPanel delay={0.55} hover={false}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(buttonVariants({ size: "lg" }), "gap-2 shimmer")}
                href="/signup"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
                href="/pricing"
              >
                View Pricing
              </Link>
            </div>
          </AnimatedPanel>

          <AnimatedPanel delay={0.65} hover={false}>
            <p className="text-sm leading-7 text-muted-foreground">
              Create an account, upload one master resume, and move straight into
              real tailoring and paid plan upgrades.
            </p>
          </AnimatedPanel>

          {/* Stats counters */}
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <AnimatedPanel key={stat.label} delay={0.7 + 0.08 * index}>
                <SpotlightCard className="surface rounded-[26px] p-5">
                  <div className="text-2xl font-semibold">
                    <AnimatedCounter
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      target={stat.value}
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                </SpotlightCard>
              </AnimatedPanel>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <AnimatedPanel delay={0.2}>
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Tailoring snapshot</CardTitle>
                  <CardDescription>
                    Match score jumps before the recruiter even opens the file.
                  </CardDescription>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatedPanel delay={0.35}>
                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-5 transition-transform duration-300 hover:-translate-y-1">
                    <div className="text-sm text-muted-foreground">Before</div>
                    <div className="mt-2 text-4xl font-semibold">
                      <AnimatedCounter target={61} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Generic summary, buried skills, and missing ATS keywords.
                    </p>
                  </div>
                </AnimatedPanel>
                <AnimatedPanel delay={0.45}>
                  <div className="score-ring-pulse rounded-[24px] border border-primary/30 bg-primary/10 p-5 transition-transform duration-300 hover:-translate-y-1">
                    <div className="text-sm text-primary">After</div>
                    <div className="mt-2 text-4xl font-semibold text-gradient">
                      <AnimatedCounter target={87} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Tailored summary, reordered bullets, and JD-aligned skill prioritization.
                    </p>
                  </div>
                </AnimatedPanel>
              </div>
              <AnimatedPanel delay={0.55}>
                <div className="space-y-4 rounded-[28px] bg-slate-950 p-6 text-slate-50 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.65)]">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="h-4 w-4 text-amber-300" />
                    <span className="text-gradient font-medium">
                      Claude Sonnet 4 + GPT-4o powered tailoring
                    </span>
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
              </AnimatedPanel>
            </CardContent>
          </Card>
        </AnimatedPanel>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative space-y-12">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

        <div className="max-w-2xl space-y-3">
          <AnimatedPanel hover={false}>
            <Badge className="w-fit">How it works</Badge>
          </AnimatedPanel>
          <AnimatedText
            as="h2"
            className="text-3xl font-semibold sm:text-4xl"
            delay={0.1}
            text="Three steps to a stronger application."
          />
          <AnimatedPanel delay={0.3} hover={false}>
            <p className="text-lg leading-8 text-muted-foreground">
              A single flow designed for speed, consistency, and solo-maintainability.
            </p>
          </AnimatedPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <AnimatedPanel key={step.title} delay={0.1 + 0.12 * index}>
                <SpotlightCard className="h-full">
                  <Card className="h-full shimmer">
                    <CardHeader>
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br",
                        step.gradient,
                      )}>
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gradient text-sm font-bold">{`0${index + 1}`}</span>
                        <CardTitle>{step.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </SpotlightCard>
              </AnimatedPanel>
            );
          })}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative">
        {/* Decorative glow orbs */}
        <div
          aria-hidden
          className="glow-orb -left-32 top-0 h-64 w-64 bg-primary/10 dark:bg-primary/5"
        />
        <div
          aria-hidden
          className="glow-orb -right-32 bottom-0 h-48 w-48 bg-accent/10 dark:bg-accent/5"
          style={{ animationDelay: "3s" }}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <AnimatedPanel delay={0.04}>
            <SpotlightCard className="h-full">
              <Card className="h-full shimmer">
                <CardHeader>
                  <CardTitle>One-click, not a chatbot</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  The interface is built around upload, paste, tailor, and download so users do
                  not waste time prompt-engineering every application.
                </CardContent>
              </Card>
            </SpotlightCard>
          </AnimatedPanel>
          <AnimatedPanel delay={0.14}>
            <SpotlightCard className="h-full">
              <Card className="h-full shimmer">
                <CardHeader>
                  <CardTitle>ATS match score visibility</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  Every tailored version shows score uplift and a clear audit trail of rewritten
                  bullets, reordered sections, and inserted keywords.
                </CardContent>
              </Card>
            </SpotlightCard>
          </AnimatedPanel>
          <AnimatedPanel delay={0.24}>
            <SpotlightCard className="h-full">
              <Card className="h-full shimmer">
                <CardHeader>
                  <CardTitle>Priced for India</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  Basic at ₹199/mo gives you 40 monthly tailors with GPT-4o mini and
                  Claude Haiku. Premium at ₹699/mo gives you 50 premium tailors with
                  Claude Sonnet 4 and GPT-4o. Both launch prices are GST-inclusive.
                </CardContent>
              </Card>
            </SpotlightCard>
          </AnimatedPanel>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <AnimatedPanel>
          <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-16 text-center text-slate-50 sm:px-16">
            <div
              aria-hidden
              className="glow-orb left-1/4 top-0 h-48 w-48 bg-primary/20"
            />
            <div
              aria-hidden
              className="glow-orb bottom-0 right-1/4 h-48 w-48 bg-accent/15"
              style={{ animationDelay: "4s" }}
            />
            <div className="relative space-y-6">
              <AnimatedText
                as="h2"
                className="mx-auto max-w-2xl justify-center text-3xl font-semibold sm:text-4xl"
                delay={0.1}
                text="Ready to stop sending the same resume everywhere?"
              />
              <p className="mx-auto max-w-xl text-lg leading-8 text-slate-300">
                Two free demos. No credit card required. See your match score jump
                before you commit.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  className={cn(buttonVariants({ size: "lg" }), "gap-2 shimmer")}
                  href="/signup"
                >
                  Try 2 Free Demos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-slate-700 text-slate-200 hover:bg-slate-800",
                  )}
                  href="/pricing"
                >
                  Compare Plans
                </Link>
              </div>
            </div>
          </div>
        </AnimatedPanel>
      </section>
    </div>
  );
}
