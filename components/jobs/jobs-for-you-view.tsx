"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { JobCard } from "@/components/jobs/job-card";
import { JobsEmptyState } from "@/components/jobs/jobs-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { JobFeedResponse, ScoredJob } from "@/lib/jobs/types";
import type { PlanTier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JobsForYouViewProps {
  hasResume: boolean;
  userPlan: PlanTier;
}

function sourceLabel(source: string) {
  return source === "remoteok" ? "Remote OK" : "Adzuna";
}

function planNote(plan: PlanTier) {
  if (plan === "premium") {
    return "Add strong matches to your tracker, then continue with the full premium automation flow.";
  }

  if (plan === "basic") {
    return "Bookmark roles here, then use the tracker to parse JDs and schedule follow-ups.";
  }

  return "Free plan users can still save matching roles to the tracker until they hit the active-row limit.";
}

export function JobsForYouView({ hasResume, userPlan }: JobsForYouViewProps) {
  const router = useRouter();
  const loadedRef = useRef(false);
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(hasResume);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<"track" | "dismiss" | null>(null);
  const deferredSearch = useDeferredValue(search);

  async function loadJobs(refresh = false) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs${refresh ? "?refresh=1" : ""}`, {
        cache: "no-store",
      });
      const payload = await response.json() as JobFeedResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load job matches.");
      }

      setJobs(payload.jobs);
      setSkills(payload.skills);
      setSources(payload.sources);
      setError(payload.error ?? null);
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : "Unable to load job matches.";
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasResume || loadedRef.current) {
      return;
    }

    loadedRef.current = true;
    void loadJobs();
  }, [hasResume]);

  const visibleSkillCounts = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.matchedSkills.length > 0 ? job.matchedSkills : job.tags) {
      visibleSkillCounts.set(skill, (visibleSkillCounts.get(skill) ?? 0) + 1);
    }
  }

  const filterSkills = [...visibleSkillCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([skill]) => skill)
    .slice(0, 10);

  const searchValue = deferredSearch.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchValue
      || `${job.title} ${job.company} ${job.location ?? ""} ${job.tags.join(" ")}`.toLowerCase().includes(searchValue);
    const matchesSkills = selectedSkills.length === 0
      || selectedSkills.some((skill) => job.matchedSkills.includes(skill) || job.tags.includes(skill));

    return matchesSearch && matchesSkills;
  });

  async function handleDismiss(job: ScoredJob) {
    const previousJobs = jobs;
    setActiveJobId(job.externalId);
    setActiveAction("dismiss");
    setJobs((current) => current.filter((item) => item.externalId !== job.externalId));

    try {
      const response = await fetch("/api/jobs/dismiss", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          externalJobId: job.externalId,
          source: job.source,
        }),
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to dismiss that job.");
      }

      toast.success("Job hidden from your feed.");
    } catch (dismissError) {
      setJobs(previousJobs);
      toast.error(
        dismissError instanceof Error ? dismissError.message : "Unable to dismiss that job.",
      );
    } finally {
      setActiveJobId(null);
      setActiveAction(null);
    }
  }

  async function handleTrack(job: ScoredJob) {
    const previousJobs = jobs;
    setActiveJobId(job.externalId);
    setActiveAction("track");
    setJobs((current) => current.filter((item) => item.externalId !== job.externalId));

    try {
      const response = await fetch("/api/jobs/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          externalJobId: job.externalId,
          source: job.source,
          title: job.title,
          company: job.company,
          location: job.location,
          applyUrl: job.applyUrl,
          tags: job.tags,
          description: job.description,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          workMode: job.workMode,
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; alreadyTracked?: boolean }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to add that job to your tracker.");
      }

      if (payload?.alreadyTracked) {
        toast.success("That job was already in your tracker.");
      } else {
        toast.success("Job added to your tracker.");
      }

      router.refresh();
    } catch (trackError) {
      setJobs(previousJobs);
      toast.error(
        trackError instanceof Error ? trackError.message : "Unable to add that job to your tracker.",
      );
    } finally {
      setActiveJobId(null);
      setActiveAction(null);
    }
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill],
    );
  }

  if (!hasResume) {
    return <JobsEmptyState hasResume={false} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Resume-matched jobs</Badge>
            {sources.map((source) => (
              <Badge key={source} variant="outline">
                {sourceLabel(source)}
              </Badge>
            ))}
          </div>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {planNote(userPlan)}
          </p>
        </div>

        <Button
          className="gap-2"
          disabled={loading}
          onClick={() => void loadJobs(true)}
          variant="outline"
        >
          <RefreshCcw className="h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, company, location, or skill..."
            value={search}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 8).map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {filterSkills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filterSkills.map((skill) => (
            <button
              key={skill}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                selectedSkills.includes(skill)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card/70 text-muted-foreground hover:border-primary/40",
              )}
              onClick={() => toggleSkill(skill)}
              type="button"
            >
              {skill}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[24px] border border-amber-300/50 bg-amber-100/60 px-4 py-3 text-sm text-amber-900 dark:border-amber-200/20 dark:bg-amber-900/20 dark:text-amber-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="surface animate-pulse rounded-[28px] border border-border/80 p-6"
            >
              <div className="h-4 w-24 rounded-full bg-muted/70" />
              <div className="mt-6 h-7 w-3/4 rounded-full bg-muted/70" />
              <div className="mt-3 h-4 w-1/2 rounded-full bg-muted/70" />
              <div className="mt-8 h-3 w-full rounded-full bg-muted/70" />
              <div className="mt-3 h-3 w-5/6 rounded-full bg-muted/70" />
              <div className="mt-3 h-3 w-2/3 rounded-full bg-muted/70" />
              <div className="mt-8 flex gap-2">
                <div className="h-8 w-24 rounded-full bg-muted/70" />
                <div className="h-8 w-24 rounded-full bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <JobsEmptyState hasResume onRefresh={() => void loadJobs(true)} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.externalId}
              busyAction={
                activeJobId === job.externalId
                  ? activeAction
                  : null
              }
              job={job}
              onDismiss={() => void handleDismiss(job)}
              onTrack={() => void handleTrack(job)}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Sources:{" "}
        {sources.length > 0
          ? sources.map((source) => sourceLabel(source)).join(", ")
          : "None available right now"}
      </div>
    </div>
  );
}
