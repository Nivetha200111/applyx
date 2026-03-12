"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CameraOff,
  Eye,
  Hand,
  Loader2,
  Smile,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BodyLanguageAnalysis } from "@/lib/ai/mock-interview";

// ── Score indicator ──

function MiniScore({
  score,
  label,
  icon: Icon,
}: {
  score: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const color =
    score >= 80
      ? "text-neon-green"
      : score >= 60
        ? "text-neon-yellow"
        : score >= 40
          ? "text-neon-orange"
          : "text-neon-pink";

  const bgColor =
    score >= 80
      ? "bg-neon-green/10 border-neon-green/30"
      : score >= 60
        ? "bg-neon-yellow/10 border-neon-yellow/30"
        : score >= 40
          ? "bg-neon-orange/10 border-neon-orange/30"
          : "bg-neon-pink/10 border-neon-pink/30";

  return (
    <div className={`flex items-center gap-2 rounded-lg border p-2 ${bgColor}`}>
      <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-pixel text-[9px] ${color}`}>{score}</span>
          <span className="font-retro text-[10px] text-white/40 truncate">{label}</span>
        </div>
      </div>
    </div>
  );
}

// ── Video Feed Component ──

interface VideoFeedProps {
  /** Whether the interview is active (controls auto-analysis) */
  isActive: boolean;
  /** Interval between body language analyses in ms (default: 10 seconds) */
  analysisInterval?: number;
}

export function VideoFeed({ isActive, analysisInterval = 10000 }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BodyLanguageAnalysis | null>(null);
  const [showFeedback, setShowFeedback] = useState(true);

  // ── Start camera ──
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access in your browser settings."
          : "Could not access camera. Make sure it's connected and not in use.";
      setCameraError(msg);
      setCameraOn(false);
    }
  }, []);

  // ── Stop camera ──
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setAnalysis(null);
  }, []);

  // ── Capture frame as base64 JPEG ──
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !cameraOn) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG (strip the data:image/jpeg;base64, prefix)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    return dataUrl.split(",")[1] ?? null;
  }, [cameraOn]);

  // ── Analyze current frame ──
  const analyzeFrame = useCallback(async () => {
    if (isAnalyzing || !cameraOn) return;

    const base64 = captureFrame();
    if (!base64) return;

    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/interviews/analyze-body", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType: "image/jpeg" }),
      });

      if (!res.ok) {
        console.error("Body analysis failed:", res.status);
        return;
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      console.error("Body analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, cameraOn, captureFrame]);

  // ── Auto-analyze on interval when active ──
  useEffect(() => {
    if (isActive && cameraOn) {
      // Run initial analysis after 3 seconds
      const initialTimeout = setTimeout(() => analyzeFrame(), 3000);

      // Then run on interval
      intervalRef.current = setInterval(() => {
        analyzeFrame();
      }, analysisInterval);

      return () => {
        clearTimeout(initialTimeout);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    // Clear interval when not active
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isActive, cameraOn, analyzeFrame, analysisInterval]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Video container */}
      <div className="relative overflow-hidden rounded-xl border-2 border-neon-cyan/20 bg-black">
        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraOn ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Analyzing indicator */}
            {isAnalyzing && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
                <Loader2 className="h-3 w-3 animate-spin text-neon-cyan" />
                <span className="font-pixel text-[8px] text-neon-cyan">ANALYZING</span>
              </div>
            )}

            {/* Live indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-pixel text-[8px] text-white/70">LIVE</span>
            </div>

            {/* Overall confidence overlay */}
            <AnimatePresence>
              {analysis && showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 pt-8"
                >
                  {/* Confidence bar */}
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-neon-yellow" />
                    <span className="font-pixel text-[9px] text-neon-yellow">
                      CONFIDENCE {analysis.overallConfidence}%
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.overallConfidence}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Quick tip */}
                  <p className="font-retro text-[11px] text-white/70 leading-tight">
                    💡 {analysis.overallTip}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-4">
            <CameraOff className="h-10 w-10 text-white/20" />
            <p className="font-retro text-sm text-white/30 text-center">
              {cameraError ?? "Camera is off. Enable it for body language analysis."}
            </p>
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={cameraOn ? stopCamera : startCamera}
          size="sm"
          className={
            cameraOn
              ? "flex-1 gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-pixel text-[9px]"
              : "flex-1 gap-1.5 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 border border-neon-cyan/30 font-pixel text-[9px]"
          }
          variant="ghost"
        >
          {cameraOn ? (
            <>
              <CameraOff className="h-3.5 w-3.5" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="h-3.5 w-3.5" />
              Enable Camera
            </>
          )}
        </Button>

        {cameraOn && (
          <Button
            onClick={() => setShowFeedback((v) => !v)}
            size="sm"
            variant="ghost"
            className="gap-1.5 border border-white/10 font-pixel text-[9px] text-white/40 hover:text-white/70"
          >
            {showFeedback ? "Hide" : "Show"} Overlay
          </Button>
        )}
      </div>

      {/* Detailed feedback panel */}
      <AnimatePresence>
        {analysis && showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-neon-purple/20 bg-retro-darker/80 p-3 space-y-2">
              <h4 className="font-pixel text-[9px] uppercase tracking-widest text-neon-purple/70">
                Body Language Analysis
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <MiniScore
                  score={analysis.posture.score}
                  label="Posture"
                  icon={User}
                />
                <MiniScore
                  score={analysis.eyeContact.score}
                  label="Eye Contact"
                  icon={Eye}
                />
                <MiniScore
                  score={analysis.facialExpression.score}
                  label="Expression"
                  icon={Smile}
                />
                <MiniScore
                  score={analysis.handGestures.score}
                  label="Gestures"
                  icon={Hand}
                />
              </div>

              {/* Detailed tips */}
              <div className="space-y-1.5 pt-1">
                {[
                  { label: "Posture", data: analysis.posture },
                  { label: "Eye Contact", data: analysis.eyeContact },
                  { label: "Expression", data: analysis.facialExpression },
                  { label: "Gestures", data: analysis.handGestures },
                ]
                  .filter((item) => item.data.score < 70)
                  .slice(0, 2)
                  .map((item) => (
                    <p
                      key={item.label}
                      className="font-retro text-[10px] text-white/50 leading-tight"
                    >
                      <span className="text-neon-orange/70">{item.label}:</span>{" "}
                      {item.data.feedback}
                    </p>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

