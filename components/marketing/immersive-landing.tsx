"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Command,
  FileBadge2,
  Layers3,
  LineChart,
  Radar,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WorkflowStage = {
  id: string;
  name: string;
  eyebrow: string;
  headline: string;
  description: string;
  accentText: string;
  accentSoft: string;
  accentGlow: string;
  cardGradient: string;
  icon: LucideIcon;
  spotlight: {
    label: string;
    value: string;
    delta: string;
  };
  metrics: Array<{
    label: string;
    value: string;
  }>;
  highlights: string[];
  queue: Array<{
    label: string;
    value: string;
    hint: string;
  }>;
  floatCard: {
    label: string;
    value: string;
  };
};

type CapabilityCard = {
  title: string;
  eyebrow: string;
  description: string;
  metric: string;
  gradient: string;
  accentText: string;
  icon: LucideIcon;
  points: string[];
};

const workflowStages: WorkflowStage[] = [
  {
    id: "parse",
    name: "Parse",
    eyebrow: "Spot The Edge",
    headline: "See why a role is worth chasing before you waste an hour on it.",
    description:
      "Paste a job post and the noise resolves into hiring priorities, missing proof points, and the language most likely to earn a second look.",
    accentText: "text-sky-200",
    accentSoft: "bg-sky-400/15 text-sky-100",
    accentGlow: "from-sky-400/40 via-cyan-300/15 to-transparent",
    cardGradient:
      "from-slate-950 via-slate-900 to-sky-950/90 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950/80",
    icon: Radar,
    spotlight: {
      label: "Intent confidence",
      value: "91%",
      delta: "+12 signals",
    },
    metrics: [
      { label: "Core skills", value: "18" },
      { label: "Salary clues", value: "3" },
      { label: "Priority themes", value: "6" },
    ],
    highlights: [
      "Turns a long JD into the few proof points recruiters actually scan for.",
      "Separates hard skills, ownership signals, and logistics in one pass.",
      "Flags the missing language before you start editing under pressure.",
    ],
    queue: [
      {
        label: "What to mirror",
        value: "TypeScript + AI evaluation",
        hint: "Pull this into the summary and strongest recent bullets.",
      },
      {
        label: "What to prove",
        value: "Own the internal platform",
        hint: "Shift the resume toward ownership, systems, and decision-making.",
      },
    ],
    floatCard: {
      label: "Fast clarity",
      value: "04",
    },
  },
  {
    id: "tailor",
    name: "Tailor",
    eyebrow: "Look Like The Fit",
    headline: "Look like the obvious match without sounding manufactured.",
    description:
      "The resume shifts around real experience, sharper proof, and safer ATS structure so you read as relevant faster.",
    accentText: "text-emerald-200",
    accentSoft: "bg-emerald-400/15 text-emerald-100",
    accentGlow: "from-emerald-400/40 via-teal-300/15 to-transparent",
    cardGradient:
      "from-slate-950 via-slate-900 to-emerald-950/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/80",
    icon: Sparkles,
    spotlight: {
      label: "Projected match",
      value: "87%",
      delta: "+26 uplift",
    },
    metrics: [
      { label: "Bullets moved up", value: "09" },
      { label: "Summary angles", value: "03" },
      { label: "Ready to send", value: "PDF + DOCX" },
    ],
    highlights: [
      "Keeps the format ATS-safe while making the strongest proof impossible to miss.",
      "Edits around real experience instead of inventing projects or fake expertise.",
      "Surfaces the bullets most likely to make a recruiter pause and keep reading.",
    ],
    queue: [
      {
        label: "What shifts first",
        value: "Platform + product impact",
        hint: "Generic engineer language gets replaced with sharper business proof.",
      },
      {
        label: "What closes the gap",
        value: "Evaluation pipelines covered",
        hint: "Inserted where it adds signal instead of bloating the page.",
      },
    ],
    floatCard: {
      label: "Match lift",
      value: "+26%",
    },
  },
  {
    id: "track",
    name: "Track",
    eyebrow: "Stay Top Of Mind",
    headline: "Keep promising roles warm before they quietly slip away.",
    description:
      "Each application gets a next move, a reminder window, and a priority signal so good roles do not vanish into spreadsheet debt.",
    accentText: "text-amber-100",
    accentSoft: "bg-amber-300/15 text-amber-50",
    accentGlow: "from-amber-300/40 via-orange-300/15 to-transparent",
    cardGradient:
      "from-slate-950 via-slate-900 to-amber-950/95 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/80",
    icon: Layers3,
    spotlight: {
      label: "Next follow-up",
      value: "14m",
      delta: "queued",
    },
    metrics: [
      { label: "Pipeline stages", value: "07" },
      { label: "Reminder logic", value: "Always on" },
      { label: "Urgency cues", value: "Hot / Warm / Hold" },
    ],
    highlights: [
      "The same role context fills the tracker, so momentum carries forward automatically.",
      "Follow-ups stay visible before a strong application goes cold.",
      "Prep, notes, and exports stay attached to the same role instead of drifting apart.",
    ],
    queue: [
      {
        label: "What happens next",
        value: "Applied -> recruiter screen",
        hint: "A reminder lands before the thread loses heat.",
      },
      {
        label: "What deserves attention",
        value: "High-fit, high-priority",
        hint: "Pinned above passive applications so attention goes where odds are better.",
      },
    ],
    floatCard: {
      label: "Live momentum",
      value: "17",
    },
  },
  {
    id: "prepare",
    name: "Prepare",
    eyebrow: "Walk In Ready",
    headline: "Walk into interviews already thinking like an insider.",
    description:
      "Each application becomes its own prep room, with the stories, reads, and notes most likely to raise confidence before the call.",
    accentText: "text-fuchsia-200",
    accentSoft: "bg-fuchsia-400/15 text-fuchsia-100",
    accentGlow: "from-fuchsia-400/40 via-violet-300/15 to-transparent",
    cardGradient:
      "from-slate-950 via-slate-900 to-fuchsia-950/95 dark:from-slate-950 dark:via-slate-900 dark:to-fuchsia-950/80",
    icon: Command,
    spotlight: {
      label: "Prep packs linked",
      value: "06",
      delta: "role-aware",
    },
    metrics: [
      { label: "Story prompts", value: "12" },
      { label: "Design reads", value: "04" },
      { label: "Notes pinned", value: "Unlimited" },
    ],
    highlights: [
      "Prep resources stay attached to the role instead of getting lost across tabs.",
      "Behavior stories mirror the responsibilities the JD emphasized most.",
      "The application stays useful after submission because it becomes your prep workspace.",
    ],
    queue: [
      {
        label: "What they may probe",
        value: "Ownership + ambiguity stories",
        hint: "Pulled toward the signals a hiring manager is likely to test.",
      },
      {
        label: "What to rehearse",
        value: "System design + behavioral loop",
        hint: "A tighter prep lane means less last-minute thrashing.",
      },
    ],
    floatCard: {
      label: "Confidence mode",
      value: "Deep",
    },
  },
];

const capabilityCards: CapabilityCard[] = [
  {
    title: "Keep Momentum",
    eyebrow: "No more broken handoffs",
    description:
      "Paste the JD once, then move from analysis to tailoring to tracking without rebuilding context at each step.",
    metric: "One continuous flow",
    gradient: "from-sky-500/30 via-cyan-400/10 to-transparent",
    accentText: "text-sky-700 dark:text-sky-200",
    icon: Workflow,
    points: [
      "Role signals carry straight into the tailored resume instead of getting lost between tools.",
      "Each application keeps its resume, status, and next step tied together.",
      "Less context switching means faster decisions and fewer dropped applications.",
    ],
  },
  {
    title: "Win Attention",
    eyebrow: "Show value fast",
    description:
      "Stronger bullets, tighter summaries, and better skill ordering help recruiters see fit before attention drifts.",
    metric: "Proof over fluff",
    gradient: "from-emerald-500/30 via-teal-400/10 to-transparent",
    accentText: "text-emerald-700 dark:text-emerald-200",
    icon: FileBadge2,
    points: [
      "The strongest evidence shows up early, where skim readers make the first judgment.",
      "ATS keywords get covered without turning the resume into a keyword dump.",
      "The rewrite stays readable to humans while still improving match strength.",
    ],
  },
  {
    title: "Stay Visible",
    eyebrow: "Follow-up without mental load",
    description:
      "Applied dates, follow-up reminders, and status changes keep strong applications from going cold in silence.",
    metric: "Follow-up stays alive",
    gradient: "from-amber-400/30 via-orange-300/10 to-transparent",
    accentText: "text-amber-700 dark:text-amber-200",
    icon: CalendarClock,
    points: [
      "The board tells you what needs action next instead of making you remember it.",
      "Reminders reduce the silent drop-off that happens after most applications.",
      "Momentum survives even when you are juggling multiple roles at once.",
    ],
  },
  {
    title: "Reduce Chaos",
    eyebrow: "Know what matters next",
    description:
      "One system keeps job context, tailored resumes, and next actions in view so the search feels manageable under pressure.",
    metric: "Clarity under pressure",
    gradient: "from-fuchsia-500/30 via-violet-400/10 to-transparent",
    accentText: "text-fuchsia-700 dark:text-fuchsia-200",
    icon: BriefcaseBusiness,
    points: [
      "You can see what is moving, what is stalled, and what deserves another push.",
      "Each application keeps its history and context in one place.",
      "Less guessing creates calmer decisions during a stressful search.",
    ],
  },
];

const heroStats = [
  {
    label: "Less friction",
    value: "1 flow",
    detail: "Parse, tailor, track, and follow up without bouncing between tools.",
  },
  {
    label: "More control",
    value: "Live",
    detail: "Every promising role gets a next step before it goes cold.",
  },
  {
    label: "Stronger signal",
    value: "ATS-safe",
    detail: "Sharper resumes that still read like a real person wrote them.",
  },
];

const liveSignals = [
  "Stop rewriting the same resume for every application.",
  "Stay top-of-mind after you hit apply.",
  "Stop losing strong roles to chaos and delay.",
];

const sectionEntrance = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function ImmersiveLanding() {
  const reduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const [activeCapability, setActiveCapability] = useState(0);
  const liftHover = reduceMotion ? undefined : { y: -6, scale: 1.02 };
  const softHover = reduceMotion ? undefined : { y: -3, scale: 1.01 };

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-shell absolute inset-x-0 top-0 h-[54rem]" />
        <div className="absolute left-[-12rem] top-20 h-80 w-80 rounded-full bg-sky-400/18 blur-3xl dark:bg-sky-400/14" />
        <div className="absolute right-[-10rem] top-40 h-72 w-72 rounded-full bg-emerald-400/16 blur-3xl dark:bg-emerald-400/14" />
        <div className="grid-sweep absolute inset-x-0 top-0 h-[58rem] [animation:none]" />
        <div className="noise-overlay absolute inset-0 opacity-40" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-8">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={sectionEntrance}
            >
              <Badge variant="outline" className="border-white/50 bg-white/55 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-foreground/80 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                Built for serious job searches
              </Badge>
            </motion.div>

            <motion.div
              className="space-y-5"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sectionEntrance, delay: 0.08 }}
            >
              <div className="space-y-3">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Tailor. Track. Follow up.
                </p>
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] sm:text-6xl lg:text-7xl">
                  Get more interviews without rewriting your resume from scratch.
                </h1>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                ApplyX turns every job post into a tailored resume, a tracked application,
                and a follow-up plan, so you move faster, stay organized, and stop losing
                strong opportunities to chaos.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sectionEntrance, delay: 0.16 }}
            >
              <Link
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "group gap-2 bg-slate-950 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.7)] hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground",
                )}
                href="/signup"
              >
                Start with 2 free demos
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-white/60 bg-white/60 backdrop-blur-xl hover:bg-white/80 dark:border-white/10 dark:bg-slate-900/65 dark:hover:bg-slate-900/85",
                )}
                href="/pricing"
              >
                Inspect plans
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sectionEntrance, delay: 0.24 }}
            >
              {liveSignals.map((signal, index) => (
                <motion.div
                  key={signal}
                  className="glass-panel rounded-full border-white/40 px-4 py-2 text-sm text-foreground/85 transition-colors duration-300 hover:border-sky-300/60 hover:bg-white/75 dark:border-white/10 dark:text-slate-200 dark:hover:border-sky-400/40 dark:hover:bg-slate-900/85"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={softHover}
                  transition={{ delay: 0.28 + index * 0.08, duration: 0.45 }}
                >
                  {signal}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="grid gap-4 sm:grid-cols-3"
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...sectionEntrance, delay: 0.3 }}
            >
              {heroStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="glass-panel group rounded-[30px] p-5 md:min-h-[10.5rem] md:p-6"
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={liftHover}
                  transition={{ delay: 0.34 + index * 0.08, duration: 0.55 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      {stat.label}
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-sky-400/70 shadow-[0_0_20px_rgba(56,189,248,0.55)] transition-transform duration-300 group-hover:scale-125" />
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.6rem]">
                    {stat.value}
                  </div>
                  <p className="mt-3 max-w-[18rem] text-sm leading-6 text-muted-foreground">
                    {stat.detail}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...sectionEntrance, delay: 0.18 }}
          >
            <div className="perspective-stage relative">
              <div className="absolute inset-x-12 top-10 h-56 rounded-full bg-white/60 blur-3xl dark:bg-white/5" />
              <div className="glass-panel relative overflow-hidden rounded-[34px] p-4 md:p-5">
                <div className="absolute inset-0 rounded-[34px] border border-white/40 dark:border-white/10" />
                <LayoutGroup id="stage-tabs">
                  <div className="flex flex-wrap gap-2">
                    {workflowStages.map((stage, index) => {
                      const isActive = index === activeStage;
                      const Icon = stage.icon;

                      return (
                        <motion.button
                          key={stage.id}
                          className={cn(
                            "relative overflow-hidden rounded-full border px-4 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "border-transparent text-white"
                              : "border-white/50 bg-white/55 text-foreground/75 hover:bg-white/70 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900/85",
                          )}
                          onClick={() => setActiveStage(index)}
                          type="button"
                          whileHover={softHover}
                          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        >
                          {isActive ? (
                            <motion.span
                              layoutId="stage-pill"
                              className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-r shadow-[0_16px_40px_-18px_rgba(15,23,42,0.85)]",
                                stage.accentGlow,
                              )}
                            />
                          ) : null}
                          <span className="relative flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {stage.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                <div className="relative mt-5 min-h-[44rem] xl:min-h-[36rem] 2xl:min-h-[34rem]">
                  {workflowStages.map((stage, index) => {
                    const position =
                      (index - activeStage + workflowStages.length) % workflowStages.length;
                    const isCurrent = position === 0;
                    const isVisible = position < 3;
                    const Icon = stage.icon;

                    return (
                      <motion.div
                        key={stage.id}
                        className={cn(
                          "absolute inset-0",
                          isCurrent ? "pointer-events-auto" : "pointer-events-none",
                          !isVisible && "hidden lg:block",
                        )}
                        animate={
                          reduceMotion
                            ? { opacity: isCurrent ? 1 : 0, x: 0, y: 0, scale: 1 }
                            : {
                                opacity: isCurrent ? 1 : position === 1 ? 0.38 : 0.16,
                                x: isCurrent ? 0 : position === 1 ? 30 : 56,
                                y: isCurrent ? 0 : position === 1 ? 24 : 48,
                                scale: isCurrent ? 1 : position === 1 ? 0.965 : 0.92,
                                rotateZ: isCurrent ? 0 : position === 1 ? 2.2 : 4.4,
                                filter: isCurrent ? "blur(0px)" : "blur(1px)",
                              }
                        }
                        style={{ zIndex: 40 - position }}
                        transition={{
                          type: "spring",
                          stiffness: 180,
                          damping: 24,
                          mass: 0.75,
                        }}
                      >
                        <div
                          className={cn(
                            "relative h-full overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br p-6 text-slate-50 shadow-[0_42px_110px_-46px_rgba(2,6,23,0.92)]",
                            stage.cardGradient,
                          )}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 bg-gradient-to-tr opacity-90",
                              stage.accentGlow,
                            )}
                          />
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_28%)]" />
                          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:88px_88px]" />

                          <AnimatePresence mode="wait">
                            {isCurrent ? (
                              <motion.div
                                key={stage.id}
                                className="relative grid h-full gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]"
                                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className="flex flex-col gap-5">
                                  <div className="space-y-5">
                                    <div className="flex items-center justify-between gap-4">
                                      <Badge
                                        className={cn(
                                          "w-fit border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em]",
                                          stage.accentSoft,
                                        )}
                                      >
                                        {stage.eyebrow}
                                      </Badge>
                                      <div className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80">
                                        <Icon className="h-4 w-4" />
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h2 className="max-w-2xl text-3xl font-semibold leading-[1.02] md:text-[3.4rem] xl:max-w-xl xl:text-[3.15rem]">
                                        {stage.headline}
                                      </h2>
                                      <p className="max-w-2xl text-base leading-8 text-slate-300 xl:max-w-xl">
                                        {stage.description}
                                      </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                                      {stage.highlights.map((highlight, highlightIndex) => (
                                        <motion.div
                                          key={highlight}
                                          className="group rounded-[22px] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-slate-200 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/10"
                                          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          whileHover={softHover}
                                          transition={{
                                            delay: 0.06 + highlightIndex * 0.05,
                                            duration: 0.35,
                                          }}
                                        >
                                          <div className="flex items-start gap-3">
                                            <CheckCircle2 className={cn("mt-1 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110", stage.accentText)} />
                                            <span>{highlight}</span>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid gap-3 sm:grid-cols-3">
                                    {stage.metrics.map((metric, metricIndex) => (
                                      <motion.div
                                        key={metric.label}
                                        className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/10"
                                        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={softHover}
                                        transition={{
                                          delay: 0.08 + metricIndex * 0.05,
                                          duration: 0.35,
                                        }}
                                      >
                                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                          {metric.label}
                                        </div>
                                        <div className="mt-3 text-xl font-semibold text-white">
                                          {metric.value}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>

                                <div className="relative flex flex-col gap-4 xl:pl-1">
                                  <motion.div
                                    className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5 backdrop-blur-2xl transition-colors duration-300 hover:border-white/20 hover:bg-slate-950/45"
                                    whileHover={liftHover}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                          {stage.spotlight.label}
                                        </div>
                                        <div className="mt-3 text-5xl font-semibold text-white">
                                          {stage.spotlight.value}
                                        </div>
                                      </div>
                                      <div
                                        className={cn(
                                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                                          stage.accentSoft,
                                        )}
                                      >
                                        {stage.spotlight.delta}
                                      </div>
                                    </div>

                                    <div className="mt-5 h-2 rounded-full bg-white/10">
                                      <motion.div
                                        className={cn(
                                          "h-full rounded-full bg-gradient-to-r",
                                          stage.accentGlow,
                                        )}
                                        initial={reduceMotion ? false : { width: 0 }}
                                        animate={{
                                          width:
                                            stage.id === "parse"
                                              ? "91%"
                                              : stage.id === "tailor"
                                                ? "87%"
                                                : stage.id === "track"
                                                  ? "74%"
                                                  : "68%",
                                        }}
                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                      />
                                    </div>
                                  </motion.div>

                                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                                    {stage.queue.map((item, queueIndex) => (
                                      <motion.div
                                        key={item.label}
                                        className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl transition-colors duration-300 hover:border-white/20 hover:bg-white/10"
                                        initial={
                                          reduceMotion
                                            ? false
                                            : { opacity: 0, x: 20, y: 10 }
                                        }
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        whileHover={softHover}
                                        transition={{
                                          delay: 0.08 + queueIndex * 0.08,
                                          duration: 0.45,
                                        }}
                                      >
                                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                          {item.label}
                                        </div>
                                        <div className="mt-2 text-lg font-medium text-white">
                                          {item.value}
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                          {item.hint}
                                        </p>
                                      </motion.div>
                                    ))}
                                  </div>

                                  <motion.div
                                    className="ml-auto hidden rounded-[22px] border border-white/10 bg-slate-950/70 px-4 py-3 shadow-[0_20px_48px_-18px_rgba(15,23,42,0.85)] backdrop-blur-xl md:block"
                                    animate={
                                      reduceMotion
                                        ? undefined
                                        : { y: [0, -8, 0], rotateZ: [0, -1, 0] }
                                    }
                                    whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                                    transition={{
                                      duration: 6,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                      {stage.floatCard.label}
                                    </div>
                                    <div className={cn("mt-1 text-2xl font-semibold", stage.accentText)}>
                                      {stage.floatCard.value}
                                    </div>
                                  </motion.div>
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-24 sm:px-6 lg:px-8"
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={sectionEntrance}
      >
        <div className="max-w-3xl space-y-4">
          <Badge className="w-fit border border-white/50 bg-white/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/80 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
            Application flow
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Every step should move you closer to an interview.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Parse the role, tailor the resume, track the application, and follow up on
            time without rebuilding context across docs, spreadsheets, and tabs.
          </p>
        </div>

        <LayoutGroup id="capability-rail">
          <div className="flex flex-col gap-4 lg:flex-row">
            {capabilityCards.map((card, index) => {
              const isActive = index === activeCapability;
              const Icon = card.icon;

              return (
                <motion.button
                  key={card.title}
                  className="glass-panel group relative min-h-[21rem] overflow-hidden rounded-[32px] border text-left"
                  onClick={() => setActiveCapability(index)}
                  onFocus={() => setActiveCapability(index)}
                  onMouseEnter={() => setActiveCapability(index)}
                  type="button"
                  layout
                  animate={reduceMotion ? undefined : { flex: isActive ? 1.55 : 0.9 }}
                  whileHover={softHover}
                  transition={{ type: "spring", stiffness: 210, damping: 26 }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-90",
                      card.gradient,
                    )}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_42%,rgba(15,23,42,0.06))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%,rgba(2,6,23,0.18))]" />

                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            {card.eyebrow}
                          </div>
                          <h3 className="text-2xl font-semibold">{card.title}</h3>
                        </div>
                        <div className="rounded-2xl border border-white/40 bg-white/55 p-3 text-foreground/80 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-100">
                          <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                        </div>
                      </div>

                      <AnimatePresence mode="wait" initial={false}>
                        {isActive ? (
                          <motion.div
                            key={`${card.title}-active`}
                            className="space-y-4"
                            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                            transition={{ duration: 0.28 }}
                          >
                            <p className="max-w-md text-sm leading-7 text-foreground/80 dark:text-slate-200">
                              {card.description}
                            </p>
                            <div className="space-y-3">
                              {card.points.map((point) => (
                                <div
                                  key={point}
                                  className="flex items-start gap-3 text-sm leading-6 text-foreground/80 dark:text-slate-200"
                                >
                                  <LineChart className={cn("mt-1 h-4 w-4 shrink-0", card.accentText)} />
                                  <span>{point}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`${card.title}-inactive`}
                            className="max-w-[14rem]"
                            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                            transition={{ duration: 0.24 }}
                          >
                            <p className="text-sm leading-7 text-foreground/75 dark:text-slate-300">
                              {card.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Active readout
                        </div>
                        <div className={cn("mt-2 text-2xl font-semibold", card.accentText)}>
                          {card.metric}
                        </div>
                      </div>
                      {isActive ? (
                        <motion.div
                          layoutId="rail-indicator"
                          className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
                        >
                          Active
                        </motion.div>
                      ) : null}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </LayoutGroup>
      </motion.section>

      <motion.section
        className="relative mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32"
        initial={reduceMotion ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={sectionEntrance}
      >
        <div className="relative overflow-hidden rounded-[36px] border border-white/40 bg-slate-950 px-6 py-8 text-slate-50 shadow-[0_44px_120px_-50px_rgba(2,6,23,0.95)] sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(2,6,23,0.98))]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px]" />

          <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit border border-white/10 bg-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-200">
                Ready to move faster
              </Badge>
              <div className="space-y-4">
                <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
                  Stop letting strong applications die in drafts, tabs, and follow-up debt.
                </h2>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  ApplyX helps you tailor faster, keep every role organized, and follow up
                  while the opportunity still has heat, so more of your effort turns into
                  real interview chances.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 bg-white text-slate-950 hover:bg-slate-100",
                  )}
                  href="/signup"
                >
                  Start with 2 free demos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-white/15 bg-white/5 text-white hover:bg-white/10",
                  )}
                  href="/dashboard"
                >
                  View dashboard
                </Link>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "Tailor faster",
                  value: "Less rewriting",
                  icon: Radar,
                },
                {
                  title: "Stay organized",
                  value: "No spreadsheet chaos",
                  icon: Workflow,
                },
                {
                  title: "Follow up on time",
                  value: "Keep warm roles alive",
                  icon: Sparkles,
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-xl"
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.08, duration: 0.45 }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        {item.title}
                      </div>
                      <Icon className="h-4 w-4 text-slate-200" />
                    </div>
                    <div className="mt-6 text-xl font-semibold text-white">{item.value}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
