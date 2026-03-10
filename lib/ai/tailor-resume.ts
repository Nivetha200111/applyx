import { buildResumeTailoringPrompt } from "@/lib/ai/prompts";
import { completeJson } from "@/lib/ai/client";
import { tailorResultSchema } from "@/lib/ai/schemas";
import type { ModelTier, ParsedJD, ParsedResume, TailorResult } from "@/lib/types";

function normalize(value: string | undefined | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";
}

function hasExplicitAiEngineerTitle(resume: ParsedResume) {
  return resume.experience.some((job) =>
    /\b(ai engineer|artificial intelligence engineer|machine learning engineer|ml engineer|llm engineer|genai engineer)\b/i.test(
      job.title,
    ),
  );
}

function restoreExperienceIdentity(
  originalResume: ParsedResume,
  tailoredResume: ParsedResume,
) {
  let restoredCount = 0;

  const restoredExperience = tailoredResume.experience.map((job, index) => {
    const exactMatch = originalResume.experience.find((candidate) =>
      normalize(candidate.company) === normalize(job.company)
      && normalize(candidate.startDate) === normalize(job.startDate)
      && normalize(candidate.endDate) === normalize(job.endDate),
    );

    const fallbackMatch = originalResume.experience[index];
    const source = exactMatch ?? fallbackMatch;

    if (!source) {
      return job;
    }

    const titleChanged = normalize(job.title) !== normalize(source.title);
    const companyChanged = normalize(job.company) !== normalize(source.company);
    const datesChanged =
      normalize(job.startDate) !== normalize(source.startDate)
      || normalize(job.endDate) !== normalize(source.endDate);

    if (titleChanged || companyChanged || datesChanged) {
      restoredCount += 1;
    }

    return {
      ...job,
      title: source.title,
      company: source.company,
      startDate: source.startDate,
      endDate: source.endDate,
      location: source.location ?? job.location,
    };
  });

  return {
    restoredExperience,
    restoredCount,
  };
}

function softenUnsupportedAiIdentity(
  originalResume: ParsedResume,
  tailoredResume: ParsedResume,
) {
  if (hasExplicitAiEngineerTitle(originalResume) || !tailoredResume.summary) {
    return { summary: tailoredResume.summary, adjusted: false };
  }

  const softenedSummary = tailoredResume.summary
    .replace(/\bGenerative AI Engineer\b/gi, "Software Engineer with Generative AI experience")
    .replace(/\bLLM Engineer\b/gi, "Software Engineer with LLM experience")
    .replace(/\bMachine Learning Engineer\b/gi, "Software Engineer with machine learning experience")
    .replace(/\bML Engineer\b/gi, "Software Engineer with machine learning experience")
    .replace(/\bAI Engineer\b/gi, "Software Engineer with AI systems experience");

  return {
    summary: softenedSummary,
    adjusted: softenedSummary !== tailoredResume.summary,
  };
}

function enforceResumeAuthenticity(
  originalResume: ParsedResume,
  tailorResult: TailorResult,
): TailorResult {
  const { restoredExperience, restoredCount } = restoreExperienceIdentity(
    originalResume,
    tailorResult.tailored_resume,
  );
  const { summary, adjusted } = softenUnsupportedAiIdentity(
    originalResume,
    tailorResult.tailored_resume,
  );

  const changes = [...tailorResult.changes];

  if (restoredCount > 0) {
    changes.push({
      type: "rewrite",
      section: "Professional Experience",
      description:
        "Restored original job titles, employers, and dates so the tailored resume does not rename the candidate's actual roles.",
    });
  }

  if (adjusted) {
    changes.push({
      type: "rewrite",
      section: "Professional Summary",
      description:
        "Softened the summary back to a software-engineering identity with AI experience instead of upgrading the candidate to an unsupported AI-specific title.",
    });
  }

  return {
    ...tailorResult,
    tailored_resume: {
      ...tailorResult.tailored_resume,
      summary,
      experience: restoredExperience,
    },
    changes,
  };
}

export async function tailorResumeWithAi(
  parsedResume: ParsedResume,
  parsedJd: ParsedJD,
  modelTier: ModelTier,
): Promise<{
  tailorResult: TailorResult;
  usedModel: string;
}> {
  const result = await completeJson({
    prompt: buildResumeTailoringPrompt(parsedResume, parsedJd),
    modelTier,
    maxTokens: 2800,
    validate: (value) => tailorResultSchema.parse(value),
  });

  return {
    tailorResult: enforceResumeAuthenticity(parsedResume, result.data),
    usedModel: result.usedModel,
  };
}
