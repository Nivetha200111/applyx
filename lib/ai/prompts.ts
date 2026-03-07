import type { ParsedJD, ParsedResume } from "@/lib/types";

const parsedResumeSchema = `{
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "portfolio": "string (optional)"
  },
  "summary": "string (optional)",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string (optional)",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string (optional)",
      "highlights": ["string"]
    }
  ],
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"],
    "languages": ["string"],
    "certifications": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "techStack": ["string"],
      "link": "string (optional)",
      "bullets": ["string"]
    }
  ],
  "achievements": ["string"],
  "publications": ["string"]
}`;

const parsedJdSchema = `{
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
  "educationRequirement": "string (optional)"
}`;

export function buildResumeParsingPrompt(resumeText: string) {
  return `You are an expert resume parser. Extract ALL information from the following resume text into structured JSON.

Rules:
- Extract EVERY bullet point verbatim — do not summarize or omit
- Preserve exact dates, company names, and job titles
- Categorize skills into: technical, tools, soft, languages, certifications
- If information is ambiguous, make your best inference and include it
- Return ONLY valid JSON, no markdown, no explanation

Return the data in this exact schema:
${parsedResumeSchema}

Resume text:
"""
${resumeText}
"""`;
}

export function buildJdAnalysisPrompt(jdText: string) {
  return `You are an expert job description analyst specializing in ATS keyword extraction. Analyze the following job description and extract structured data.

Rules:
- Separate required vs preferred skills precisely
- Extract EVERY keyword that an ATS system would scan for
- Include industry-specific terminology and acronyms
- Identify the seniority level and years of experience expected
- Return ONLY valid JSON, no markdown

Return the data in this exact schema:
${parsedJdSchema}

Job Description:
"""
${jdText}
"""`;
}

export function buildResumeTailoringPrompt(
  parsedResume: ParsedResume,
  parsedJd: ParsedJD,
) {
  return `You are an expert resume writer and ATS optimization specialist. Your job is to tailor the candidate's resume to perfectly match the target job description.

## INPUTS
- Original parsed resume (JSON)
- Target job description analysis (JSON)

## RULES — FOLLOW STRICTLY

### Content Rules:
1. NEVER fabricate experience, skills, or achievements the candidate doesn't have
2. REWRITE bullet points to use keywords from the JD where the candidate's experience genuinely matches
3. REORDER sections and bullets to put the most relevant experience first
4. ADD a tailored professional summary (2-3 lines) that mirrors the JD's language
5. In the skills section, PRIORITIZE skills that appear in the JD (move them to the front)
6. ADD skills from the JD to the skills section ONLY if they are reasonably implied by the candidate's experience
7. QUANTIFY achievements wherever possible (add metrics if they can be reasonably inferred)
8. Use ACTION VERBS that match the JD's tone (e.g., if JD says "drive", use "drove" in bullets)

### ATS Rules:
9. Use standard section headings: "Professional Experience", "Education", "Skills", "Projects"
10. Do NOT use tables, columns, graphics, or headers/footers (ATS can't parse them)
11. Include the EXACT job title from the JD in the summary or headline if the candidate's experience supports it
12. Spell out acronyms at least once (e.g., "Machine Learning (ML)")
13. Mirror the JD's language for skill names (e.g., if JD says "React.js" don't write "React")

### Output Rules:
14. Return the COMPLETE tailored resume in the same ParsedResume JSON schema
15. Also return a "changes" array listing every modification you made and why
16. Also return match_score_before (0-100) and match_score_after (0-100)

## INPUTS

Original Resume:
${JSON.stringify(parsedResume, null, 2)}

Target Job Description:
${JSON.stringify(parsedJd, null, 2)}

## OUTPUT FORMAT (JSON only, no markdown):
{
  "tailored_resume": ${parsedResumeSchema},
  "match_score_before": number,
  "match_score_after": number,
  "changes": [
    {"type": "rewrite|reorder|add|remove", "section": string, "description": string}
  ]
}`;
}
