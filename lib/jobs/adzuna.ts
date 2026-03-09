import { extractTagsFromText, inferWorkMode } from "@/lib/jobs/matcher";
import type { ExternalJob } from "@/lib/jobs/types";

type AdzunaJob = {
  id?: string | number;
  title?: string;
  description?: string | null;
  redirect_url?: string | null;
  created?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  company?: {
    display_name?: string | null;
  } | null;
  location?: {
    display_name?: string | null;
  } | null;
  category?: {
    label?: string | null;
  } | null;
  contract_type?: string | null;
  contract_time?: string | null;
};

function getAdzunaCredentials() {
  const appId = process.env.ADZUNA_APP_ID?.trim() ?? "";
  const appKey = process.env.ADZUNA_APP_KEY?.trim() ?? "";

  return {
    appId,
    appKey,
  };
}

export function hasAdzunaConfig() {
  const { appId, appKey } = getAdzunaCredentials();
  return Boolean(appId && appKey);
}

function getCurrencyForCountry(country: string) {
  switch (country.toLowerCase()) {
    case "in":
      return "INR";
    case "gb":
      return "GBP";
    case "ca":
      return "CAD";
    case "au":
      return "AUD";
    case "sg":
      return "SGD";
    case "us":
    default:
      return "USD";
  }
}

function normalizeSalary(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.round(value);
}

function toIsoDate(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

export async function fetchAdzunaJobs(
  query: string,
  options?: {
    country?: string;
    noStore?: boolean;
  },
) {
  const { appId, appKey } = getAdzunaCredentials();

  if (!appId || !appKey) {
    return [] as ExternalJob[];
  }

  const country = options?.country ?? "in";
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "50",
    what: query,
    "content-type": "application/json",
  });

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`,
    options?.noStore ? { cache: "no-store" } : { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    throw new Error(`Adzuna request failed with ${response.status}.`);
  }

  const payload = await response.json() as { results?: unknown };
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results
    .filter((item): item is AdzunaJob => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const job = item as AdzunaJob;
      return Boolean(job.id && job.title && job.redirect_url && job.company?.display_name);
    })
    .map((job) => {
      const description = (job.description ?? "").trim();
      const location = job.location?.display_name?.trim() || null;
      const title = job.title?.trim() ?? "";
      const company = job.company?.display_name?.trim() ?? "";
      const workMode = inferWorkMode(
        [title, description, location ?? "", job.contract_type ?? "", job.contract_time ?? ""].join(" "),
      );

      return {
        externalId: `adzuna:${job.id}`,
        source: "adzuna",
        title,
        company,
        location,
        tags: extractTagsFromText(
          [
            title,
            description,
            job.category?.label ?? "",
            job.contract_type ?? "",
            job.contract_time ?? "",
          ].join(" "),
        ),
        description,
        applyUrl: job.redirect_url?.trim() ?? "",
        salaryMin: normalizeSalary(job.salary_min),
        salaryMax: normalizeSalary(job.salary_max),
        salaryCurrency: getCurrencyForCountry(country),
        postedAt: toIsoDate(job.created),
        workMode,
      } satisfies ExternalJob;
    })
    .filter((job) => job.title && job.company && job.applyUrl);
}
