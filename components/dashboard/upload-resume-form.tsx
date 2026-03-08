"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/auth/submit-button";
import { cn } from "@/lib/utils";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const blocked = currentCount >= limit;

  const handleFile = useCallback((file: File | null) => {
    if (!file) {
      setFileName(null);
      return;
    }
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Only PDF and DOCX files are accepted.");
      setFileName(null);
      return;
    }
    setErrorMessage(null);
    setFileName(file.name);
  }, []);

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
          setFileName(null);
          router.refresh();
        });
      }}
      ref={formRef}
    >
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : fileName
              ? "border-primary/40 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/50",
          blocked && "pointer-events-none opacity-50",
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && fileInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInputRef.current.files = dt.files;
            handleFile(file);
          }
        }}
      >
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
          fileName ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
        )}>
          {fileName ? <FileUp className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        </div>
        {fileName ? (
          <div>
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="mt-1 text-xs text-muted-foreground">Click or drop to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-foreground">
              Drop your resume here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX, up to 5 MB</p>
          </div>
        )}
        <input
          accept=".pdf,.docx"
          className="sr-only"
          name="resume"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          ref={fileInputRef}
          type="file"
        />
      </div>
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
