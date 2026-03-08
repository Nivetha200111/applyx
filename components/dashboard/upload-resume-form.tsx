"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";

interface UploadResumeFormProps {
  currentCount: number;
  limit: number;
}

export function UploadResumeForm({
  currentCount,
  limit,
}: UploadResumeFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const blocked = currentCount >= limit;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setErrorMessage(null);

        if (blocked) {
          setErrorMessage("Resume limit reached for your current plan.");
          return;
        }

        const formData = new FormData(event.currentTarget);
        const file = formData.get("resume");

        if (!(file instanceof File) || file.size === 0) {
          setErrorMessage("Upload a PDF or DOCX resume.");
          return;
        }

        startTransition(async () => {
          const response = await fetch("/api/resumes", {
            method: "POST",
            body: formData,
          });

          const payload = (await response.json().catch(() => null)) as
            | { error?: string; resumeId?: string }
            | null;

          if (!response.ok) {
            setErrorMessage(payload?.error ?? "Resume upload failed.");
            return;
          }

          toast.success("Resume parsed and saved.");
          formRef.current?.reset();
          router.refresh();
        });
      }}
      ref={formRef}
    >
      <Input accept=".pdf,.docx" name="resume" type="file" />
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <SubmitButton
        className="w-full"
        isPending={isPending}
        pendingLabel="Parsing resume..."
        type="submit"
      >
        Upload and parse resume
      </SubmitButton>
    </form>
  );
}
