"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AddApplicationDialog } from "@/components/tracker/add-application-dialog";
import { ApplicationDetail } from "@/components/tracker/application-detail";
import { allStatuses, getStatusLabel } from "@/components/tracker/status-badge";
import { TrackerStats } from "@/components/tracker/tracker-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ApplicationStatus,
  PlanTier,
  TrackedApplicationRecord,
} from "@/lib/types";

interface TrackerViewProps {
  initialApplications: TrackedApplicationRecord[];
  initialTotal: number;
  trackerStats: { total: number; byStatus: Record<string, number>; responseRate: number };
  trackerParsesRemaining: number;
  userPlan: PlanTier;
}

type SortField = "created_at" | "company_name" | "role_title" | "status" | "priority" | "applied_at";
type SortOrder = "asc" | "desc";

interface FetchOptions {
  search?: string;
  statusFilter?: ApplicationStatus[];
  sortField?: SortField;
  sortOrder?: SortOrder;
}

const trackerSalaryFormatter = new Intl.NumberFormat("en-US");
const trackerAppliedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function formatAppliedDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return trackerAppliedDateFormatter.format(date);
}

export function TrackerView({
  initialApplications,
  initialTotal,
  trackerStats,
  trackerParsesRemaining,
  userPlan,
}: TrackerViewProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [total, setTotal] = useState(initialTotal);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>([]);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchApplications = useCallback((options?: FetchOptions) => {
    startTransition(async () => {
      const nextSearch = options?.search ?? search;
      const nextStatusFilter = options?.statusFilter ?? statusFilter;
      const nextSortField = options?.sortField ?? sortField;
      const nextSortOrder = options?.sortOrder ?? sortOrder;
      const params = new URLSearchParams();
      if (nextSearch) params.set("search", nextSearch);
      if (nextStatusFilter.length > 0) {
        params.set("status", nextStatusFilter.join(","));
      }
      params.set("sort", nextSortField);
      params.set("order", nextSortOrder);

      const response = await fetch(`/api/applications?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as { applications: TrackedApplicationRecord[]; total: number };
        setApplications(data.applications);
        setTotal(data.total);
      }
    });
  }, [search, statusFilter, sortField, sortOrder, startTransition]);

  const handleSort = useCallback((field: SortField) => {
    const nextSortField = field;
    const nextSortOrder =
      sortField === field ? (sortOrder === "asc" ? "desc" : "asc") : "desc";

    setSortField(nextSortField);
    setSortOrder(nextSortOrder);
    fetchApplications({ sortField: nextSortField, sortOrder: nextSortOrder });
  }, [fetchApplications, sortField, sortOrder]);

  const handleInlineUpdate = useCallback(
    async (id: string, field: string, value: unknown) => {
      // Optimistic update
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, [field]: value } : app)),
      );

      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) {
        toast.error("Failed to update. Reverting.");
        fetchApplications();
      }
    },
    [fetchApplications],
  );

  const handleApplicationReplace = useCallback((application: TrackedApplicationRecord) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === application.id ? application : item)),
    );
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      setApplications((prev) => prev.filter((app) => app.id !== id));

      const response = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error("Failed to delete.");
        fetchApplications();
      } else {
        toast.success("Application removed.");
        setTotal((prev) => prev - 1);
      }
    },
    [fetchApplications],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      setApplications((prev) => prev.filter((app) => app.id !== id));
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });

      if (!response.ok) {
        toast.error("Failed to archive.");
        fetchApplications();
      } else {
        toast.success("Application archived.");
        setTotal((prev) => prev - 1);
      }
    },
    [fetchApplications],
  );

  const handleSearchSubmit = useCallback(() => {
    fetchApplications();
  }, [fetchApplications]);

  const toggleStatusFilter = useCallback(
    (status: ApplicationStatus) => {
      const next = statusFilter.includes(status)
        ? statusFilter.filter((s) => s !== status)
        : [...statusFilter, status];

      setStatusFilter(next);
      fetchApplications({ statusFilter: next });
    },
    [fetchApplications, statusFilter],
  );

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "—";
    const fmt = (v: number) =>
      currency === "INR" ? `${v} LPA` : `${currency} ${trackerSalaryFormatter.format(v)}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return fmt(min ?? max!);
  };

  return (
    <div className="space-y-6">
      <TrackerStats stats={trackerStats} />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search company or role..."
              value={search}
            />
          </div>
          <Button onClick={handleSearchSubmit} size="sm" variant="outline">
            Search
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <span className="rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            {trackerParsesRemaining} AI auto-fills left
          </span>
          <Button
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {allStatuses.map((status) => (
          <button
            key={status}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter.includes(status)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/70 text-muted-foreground hover:border-primary/40",
            )}
            onClick={() => toggleStatusFilter(status)}
            type="button"
          >
            {getStatusLabel(status)}
            {trackerStats.byStatus[status] ? ` (${trackerStats.byStatus[status]})` : ""}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[28px] border border-border/70 bg-card/80 backdrop-blur-xl shadow-glow shadow-black/5 dark:shadow-[0_32px_88px_-42px_rgba(2,6,23,0.98)]">
        <table className="min-w-[980px] w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="w-8 px-3 py-3" />
              <SortableHeader field="company_name" label="Company" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader field="role_title" label="Role" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader field="status" label="Status" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <SortableHeader field="priority" label="Priority" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Salary</th>
              <SortableHeader field="applied_at" label="Applied" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td className="px-6 py-12 text-center text-muted-foreground" colSpan={9}>
                  {search || statusFilter.length > 0
                    ? "No matching applications found."
                    : "No applications tracked yet. Click \"Add Application\" to start."}
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  app={app}
                  expanded={expandedId === app.id}
                  formatSalary={formatSalary}
                  onArchive={handleArchive}
                  onApplicationReplace={handleApplicationReplace}
                  onDelete={handleDelete}
                  onToggleExpand={() =>
                    setExpandedId((prev) => (prev === app.id ? null : app.id))
                  }
                  onUpdate={handleInlineUpdate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > applications.length ? (
        <div className="text-center">
          <Button onClick={() => fetchApplications()} variant="outline">
            {isPending ? "Loading..." : `Showing ${applications.length} of ${total}`}
          </Button>
        </div>
      ) : null}

      {showAddDialog ? (
        <AddApplicationDialog
          onClose={() => setShowAddDialog(false)}
          onCreated={() => {
            setShowAddDialog(false);
            fetchApplications();
            router.refresh();
          }}
          parsesRemaining={trackerParsesRemaining}
          userPlan={userPlan}
        />
      ) : null}
    </div>
  );
}

function SortableHeader({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === field;
  return (
    <th className="px-3 py-3">
      <button
        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        onClick={() => onSort(field)}
        type="button"
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", isActive && "text-primary")} />
        {isActive ? (
          <span className="text-[10px] text-primary">{sortOrder === "asc" ? "↑" : "↓"}</span>
        ) : null}
      </button>
    </th>
  );
}

function ApplicationRow({
  app,
  expanded,
  formatSalary,
  onToggleExpand,
  onUpdate,
  onApplicationReplace,
  onDelete,
  onArchive,
}: {
  app: TrackedApplicationRecord;
  expanded: boolean;
  formatSalary: (min: number | null, max: number | null, currency: string) => string;
  onToggleExpand: () => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
  onApplicationReplace: (application: TrackedApplicationRecord) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  return (
    <>
      <tr className="group border-b border-border/40 transition-colors hover:bg-muted/30">
        <td className="px-3 py-3">
          <button
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={onToggleExpand}
            type="button"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </td>
        <td className="px-3 py-3">
          <InlineEditCell
            className="max-w-[15rem] whitespace-normal break-words leading-6"
            onSave={(v) => onUpdate(app.id, "companyName", v)}
            value={app.companyName}
          />
          {app.sourceUrl ? (
            <a
              className="ml-1 inline-block text-muted-foreground hover:text-primary"
              href={app.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="inline h-3 w-3" />
            </a>
          ) : null}
        </td>
        <td className="px-3 py-3">
          <InlineEditCell
            className="max-w-[16rem] whitespace-normal break-words leading-6"
            onSave={(v) => onUpdate(app.id, "roleTitle", v)}
            value={app.roleTitle}
          />
        </td>
        <td className="px-3 py-3">
          <StatusSelect
            onChange={(v) => onUpdate(app.id, "status", v)}
            value={app.status}
          />
        </td>
        <td className="px-3 py-3">
          <PriorityStars
            onChange={(v) => onUpdate(app.id, "priority", v)}
            value={app.priority}
          />
        </td>
        <td className="max-w-[11rem] px-3 py-3 text-muted-foreground">
          {app.location || "—"}
          {app.workMode !== "unknown" ? (
            <span className={cn(
              "ml-1 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              app.workMode === "remote" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
              app.workMode === "hybrid" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              app.workMode === "onsite" && "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
            )}>
              {app.workMode}
            </span>
          ) : null}
        </td>
        <td className="px-3 py-3 text-muted-foreground">
          {formatSalary(app.salaryMin, app.salaryMax, app.salaryCurrency)}
        </td>
        <td className="px-3 py-3 text-muted-foreground">
          {formatAppliedDate(app.appliedAt)}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => onArchive(app.id)}
              title="Archive"
              type="button"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
            <button
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
              onClick={() => onDelete(app.id)}
              title="Delete"
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td className="border-b border-border/40 bg-muted/20 px-6 py-4" colSpan={9}>
            <ApplicationDetail
              app={app}
              onApplicationReplace={onApplicationReplace}
              onUpdate={onUpdate}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function InlineEditCell({
  value,
  onSave,
  className,
}: {
  value: string;
  onSave: (value: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        className={cn(
          "w-full rounded-lg border border-primary/40 bg-transparent px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary",
          className,
        )}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onSave(draft);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            if (draft !== value) onSave(draft);
          }
          if (e.key === "Escape") {
            setEditing(false);
            setDraft(value);
          }
        }}
        value={draft}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-block cursor-text rounded-lg px-1 py-0.5 transition-colors hover:bg-muted",
        className,
      )}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
    >
      {value || <span className="text-muted-foreground/50">Click to edit</span>}
    </span>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: ApplicationStatus;
  onChange: (value: ApplicationStatus) => void;
}) {
  return (
    <select
      className="appearance-none rounded-full border-0 bg-transparent p-0 text-xs font-semibold outline-none focus:ring-0"
      onChange={(e) => onChange(e.target.value as ApplicationStatus)}
      value={value}
    >
      {allStatuses.map((s) => (
        <option key={s} value={s}>
          {getStatusLabel(s)}
        </option>
      ))}
    </select>
  );
}

function PriorityStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          className="transition-colors"
          onClick={() => onChange(value === i ? 0 : i)}
          type="button"
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              i <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30",
            )}
          />
        </button>
      ))}
    </div>
  );
}
