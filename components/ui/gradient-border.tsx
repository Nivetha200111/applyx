"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  animate?: boolean;
}

export function GradientBorder({
  children,
  className,
  borderWidth = 1,
  animate = true,
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative rounded-[28px] p-[var(--bw)]",
        animate && "gradient-border-animate",
        className,
      )}
      style={
        {
          "--bw": `${borderWidth}px`,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/60 via-accent/40 to-primary/60 [background-size:200%_200%]" />
      <div className="relative rounded-[27px] bg-card">
        {children}
      </div>
    </div>
  );
}
