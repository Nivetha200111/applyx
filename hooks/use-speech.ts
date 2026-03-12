"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ══════════════════════════════════════════════════
//  useSpeechRecognition — Voice-to-Text
// ══════════════════════════════════════════════════

interface SpeechRecognitionHook {
  /** Current transcript text */
  transcript: string;
  /** Whether speech recognition is currently listening */
  isListening: boolean;
  /** Whether the browser supports speech recognition */
  isSupported: boolean;
  /** Start listening for speech */
  startListening: () => void;
  /** Stop listening for speech */
  stopListening: () => void;
  /** Reset the transcript */
  resetTranscript: () => void;
}

// Type-safe window augmentation for SpeechRecognition
type SpeechRecognitionAPI = typeof window extends { SpeechRecognition: infer T }
  ? T
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any;

function getSpeechRecognition(): SpeechRecognitionAPI | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const accumulatedRef = useRef("");

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: { results: Iterable<unknown> | ArrayLike<unknown> }) => {
      const results = Array.from(event.results) as SpeechRecognitionResult[];
      let interimTranscript = "";
      let finalTranscript = "";

      for (const result of results) {
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      // When we get final results, add them to accumulated
      if (finalTranscript) {
        accumulatedRef.current = finalTranscript.trim();
      }

      // Show accumulated final + current interim
      const fullText = accumulatedRef.current
        ? accumulatedRef.current + " " + interimTranscript
        : interimTranscript;
      setTranscript(fullText.trim());
    };

    recognition.onerror = (event: { error: string }) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      // (recognition can stop on its own after silence)
      if (recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null; // prevent auto-restart
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    accumulatedRef.current = "";
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// ══════════════════════════════════════════════════
//  useSpeechSynthesis — Text-to-Speech
// ══════════════════════════════════════════════════

interface SpeechSynthesisHook {
  /** Speak the given text */
  speak: (text: string) => void;
  /** Stop speaking */
  stop: () => void;
  /** Whether currently speaking */
  isSpeaking: boolean;
  /** Whether the browser supports speech synthesis */
  isSupported: boolean;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.lang = "en-US";

    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")),
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}

