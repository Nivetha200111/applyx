import type { ParsedResume } from "@/lib/types";
import type { ExternalJob, ScoredJob } from "@/lib/jobs/types";

type MatchProfile = {
  skills: string[];
  titles: string[];
};

const SKILL_ALIASES: Record<string, string> = {
  "js": "javascript",
  "ts": "typescript",
  "react.js": "react",
  "reactjs": "react",
  "next.js": "nextjs",
  "node.js": "node",
  "nodejs": "node",
  "vue.js": "vue",
  "vuejs": "vue",
  "nuxt.js": "nuxt",
  "k8s": "kubernetes",
  "postgres": "postgresql",
  "pg": "postgresql",
  "mongo": "mongodb",
  "golang": "go",
  "py": "python",
  "c#": "csharp",
  "c++": "cpp",
  "dotnet": ".net",
  ".net core": ".net",
  "rest api": "rest apis",
  "restful api": "rest apis",
  "ci/cd": "cicd",
  "ci cd": "cicd",
  "github actions": "github actions",
  "google cloud": "gcp",
  "amazon web services": "aws",
  "react native": "react native",
  "machine learning": "ml",
  "artificial intelligence": "ai",
};

const SPOKEN_LANGUAGE_SKILLS = new Set([
  "english",
  "hindi",
  "tamil",
  "telugu",
  "kannada",
  "malayalam",
  "french",
  "german",
  "spanish",
  "japanese",
  "mandarin",
  "arabic",
]);

const PROGRAMMING_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "ruby",
  "php",
  "scala",
  "rust",
  "kotlin",
  "swift",
  "objective-c",
  "c",
  "cpp",
  "csharp",
  ".net",
  "sql",
  "r",
  "matlab",
  "dart",
  "elixir",
  "haskell",
  "perl",
  "bash",
  "shell",
]);

const SKILL_KEYWORDS = [
  "react",
  "nextjs",
  "typescript",
  "javascript",
  "node",
  "python",
  "java",
  "go",
  "ruby",
  "php",
  "csharp",
  "cpp",
  ".net",
  "sql",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "graphql",
  "rest apis",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "terraform",
  "linux",
  "git",
  "github actions",
  "cicd",
  "devops",
  "react native",
  "ios",
  "android",
  "figma",
  "tailwind",
  "html",
  "css",
  "sass",
  "vue",
  "angular",
  "nuxt",
  "svelte",
  "firebase",
  "supabase",
  "airflow",
  "spark",
  "data engineering",
  "data analysis",
  "ml",
  "ai",
  "nlp",
  "computer vision",
  "microservices",
  "system design",
  "testing",
  "automation",
];

const TITLE_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "with",
]);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function canonicalizeSkill(value: string) {
  const normalized = normalizeWhitespace(value.toLowerCase())
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ");

  return SKILL_ALIASES[normalized] ?? normalized;
}

function dedupeSkills(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = canonicalizeSkill(value);
    if (!normalized || seen.has(normalized) || TITLE_STOP_WORDS.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function tokenizeTitle(value: string) {
  return normalizeWhitespace(value.toLowerCase())
    .split(/[^a-z0-9.+#]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !TITLE_STOP_WORDS.has(token));
}

function hasTokenMatch(text: string, skill: string) {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (/[+#.]/.test(skill) || skill.length <= 3 || skill.includes(" ")) {
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
  }

  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function extractTagsFromText(text: string) {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  for (const skill of SKILL_KEYWORDS) {
    if (hasTokenMatch(lower, skill)) {
      tags.push(skill);
    }
  }

  return dedupeSkills(tags);
}

function normalizeJobTags(tags: string[]) {
  return dedupeSkills(tags);
}

function programmingLanguagesFromResume(values: string[] | undefined) {
  if (!values) {
    return [];
  }

  return values.filter((value) => {
    const normalized = canonicalizeSkill(value);
    return PROGRAMMING_LANGUAGES.has(normalized) && !SPOKEN_LANGUAGE_SKILLS.has(normalized);
  });
}

export function extractUserMatchProfile(parsedResume: ParsedResume): MatchProfile {
  const skills = dedupeSkills([
    ...(parsedResume.skills.technical ?? []),
    ...(parsedResume.skills.tools ?? []),
    ...programmingLanguagesFromResume(parsedResume.skills.languages),
    ...((parsedResume.projects ?? []).flatMap((project) => project.techStack ?? [])),
  ]);

  const titles = (parsedResume.experience ?? [])
    .slice(0, 2)
    .map((experience) => normalizeWhitespace(experience.title))
    .filter(Boolean);

  return {
    skills,
    titles,
  };
}

export function inferWorkMode(text: string) {
  const lower = text.toLowerCase();

  if (/\bhybrid\b/.test(lower)) {
    return "hybrid" as const;
  }

  if (/\b(onsite|on-site|in office|in-office)\b/.test(lower)) {
    return "onsite" as const;
  }

  if (/\bremote\b/.test(lower)) {
    return "remote" as const;
  }

  return "unknown" as const;
}

function getTitleBoost(jobTitle: string, userTitles: string[]) {
  const jobWords = tokenizeTitle(jobTitle);

  if (jobWords.length === 0) {
    return 0;
  }

  let bestScore = 0;

  for (const title of userTitles) {
    const titleWords = new Set(tokenizeTitle(title));
    let overlap = 0;

    for (const word of jobWords) {
      if (titleWords.has(word)) {
        overlap += 1;
      }
    }

    bestScore = Math.max(bestScore, (overlap / jobWords.length) * 15);
  }

  return bestScore;
}

function getRecencyBoost(postedAt: string) {
  const timestamp = new Date(postedAt).getTime();

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  const daysSincePosted = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return Math.max(0, 10 - daysSincePosted * 0.3);
}

export function scoreJobs(
  jobs: ExternalJob[],
  userSkills: string[],
  userTitles: string[],
): ScoredJob[] {
  const normalizedUserSkills = new Set(dedupeSkills(userSkills));

  return jobs
    .map((job) => {
      const normalizedTags = normalizeJobTags(job.tags);
      const matchedSkills = normalizedTags.filter((tag) => normalizedUserSkills.has(tag));
      const missingSkills = normalizedTags.filter((tag) => !normalizedUserSkills.has(tag));
      const tagDenominator = Math.max(normalizedTags.length, 1);
      const tagScore = (matchedSkills.length / tagDenominator) * 70;
      const titleBoost = getTitleBoost(job.title, userTitles);
      const recencyBoost = getRecencyBoost(job.postedAt);
      const salaryBonus = job.salaryMin !== null || job.salaryMax !== null ? 5 : 0;

      return {
        ...job,
        tags: normalizedTags,
        matchScore: Math.round(Math.min(100, tagScore + titleBoost + recencyBoost + salaryBonus)),
        matchedSkills,
        missingSkills,
      } satisfies ScoredJob;
    })
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
    });
}
