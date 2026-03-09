"use client";

import { ExternalLink, MapPin, Wallet, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ScoredJob } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: ScoredJob;
  busyAction: "track" | "dismiss" | null;
  onDismiss: () => void;
  onTrack: () => void;
}

function formatSalary(job: ScoredJob) {
  if (job.salaryMin === null && job.salaryMax === null) {
    return null;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  });
  const formatValue = (value: number) => `${job.salaryCurrency} ${formatter.format(value)}`;

  if (job.salaryMin !== null && job.salaryMax !== null) {
    return `${formatValue(job.salaryMin)} - ${formatValue(job.salaryMax)}`;
  }

  return formatValue(job.salaryMin ?? job.salaryMax ?? 0);
}

function formatPostedAt(postedAt: string) {
  const timestamp = new Date(postedAt).getTime();
  if (Number.isNaN(timestamp)) {
    return "Recently posted";
  }

  const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return "Posted today";
  }
  if (diffDays === 1) {
    return "Posted 1 day ago";
  }
  if (diffDays < 30) {
    return `Posted ${diffDays} days ago`;
  }

  return `Posted ${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`;
}

function sourceLabel(source: ScoredJob["source"]) {
  return source === "remoteok" ? "Remote OK" : "Adzuna";
}

function descriptionSnippet(value: string) {
  const trimmed = value.trim();
  if (trimmed.length <= 220) {
    return trimmed;
  }

  return `${trimmed.slice(0, 217).trimEnd()}...`;
}

export function JobCard({ job, busyAction, onDismiss, onTrack }: JobCardProps) {
  const salary = formatSalary(job);
  const matchTone =
    job.matchScore >= 70 ? "from-emerald-500/90 to-teal-400/90"
      : job.matchScore >= 40 ? "from-amber-400/90 to-orange-400/90"
        : "from-slate-400/80 to-slate-500/80";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{sourceLabel(job.source)}</Badge>
              <Badge variant={job.matchScore >= 70 ? "success" : "outline"}>
                {job.workMode}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-tight">{job.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {job.company}
            </div>
          </div>

          <div className="min-w-[5.5rem] text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Match
            </div>
            <div className="mt-1 text-2xl font-semibold">{job.matchScore}%</div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-muted/70">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r", matchTone)}
            style={{ width: `${job.matchScore}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location || "Location not listed"}
          </span>
          {salary ? (
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              {salary}
            </span>
          ) : null}
          <span>{formatPostedAt(job.postedAt)}</span>
        </div>

        <p className="text-sm leading-7 text-muted-foreground">
          {descriptionSnippet(job.description)}
        </p>

        <div className="space-y-3">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Matched skills
            </div>
            <div className="flex flex-wrap gap-2">
              {job.matchedSkills.length > 0 ? (
                job.matchedSkills.slice(0, 6).map((skill) => (
                  <Badge key={skill} variant="success">
                    {skill}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline">Low skill overlap</Badge>
              )}
            </div>
          </div>

          {job.missingSkills.length > 0 ? (
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Missing from resume
              </div>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button disabled={busyAction !== null} onClick={onTrack}>
            {busyAction === "track" ? "Adding..." : "Add to Tracker"}
          </Button>
          <Button
            disabled={busyAction !== null}
            onClick={onDismiss}
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            {busyAction === "dismiss" ? "Hiding..." : "Not interested"}
          </Button>
        </div>

        <a
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80",
            busyAction !== null && "pointer-events-none opacity-60",
          )}
          href={job.applyUrl}
          rel="noreferrer"
          target="_blank"
        >
          View listing
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
}
