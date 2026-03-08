import { completeJson } from "@/lib/ai/client";
import { trackerParsedJdSchema } from "@/lib/ai/schemas";
import type { TrackerParsedJD } from "@/lib/types";

function buildTrackerJdParsePrompt(jdText: string) {
  return `You are an expert job description parser for job seekers. Extract structured data from the following job description.

Rules:
- Extract the job title, company name, and location precisely
- Separate required vs preferred skills
- Extract salary range if mentioned using the most likely currency (examples: "$120k-$150k", "£70k-£90k", "€60k-€80k", "X-Y LPA")
- Detect work mode: remote, hybrid, onsite, or unknown
- Identify experience level requirements
- Extract ATS-relevant keywords and industry terms
- Detect source platform from URL patterns if any (linkedin, indeed, greenhouse, lever, wellfound, naukri, instahyre, etc.)
- Return ONLY valid JSON, no markdown

Return the data in this exact schema:
{
  "title": "string",
  "company": "string",
  "location": "string (optional)",
  "type": "string (optional)",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "requiredExperience": "string",
  "keyResponsibilities": ["string"],
  "keywords": ["string"],
  "industryTerms": ["string"],
  "educationRequirement": "string (optional)",
  "salaryRange": { "min": number, "max": number, "currency": "USD|EUR|GBP|INR|..." } or null,
  "workMode": "remote" | "hybrid" | "onsite" | "unknown",
  "applicationDeadline": "string (optional, ISO date if found)" or null,
  "sourcePlatform": "string (optional)" or null
}

Job Description:
"""
${jdText}
"""`;
}

export async function parseJdForTracker(
  jdText: string,
): Promise<{
  parsed: TrackerParsedJD;
  usedModel: string;
}> {
  // Always use demo tier (cheapest models) for tracker parsing
  const result = await completeJson({
    prompt: buildTrackerJdParsePrompt(jdText),
    modelTier: "demo",
    validate: (value) => trackerParsedJdSchema.parse(value),
  });

  return {
    parsed: result.data,
    usedModel: result.usedModel,
  };
}
