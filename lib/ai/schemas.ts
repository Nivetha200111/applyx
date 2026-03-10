import { z } from "zod";

const requiredString = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return typeof value === "string" ? value : String(value);
}, z.string());

const nullableOptionalString = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().optional(),
);

const stringArray = z.preprocess((value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (item === null || item === undefined ? "" : String(item).trim()))
    .filter(Boolean);
}, z.array(z.string()));

const optionalStringArray = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((item) => (item === null || item === undefined ? "" : String(item).trim()))
    .filter(Boolean);
}, z.array(z.string()).optional());

export const parsedResumeSchema = z.object({
  personal: z.object({
    name: requiredString,
    email: requiredString,
    phone: requiredString,
    location: requiredString,
    linkedin: nullableOptionalString,
    github: nullableOptionalString,
    portfolio: nullableOptionalString,
  }),
  summary: nullableOptionalString,
  experience: z.array(
    z.object({
      title: requiredString,
      company: requiredString,
      location: nullableOptionalString,
      startDate: requiredString,
      endDate: requiredString,
      bullets: stringArray,
    }),
  ),
  education: z.array(
    z.object({
      degree: requiredString,
      institution: requiredString,
      year: requiredString,
      gpa: nullableOptionalString,
      highlights: optionalStringArray,
    }),
  ),
  skills: z.object({
    technical: stringArray,
    tools: stringArray,
    soft: optionalStringArray,
    languages: optionalStringArray,
    certifications: optionalStringArray,
  }),
  projects: z
    .array(
      z.object({
        name: requiredString,
        description: requiredString,
        techStack: stringArray,
        link: nullableOptionalString,
        bullets: optionalStringArray,
      }),
    )
    .optional(),
  achievements: optionalStringArray,
  publications: optionalStringArray,
});

export const parsedJdSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: nullableOptionalString,
  type: nullableOptionalString,
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  requiredExperience: z.string(),
  keyResponsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  industryTerms: z.array(z.string()),
  educationRequirement: nullableOptionalString,
});

export const trackerParsedJdSchema = parsedJdSchema.extend({
  salaryRange: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("INR"),
    })
    .nullable()
    .optional(),
  workMode: z.enum(["remote", "hybrid", "onsite", "unknown"]).optional(),
  applicationDeadline: nullableOptionalString,
  sourcePlatform: nullableOptionalString,
});

export const tailorChangeSchema = z.object({
  type: z.enum(["rewrite", "reorder", "add", "remove"]),
  section: z.string(),
  description: z.string(),
});

export const tailorResultSchema = z.object({
  tailored_resume: parsedResumeSchema,
  match_score_before: z.number().min(0).max(100),
  match_score_after: z.number().min(0).max(100),
  changes: z.array(tailorChangeSchema),
});
