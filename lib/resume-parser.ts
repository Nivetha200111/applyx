import { OpenAI } from "openai";

export type UserProfile = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  experience?: Array<{
    company?: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<Record<string, unknown>>;
  desired_roles?: string[];
  experience_years?: number;
};

export class ResumeParser {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "ollama",
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }

  async parseResume(file: Buffer): Promise<UserProfile> {
    const pdfModule: any = await import("pdf-parse");
    const pdfParseFn: (f: Buffer) => Promise<{ text: string }> =
      (pdfModule && (pdfModule.default || pdfModule)) as any;
    const pdfData = await pdfParseFn(file);
    const text = pdfData.text;

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a parser. Return ONLY valid JSON with keys: name, email, phone, location, skills (array), experience (array of {company, role, duration, description}), education (array), desired_roles (array), experience_years (number). No commentary.",
        },
        { role: "user", content: text },
      ],
      // Avoid response_format for broader provider compatibility (e.g., Ollama)
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    // Try strict JSON parse first
    try {
      return JSON.parse(raw);
    } catch (_) {
      // Fallback: extract first JSON object from the text
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (_) {}
      }
      // Final fallback minimal shape
      return { skills: [], experience: [], education: [], desired_roles: [] };
    }
  }
}



