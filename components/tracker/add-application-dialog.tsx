"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/types";

interface AddApplicationDialogProps {
  onClose: () => void;
  onCreated: () => void;
  parsesRemaining: number;
  userPlan: PlanTier;
}

export function AddApplicationDialog({
  onClose,
  onCreated,
  parsesRemaining,
  userPlan,
}: AddApplicationDialogProps) {
  const [mode, setMode] = useState<"quick" | "paste">("paste");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoTailorStatus, setAutoTailorStatus] = useState<
    "idle" | "tailoring" | "done" | "error"
  >("idle");

  // Quick add fields
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Paste JD fields
  const [rawJdText, setRawJdText] = useState("");
  const isAutoTailoring = autoTailorStatus === "tailoring";
  const isBusy = isSubmitting || isAutoTailoring;
  const parseHelperText =
    userPlan === "premium"
      ? "Premium parses also auto-tailor your primary resume when one is available."
      : userPlan === "basic"
        ? "Paid plans auto-mark parsed roles as applying and schedule a follow-up reminder."
        : "Free plan parses the JD, but follow-ups and auto-tailor stay manual.";

  async function handleSubmit() {
    if (isBusy) return;

    setIsSubmitting(true);
    try {
      setAutoTailorStatus("idle");

      const body: Record<string, string> = {};

      if (mode === "paste") {
        if (rawJdText.trim().length < 50) {
          toast.error("Paste a fuller job description (at least 50 characters).");
          return;
        }
        body.rawJdText = rawJdText;
        if (sourceUrl) body.sourceUrl = sourceUrl;
        if (companyName) body.companyName = companyName;
        if (roleTitle) body.roleTitle = roleTitle;
      } else {
        if (!companyName.trim() && !roleTitle.trim()) {
          toast.error("Enter at least a company name or role.");
          return;
        }
        body.companyName = companyName;
        body.roleTitle = roleTitle;
        if (sourceUrl) body.sourceUrl = sourceUrl;
      }

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean; applicationId?: string; plan?: string; usedAiParse?: boolean }
        | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to add application.");
        return;
      }

      // Auto-tailor for premium users when JD was parsed
      if (
        payload?.usedAiParse &&
        payload?.plan === "premium" &&
        payload?.applicationId
      ) {
        toast.success("JD parsed. Auto-tailoring your resume...");
        setAutoTailorStatus("tailoring");
        let autoTailorFailed = false;

        try {
          const tailorRes = await fetch(
            `/api/applications/${payload.applicationId}/auto-tailor`,
            { method: "POST" },
          );
          const tailorData = (await tailorRes.json().catch(() => null)) as
            | { ok?: boolean; skipped?: boolean; reason?: string; matchScoreAfter?: number; error?: string }
            | null;

          if (tailorRes.ok && tailorData?.ok && !tailorData?.skipped) {
            toast.success(
              `Resume auto-tailored! Match score: ${tailorData.matchScoreAfter ?? "—"}%`,
            );
          } else if (tailorData?.skipped) {
            toast.info("Resume already tailored for this application.");
          } else {
            autoTailorFailed = true;
            setAutoTailorStatus("error");
            toast.warning(tailorData?.error ?? "Auto-tailor skipped. You can tailor manually.");
          }
        } catch {
          autoTailorFailed = true;
          setAutoTailorStatus("error");
          toast.warning("Auto-tailor couldn't complete. You can tailor manually.");
        }

        if (!autoTailorFailed) {
          setAutoTailorStatus("done");
        }
      } else {
        const msg = mode === "paste"
          ? userPlan !== "free"
            ? "Application added, JD parsed, and follow-up set."
            : "Application added and JD parsed with AI."
          : "Application added.";
        toast.success(msg);
      }

      onCreated();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-[32px] border border-border/70 bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add application</h2>
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
            disabled={isBusy}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1">
          <button
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              mode === "paste"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={isBusy}
            onClick={() => setMode("paste")}
            type="button"
          >
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            Paste JD (AI auto-fill)
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              mode === "quick"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            disabled={isBusy}
            onClick={() => setMode("quick")}
            type="button"
          >
            Quick add
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {mode === "paste" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="add-jd">
                  Job description
                </label>
                <Textarea
                  className="min-h-[180px]"
                  disabled={isBusy}
                  id="add-jd"
                  onChange={(e) => setRawJdText(e.target.value)}
                  placeholder="Paste the full job description here. AI will extract company, role, skills, salary, and more."
                  value={rawJdText}
                />
                <p className="text-xs text-muted-foreground">
                  {parsesRemaining > 0
                    ? `${parsesRemaining} AI auto-fills remaining this month`
                    : "AI auto-fill limit reached. Use Quick add instead."}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">{parseHelperText}</p>
              </div>
            </>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="add-company">
                Company {mode === "paste" ? "(optional)" : ""}
              </label>
              <Input
                disabled={isBusy}
                id="add-company"
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Google, TCS, etc."
                value={companyName}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="add-role">
                Role {mode === "paste" ? "(optional)" : ""}
              </label>
              <Input
                disabled={isBusy}
                id="add-role"
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Software Engineer"
                value={roleTitle}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="add-url">
              Job URL (optional)
            </label>
            <Input
              disabled={isBusy}
              id="add-url"
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/..."
              value={sourceUrl}
            />
          </div>

          {isAutoTailoring ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Premium auto-tailor is running now. We&apos;re generating a tailored resume,
              linking it to this application, and setting the next follow-up.
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" disabled={isBusy} onClick={onClose} variant="outline">
              Cancel
            </Button>
            <SubmitButton
              className="flex-1"
              isPending={isBusy}
              onClick={handleSubmit}
              pendingLabel={
                mode === "paste"
                  ? isAutoTailoring
                    ? "Auto-tailoring..."
                    : "Parsing with AI..."
                  : "Adding..."
              }
            >
              {mode === "paste" ? "Parse & Add" : "Add"}
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
