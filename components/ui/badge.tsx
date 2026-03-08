import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground dark:bg-secondary/95 dark:text-secondary-foreground",
        outline: "border border-border bg-card/80 text-foreground dark:bg-card/90 dark:text-foreground",
        success:
          "bg-emerald-100 text-emerald-900 dark:border dark:border-emerald-300/30 dark:bg-emerald-300/16 dark:text-emerald-50",
        warning:
          "bg-amber-100 text-amber-900 dark:border dark:border-amber-50/60 dark:bg-amber-200 dark:text-slate-950",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
