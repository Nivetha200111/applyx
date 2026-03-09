"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Types ──

type StatusEntry = { status: string; count: number };
type WeekEntry = { week: string; count: number };
type SkillEntry = { skill: string; count: number };
type SalaryEntry = {
  companyName: string;
  roleTitle: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  status: string;
};

type AnalyticsData = {
  statusBreakdown: StatusEntry[];
  weeklyVelocity: WeekEntry[];
  topSkills: SkillEntry[];
  salaryInsights: SalaryEntry[];
};

// ── Status color map ──

const STATUS_COLORS: Record<string, string> = {
  bookmarked: "bg-slate-500",
  applying: "bg-blue-400",
  applied: "bg-blue-600",
  screening: "bg-amber-500",
  interviewing: "bg-purple-500",
  offer: "bg-emerald-500",
  accepted: "bg-green-600",
  rejected: "bg-red-500",
  withdrawn: "bg-gray-500",
  ghosted: "bg-gray-400",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  bookmarked: "text-slate-500",
  applying: "text-blue-400",
  applied: "text-blue-600",
  screening: "text-amber-500",
  interviewing: "text-purple-500",
  offer: "text-emerald-500",
  accepted: "text-green-600",
  rejected: "text-red-500",
  withdrawn: "text-gray-500",
  ghosted: "text-gray-400",
};

// ── Helpers ──

function formatWeekLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatSalary(value: number, currency: string) {
  if (currency === "INR") {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 0)}K`;
  }
  return value.toLocaleString();
}

function currencySymbol(currency: string) {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\u00A3",
    INR: "\u20B9",
    CAD: "C$",
    AUD: "A$",
  };
  return symbols[currency] || currency + " ";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Empty state ──

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-[24px] border border-border/60 bg-background/30 py-12">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ── Loading skeleton ──

function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded-md bg-muted/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-20 animate-pulse rounded-md bg-muted/60" />
              <div
                className="h-6 animate-pulse rounded-full bg-muted"
                style={{ width: `${70 - i * 15}%` }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Section A: Status Breakdown ──

function StatusBreakdown({ data }: { data: StatusEntry[] }) {
  if (data.length === 0) {
    return <EmptyState message="No data yet. Start tracking applications to see your status breakdown." />;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = data[0]?.count ?? 1;

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
        const widthPct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
        const color = STATUS_COLORS[entry.status] || "bg-primary";

        return (
          <div key={entry.status} className="group">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
                />
                <span className="font-medium">{capitalize(entry.status)}</span>
              </div>
              <span className="tabular-nums text-muted-foreground">
                {entry.count}
                <span className="ml-1.5 text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Section B: Application Velocity ──

function ApplicationVelocity({ data }: { data: WeekEntry[] }) {
  if (data.length === 0) {
    return <EmptyState message="No data yet. Applications added in the last 12 weeks will appear here." />;
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5" style={{ height: 180 }}>
      {data.map((entry) => {
        const heightPct = (entry.count / maxCount) * 100;
        return (
          <div
            key={entry.week}
            className="group flex flex-1 flex-col items-center gap-1.5"
            style={{ height: "100%" }}
          >
            <div className="relative flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[36px] rounded-t-md bg-primary transition-all duration-700 ease-out group-hover:bg-primary/80"
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
              <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded-md bg-popover px-1.5 py-0.5 text-xs font-medium text-popover-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                {entry.count}
              </span>
            </div>
            <span className="text-[10px] leading-none text-muted-foreground">
              {formatWeekLabel(entry.week)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Section C: Top Skills ──

function TopSkills({ data }: { data: SkillEntry[] }) {
  if (data.length === 0) {
    return <EmptyState message="No data yet. Skills from your tracked applications will be aggregated here." />;
  }

  const maxCount = data[0]?.count ?? 1;

  return (
    <div className="space-y-2.5">
      {data.map((entry) => {
        const widthPct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;

        return (
          <div key={entry.skill} className="group">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{entry.skill}</span>
              <span className="tabular-nums text-muted-foreground">
                {entry.count}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full bg-primary/80 transition-all duration-700 ease-out"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Section D: Salary Landscape ──

function SalaryLandscape({ data }: { data: SalaryEntry[] }) {
  if (data.length === 0) {
    return <EmptyState message="No data yet. Add salary info to your tracked applications to see insights." />;
  }

  // Group by currency
  const byCurrency: Record<string, SalaryEntry[]> = {};
  for (const entry of data) {
    const cur = entry.salaryCurrency || "USD";
    if (!byCurrency[cur]) byCurrency[cur] = [];
    byCurrency[cur].push(entry);
  }

  const currencyGroups = Object.entries(byCurrency);

  return (
    <div className="space-y-8">
      {currencyGroups.map(([currency, entries]) => {
        const allMins = entries
          .map((e) => e.salaryMin)
          .filter((v): v is number => v !== null);
        const allMaxes = entries
          .map((e) => e.salaryMax)
          .filter((v): v is number => v !== null);
        const allValues = [...allMins, ...allMaxes];

        if (allValues.length === 0) return null;

        const globalMin = Math.min(...allValues);
        const globalMax = Math.max(...allValues);
        const range = globalMax - globalMin || 1;

        // Compute stats
        const midpoints = entries
          .map((e) => {
            const lo = e.salaryMin ?? e.salaryMax;
            const hi = e.salaryMax ?? e.salaryMin;
            if (lo === null || hi === null) return null;
            return (lo + hi) / 2;
          })
          .filter((v): v is number => v !== null)
          .sort((a, b) => a - b);

        const avg =
          midpoints.length > 0
            ? Math.round(
                midpoints.reduce((s, v) => s + v, 0) / midpoints.length,
              )
            : null;
        const median =
          midpoints.length > 0
            ? midpoints.length % 2 === 1
              ? midpoints[Math.floor(midpoints.length / 2)]
              : Math.round(
                  (midpoints[midpoints.length / 2 - 1]! +
                    midpoints[midpoints.length / 2]!) /
                    2,
                )
            : null;

        const sym = currencySymbol(currency);

        return (
          <div key={currency} className="space-y-4">
            {currencyGroups.length > 1 && (
              <h4 className="text-sm font-semibold text-muted-foreground">
                {currency}
              </h4>
            )}

            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {avg !== null && (
                <div className="rounded-[16px] border border-border/60 bg-background/30 px-3 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Avg Mid
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {sym}
                    {formatSalary(avg, currency)}
                  </p>
                </div>
              )}
              {median !== null && (
                <div className="rounded-[16px] border border-border/60 bg-background/30 px-3 py-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Median
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {sym}
                    {formatSalary(median, currency)}
                  </p>
                </div>
              )}
              <div className="rounded-[16px] border border-border/60 bg-background/30 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Min Seen
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {sym}
                  {formatSalary(globalMin, currency)}
                </p>
              </div>
              <div className="rounded-[16px] border border-border/60 bg-background/30 px-3 py-2.5">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Max Seen
                </p>
                <p className="text-lg font-semibold tabular-nums">
                  {sym}
                  {formatSalary(globalMax, currency)}
                </p>
              </div>
            </div>

            {/* Range bars */}
            <div className="space-y-2">
              {entries.map((entry, i) => {
                const lo = entry.salaryMin ?? entry.salaryMax ?? globalMin;
                const hi = entry.salaryMax ?? entry.salaryMin ?? globalMax;
                const leftPct = ((lo - globalMin) / range) * 100;
                const widthPct = Math.max(
                  ((hi - lo) / range) * 100,
                  1,
                );
                const isOffer =
                  entry.status === "offer" || entry.status === "accepted";
                const barColor = isOffer
                  ? "bg-emerald-500"
                  : "bg-primary/70";

                return (
                  <div
                    key={`${entry.companyName}-${entry.roleTitle}-${i}`}
                    className="group"
                  >
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="max-w-[55%] truncate font-medium">
                        {entry.companyName}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          {entry.roleTitle}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isOffer && (
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${STATUS_COLORS[entry.status] || "bg-emerald-500"}`}
                          />
                        )}
                        <span
                          className={`text-xs ${isOffer ? (STATUS_TEXT_COLORS[entry.status] || "text-emerald-500") : "text-muted-foreground"}`}
                        >
                          {capitalize(entry.status)}
                        </span>
                      </div>
                    </div>
                    <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={`absolute top-0 h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      />
                      <span
                        className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white drop-shadow-sm"
                        style={{
                          left: `${leftPct + widthPct / 2}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {sym}
                        {formatSalary(lo, currency)}
                        {lo !== hi && ` - ${sym}${formatSalary(hi, currency)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ──

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function fetchData() {
      try {
        const res = await fetch("/api/applications/analytics");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error || `Failed to load analytics (${res.status})`,
          );
        }
        const json: AnalyticsData = await res.json();
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics.",
        );
      }
    }

    fetchData();
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* A: Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>
            Distribution of your active applications by status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBreakdown data={data.statusBreakdown} />
        </CardContent>
      </Card>

      {/* B: Application Velocity */}
      <Card>
        <CardHeader>
          <CardTitle>Application Velocity</CardTitle>
          <CardDescription>
            Applications added per week over the last 12 weeks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationVelocity data={data.weeklyVelocity} />
        </CardContent>
      </Card>

      {/* C: Top Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Top Skills in Demand</CardTitle>
          <CardDescription>
            Most frequently required skills across your tracked roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopSkills data={data.topSkills} />
        </CardContent>
      </Card>

      {/* D: Salary Landscape */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Salary Landscape</CardTitle>
          <CardDescription>
            Salary ranges from your tracked applications. Offers are highlighted
            in green.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalaryLandscape data={data.salaryInsights} />
        </CardContent>
      </Card>
    </div>
  );
}
