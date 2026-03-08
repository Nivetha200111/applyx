"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeTemplate } from "@/lib/types";

interface ResumeOption {
  id: string;
  label: string;
}

interface TailorFormProps {
  resumes: ResumeOption[];
  remainingTailors: number;
  planName: string;
}

const templateOptions: ResumeTemplate[] = ["classic", "modern", "minimal"];

export function TailorForm({
  resumes,
  remainingTailors,
  planName,
}: TailorFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const defaultResumeId = useMemo(() => resumes[0]?.id ?? "", [resumes]);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setErrorMessage(null);

        const formData = new FormData(event.currentTarget);
        const resumeId = String(formData.get("resume_id") ?? "");
        const jobDescription = String(formData.get("job_description") ?? "").trim();
        const sourceUrl = String(formData.get("source_url") ?? "").trim();
        const templateUsed = String(formData.get("template_used") ?? "classic");

        if (!resumeId) {
          setErrorMessage("Select a master resume first.");
          return;
        }

        if (!jobDescription) {
          setErrorMessage("Paste a job description to tailor against.");
          return;
        }

        if (remainingTailors <= 0) {
          setErrorMessage(`No ${planName} tailors remaining. Upgrade to continue.`);
          return;
        }

        startTransition(async () => {
          const response = await fetch("/api/tailor", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              resumeId,
              jobDescription,
              sourceUrl: sourceUrl || null,
              templateUsed,
            }),
          });

          const payload = (await response.json().catch(() => null)) as
            | { error?: string; tailoredResumeId?: string }
            | null;

          if (!response.ok || !payload?.tailoredResumeId) {
            setErrorMessage(payload?.error ?? "Tailoring failed.");
            return;
          }

          toast.success("Tailored resume generated.");
          router.push(`/tailored/${payload.tailoredResumeId}`);
          router.refresh();
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="resume-id">
          Master resume
        </label>
        <select
          className="flex h-11 w-full rounded-2xl border border-input bg-card/85 px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={defaultResumeId}
          id="resume-id"
          name="resume_id"
        >
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="source-url">
          Job URL
        </label>
        <Input id="source-url" name="source_url" placeholder="Optional LinkedIn / company URL" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="job-description">
          Job description
        </label>
        <Textarea
          id="job-description"
          name="job_description"
          placeholder="Paste the job description here"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="template-used">
          Template
        </label>
        <select
          className="flex h-11 w-full rounded-2xl border border-input bg-card/85 px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue="classic"
          id="template-used"
          name="template_used"
        >
          {templateOptions.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </div>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <SubmitButton
        className="w-full"
        isPending={isPending}
        pendingLabel="Tailoring resume..."
        type="submit"
      >
        Tailor resume
      </SubmitButton>
    </form>
  );
}
