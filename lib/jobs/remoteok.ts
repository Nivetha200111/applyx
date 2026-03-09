import type { ExternalJob } from "@/lib/jobs/types";

type RemoteOkJob = {
  id?: number | string;
  position?: string;
  company?: string;
  location?: string | null;
  tags?: string[] | null;
  description?: string | null;
  apply_url?: string | null;
  url?: string | null;
  date?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
};

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/Please mention the word[\s\S]*$/i, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function normalizeSalary(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

export async function fetchRemoteOkJobs(options?: { noStore?: boolean }) {
  const response = await fetch("https://remoteok.com/api", {
    headers: {
      accept: "application/json",
    },
    ...(options?.noStore ? { cache: "no-store" as const } : { next: { revalidate: 3600 } }),
  });

  if (!response.ok) {
    throw new Error(`RemoteOK request failed with ${response.status}.`);
  }

  const payload = await response.json() as unknown;

  if (!Array.isArray(payload)) {
    throw new Error("RemoteOK returned an unexpected payload.");
  }

  return payload
    .filter((item): item is RemoteOkJob => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const job = item as RemoteOkJob;
      return Boolean(job.id && job.position && job.company && (job.apply_url || job.url));
    })
    .map((job) => ({
      externalId: `remoteok:${job.id}`,
      source: "remoteok",
      title: job.position?.trim() ?? "",
      company: job.company?.trim() ?? "",
      location: job.location?.trim() || "Remote",
      tags: Array.isArray(job.tags) ? job.tags : [],
      description: stripHtml(job.description ?? ""),
      applyUrl: job.apply_url?.trim() || job.url?.trim() || "",
      salaryMin: normalizeSalary(job.salary_min),
      salaryMax: normalizeSalary(job.salary_max),
      salaryCurrency: "USD",
      postedAt: toIsoDate(job.date),
      workMode: "remote",
    } satisfies ExternalJob))
    .filter((job) => job.title && job.company && job.applyUrl);
}
