import { cn } from "@/lib/utils";

interface AuthMessageProps {
  tone: "error" | "success";
  message: string;
}

export function AuthMessage({ tone, message }: AuthMessageProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border px-4 py-3 text-sm leading-6",
        tone === "error" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        tone === "success" &&
          "border-primary/20 bg-primary/10 text-foreground",
      )}
    >
      {message}
    </div>
  );
}
