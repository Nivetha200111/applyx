import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow } from "@/lib/db";
import { refreshUserAccess } from "@/lib/data";
import { getDismissedJobIds } from "@/lib/jobs/dismissed";
import { fetchAdzunaJobs, hasAdzunaConfig } from "@/lib/jobs/adzuna";
import { extractUserMatchProfile, scoreJobs } from "@/lib/jobs/matcher";
import { fetchRemoteOkJobs } from "@/lib/jobs/remoteok";
import type { ExternalJob, ExternalJobSource, JobFeedResponse } from "@/lib/jobs/types";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import type { ParsedResume } from "@/lib/types";

export const runtime = "nodejs";

type MasterResumeRow = {
  id: string;
  parsed_data: ParsedResume;
};

type ExistingTrackedRow = {
  source_url: string | null;
  company_name: string;
  role_title: string;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUrl(value: string | null | undefined) {
  return normalizeText(value).replace(/\/+$/, "");
}

function getTrackedKey(company: string | null | undefined, title: string | null | undefined) {
  return `${normalizeText(company)}::${normalizeText(title)}`;
}

function choosePreferredJob(current: ExternalJob, incoming: ExternalJob) {
  const currentScore =
    current.tags.length * 3
    + (current.salaryMin !== null || current.salaryMax !== null ? 2 : 0)
    + Math.min(current.description.length, 600) / 200;
  const incomingScore =
    incoming.tags.length * 3
    + (incoming.salaryMin !== null || incoming.salaryMax !== null ? 2 : 0)
    + Math.min(incoming.description.length, 600) / 200;

  if (incomingScore !== currentScore) {
    return incomingScore > currentScore ? incoming : current;
  }

  return new Date(incoming.postedAt).getTime() > new Date(current.postedAt).getTime()
    ? incoming
    : current;
}

function dedupeJobs(jobs: ExternalJob[]) {
  const deduped = new Map<string, ExternalJob>();

  for (const job of jobs) {
    const key = normalizeUrl(job.applyUrl) || getTrackedKey(job.company, job.title);
    const existing = deduped.get(key);
    deduped.set(key, existing ? choosePreferredJob(existing, job) : job);
  }

  return [...deduped.values()];
}

function buildAdzunaQuery(skills: string[], titles: string[]) {
  const queryParts = [
    titles[0] ?? "",
    ...skills.slice(0, 5),
  ].filter(Boolean);

  return queryParts.join(" ") || "software engineer remote";
}

async function getPreferredResume(userId: string) {
  let result = await dbQuery<MasterResumeRow>(
    `select id, parsed_data
     from public.master_resumes
     where user_id = $1 and is_primary = true
     limit 1`,
    [userId],
  );
  let resume = firstRow(result);

  if (!resume) {
    result = await dbQuery<MasterResumeRow>(
      `select id, parsed_data
       from public.master_resumes
       where user_id = $1
       order by created_at desc
       limit 1`,
      [userId],
    );
    resume = firstRow(result);
  }

  return resume;
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await refreshUserAccess(sessionUser);
    await enforceRateLimit({
      key: "jobs:list",
      identifier: user.id,
      limit: 20,
      windowSeconds: 60,
      message: "Jobs feed rate limit reached. Please wait a minute and try again.",
    });

    const resume = await getPreferredResume(user.id);

    if (!resume) {
      return NextResponse.json({
        jobs: [],
        skills: [],
        sources: [],
        error: "Upload a resume first to get personalized job matches.",
      } satisfies JobFeedResponse);
    }

    const profile = extractUserMatchProfile(resume.parsed_data);
    const url = new URL(request.url);
    const noStore = url.searchParams.get("refresh") === "1";
    const requestedSources: ExternalJobSource[] = [];

    const sourceResults = await Promise.allSettled([
      fetchRemoteOkJobs({ noStore }),
      hasAdzunaConfig()
        ? fetchAdzunaJobs(buildAdzunaQuery(profile.skills, profile.titles), { noStore })
        : Promise.resolve([] as ExternalJob[]),
    ]);

    const jobs: ExternalJob[] = [];

    if (sourceResults[0].status === "fulfilled") {
      requestedSources.push("remoteok");
      jobs.push(...sourceResults[0].value);
    } else {
      console.error(`[jobs] RemoteOK failed: ${sourceResults[0].reason instanceof Error ? sourceResults[0].reason.message : "Unknown error"}`);
    }

    if (sourceResults[1].status === "fulfilled") {
      if (hasAdzunaConfig()) {
        requestedSources.push("adzuna");
      }
      jobs.push(...sourceResults[1].value);
    } else {
      console.error(`[jobs] Adzuna failed: ${sourceResults[1].reason instanceof Error ? sourceResults[1].reason.message : "Unknown error"}`);
    }

    if (jobs.length === 0) {
      return NextResponse.json({
        jobs: [],
        skills: profile.skills,
        sources: requestedSources,
        error: "No job feeds are available right now. Please try again later.",
      } satisfies JobFeedResponse);
    }

    const [dismissedIds, trackedJobsResult] = await Promise.all([
      getDismissedJobIds(user.id),
      dbQuery<ExistingTrackedRow>(
        `select source_url, company_name, role_title
         from public.tracked_applications
         where user_id = $1 and is_archived = false`,
        [user.id],
      ),
    ]);

    const trackedUrls = new Set(
      trackedJobsResult.rows
        .map((row) => normalizeUrl(row.source_url))
        .filter(Boolean),
    );
    const trackedKeys = new Set(
      trackedJobsResult.rows.map((row) => getTrackedKey(row.company_name, row.role_title)),
    );

    const filteredJobs = dedupeJobs(jobs).filter((job) => {
      if (dismissedIds.has(job.externalId)) {
        return false;
      }

      if (trackedUrls.has(normalizeUrl(job.applyUrl))) {
        return false;
      }

      return !trackedKeys.has(getTrackedKey(job.company, job.title));
    });

    return NextResponse.json({
      jobs: scoreJobs(filteredJobs, profile.skills, profile.titles).slice(0, 50),
      skills: profile.skills.slice(0, 16),
      sources: requestedSources,
    } satisfies JobFeedResponse);
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to load job matches right now.",
      logLabel: "api/jobs",
    });
  }
}
