"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    eyebrow: "Signal Extraction",
    headline: "Read the JD like a recruiter, not a keyword dump.",
    description:
      "Paste a job post and watch the role resolve into skills, scope, seniority, work mode, and missing language before you touch the resume.",
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
      { label: "Skills extracted", value: "18" },
      { label: "Comp clues", value: "3" },
      { label: "Role priorities", value: "6" },
    ],
    highlights: [
      "Clusters requirements into hiring priorities instead of a flat keyword list.",
      "Separates hard skills, ownership signals, and logistics in one pass.",
      "Flags terms your current resume never mentions before tailoring starts.",
    ],
    queue: [
      {
        label: "Primary ask",
        value: "TypeScript + AI evaluation",
        hint: "Mirrored into summary and recent bullets.",
      },
      {
        label: "Scope cue",
        value: "Own the internal platform",
        hint: "Raises architecture and cross-team language.",
      },
    ],
    floatCard: {
      label: "Fresh roles mapped",
      value: "04",
    },
  },
  {
    id: "tailor",
    name: "Tailor",
    eyebrow: "Resume Delta Engine",
    headline: "Reshape the resume with believable, ATS-safe edits.",
    description:
      "The system reorders bullets, rewrites the summary, and lifts the strongest evidence without turning the candidate into fiction.",
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
      { label: "Bullets reprioritized", value: "09" },
      { label: "Summary variants", value: "03" },
      { label: "Exports ready", value: "PDF + DOCX" },
    ],
    highlights: [
      "Keeps formatting single-column and ATS-safe while still feeling premium.",
      "Preserves truthfulness by editing around real experience, not inventing projects.",
      "Surfaces the strongest evidence first so recruiters see fit immediately.",
    ],
    queue: [
      {
        label: "Summary state",
        value: "Platform + product impact",
        hint: "Shifted from generic engineer language.",
      },
      {
        label: "Keyword gap",
        value: "Evaluation pipelines covered",
        hint: "Inserted into two measurable bullets.",
      },
    ],
    floatCard: {
      label: "Version delta",
      value: "+26%",
    },
  },
  {
    id: "track",
    name: "Track",
    eyebrow: "Live Pipeline Board",
    headline: "Push every tailored draft into a board that stays alive.",
    description:
      "Each role becomes a moving system with status, follow-up timing, priorities, and notes instead of another dead spreadsheet row.",
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
      { label: "Smart reminders", value: "Always on" },
      { label: "Priority tags", value: "Hot / Warm / Hold" },
    ],
    highlights: [
      "Auto-fills the tracker from the same role context used to tailor the resume.",
      "Keeps follow-ups visible so promising roles do not disappear after submission.",
      "Links interview prep, notes, and exports back to the same card.",
    ],
    queue: [
      {
        label: "Board state",
        value: "Applied -> recruiter screen",
        hint: "Reminder scheduled before the status cools off.",
      },
      {
        label: "Role urgency",
        value: "High-fit, high-priority",
        hint: "Pinned above passive applications.",
      },
    ],
    floatCard: {
      label: "Active board cards",
      value: "17",
    },
  },
  {
    id: "prepare",
    name: "Prepare",
    eyebrow: "Interview Command Layer",
    headline: "Turn each application into a prep room before the interview lands.",
    description:
      "Attach practice loops, system design reads, behavior prompts, and company notes to the exact role that generated them.",
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
      { label: "Behavior prompts", value: "12" },
      { label: "System design reads", value: "04" },
      { label: "Notes pinned", value: "Unlimited" },
    ],
    highlights: [
      "Prep resources stay attached to the application instead of scattered across tabs.",
      "Behavior stories can mirror the exact responsibilities emphasized in the JD.",
      "The page remains useful after submission because it becomes your interview workspace.",
    ],
    queue: [
      {
        label: "Prompt set",
        value: "Ownership + ambiguity stories",
        hint: "Aligned to hiring-manager expectations.",
      },
      {
        label: "Practice lane",
        value: "System design + behavioral loop",
        hint: "Switched on for this company profile.",
      },
    ],
    floatCard: {
      label: "Prep depth",
      value: "Deep",
    },
  },
];

const capabilityCards: CapabilityCard[] = [
  {
    title: "Workflow Morph",
    eyebrow: "Shared layout card transitions",
    description:
      "Cards expand, compress, and hand detail from one state to another so the page feels like a product demo instead of stacked marketing blocks.",
    metric: "4 linked scenes",
    gradient: "from-sky-500/30 via-cyan-400/10 to-transparent",
    accentText: "text-sky-700 dark:text-sky-200",
    icon: Workflow,
    points: [
      "Hover or tap shifts the active capability without a hard page break.",
      "Large panels reuse motion language from the hero for visual continuity.",
      "The active card reveals denser copy while inactive cards stay compressed.",
    ],
  },
  {
    title: "Resume Delta",
    eyebrow: "Animated evidence surfaces",
    description:
      "The UI shows before-and-after pressure points: stronger bullets, tighter summaries, and clearer skill alignment at the exact moment the viewer asks for proof.",
    metric: "Believable uplift",
    gradient: "from-emerald-500/30 via-teal-400/10 to-transparent",
    accentText: "text-emerald-700 dark:text-emerald-200",
    icon: FileBadge2,
    points: [
      "Highlight cards lift metrics and changed content without overwhelming the page.",
      "Floating support panels give the hero more depth than a single static mockup.",
      "Transitions prioritize legibility over novelty so motion still sells the product.",
    ],
  },
  {
    title: "Tracker Pulse",
    eyebrow: "Stateful follow-up UI",
    description:
      "Reminders, status movement, and priority heat are treated like live signals. That keeps the board feeling active rather than archival.",
    metric: "Board stays alive",
    gradient: "from-amber-400/30 via-orange-300/10 to-transparent",
    accentText: "text-amber-700 dark:text-amber-200",
    icon: CalendarClock,
    points: [
      "Priority cards surface urgency with color, motion, and queue language.",
      "Status shifts happen in-place so the product reads as operational software.",
      "The layout stays readable on mobile by collapsing into a vertical motion rail.",
    ],
  },
  {
    title: "Recruiter Readout",
    eyebrow: "High-signal visual hierarchy",
    description:
      "The page leans on contrast, blur, and hard typographic rhythm to frame the most important actions immediately while secondary detail drifts into the background.",
    metric: "No dead space",
    gradient: "from-fuchsia-500/30 via-violet-400/10 to-transparent",
    accentText: "text-fuchsia-700 dark:text-fuchsia-200",
    icon: BriefcaseBusiness,
    points: [
      "The hero and CTA each carry their own atmosphere instead of sharing one flat shell.",
      "Glass surfaces and lighting changes react differently in light and dark themes.",
      "Motion is concentrated around state changes, not sprayed across every element.",
    ],
  },
];

const heroStats = [
  {
    label: "Scenes",
    value: "04",
    detail: "Parse, tailor, track, prepare",
  },
  {
    label: "Board state",
    value: "Live",
    detail: "The pipeline stays actionable",
  },
  {
    label: "Output",
    value: "ATS-safe",
    detail: "Readable by software and humans",
  },
];

const liveSignals = [
  "JD mapped into hiring priorities",
  "Resume delta pushed into export-ready drafts",
  "Follow-up timing scheduled from the same role context",
];

const sectionEntrance = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function ImmersiveLanding() {
  const reduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState(0);
  const [activeCapability, setActiveCapability] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const rotation = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % workflowStages.length);
    }, 4800);

    return () => window.clearInterval(rotation);
  }, [reduceMotion]);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-shell absolute inset-x-0 top-0 h-[54rem]" />
        <motion.div
          className="absolute left-[-12rem] top-20 h-80 w-80 rounded-full bg-sky-400/18 blur-3xl dark:bg-sky-400/14"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 80, -20, 0],
                  y: [0, -30, 30, 0],
                  scale: [1, 1.08, 0.96, 1],
                }
          }
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-[-10rem] top-40 h-72 w-72 rounded-full bg-emerald-400/16 blur-3xl dark:bg-emerald-400/14"
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -70, 10, 0],
                  y: [0, 30, -20, 0],
                  scale: [1, 0.94, 1.06, 1],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="grid-sweep absolute inset-x-0 top-0 h-[58rem]" />
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
                Motion-first landing page
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
                  ApplyX control room
                </p>
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] sm:text-6xl lg:text-7xl">
                  A cinematic UI for the full job-search loop.
                </h1>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Resume tailoring, pipeline tracking, and interview prep rendered as one
                linked motion system with live card transitions instead of static sections.
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
                Enter the flow
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
                  className="glass-panel rounded-full px-4 py-2 text-sm text-foreground/85 dark:text-slate-200"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
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
                  className="glass-panel rounded-[28px] p-5"
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34 + index * 0.08, duration: 0.55 }}
                >
                  <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
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
                        <button
                          key={stage.id}
                          className={cn(
                            "relative overflow-hidden rounded-full border px-4 py-2 text-left text-sm transition-colors",
                            isActive
                              ? "border-transparent text-white"
                              : "border-white/50 bg-white/55 text-foreground/75 hover:bg-white/70 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-900/85",
                          )}
                          onClick={() => setActiveStage(index)}
                          type="button"
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
                        </button>
                      );
                    })}
                  </div>
                </LayoutGroup>

                <div className="relative mt-5 min-h-[31rem]">
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
                                className="relative grid h-full gap-6 lg:grid-cols-[1.02fr_0.98fr]"
                                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div className="flex flex-col justify-between gap-6">
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
                                      <h2 className="max-w-xl text-3xl font-semibold leading-tight md:text-4xl">
                                        {stage.headline}
                                      </h2>
                                      <p className="max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                                        {stage.description}
                                      </p>
                                    </div>

                                    <div className="space-y-3">
                                      {stage.highlights.map((highlight) => (
                                        <div
                                          key={highlight}
                                          className="flex items-start gap-3 text-sm leading-6 text-slate-200"
                                        >
                                          <CheckCircle2 className={cn("mt-1 h-4 w-4 shrink-0", stage.accentText)} />
                                          <span>{highlight}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid gap-3 sm:grid-cols-3">
                                    {stage.metrics.map((metric) => (
                                      <div
                                        key={metric.label}
                                        className="rounded-[22px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl"
                                      >
                                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                          {metric.label}
                                        </div>
                                        <div className="mt-3 text-xl font-semibold text-white">
                                          {metric.value}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="relative flex flex-col justify-between gap-4">
                                  <div className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5 backdrop-blur-2xl">
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
                                  </div>

                                  <div className="grid gap-3">
                                    {stage.queue.map((item, queueIndex) => (
                                      <motion.div
                                        key={item.label}
                                        className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-xl"
                                        initial={
                                          reduceMotion
                                            ? false
                                            : { opacity: 0, x: 20, y: 10 }
                                        }
                                        animate={{ opacity: 1, x: 0, y: 0 }}
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
                                    className="absolute -bottom-3 right-0 hidden rounded-[22px] border border-white/10 bg-slate-950/70 px-4 py-3 shadow-[0_20px_48px_-18px_rgba(15,23,42,0.85)] backdrop-blur-xl md:block"
                                    animate={
                                      reduceMotion
                                        ? undefined
                                        : { y: [0, -8, 0], rotateZ: [0, -1, 0] }
                                    }
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
            Capability rail
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Card transitions that behave like product states.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            Hover or tap through the rail and the active panel expands into a more
            technical explanation. The rest compress but stay visible, so the layout keeps
            momentum instead of snapping between unrelated sections.
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
                  className="glass-panel relative min-h-[21rem] overflow-hidden rounded-[32px] border text-left"
                  onClick={() => setActiveCapability(index)}
                  onFocus={() => setActiveCapability(index)}
                  onMouseEnter={() => setActiveCapability(index)}
                  type="button"
                  layout
                  animate={reduceMotion ? undefined : { flex: isActive ? 1.55 : 0.9 }}
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
                          <Icon className="h-5 w-5" />
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
                Final CTA
              </Badge>
              <div className="space-y-4">
                <h2 className="max-w-2xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
                  If you wanted an advanced animated page, this is the direction.
                </h2>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  The homepage now behaves like a motion-driven product story: layered
                  backgrounds, stacked scene changes, expandable capability cards, and a
                  darker CTA zone that closes with real depth instead of another flat block.
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
                  Launch the experience
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
                  title: "Visual density",
                  value: "High-signal hierarchy",
                  icon: Radar,
                },
                {
                  title: "Motion language",
                  value: "Stack, swap, expand",
                  icon: Workflow,
                },
                {
                  title: "Conversion focus",
                  value: "Actions stay visible",
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
