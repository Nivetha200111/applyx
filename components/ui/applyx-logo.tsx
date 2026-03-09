import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ApplyxLogoProps extends HTMLAttributes<HTMLDivElement> {
  markOnly?: boolean;
  size?: "sm" | "md" | "lg";
  subtitle?: string | null;
  scheme?: "auto" | "light" | "dark";
  titleClassName?: string;
  subtitleClassName?: string;
}

const sizeClasses = {
  sm: {
    mark: "h-8 w-8",
    title: "text-sm",
    subtitle: "text-xs",
  },
  md: {
    mark: "h-11 w-11",
    title: "text-base",
    subtitle: "text-sm",
  },
  lg: {
    mark: "h-14 w-14",
    title: "text-lg",
    subtitle: "text-sm",
  },
};

export function ApplyxLogo({
  className,
  markOnly = false,
  size = "md",
  subtitle = "Resume tailoring + tracker",
  scheme = "auto",
  titleClassName,
  subtitleClassName,
  ...props
}: ApplyxLogoProps) {
  const scale = sizeClasses[size];
  const colorClasses =
    scheme === "dark"
      ? "text-[#25c4f1] drop-shadow-[0_10px_28px_rgba(37,196,241,0.28)]"
      : scheme === "light"
        ? "text-[#238a83] drop-shadow-[0_8px_24px_rgba(35,138,131,0.16)]"
        : "text-[#238a83] dark:text-[#25c4f1] drop-shadow-[0_8px_24px_rgba(35,138,131,0.16)] dark:drop-shadow-[0_10px_28px_rgba(37,196,241,0.28)]";

  return (
    <div className={cn("inline-flex items-center gap-3", className)} {...props}>
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center rounded-[1.15rem]",
          colorClasses,
          scale.mark,
        )}
      >
        <svg
          className="h-full w-full"
          fill="none"
          viewBox="0 0 128 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47 27V18C47 12.4772 51.4772 8 57 8H71C76.5228 8 81 12.4772 81 18V27"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6.5"
          />
          <path
            d="M26 36C26 29.9249 30.9249 25 37 25H91C97.0751 25 102 29.9249 102 36V78C102 84.0751 97.0751 89 91 89H76.5L67.7264 64.282C66.3749 60.475 61.6251 60.475 60.2736 64.282L51.5 89H37C30.9249 89 26 84.0751 26 78V36Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6.5"
          />
          <path
            d="M53.5 63H74.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6.5"
          />
        </svg>
      </span>

      {markOnly ? null : (
        <div>
          <div
            className={cn(
              "font-semibold tracking-tight text-foreground",
              scale.title,
              titleClassName,
            )}
          >
            ApplyX
          </div>
          {subtitle ? (
            <div
              className={cn("text-muted-foreground", scale.subtitle, subtitleClassName)}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
