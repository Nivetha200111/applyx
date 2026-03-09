"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  suggestQuestionsForApplication,
  categoryLabels,
  type InterviewQuestion,
} from "@/lib/interview-questions";

interface InterviewPrepPanelProps {
  requiredSkills: string[];
  preferredSkills: string[];
  roleTitle: string;
}

export function InterviewPrepPanel({
  requiredSkills,
  preferredSkills,
  roleTitle,
}: InterviewPrepPanelProps) {
  const questions = useMemo(
    () => suggestQuestionsForApplication(requiredSkills, preferredSkills, roleTitle),
    [requiredSkills, preferredSkills, roleTitle],
  );

  const grouped = useMemo(() => {
    const map: Record<InterviewQuestion["category"], InterviewQuestion[]> = {
      behavioral: [],
      technical: [],
      "system-design": [],
      "role-specific": [],
    };
    for (const q of questions) {
      map[q.category].push(q);
    }
    return Object.entries(map).filter(([, items]) => items.length > 0) as Array<
      [InterviewQuestion["category"], InterviewQuestion[]]
    >;
  }, [questions]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (questions.length === 0) return null;

  return (
    <div className="min-w-0 space-y-3 rounded-[24px] border border-border/60 bg-background/30 p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Interview Prep
        </span>
        <Badge variant="outline" className="ml-auto text-[10px] tabular-nums">
          {questions.length} questions
        </Badge>
      </div>

      {grouped.map(([category, items]) => (
        <div key={category} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/85">
              {categoryLabels[category]}
            </span>
            <Badge variant="outline" className="text-[10px] tabular-nums">
              {items.length}
            </Badge>
          </div>

          <div className="space-y-0.5">
            {items.map((q) => {
              const isOpen = expanded.has(q.id);
              return (
                <div key={q.id}>
                  <button
                    className="flex w-full items-start gap-2 rounded-xl border border-transparent px-3 py-2 text-left text-sm leading-6 text-muted-foreground transition-colors hover:border-border/60 hover:bg-card/70 hover:text-foreground"
                    onClick={() => toggle(q.id)}
                    type="button"
                  >
                    {isOpen ? (
                      <ChevronDown className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 break-words">{q.question}</span>
                  </button>

                  {isOpen && (
                    <div className="ml-[22px] mr-2 mb-1 rounded-lg border border-border/40 bg-card/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                      {q.tip}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
