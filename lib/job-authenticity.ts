import { dbQuery, firstRow } from "@/lib/db";
import { getTrackedApplicationForUser } from "@/lib/data";
import { canonicalizeSkill, extractUserMatchProfile } from "@/lib/jobs/matcher";
import type {
  CandidateFitVerdict,
  JobAuthenticityAssessment,
  JobSignalEvidenceItem,
  JobSignalRecommendation,
  JobSourceCheck,
  ParsedResume,
  TrackedApplicationRecord,
} from "@/lib/types";

type ResumeRow = {
  parsed_data: ParsedResume;
};

type AssessmentOptions = {
  allowExternalSourceCheck?: boolean;
};

type SourceUrlMetadata = {
  finalUrl: string | null;
  httpStatus: number | null;
  reachable: boolean;
  siteName: string | null;
  title: string | null;
  jobPosting: {
    found: boolean;
    datePosted: string | null;
    validThrough: string | null;
    hiringOrganization: string | null;
  };
};

const KNOWN_JOB_HOSTS = new Set([
  "linkedin.com",
  "greenhouse.io",
  "lever.co",
  "ashbyhq.com",
  "workday.com",
  "myworkdayjobs.com",
  "indeed.com",
  "wellfound.com",
  "naukri.com",
  "instahyre.com",
  "smartrecruiters.com",
]);

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "tiny.cc",
  "rebrand.ly",
]);

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

const SUSPICIOUS_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /\b(registration fee|processing fee|training fee|security deposit)\b/i, message: "The posting mentions an upfront fee." },
  { pattern: /\bwhatsapp\b|\btelegram\b/i, message: "The posting relies on messaging apps instead of a standard hiring flow." },
  { pattern: /\b(no interview|instant joining|guaranteed job)\b/i, message: "The posting promises unrealistic hiring speed or certainty." },
  { pattern: /\b(payment required|pay before interview)\b/i, message: "The posting asks for payment before the hiring process." },
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function normalizeHost(host: string) {
  return host.replace(/^www\./, "").toLowerCase();
}

function getHostname(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) {
      return null;
    }

    return normalizeHost(parsed.hostname);
  } catch {
    return null;
  }
}

function parseDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(date: Date) {
  return (Date.now() - date.getTime()) / 86_400_000;
}

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function addEvidence(
  evidence: JobSignalEvidenceItem[],
  item: JobSignalEvidenceItem,
) {
  if (evidence.some((existing) => existing.label === item.label && existing.detail === item.detail)) {
    return;
  }

  evidence.push(item);
}

function dedupeSkills(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = canonicalizeSkill(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function tokenizeTitle(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function getTitleFitBoost(roleTitle: string, resumeTitles: string[]) {
  const jobTokens = tokenizeTitle(roleTitle);
  if (jobTokens.length === 0 || resumeTitles.length === 0) {
    return 0;
  }

  let best = 0;

  for (const title of resumeTitles) {
    const titleTokens = new Set(tokenizeTitle(title));
    let overlap = 0;

    for (const token of jobTokens) {
      if (titleTokens.has(token)) {
        overlap += 1;
      }
    }

    best = Math.max(best, overlap / jobTokens.length);
  }

  return Math.round(best * 15);
}

function getCandidateFitVerdict(score: number | null): CandidateFitVerdict {
  if (score === null) {
    return "unknown";
  }

  if (score >= 70) {
    return "strong";
  }

  if (score >= 45) {
    return "partial";
  }

  return "weak";
}

function getAuthenticityVerdict(score: number) {
  if (score >= 75) {
    return "credible" as const;
  }

  if (score >= 45) {
    return "mixed" as const;
  }

  return "risky" as const;
}

function getRecommendation(
  authenticityScore: number,
  candidateFitScore: number | null,
  riskSignals: string[],
): JobSignalRecommendation {
  const hasHardFraudSignal = riskSignals.some((signal) =>
    /upfront fee|payment|messaging apps|unrealistic hiring speed|expired/i.test(signal),
  );

  if (authenticityScore < 35 || hasHardFraudSignal) {
    return "avoid";
  }

  if (authenticityScore < 55) {
    return "investigate_first";
  }

  if (candidateFitScore === null) {
    return authenticityScore >= 75 ? "apply_with_focus" : "investigate_first";
  }

  if (authenticityScore >= 75 && candidateFitScore >= 70) {
    return "strong_apply";
  }

  if (candidateFitScore >= 45) {
    return "apply_with_focus";
  }

  return "investigate_first";
}

function getCompanyHint(companyName: string) {
  return normalizeText(companyName).replace(/[^a-z0-9]+/g, "");
}

function hostnameLooksCompanyOwned(hostname: string | null, companyName: string) {
  if (!hostname) {
    return false;
  }

  const host = normalizeHost(hostname);
  if (KNOWN_JOB_HOSTS.has(host)) {
    return true;
  }

  const companyHint = getCompanyHint(companyName);
  return companyHint.length >= 4 && host.replace(/[^a-z0-9]+/g, "").includes(companyHint);
}

function getContactEmailDomain(email: string | null | undefined) {
  const normalized = normalizeText(email);
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex === -1) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

async function getPreferredResume(userId: string) {
  let result = await dbQuery<ResumeRow>(
    `select parsed_data
     from public.master_resumes
     where user_id = $1 and is_primary = true
     limit 1`,
    [userId],
  );
  let resume = firstRow(result);

  if (!resume) {
    result = await dbQuery<ResumeRow>(
      `select parsed_data
       from public.master_resumes
       where user_id = $1
       order by created_at desc
       limit 1`,
      [userId],
    );
    resume = firstRow(result);
  }

  return resume?.parsed_data ?? null;
}

function extractMetaContent(html: string, attribute: "name" | "property", key: string) {
  const regex = new RegExp(
    `<meta[^>]+${attribute}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);
  return match?.[1]?.trim() ?? null;
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, " ").trim() ?? null;
}

function flattenJsonLd(value: unknown): Array<Record<string, unknown>> {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(flattenJsonLd);
  }

  if (typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const graph = Array.isArray(record["@graph"]) ? flattenJsonLd(record["@graph"]) : [];
  return [record, ...graph];
}

function isJobPostingNode(value: Record<string, unknown>) {
  const rawType = value["@type"];

  if (typeof rawType === "string") {
    return rawType.toLowerCase() === "jobposting";
  }

  if (Array.isArray(rawType)) {
    return rawType.some((entry) => typeof entry === "string" && entry.toLowerCase() === "jobposting");
  }

  return false;
}

function extractJobPostingMetadata(html: string) {
  const blocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];

  for (const block of blocks) {
    const contentMatch = block.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const content = contentMatch?.[1]?.trim();
    if (!content) {
      continue;
    }

    try {
      const parsed = JSON.parse(content) as unknown;
      const nodes = flattenJsonLd(parsed);
      const jobPosting = nodes.find(isJobPostingNode);

      if (!jobPosting) {
        continue;
      }

      const hiringOrganization =
        typeof jobPosting.hiringOrganization === "object" &&
        jobPosting.hiringOrganization !== null &&
        typeof (jobPosting.hiringOrganization as Record<string, unknown>).name === "string"
          ? String((jobPosting.hiringOrganization as Record<string, unknown>).name)
          : null;

      return {
        found: true,
        datePosted:
          typeof jobPosting.datePosted === "string" ? jobPosting.datePosted : null,
        validThrough:
          typeof jobPosting.validThrough === "string" ? jobPosting.validThrough : null,
        hiringOrganization,
      };
    } catch {
      continue;
    }
  }

  return {
    found: false,
    datePosted: null,
    validThrough: null,
    hiringOrganization: null,
  };
}

async function fetchSourceMetadata(sourceUrl: string): Promise<SourceUrlMetadata | null> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return null;
  }

  if (!/^https?:$/i.test(parsedUrl.protocol)) {
    return null;
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "user-agent": "ApplyXBot/1.0 (+https://applyx.ai)",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });

    const finalUrl = response.url || parsedUrl.toString();

    if (!response.ok) {
      return {
        finalUrl,
        httpStatus: response.status,
        reachable: false,
        siteName: null,
        title: null,
        jobPosting: {
          found: false,
          datePosted: null,
          validThrough: null,
          hiringOrganization: null,
        },
      };
    }

    const html = (await response.text()).slice(0, 250_000);
    const siteName =
      extractMetaContent(html, "property", "og:site_name")
      ?? extractMetaContent(html, "name", "application-name");

    return {
      finalUrl,
      httpStatus: response.status,
      reachable: true,
      siteName,
      title: extractTitle(html),
      jobPosting: extractJobPostingMetadata(html),
    };
  } catch {
    return {
      finalUrl: parsedUrl.toString(),
      httpStatus: null,
      reachable: false,
      siteName: null,
      title: null,
      jobPosting: {
        found: false,
        datePosted: null,
        validThrough: null,
        hiringOrganization: null,
      },
    };
  }
}

function buildSourceCheck(
  app: Pick<TrackedApplicationRecord, "sourceUrl">,
  metadata: SourceUrlMetadata | null,
): JobSourceCheck | null {
  const domain = getHostname(metadata?.finalUrl ?? app.sourceUrl);

  if (!domain && !metadata) {
    return null;
  }

  return {
    domain,
    finalUrl: metadata?.finalUrl ?? app.sourceUrl ?? null,
    reachable: metadata?.reachable ?? null,
    httpStatus: metadata?.httpStatus ?? null,
    siteName: metadata?.siteName ?? null,
    title: metadata?.title ?? null,
    foundStructuredJobPosting: metadata?.jobPosting.found ?? false,
    datePosted: metadata?.jobPosting.datePosted ?? null,
    validThrough: metadata?.jobPosting.validThrough ?? null,
    hiringOrganization: metadata?.jobPosting.hiringOrganization ?? null,
  };
}

export async function generateTrackedApplicationAuthenticityAssessment(
  userId: string,
  app: Pick<
    TrackedApplicationRecord,
    | "companyName"
    | "roleTitle"
    | "location"
    | "workMode"
    | "salaryMin"
    | "salaryMax"
    | "salaryCurrency"
    | "sourceUrl"
    | "sourcePlatform"
    | "rawJdText"
    | "parsedJdData"
    | "requiredSkills"
    | "preferredSkills"
    | "experienceRequired"
    | "deadlineAt"
    | "notes"
    | "contactEmail"
  >,
  options: AssessmentOptions = {},
): Promise<JobAuthenticityAssessment> {
  const evidence: JobSignalEvidenceItem[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  let authenticityScore = 45;

  const host = getHostname(app.sourceUrl);
  const deadline = parseDate(app.deadlineAt ?? app.parsedJdData?.applicationDeadline ?? null);

  if (app.companyName.trim()) {
    authenticityScore += 8;
    addUnique(positiveSignals, "The company name is present.");
    addEvidence(evidence, {
      source: "job_post",
      sentiment: "positive",
      label: "Company identified",
      detail: app.companyName,
    });
  } else {
    authenticityScore -= 15;
    addUnique(riskSignals, "The job post is missing a clear company name.");
  }

  if (app.roleTitle.trim()) {
    authenticityScore += 6;
    addEvidence(evidence, {
      source: "job_post",
      sentiment: "positive",
      label: "Role identified",
      detail: app.roleTitle,
    });
  } else {
    authenticityScore -= 10;
    addUnique(riskSignals, "The role title is missing or too vague.");
  }

  if (app.sourceUrl) {
    authenticityScore += 8;
    addUnique(positiveSignals, "A source URL is attached to the application.");
  } else {
    authenticityScore -= 6;
    addUnique(riskSignals, "There is no source URL to verify against.");
  }

  if (host) {
    if (KNOWN_JOB_HOSTS.has(host) || hostnameLooksCompanyOwned(host, app.companyName)) {
      authenticityScore += 8;
      addUnique(positiveSignals, "The application points to a recognized job platform or company-owned domain.");
    } else if (URL_SHORTENERS.has(host)) {
      authenticityScore -= 10;
      addUnique(riskSignals, "The application link uses a URL shortener.");
    } else {
      authenticityScore += 2;
      addEvidence(evidence, {
        source: "source_url",
        sentiment: "neutral",
        label: "Source domain",
        detail: host,
      });
    }
  }

  if (app.sourcePlatform) {
    authenticityScore += 4;
    addEvidence(evidence, {
      source: "job_post",
      sentiment: "positive",
      label: "Detected source platform",
      detail: app.sourcePlatform,
    });
  }

  if ((app.rawJdText ?? "").trim().length >= 350) {
    authenticityScore += 8;
    addUnique(positiveSignals, "The job description is detailed enough to cross-check.");
  } else if ((app.rawJdText ?? "").trim().length >= 150) {
    authenticityScore += 4;
  } else {
    authenticityScore -= 8;
    addUnique(riskSignals, "The job description is unusually short.");
  }

  if (app.requiredSkills.length >= 4) {
    authenticityScore += 6;
    addUnique(positiveSignals, "The role lists a concrete set of required skills.");
  } else if (app.requiredSkills.length > 0) {
    authenticityScore += 3;
  } else {
    authenticityScore -= 4;
    addUnique(riskSignals, "The post does not spell out enough requirements.");
  }

  if (app.location || app.workMode !== "unknown") {
    authenticityScore += 4;
  } else {
    authenticityScore -= 3;
    addUnique(riskSignals, "The posting does not clearly explain where or how the work happens.");
  }

  if (app.salaryMin !== null || app.salaryMax !== null) {
    authenticityScore += 4;
    addUnique(positiveSignals, "The posting includes compensation details.");
  }

  if (app.experienceRequired?.trim()) {
    authenticityScore += 4;
  }

  if (deadline) {
    const msUntilDeadline = deadline.getTime() - Date.now();
    if (msUntilDeadline < 0) {
      authenticityScore -= 18;
      addUnique(riskSignals, "The application deadline appears to be in the past.");
    } else if (msUntilDeadline <= 30 * 86_400_000) {
      authenticityScore += 4;
      addUnique(positiveSignals, "The posting still has an active application window.");
    }
  }

  const contactEmailDomain = getContactEmailDomain(app.contactEmail);
  if (contactEmailDomain) {
    if (FREE_EMAIL_DOMAINS.has(contactEmailDomain) && app.companyName.trim()) {
      authenticityScore -= 8;
      addUnique(riskSignals, "The recruiter contact uses a free email domain.");
    } else if (hostnameLooksCompanyOwned(contactEmailDomain, app.companyName)) {
      authenticityScore += 6;
      addUnique(positiveSignals, "The recruiter contact matches the company domain.");
    }
  }

  const suspiciousCorpus = `${app.rawJdText ?? ""}\n${app.notes ?? ""}`;
  for (const entry of SUSPICIOUS_PATTERNS) {
    if (!entry.pattern.test(suspiciousCorpus)) {
      continue;
    }

    authenticityScore -= 12;
    addUnique(riskSignals, entry.message);
  }

  let sourceMetadata: SourceUrlMetadata | null = null;
  if (options.allowExternalSourceCheck && app.sourceUrl) {
    sourceMetadata = await fetchSourceMetadata(app.sourceUrl);
  }

  const sourceCheck = buildSourceCheck(app, sourceMetadata);
  if (sourceCheck?.reachable === true) {
    authenticityScore += 5;
    addUnique(positiveSignals, "The source page is reachable.");
  } else if (options.allowExternalSourceCheck && sourceCheck?.reachable === false) {
    authenticityScore -= 6;
    addUnique(riskSignals, "The source page could not be fetched for verification.");
  }

  if (sourceCheck?.foundStructuredJobPosting) {
    authenticityScore += 10;
    addUnique(positiveSignals, "The source page exposes structured JobPosting metadata.");
  }

  const postedDate = parseDate(sourceCheck?.datePosted);
  if (postedDate) {
    const ageInDays = daysBetween(postedDate);
    if (ageInDays <= 30) {
      authenticityScore += 8;
      addUnique(positiveSignals, "The posting appears to be recent.");
    } else if (ageInDays <= 90) {
      authenticityScore += 4;
    } else if (ageInDays > 180) {
      authenticityScore -= 6;
      addUnique(riskSignals, "The posting appears unusually old.");
    }
  }

  const validThrough = parseDate(sourceCheck?.validThrough);
  if (validThrough && validThrough.getTime() < Date.now()) {
    authenticityScore -= 20;
    addUnique(riskSignals, "The source page says the job posting has already expired.");
  }

  if (
    sourceCheck?.hiringOrganization
    && app.companyName.trim()
    && normalizeText(sourceCheck.hiringOrganization) !== normalizeText(app.companyName)
  ) {
    authenticityScore -= 8;
    addUnique(riskSignals, "The company name on the source page does not match the tracked application.");
  }

  if (sourceCheck?.domain) {
    addEvidence(evidence, {
      source: "source_url",
      sentiment: sourceCheck.reachable === false ? "warning" : "neutral",
      label: "Source domain",
      detail: sourceCheck.domain,
    });
  }

  if (sourceCheck?.datePosted) {
    addEvidence(evidence, {
      source: "source_url",
      sentiment: "positive",
      label: "Posting date",
      detail: sourceCheck.datePosted,
    });
  }

  const resume = await getPreferredResume(userId);
  let candidateFitScore: number | null = null;
  let matchedSkills: string[] = [];
  let missingSkills: string[] = [];

  if (resume) {
    const profile = extractUserMatchProfile(resume);
    const resumeSkills = new Set(dedupeSkills(profile.skills));
    const requiredSkills = dedupeSkills(app.requiredSkills);
    const preferredSkills = dedupeSkills(app.preferredSkills);
    const fallbackSkills = dedupeSkills([
      ...(app.parsedJdData?.keywords ?? []).slice(0, 8),
      ...(app.parsedJdData?.industryTerms ?? []).slice(0, 6),
    ]);
    const targetRequiredSkills = requiredSkills.length > 0 ? requiredSkills : fallbackSkills;
    const titleBoost = getTitleFitBoost(app.roleTitle, profile.titles);

    if (targetRequiredSkills.length > 0 || app.roleTitle.trim()) {
      matchedSkills = targetRequiredSkills.filter((skill) => resumeSkills.has(skill));
      missingSkills = targetRequiredSkills.filter((skill) => !resumeSkills.has(skill));
      const matchedPreferred = preferredSkills.filter((skill) => resumeSkills.has(skill));

      const requiredScore =
        targetRequiredSkills.length > 0
          ? (matchedSkills.length / targetRequiredSkills.length) * 70
          : 35;
      const preferredScore =
        preferredSkills.length > 0
          ? (matchedPreferred.length / preferredSkills.length) * 15
          : 0;

      candidateFitScore = clampScore(requiredScore + preferredScore + titleBoost);

      addEvidence(evidence, {
        source: "resume",
        sentiment: candidateFitScore >= 70 ? "positive" : candidateFitScore >= 45 ? "neutral" : "warning",
        label: "Resume fit",
        detail:
          targetRequiredSkills.length > 0
            ? `Matched ${matchedSkills.length}/${targetRequiredSkills.length} core skills`
            : "Fit estimated from role/title alignment",
      });
    }
  } else {
    addUnique(riskSignals, "No primary resume is available, so candidate fit is still unknown.");
  }

  const candidateFitVerdict = getCandidateFitVerdict(candidateFitScore);
  const finalAuthenticityScore = clampScore(authenticityScore);
  const overallScore =
    candidateFitScore === null
      ? finalAuthenticityScore
      : clampScore(finalAuthenticityScore * 0.65 + candidateFitScore * 0.35);
  const recommendation = getRecommendation(finalAuthenticityScore, candidateFitScore, riskSignals);

  const nextSteps: string[] = [];
  if (recommendation === "strong_apply") {
    nextSteps.push("Prioritize this role and tailor your resume before applying.");
  }
  if (recommendation === "apply_with_focus") {
    nextSteps.push("Tailor your resume to the missing skills before you apply.");
  }
  if (recommendation === "investigate_first") {
    nextSteps.push("Verify the hiring team, ATS page, and recency before spending time on this role.");
  }
  if (recommendation === "avoid") {
    nextSteps.push("Skip this role unless you can independently verify the company and process.");
  }
  if (!sourceCheck && app.sourceUrl) {
    nextSteps.push("Run an enriched check once external verification is enabled for this job.");
  }
  if (!resume) {
    nextSteps.push("Upload or mark a primary resume so ApplyX can score your fit.");
  } else if (missingSkills.length > 0) {
    nextSteps.push(`Address the highest-priority missing skills: ${missingSkills.slice(0, 3).join(", ")}.`);
  }

  const authenticityVerdict = getAuthenticityVerdict(finalAuthenticityScore);
  const fitSummary =
    candidateFitScore === null
      ? "Candidate fit is still unknown."
      : candidateFitScore >= 70
        ? "Your resume looks like a strong fit."
        : candidateFitScore >= 45
          ? "Your resume is a partial fit."
          : "Your resume looks weak against the role requirements.";

  const summary =
    authenticityVerdict === "credible"
      ? `${fitSummary} The posting has enough structure and sourcing detail to look credible.`
      : authenticityVerdict === "mixed"
        ? `${fitSummary} The posting has some good signals, but it still needs verification.`
        : `${fitSummary} The posting shows multiple risk signals and should be treated carefully.`;

  return {
    version: 1,
    provider: "rules-v1",
    mode: options.allowExternalSourceCheck ? "enriched" : "baseline",
    generatedAt: new Date().toISOString(),
    summary,
    recommendation,
    overallScore,
    authenticityScore: finalAuthenticityScore,
    authenticityVerdict,
    candidateFitScore,
    candidateFitVerdict,
    matchedSkills,
    missingSkills,
    positiveSignals,
    riskSignals,
    nextSteps,
    evidence,
    sourceCheck,
  };
}

export async function refreshTrackedApplicationAuthenticityAssessment(
  userId: string,
  applicationId: string,
  options: AssessmentOptions = {},
) {
  const application = await getTrackedApplicationForUser(userId, applicationId);

  if (!application) {
    return null;
  }

  const assessment = await generateTrackedApplicationAuthenticityAssessment(userId, application, options);

  await dbQuery(
    `update public.tracked_applications
     set
       authenticity_score = $1,
       authenticity_assessment = $2::jsonb,
       authenticity_checked_at = $3
     where id = $4 and user_id = $5`,
    [
      assessment.authenticityScore,
      JSON.stringify(assessment),
      assessment.generatedAt,
      applicationId,
      userId,
    ],
  );

  return getTrackedApplicationForUser(userId, applicationId);
}
