import { z } from "zod";

export const parsedResumeSchema = z.object({
  personal: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional(),
  }),
  summary: z.string().optional(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
      gpa: z.string().optional(),
      highlights: z.array(z.string()).optional(),
    }),
  ),
  skills: z.object({
    technical: z.array(z.string()),
    tools: z.array(z.string()),
    soft: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  }),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        techStack: z.array(z.string()),
        link: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  achievements: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
});

export const parsedJdSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  type: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  requiredExperience: z.string(),
  keyResponsibilities: z.array(z.string()),
  keywords: z.array(z.string()),
  industryTerms: z.array(z.string()),
  educationRequirement: z.string().optional(),
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
