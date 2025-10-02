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
    let text: string;
    
    try {
      // Check if it's a PDF by looking at the header
      const isPDF = file.toString('ascii', 0, 4) === '%PDF';
      
      if (isPDF) {
        // For PDFs, extract readable text
        const pdfText = file.toString('utf-8');
        // Extract text between PDF objects
        const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
        if (textMatches) {
          text = textMatches
            .map(match => match.replace(/BT\s+/, '').replace(/ET/, ''))
            .join(' ')
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } else {
          // Fallback: extract any readable text
          text = pdfText
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000); // Limit size
        }
        
        if (!text || text.length < 50) {
          text = 'PDF content extracted but may be incomplete. Please provide a text version for better parsing.';
        }
      } else {
        // For text files, use as-is
        text = file.toString('utf-8');
      }
    } catch (error) {
      console.error('File parsing error:', error);
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



