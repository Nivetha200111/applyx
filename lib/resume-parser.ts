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
    // For now, let's use a simple text extraction approach
    // This will work for both PDF and text files
    let text: string;
    
    try {
      // Try to extract text from the buffer
      text = file.toString('utf-8');
      
      // If it's mostly binary data, try to extract readable text
      if (text.length < 100 || text.includes('\0')) {
        // This is likely a PDF, so we'll use a simple approach
        // Extract any readable text from the PDF
        const readableText = text.replace(/[^\x20-\x7E\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
        text = readableText || 'PDF content - please provide text version for better parsing';
      }
    } catch {
      text = 'Unable to parse file content';
    }

    const model = process.env.OPENAI_MODEL || "grok-2-1212";

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
    } catch {
      // Fallback: extract first JSON object from the text
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {}
      }
      // Final fallback minimal shape
      return { skills: [], experience: [], education: [], desired_roles: [] };
    }
  }
}



