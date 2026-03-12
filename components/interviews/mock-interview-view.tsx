"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ──

interface InterviewQuestion {
  id: number;
  question: string;
  type: "behavioral" | "technical" | "situational" | "role-specific";
  difficulty: "easy" | "medium" | "hard";
  idealAnswer: string;
  keyPoints: string[];
}

interface AnswerFeedback {
  score: number;
  semanticScore: number;
  strengths: string[];
  improvements: string[];
  sampleResponse: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
}

interface InterviewSummary {
  overallScore: number;
  overallFeedback: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  hiringLikelihood: "strong_yes" | "yes" | "maybe" | "no" | "strong_no";
}

interface QAPair {
  question: InterviewQuestion;
  answer: string;
  feedback: AnswerFeedback;
}

type InterviewPhase = "setup" | "generating" | "interview" | "evaluating" | "summary";

// ── Helpers ──

function getTypeColor(type: string) {
  switch (type) {
    case "behavioral": return "text-neon-cyan";
    case "technical": return "text-neon-green";
    case "situational": return "text-neon-yellow";
    case "role-specific": return "text-neon-purple";
    default: return "text-neon-pink";
  }
}

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case "easy": return <Badge variant="success">Easy</Badge>;
    case "medium": return <Badge variant="warning">Medium</Badge>;
    case "hard": return <Badge variant="outline">Hard</Badge>;
    default: return <Badge>{difficulty}</Badge>;
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-neon-green";
  if (score >= 60) return "text-neon-yellow";
  if (score >= 40) return "text-neon-orange";
  return "text-neon-pink";
}

function getHiringBadge(likelihood: string) {
  switch (likelihood) {
    case "strong_yes": return <Badge variant="success" className="text-base px-4 py-1">🎯 Strong Hire</Badge>;
    case "yes": return <Badge variant="success" className="text-base px-4 py-1">✅ Likely Hire</Badge>;
    case "maybe": return <Badge variant="warning" className="text-base px-4 py-1">🤔 Borderline</Badge>;
    case "no": return <Badge variant="outline" className="text-base px-4 py-1">❌ Unlikely</Badge>;
    case "strong_no": return <Badge variant="outline" className="text-base px-4 py-1">⛔ Not Ready</Badge>;
    default: return <Badge>{likelihood}</Badge>;
  }
}

// ── Score Ring ──

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 80 ? "#6cd958" : score >= 60 ? "#d2c83c" : score >= 40 ? "#ff8c3a" : "#e8609b"}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold font-pixel ${getScoreColor(score)}`}>{score}</span>
        {label && <span className="text-[10px] text-muted-foreground font-retro mt-1">{label}</span>}
      </div>
    </div>
  );
}

// ── Terminal Line ──

function TerminalLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="font-retro text-sm text-neon-green/80"
    >
      <span className="text-neon-cyan/60">{">"}</span> {text}
      <span className="terminal-cursor" />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
//   MAIN COMPONENT
// ══════════════════════════════════════════════════

export function MockInterviewView() {
  const [phase, setPhase] = useState<InterviewPhase>("setup");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [completedQAs, setCompletedQAs] = useState<QAPair[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  // ── Start Interview ──
  async function handleStart() {
    if (!jobTitle.trim() || !jobDescription.trim()) return;

    setPhase("generating");
    setError(null);

    try {
      const res = await fetch("/api/interviews/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to generate questions (${res.status})`);
      }

      const data = await res.json();
      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setCompletedQAs([]);
      setCurrentFeedback(null);
      setSummary(null);
      setPhase("interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview.");
      setPhase("setup");
    }
  }

  // ── Submit Answer ──
  async function handleSubmitAnswer() {
    if (!currentAnswer.trim() || isLoading) return;

    setIsLoading(true);
    setPhase("evaluating");
    setError(null);

    try {
      const question = questions[currentQuestionIndex];
      const res = await fetch("/api/interviews/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer: currentAnswer }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Evaluation failed (${res.status})`);
      }

      const data = await res.json();
      setCurrentFeedback(data.feedback);

      setCompletedQAs((prev) => [
        ...prev,
        { question, answer: currentAnswer, feedback: data.feedback },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to evaluate answer.");
    } finally {
      setIsLoading(false);
      setPhase("interview");
    }
  }

  // ── Next Question ──
  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setCurrentAnswer("");
      setCurrentFeedback(null);
      setTimeout(() => answerRef.current?.focus(), 100);
    } else {
      handleFinish();
    }
  }

  // ── Finish Interview ──
  async function handleFinish() {
    setPhase("evaluating");
    setError(null);

    try {
      const res = await fetch("/api/interviews/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, questionsAndAnswers: completedQAs }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Summary failed (${res.status})`);
      }

      const data = await res.json();
      setSummary(data.summary);
      setPhase("summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary.");
      setPhase("interview");
    }
  }

  // ── Reset ──
  function handleReset() {
    setPhase("setup");
    setJobTitle("");
    setJobDescription("");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setCompletedQAs([]);
    setCurrentFeedback(null);
    setSummary(null);
    setError(null);
  }

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const progress = questions.length > 0
    ? Math.round(((currentFeedback ? currentQuestionIndex + 1 : currentQuestionIndex) / questions.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {phase !== "setup" && phase !== "summary" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-retro text-muted-foreground">
            <span>
              Question {Math.min(currentQuestionIndex + 1, questions.length)} of {questions.length}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-retro-darker border border-neon-cyan/20">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan via-neon-green to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="wait">
        {/* ══════════════ SETUP PHASE ══════════════ */}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden border-neon-cyan/20 bg-retro-darker/80">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="font-retro text-2xl text-neon-cyan">
                      Initialize Interview Protocol
                    </CardTitle>
                    <CardDescription className="font-retro text-sm text-neon-green/60">
                      Powered by Gemini Embedding 2 • Semantic Answer Analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Terminal intro */}
                <div className="rounded-lg border border-neon-green/20 bg-black/40 p-4 space-y-1">
                  <TerminalLine text="MOCK_INTERVIEW_ENGINE v2.0 loaded" delay={0} />
                  <TerminalLine text="Gemini Embedding 2 model: ONLINE" delay={200} />
                  <TerminalLine text="Semantic similarity scoring: ENABLED" delay={400} />
                  <TerminalLine text="Awaiting job parameters..." delay={600} />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block font-pixel text-[10px] uppercase tracking-widest text-neon-pink/70">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full rounded-lg border-2 border-neon-cyan/20 bg-retro-darker px-4 py-3 font-retro text-lg text-white placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-pixel text-[10px] uppercase tracking-widest text-neon-pink/70">
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      rows={6}
                      className="w-full rounded-lg border-2 border-neon-cyan/20 bg-retro-darker px-4 py-3 font-retro text-base text-white placeholder:text-white/20 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleStart}
                  disabled={!jobTitle.trim() || !jobDescription.trim()}
                  className="retro-btn w-full font-pixel text-sm gap-2 py-6"
                >
                  <Zap className="h-4 w-4" />
                  Start Mock Interview
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Feature cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-neon-green/20 bg-retro-darker/60">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-green/10 text-neon-green">
                    <Brain className="h-5 w-5" />
                  </div>
                  <h3 className="font-pixel text-[10px] text-neon-green">Gemini Embedding 2</h3>
                  <p className="font-retro text-sm text-white/50">
                    Your answers are embedded into vectors and compared against ideal responses
                    using cosine similarity for precise scoring.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-neon-cyan/20 bg-retro-darker/60">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h3 className="font-pixel text-[10px] text-neon-cyan">AI Feedback</h3>
                  <p className="font-retro text-sm text-white/50">
                    Get detailed feedback on strengths, weaknesses, and specific improvements
                    after every answer.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-neon-purple/20 bg-retro-darker/60">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10 text-neon-purple">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="font-pixel text-[10px] text-neon-purple">Hire Signal</h3>
                  <p className="font-retro text-sm text-white/50">
                    Get a final hiring likelihood assessment based on your overall performance
                    across all questions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ══════════════ GENERATING PHASE ══════════════ */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-neon-cyan/20 border-t-neon-cyan" />
              <Brain className="absolute inset-0 m-auto h-8 w-8 text-neon-cyan animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-pixel text-sm text-neon-cyan">Generating Interview Questions</p>
              <p className="font-retro text-base text-white/40">
                Gemini is analyzing the job description and crafting role-specific questions...
              </p>
            </div>
            <div className="rounded-lg border border-neon-green/20 bg-black/40 p-4 space-y-1 max-w-md w-full">
              <TerminalLine text="Parsing job requirements..." delay={0} />
              <TerminalLine text="Identifying key competencies..." delay={800} />
              <TerminalLine text="Generating question bank..." delay={1600} />
              <TerminalLine text="Calibrating difficulty levels..." delay={2400} />
            </div>
          </motion.div>
        )}

        {/* ══════════════ INTERVIEW PHASE ══════════════ */}
        {(phase === "interview" || phase === "evaluating") && currentQuestion && (
          <motion.div
            key={`q-${currentQuestion.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-6"
          >
            {/* Question card */}
            <Card className="overflow-hidden border-neon-pink/20 bg-retro-darker/80">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className={`font-pixel text-[10px] uppercase ${getTypeColor(currentQuestion.type)}`}>
                      {currentQuestion.type}
                    </span>
                    {getDifficultyBadge(currentQuestion.difficulty)}
                  </div>
                  <span className="font-retro text-sm text-white/30">
                    Q{currentQuestionIndex + 1}/{questions.length}
                  </span>
                </div>
                <CardTitle className="font-retro text-xl text-white leading-relaxed mt-4">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  ref={answerRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific, use examples, and structure your response clearly."
                  rows={8}
                  disabled={isLoading || !!currentFeedback}
                  className="w-full rounded-lg border-2 border-neon-green/20 bg-black/40 px-4 py-3 font-retro text-base text-white placeholder:text-white/20 focus:border-neon-green/50 focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all resize-none disabled:opacity-50"
                />

                {!currentFeedback && (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="retro-btn retro-btn-cyan w-full font-pixel text-[11px] gap-2 py-5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Evaluating with Gemini Embedding 2...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Feedback card */}
            {currentFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-neon-green/20 bg-retro-darker/80">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <CardTitle className="font-retro text-xl text-neon-green">
                        Answer Feedback
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <ScoreRing score={currentFeedback.score} size={80} label="AI Score" />
                        <ScoreRing score={currentFeedback.semanticScore} size={80} label="Semantic" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Strengths */}
                    {currentFeedback.strengths.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-pixel text-[10px] uppercase tracking-widest text-neon-green/70">
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {currentFeedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 font-retro text-sm text-white/70">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {currentFeedback.improvements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-pixel text-[10px] uppercase tracking-widest text-neon-orange/70">
                          Areas to Improve
                        </h4>
                        <ul className="space-y-1">
                          {currentFeedback.improvements.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 font-retro text-sm text-white/70">
                              <ArrowRight className="h-4 w-4 shrink-0 text-neon-orange mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key points */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      {currentFeedback.keyPointsCovered.length > 0 && (
                        <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-3 space-y-2">
                          <h5 className="font-pixel text-[9px] text-neon-green/70">Points Covered</h5>
                          {currentFeedback.keyPointsCovered.map((p, i) => (
                            <p key={i} className="font-retro text-xs text-white/60">✓ {p}</p>
                          ))}
                        </div>
                      )}
                      {currentFeedback.keyPointsMissed.length > 0 && (
                        <div className="rounded-lg border border-neon-pink/20 bg-neon-pink/5 p-3 space-y-2">
                          <h5 className="font-pixel text-[9px] text-neon-pink/70">Points Missed</h5>
                          {currentFeedback.keyPointsMissed.map((p, i) => (
                            <p key={i} className="font-retro text-xs text-white/60">✗ {p}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sample improvement */}
                    {currentFeedback.sampleResponse && (
                      <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-4 space-y-2">
                        <h5 className="font-pixel text-[9px] text-neon-cyan/70">
                          How to Improve Your Answer
                        </h5>
                        <p className="font-retro text-sm text-white/60 leading-relaxed">
                          {currentFeedback.sampleResponse}
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleNext}
                      className="retro-btn w-full font-pixel text-[11px] gap-2 py-5"
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4" />
                          Finish Interview & Get Results
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ══════════════ SUMMARY PHASE ══════════════ */}
        {phase === "summary" && summary && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <Card className="overflow-hidden border-neon-yellow/20 bg-retro-darker/80">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <ScoreRing score={summary.overallScore} size={140} label="Overall" />
                </div>
                <CardTitle className="font-pixel text-lg text-neon-yellow">
                  Interview Complete
                </CardTitle>
                <div className="flex justify-center">
                  {getHiringBadge(summary.hiringLikelihood)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="font-retro text-base text-white/70 leading-relaxed whitespace-pre-line">
                  {summary.overallFeedback}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Strengths */}
                  <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-4 space-y-3">
                    <h4 className="font-pixel text-[10px] text-neon-green">Top Strengths</h4>
                    <ul className="space-y-2">
                      {summary.topStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 font-retro text-sm text-white/60">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-neon-green mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas to improve */}
                  <div className="rounded-lg border border-neon-orange/20 bg-neon-orange/5 p-4 space-y-3">
                    <h4 className="font-pixel text-[10px] text-neon-orange">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {summary.areasToImprove.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 font-retro text-sm text-white/60">
                          <ArrowRight className="h-4 w-4 shrink-0 text-neon-orange mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 p-4 space-y-3">
                  <h4 className="font-pixel text-[10px] text-neon-cyan">Recommendations</h4>
                  <ul className="space-y-2">
                    {summary.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 font-retro text-sm text-white/60">
                        <Sparkles className="h-4 w-4 shrink-0 text-neon-cyan mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Per-question breakdown */}
                <div className="space-y-3">
                  <h4 className="font-pixel text-[10px] text-neon-purple uppercase tracking-widest">
                    Question Breakdown
                  </h4>
                  {completedQAs.map((qa, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-lg border border-white/10 bg-black/30 p-3"
                    >
                      <ScoreRing score={qa.feedback.score} size={50} />
                      <div className="flex-1 min-w-0">
                        <p className="font-retro text-sm text-white/70 truncate">
                          {qa.question.question}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-pixel text-[8px] uppercase ${getTypeColor(qa.question.type)}`}>
                            {qa.question.type}
                          </span>
                          <span className="font-retro text-xs text-white/30">
                            Semantic: {qa.feedback.semanticScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleReset}
                  className="retro-btn retro-btn-cyan w-full font-pixel text-[11px] gap-2 py-5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Start New Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ══════════════ EVALUATING OVERLAY (final summary) ══════════════ */}
        {phase === "evaluating" && !currentFeedback && (
          <motion.div
            key="evaluating-summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
            <div className="relative">
              <div className="h-20 w-20 animate-spin rounded-full border-4 border-neon-yellow/20 border-t-neon-yellow" />
              <Trophy className="absolute inset-0 m-auto h-8 w-8 text-neon-yellow animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-pixel text-sm text-neon-yellow">Generating Interview Report</p>
              <p className="font-retro text-base text-white/40">
                Analyzing all answers and computing your final hiring likelihood...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

