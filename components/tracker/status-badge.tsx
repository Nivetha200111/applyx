import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  bookmarked: { label: "Bookmarked", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  applying: { label: "Applying", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  applied: { label: "Applied", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  screening: { label: "Screening", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  interviewing: { label: "Interviewing", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  offer: { label: "Offer", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  withdrawn: { label: "Withdrawn", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  ghosted: { label: "Ghosted", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
};

export const allStatuses: ApplicationStatus[] = [
  "bookmarked", "applying", "applied", "screening",
  "interviewing", "offer", "accepted", "rejected",
  "withdrawn", "ghosted",
];

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      config.className,
      className,
    )}>
      {config.label}
    </span>
  );
}

export function getStatusLabel(status: ApplicationStatus) {
  return statusConfig[status]?.label ?? status;
}
