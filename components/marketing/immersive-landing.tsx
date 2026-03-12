"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  FileSearch,
  Gamepad2,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   ★  CUSTOM CURSOR FOLLOWER  ★
   ═══════════════════════════════════════════════════════ */

function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<HTMLDivElement[]>([]);
  const [visible, setVisible] = useState(false);
  const mousePos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let animId: number;
    const trailPositions = Array.from({ length: 6 }, () => ({ x: -100, y: -100 }));

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    const animate = () => {
      const { x, y } = mousePos.current;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
      }

      // Animate trail
      for (let i = trailPositions.length - 1; i > 0; i--) {
        trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.3;
        trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.3;
      }
      trailPositions[0].x += (x - trailPositions[0].x) * 0.4;
      trailPositions[0].y += (y - trailPositions[0].y) * 0.4;

      trailRefs.current.forEach((el, i) => {
        if (el) {
          const pos = trailPositions[i];
          const size = 8 - i;
          el.style.transform = `translate(${pos.x - size / 2}px, ${pos.y - size / 2}px)`;
          el.style.opacity = `${0.6 - i * 0.1}`;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
        }
      });

      animId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [visible]);

  return (
    <div className={cn("pointer-events-none fixed inset-0 z-[99999] hidden md:block", visible ? "opacity-100" : "opacity-0")} style={{ transition: "opacity 0.3s" }}>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el; }}
          className="fixed rounded-full"
          style={{
            background: i % 2 === 0 ? "rgba(232,96,155,0.5)" : "rgba(91,207,219,0.5)",
            mixBlendMode: "screen",
            boxShadow: i % 2 === 0
              ? "0 0 4px rgba(255,45,149,0.2)"
              : "0 0 4px rgba(0,240,255,0.2)",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ★  FLOATING STARS BACKGROUND  ★
   ═══════════════════════════════════════════════════════ */

function FloatingStars() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 star-field opacity-30" />
  );
}

/* ═══════════════════════════════════════════════════════
   ★  VISITOR COUNTER (fake geocities vibe)  ★
   ═══════════════════════════════════════════════════════ */

function VisitorCounter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = 48721 + Math.floor(Math.random() * 100);
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded border-2 border-neon-cyan/40 bg-retro-darker px-3 py-1.5">
      <div className="h-2 w-2 animate-pulse rounded-full bg-neon-green shadow-neon-green" />
      <span className="font-retro text-sm text-neon-cyan">
        VISITORS: <span className="text-neon-green">{count.toLocaleString()}</span>
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ★  MARQUEE BANNER  ★
   ═══════════════════════════════════════════════════════ */

function MarqueeBanner({ children, speed = 20 }: { children: React.ReactNode; speed?: number }) {
  return (
    <div className="marquee-container overflow-hidden border-y-2 border-neon-pink/40 bg-retro-darker/80 py-2">
      <div
        className="marquee-content inline-block whitespace-nowrap font-retro text-lg"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        <span className="mx-16">{children}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ★  GLITCH TEXT COMPONENT  ★
   ═══════════════════════════════════════════════════════ */

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn("relative inline-block", className)} data-text={text}>
      <span className={cn(glitching && "animate-glitch")}>{text}</span>
      {glitching && (
        <>
          <span
            className="absolute left-0 top-0 text-neon-pink opacity-70"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 33%, 0 33%)",
              transform: "translate(-2px, -1px)",
            }}
          >
            {text}
          </span>
          <span
            className="absolute left-0 top-0 text-neon-cyan opacity-70"
            style={{
              clipPath: "polygon(0 66%, 100% 66%, 100% 100%, 0 100%)",
              transform: "translate(2px, 1px)",
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   ★  CHAPTER DATA — THE STORY  ★
   ═══════════════════════════════════════════════════════ */

const chapters = [
  {
    id: "dark-ages",
    number: "01",
    icon: Swords,
    badge: "THE STRUGGLE",
    title: "The Dark Ages of Job Hunting",
    subtitle: "Every job seeker knows this pain...",
    color: "neon-pink" as const,
    borderClass: "neon-border-pink",
    textClass: "neon-text-pink",
    narrative: [
      "> You find the perfect job listing at 11:47 PM...",
      "> You open your resume. It's generic. Again.",
      "> You start rewriting from scratch for the 47th time.",
      "> 3 hours later, you forgot to actually apply.",
      "> The listing closes. GG.",
    ],
    stats: [
      { label: "AVG TIME WASTED", value: "3.5 HRS", icon: "⏰" },
      { label: "RESUMES REWRITTEN", value: "∞", icon: "📄" },
      { label: "SANITY REMAINING", value: "12%", icon: "🧠" },
    ],
  },
  {
    id: "discovery",
    number: "02",
    icon: Zap,
    badge: "THE SIGNAL",
    title: "You Discover ApplyX",
    subtitle: "A wild power-up appears...",
    color: "neon-cyan" as const,
    borderClass: "neon-border-cyan",
    textClass: "neon-text-cyan",
    narrative: [
      "> SYSTEM: New weapon detected...",
      "> LOADING: ApplyX v1.0 ████████████ 100%",
      "> STATUS: AI Resume Tailoring — ONLINE",
      "> STATUS: Job Tracker — ARMED",
      "> STATUS: Interview Prep — STANDING BY",
      "> READY: Your job search just leveled up.",
    ],
    stats: [
      { label: "POWER LEVEL", value: "9000+", icon: "⚡" },
      { label: "WEAPONS", value: "LOADED", icon: "🔫" },
      { label: "BOSS MODE", value: "ACTIVE", icon: "👑" },
    ],
  },
  {
    id: "parse",
    number: "03",
    icon: FileSearch,
    badge: "LEVEL 1: PARSE",
    title: "Decode the Job Listing",
    subtitle: "See what recruiters actually care about",
    color: "neon-green" as const,
    borderClass: "neon-border-green",
    textClass: "neon-text-green",
    narrative: [
      "> Paste any job description...",
      "> AI extracts: skills, priorities, hidden signals",
      "> See what ACTUALLY matters vs. filler requirements",
      "> Know exactly what to prove before you write a word",
    ],
    stats: [
      { label: "SIGNALS FOUND", value: "18+", icon: "🎯" },
      { label: "TIME TO PARSE", value: "4 SEC", icon: "⚡" },
      { label: "CLARITY", value: "MAX", icon: "🔮" },
    ],
    features: [
      "Extracts must-have skills vs nice-to-haves",
      "Spots salary clues & red flags",
      "Maps your resume gaps instantly",
    ],
  },
  {
    id: "tailor",
    number: "04",
    icon: Sparkles,
    badge: "LEVEL 2: TAILOR",
    title: "Power Up Your Resume",
    subtitle: "AI turns your generic resume into a perfect match",
    color: "neon-purple" as const,
    borderClass: "neon-border-purple",
    textClass: "neon-text-purple",
    narrative: [
      "> Uploading resume... ████████ DONE",
      "> Analyzing job requirements...",
      "> BOOSTING relevant experience...",
      "> REORDERING bullets for maximum impact...",
      "> ATS compatibility: ████████████ OPTIMIZED",
      "> Match score: 61% → 87% ↑↑↑",
    ],
    stats: [
      { label: "MATCH BOOST", value: "+26%", icon: "📈" },
      { label: "ATS SCORE", value: "A+", icon: "🏆" },
      { label: "EXPORTS", value: "PDF+DOCX", icon: "📑" },
    ],
    features: [
      "Rewrites bullets around YOUR real experience",
      "ATS-optimized format that passes every scanner",
      "Download as PDF or DOCX instantly",
    ],
  },
  {
    id: "track",
    number: "05",
    icon: Shield,
    badge: "LEVEL 3: TRACK",
    title: "Command Your Pipeline",
    subtitle: "Never lose a promising application again",
    color: "neon-cyan" as const,
    borderClass: "neon-border-cyan",
    textClass: "neon-text-cyan",
    narrative: [
      "> Initializing application tracker...",
      "> STATUS BOARD: Applied → Screen → Interview → Offer",
      "> FOLLOW-UP reminders: ARMED",
      "> No more spreadsheet chaos. No more lost roles.",
    ],
    stats: [
      { label: "PIPELINE", value: "7 STAGES", icon: "🔄" },
      { label: "REMINDERS", value: "AUTO", icon: "🔔" },
      { label: "CHAOS", value: "ELIMINATED", icon: "✅" },
    ],
    features: [
      "Visual pipeline with drag-and-drop stages",
      "Smart follow-up reminders before apps go cold",
      "Interview prep attached to each application",
    ],
  },
  {
    id: "victory",
    number: "06",
    icon: Trophy,
    badge: "BOSS DEFEATED",
    title: "Victory Royale",
    subtitle: "You got the interview. You got the job.",
    color: "neon-green" as const,
    borderClass: "neon-border-green",
    textClass: "neon-text-green",
    narrative: [
      "> INTERVIEW: SCHEDULED ✓",
      "> PREP PACK: LOADED ✓",
      "> CONFIDENCE: MAXIMUM ✓",
      "> YOU WIN. GAME OVER. 🏆",
    ],
    stats: [
      { label: "INTERVIEWS", value: "↑↑↑", icon: "🎤" },
      { label: "OFFERS", value: "INCOMING", icon: "💰" },
      { label: "STRESS", value: "GONE", icon: "😎" },
    ],
  },
];

const colorMap = {
  "neon-pink": {
    text: "text-neon-pink",
    bg: "bg-neon-pink",
    border: "border-neon-pink",
    shadow: "shadow-neon-pink",
    glow: "neon-text-pink",
    glowBorder: "neon-border-pink",
    from: "from-neon-pink/20",
    via: "via-neon-pink/5",
  },
  "neon-cyan": {
    text: "text-neon-cyan",
    bg: "bg-neon-cyan",
    border: "border-neon-cyan",
    shadow: "shadow-neon-cyan",
    glow: "neon-text-cyan",
    glowBorder: "neon-border-cyan",
    from: "from-neon-cyan/20",
    via: "via-neon-cyan/5",
  },
  "neon-green": {
    text: "text-neon-green",
    bg: "bg-neon-green",
    border: "border-neon-green",
    shadow: "shadow-neon-green",
    glow: "neon-text-green",
    glowBorder: "neon-border-green",
    from: "from-neon-green/20",
    via: "via-neon-green/5",
  },
  "neon-purple": {
    text: "text-neon-purple",
    bg: "bg-neon-purple",
    border: "border-neon-purple",
    shadow: "shadow-neon-purple",
    glow: "neon-text-purple",
    glowBorder: "neon-border-purple",
    from: "from-neon-purple/20",
    via: "via-neon-purple/5",
  },
};

/* ═══════════════════════════════════════════════════════
   ★  CHAPTER COMPONENT  ★
   ═══════════════════════════════════════════════════════ */

function ChapterSection({ chapter, index }: { chapter: (typeof chapters)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const colors = colorMap[chapter.color];
  const Icon = chapter.icon;
  const isEven = index % 2 === 0;

  return (
    <section ref={ref} className="relative">
      {/* Chapter divider */}
      <div className="chapter-divider" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Background glow */}
        <div
          className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-30", colors.from, colors.via, "to-transparent")}
        />

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Chapter header */}
          <div className={cn("mb-10 flex flex-col gap-6", isEven ? "items-start" : "items-end text-right")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={cn(
                "inline-flex items-center gap-3 rounded-sm border-2 px-4 py-2",
                colors.border,
                "bg-retro-darker/80"
              )}
            >
              <span className="font-pixel text-xs uppercase tracking-widest text-white/60">CHAPTER</span>
              <span className={cn("font-pixel text-2xl", colors.text)}>{chapter.number}</span>
            </motion.div>

            <motion.div
              className={cn("inline-flex items-center gap-2 rounded-sm border px-3 py-1", colors.border, "bg-retro-darker/60")}
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Icon className={cn("h-4 w-4", colors.text)} />
              <span className={cn("font-pixel text-[10px] uppercase tracking-[0.3em]", colors.text)}>
                {chapter.badge}
              </span>
            </motion.div>

            <motion.h2
              className="font-pixel text-2xl leading-relaxed text-white sm:text-3xl lg:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <GlitchText text={chapter.title} />
            </motion.h2>

            <motion.p
              className="font-retro text-2xl text-white/60"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {chapter.subtitle}
            </motion.p>
          </div>

          {/* Content grid */}
          <div className={cn("grid gap-8", "lg:grid-cols-2")}>
            {/* Terminal / Narrative */}
            <motion.div
              className={cn(
                "retro-card rounded-sm p-6",
                isEven ? "lg:order-1" : "lg:order-2"
              )}
              initial={{ opacity: 0, x: isEven ? -40 : 40, rotateY: isEven ? -5 : 5 }}
              animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-neon-pink" />
                <div className="h-3 w-3 rounded-full bg-neon-yellow" />
                <div className="h-3 w-3 rounded-full bg-neon-green" />
                <span className="ml-2 font-pixel text-[10px] uppercase tracking-widest text-white/40">
                  terminal v1.337
                </span>
              </div>

              <div className="space-y-2 font-retro text-lg">
                {chapter.narrative.map((line, lineIndex) => (
                  <motion.div
                    key={lineIndex}
                    className={cn(
                      "transition-colors",
                      line.startsWith("> SYSTEM") || line.startsWith("> STATUS") || line.startsWith("> READY")
                        ? colors.text
                        : line.includes("✓") || line.includes("WIN")
                          ? "text-neon-green"
                          : line.includes("closes") || line.includes("GG") || line.includes("generic")
                            ? "text-neon-pink"
                            : "text-white/80"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.7 + lineIndex * 0.15, duration: 0.4 }}
                  >
                    {line}
                  </motion.div>
                ))}
                <motion.div
                  className="mt-4 inline-block"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.7 + chapter.narrative.length * 0.15 }}
                >
                  <span className="animate-blink text-neon-green">█</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Stats & features */}
            <motion.div
              className={cn("space-y-6", isEven ? "lg:order-2" : "lg:order-1")}
              initial={{ opacity: 0, x: isEven ? 40 : -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {chapter.stats.map((stat, statIndex) => (
                  <motion.div
                    key={stat.label}
                    className={cn(
                      "retro-card flex flex-col items-center gap-2 rounded-sm p-4 text-center transition-all duration-300 hover:scale-105",
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: 0.8 + statIndex * 0.1, duration: 0.5 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: `0 0 16px ${chapter.color === "neon-pink" ? "rgba(255,45,149,0.15)" : chapter.color === "neon-cyan" ? "rgba(0,240,255,0.15)" : chapter.color === "neon-green" ? "rgba(57,255,20,0.15)" : "rgba(176,38,255,0.15)"}`,
                    }}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={cn("font-pixel text-sm sm:text-lg", colors.text)}>
                      {stat.value}
                    </span>
                    <span className="font-retro text-xs uppercase tracking-widest text-white/50">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Features list */}
              {chapter.features && (
                <div className="space-y-3">
                  {chapter.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      className={cn(
                        "flex items-start gap-3 rounded-sm border-l-4 bg-retro-darker/60 p-4",
                        colors.border,
                      )}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 1 + featureIndex * 0.12, duration: 0.5 }}
                      whileHover={{ x: 8, borderLeftWidth: "8px" }}
                    >
                      <Star className={cn("mt-0.5 h-4 w-4 shrink-0", colors.text)} />
                      <span className="font-retro text-lg text-white/80">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   ★  MAIN LANDING PAGE  ★
   ═══════════════════════════════════════════════════════ */

export function ImmersiveLanding() {
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="retro-cursor crt-overlay relative overflow-hidden bg-retro-dark">
      <CursorFollower />
      <FloatingStars />

      {/* Scroll progress bar */}
      <motion.div
        className="fixed left-0 top-0 z-[9999] h-1 bg-gradient-to-r from-neon-pink via-neon-cyan to-neon-green"
        style={{ width: progressWidth }}
      />

      {/* ═══════ HERO SECTION ═══════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="star-field absolute inset-0 opacity-40" />
          <div className="retro-grid absolute inset-x-0 bottom-0 h-1/2 opacity-20" />
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-neon-pink/5 blur-[150px]" />
          <div className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-neon-cyan/5 blur-[130px]" />
          <div className="absolute bottom-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-neon-purple/5 blur-[130px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-8 px-4 py-20 text-center sm:px-6 lg:px-8">
          {/* Visitor counter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <VisitorCounter />
          </motion.div>

          {/* "NEW!" rotating badge */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="absolute -right-16 -top-8 font-pixel text-xs text-neon-yellow"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ★ NEW! ★
            </motion.div>
            <div className="inline-flex items-center gap-2 rounded-sm border-2 border-neon-pink/50 bg-retro-darker/80 px-5 py-2">
              <Gamepad2 className="h-5 w-5 text-neon-pink" />
              <span className="font-pixel text-[10px] uppercase tracking-[0.4em] text-neon-pink">
                PLAYER 1 — START YOUR JOB QUEST
              </span>
            </div>
          </motion.div>

          {/* Main title with glitch */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h1 className="font-pixel text-3xl leading-[1.4] sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="neon-text-cyan">STOP</span>{" "}
              <span className="text-white">REWRITING</span>
              <br />
              <span className="text-white">YOUR</span>{" "}
              <GlitchText text="RESUME" className="neon-text-pink" />
              <br />
              <span className="neon-text-green">FROM SCRATCH</span>
            </h1>

            <motion.p
              className="mx-auto max-w-3xl font-retro text-2xl leading-relaxed text-white/70 sm:text-3xl"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              ApplyX turns every job post into a{" "}
              <span className="text-neon-cyan">tailored resume</span>,{" "}
              a <span className="text-neon-pink">tracked application</span>,{" "}
              and a <span className="text-neon-green">follow-up plan</span>.
              <br />
              So you land interviews, not headaches.
            </motion.p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Link href="/signup">
              <motion.div
                className="retro-btn font-pixel text-xs sm:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  START FREE — 2 DEMOS
                  <ArrowRight className="h-4 w-4" />
                </span>
              </motion.div>
            </Link>
            <Link href="/pricing">
              <motion.div
                className="retro-btn retro-btn-cyan font-pixel text-xs sm:text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  VIEW POWER-UPS
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Hero stats bar */}
          <motion.div
            className="grid w-full max-w-3xl grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {[
              { label: "PARSE TIME", value: "4s", icon: "⚡" },
              { label: "MATCH BOOST", value: "+26%", icon: "📈" },
              { label: "ATS SAFE", value: "100%", icon: "🛡️" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="retro-card flex flex-col items-center gap-2 rounded-sm p-4"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.4 + i * 0.1, duration: 0.5 }}
              >
                <span className="text-xl sm:text-2xl">{stat.icon}</span>
                <span className="font-pixel text-sm text-neon-cyan sm:text-lg">{stat.value}</span>
                <span className="font-retro text-xs uppercase tracking-widest text-white/50">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="font-pixel text-[8px] uppercase tracking-widest text-neon-cyan/60">SCROLL TO BEGIN</span>
              <ChevronDown className="h-6 w-6 text-neon-cyan/60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ MARQUEE BANNER ═══════ */}
      <MarqueeBanner>
        <span className="text-neon-pink">★ PARSE JOB LISTINGS IN SECONDS </span>
        <span className="text-neon-cyan">★ AI-TAILORED RESUMES </span>
        <span className="text-neon-green">★ TRACK EVERY APPLICATION </span>
        <span className="text-neon-yellow">★ SMART FOLLOW-UP REMINDERS </span>
        <span className="text-neon-purple">★ INTERVIEW PREP PACKS </span>
        <span className="text-neon-orange">★ ATS-OPTIMIZED FORMAT </span>
        <span className="text-white">★ PDF + DOCX EXPORT </span>
      </MarqueeBanner>

      {/* ═══════ STORY CHAPTERS ═══════ */}
      {chapters.map((chapter, index) => (
        <ChapterSection key={chapter.id} chapter={chapter} index={index} />
      ))}

      {/* ═══════ FINAL CTA — BOSS ROOM ═══════ */}
      <section className="relative overflow-hidden">
        <div className="chapter-divider" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-neon-pink/5 via-transparent to-neon-cyan/5" />
          <div className="absolute left-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-neon-pink/4 blur-[150px]" />
          <div className="absolute right-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-neon-cyan/4 blur-[150px]" />

          <motion.div
            className="relative text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Decorative badge */}
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-sm border-2 border-neon-green/50 bg-retro-darker/80 px-5 py-2"
              animate={{ boxShadow: ["0 0 6px rgba(57,255,20,0.15)", "0 0 14px rgba(57,255,20,0.25)", "0 0 6px rgba(57,255,20,0.15)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="h-5 w-5 text-neon-green" />
              <span className="font-pixel text-[10px] uppercase tracking-[0.3em] text-neon-green">
                READY TO WIN?
              </span>
            </motion.div>

            <h2 className="mx-auto mb-6 max-w-4xl font-pixel text-2xl leading-relaxed text-white sm:text-3xl lg:text-4xl">
              <span className="neon-text-cyan">STOP LETTING</span>{" "}
              <span className="text-white">GOOD APPS</span>
              <br />
              <span className="text-white">DIE IN YOUR</span>{" "}
              <GlitchText text="DRAFTS" className="neon-text-pink" />
            </h2>

            <p className="mx-auto mb-10 max-w-2xl font-retro text-2xl leading-relaxed text-white/60">
              Tailor faster. Track smarter. Follow up before opportunities go cold.
              <br />
              Your next interview is waiting.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <motion.div
                  className="retro-btn font-pixel text-xs sm:text-sm"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 4px 0 rgba(100,0,50,0.8), 0 0 10px rgba(255,45,149,0.12)",
                      "0 4px 0 rgba(100,0,50,0.8), 0 0 18px rgba(255,45,149,0.2)",
                      "0 4px 0 rgba(100,0,50,0.8), 0 0 10px rgba(255,45,149,0.12)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="flex items-center gap-2">
                    <Rocket className="h-4 w-4" />
                    INSERT COIN — START FREE
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </motion.div>
              </Link>
              <Link href="/dashboard">
                <motion.div
                  className="retro-btn retro-btn-cyan font-pixel text-xs sm:text-sm"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    ENTER DASHBOARD
                  </span>
                </motion.div>
              </Link>
            </div>

            {/* Bottom decorative grid */}
            <motion.div
              className="mt-16 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {[
                { label: "TAILOR FASTER", value: "NO MORE REWRITES", color: "text-neon-pink" },
                { label: "STAY ORGANIZED", value: "NO SPREADSHEETS", color: "text-neon-cyan" },
                { label: "FOLLOW UP", value: "STAY TOP OF MIND", color: "text-neon-green" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="retro-card rounded-sm p-4 text-center"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  <div className={cn("font-pixel text-xs sm:text-sm", item.color)}>{item.value}</div>
                  <div className="mt-2 font-retro text-xs uppercase tracking-widest text-white/40">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="chapter-divider" />
      </section>

      {/* ═══════ FOOTER MARQUEE ═══════ */}
      <MarqueeBanner speed={25}>
        <span className="text-white/40">
          ★ BUILT WITH {"<3"} FOR JOB SEEKERS{" "}
          ★ APPLYX.SPACE{" "}
          ★ BEST VIEWED ON NETSCAPE NAVIGATOR{" "}
          ★ YOU ARE VISITOR #{Math.floor(Math.random() * 99999).toLocaleString()}{" "}
          ★ MADE IN THE INTERNET{" "}
          ★ UNDER CONSTRUCTION{" "}
          ★ WEBMASTER: APPLYX CREW{" "}
        </span>
      </MarqueeBanner>
    </div>
  );
}
