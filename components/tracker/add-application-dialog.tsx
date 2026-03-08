"use client";

import { useState, useTransition } from "react";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AddApplicationDialogProps {
  onClose: () => void;
  onCreated: () => void;
  parsesRemaining: number;
}

export function AddApplicationDialog({
  onClose,
  onCreated,
  parsesRemaining,
}: AddApplicationDialogProps) {
  const [mode, setMode] = useState<"quick" | "paste">("paste");
  const [isPending, startTransition] = useTransition();

  // Quick add fields
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Paste JD fields
  const [rawJdText, setRawJdText] = useState("");

  function handleSubmit() {
    startTransition(async () => {
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
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok) {
        toast.error(payload?.error ?? "Failed to add application.");
        return;
      }

      toast.success(
        mode === "paste"
          ? "Application added and JD parsed with AI."
          : "Application added.",
      );
      onCreated();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-[32px] border border-border/70 bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add application</h2>
          <button
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
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
              </div>
            </>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="add-company">
                Company {mode === "paste" ? "(optional)" : ""}
              </label>
              <Input
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
              id="add-url"
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://linkedin.com/jobs/..."
              value={sourceUrl}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <SubmitButton
              className="flex-1"
              isPending={isPending}
              onClick={handleSubmit}
              pendingLabel={mode === "paste" ? "Parsing with AI..." : "Adding..."}
            >
              {mode === "paste" ? "Parse & Add" : "Add"}
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
