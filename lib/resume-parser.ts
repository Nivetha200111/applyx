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
  private openai: OpenAI | null = null;
  private debugMode = true; // Enable debug logging

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_BASE_URL || undefined,
        });
        console.log("[ResumeParser] AI client initialized with base URL:", process.env.OPENAI_BASE_URL);
      } catch (error) {
        console.error("[ResumeParser] Failed to initialize OpenAI client:", error);
        this.openai = null;
      }
    } else {
      console.warn("[ResumeParser] No OPENAI_API_KEY found in environment");
    }
  }

  async parseResume(file: Buffer): Promise<UserProfile> {
    console.log("[ResumeParser] Starting resume parse, file size:", file.length, "bytes");
    
    // Extract text from file
    const text = await this.extractText(file);
    
    console.log("[ResumeParser] Extracted text length:", text.length);
    if (this.debugMode && text.length > 0) {
      console.log("[ResumeParser] First 500 chars of text:", text.substring(0, 500));
    }
    
    if (!text || text.trim().length < 10) {
      console.error("[ResumeParser] No meaningful text extracted from file!");
      // Still try to parse what we have
      return this.enhancedHeuristicParse(text || "");
    }

    let finalProfile: UserProfile = {};

    // Try AI parsing first if configured
    if (this.openai) {
      console.log("[ResumeParser] Attempting AI parsing with Grok...");
      try {
        const aiResult = await this.parseWithAI(text);
        console.log("[ResumeParser] AI parsing result:", JSON.stringify(aiResult, null, 2));
        
        if (this.isValidProfile(aiResult)) {
          console.log("[ResumeParser] AI result is valid, using it as base");
          finalProfile = aiResult;
        } else {
          console.warn("[ResumeParser] AI result is not valid, will rely on heuristic");
        }
      } catch (err) {
        console.error("[ResumeParser] AI parsing failed:", err);
      }
    }

    // Always run heuristic parsing as fallback or to fill gaps
    console.log("[ResumeParser] Running heuristic parsing...");
    const heuristicResult = this.enhancedHeuristicParse(text);
    console.log("[ResumeParser] Heuristic result:", JSON.stringify(heuristicResult, null, 2));

    // Merge results, preferring AI but filling gaps with heuristic
    const mergedProfile = this.mergeProfiles(finalProfile, heuristicResult);
    console.log("[ResumeParser] Final merged profile:", JSON.stringify(mergedProfile, null, 2));

    // Clean up the profile before returning
    return this.cleanProfile(mergedProfile);
  }

  private async parseWithAI(text: string): Promise<UserProfile> {
    if (!this.openai) throw new Error("AI client not initialized");

    const modelEnv = process.env.OPENAI_MODEL?.trim();
    const model = modelEnv || "grok-4"; // Default to grok-4
    
    console.log("[ResumeParser] Using model:", model);

    // Simple, clear prompt for Grok
    const prompt = `Extract these details from the resume below and return as JSON:
- name (person's full name)
- email (email address)
- phone (phone number)
- location (city/country)
- skills (array of technical skills)
- experience (array with company, role, duration)
- experience_years (total years of experience as number)

Resume text:
${text.slice(0, 8000)}

Return ONLY the JSON object, no other text.`;

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { 
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const raw = response.choices[0]?.message?.content || "{}";
      console.log("[ResumeParser] Raw AI response:", raw.substring(0, 500));
      
      // Clean up the response
      let jsonStr = raw;
      
      // Remove markdown formatting
      jsonStr = jsonStr.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
      
      // Extract JSON object
      const jsonMatch = jsonStr.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
        console.log("[ResumeParser] Extracted JSON:", jsonStr.substring(0, 500));
      }

      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (error) {
      console.error("[ResumeParser] Error calling AI or parsing response:", error);
      if (error instanceof Error) {
        console.error("[ResumeParser] Error details:", error.message);
      }
      throw error;
    }
  }

  private async extractText(file: Buffer): Promise<string> {
    if (!file || file.length === 0) {
      console.error("[ResumeParser] Empty file buffer");
      return "";
    }

    // Check if it's a PDF
    const headerBytes = file.subarray(0, Math.min(4, file.length));
    const header = headerBytes.toString("ascii");
    const isPDF = header === "%PDF";
    
    console.log("[ResumeParser] File header:", header, "isPDF:", isPDF);

    if (isPDF) {
      try {
        console.log("[ResumeParser] Attempting PDF extraction...");
        // Import pdf-parse, handling both default and named exports
        let pdfParse: any;
        try {
          const mod = await import("pdf-parse");
          pdfParse = (mod && typeof mod === "object" && "default" in mod) ? mod.default : mod;
        } catch (err) {
          console.error("[ResumeParser] Failed to import pdf-parse:", err);
          pdfParse = null;
        }
        if (pdfParse) {
          const data = await pdfParse(file);
          if (data?.text) {
            console.log("[ResumeParser] PDF extracted, text length:", data.text.length);
            return data.text;
          }
        }
      } catch (error) {
        console.error("[ResumeParser] PDF parsing error:", error);
      }
    }

    // Try as text with different encodings
    const encodings = ['utf-8', 'utf16le', 'latin1', 'ascii'];
    for (const encoding of encodings) {
      try {
        const text = file.toString(encoding as BufferEncoding);
        if (text && text.trim().length > 10) {
          // Check if text seems valid (has letters)
          if (/[a-zA-Z]{3,}/.test(text)) {
            console.log(`[ResumeParser] Successfully decoded as ${encoding}`);
            return text;
          }
        }
      } catch (error) {
        console.log(`[ResumeParser] Failed to decode as ${encoding}`);
      }
    }

    // Last resort - return raw UTF-8
    console.warn("[ResumeParser] Could not properly decode file, returning raw UTF-8");
    return file.toString('utf-8');
  }

  private enhancedHeuristicParse(text: string): UserProfile {
    console.log("[ResumeParser] Starting heuristic parse...");
    
    // Clean text
    const cleanText = text
      .replace(/\u0000/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Extract email - multiple patterns
    let email: string | undefined;
    const emailPatterns = [
      /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/gi,
      /email\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /([a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,})/gi
    ];
    
    for (const pattern of emailPatterns) {
      const matches = cleanText.match(pattern);
      if (matches && matches.length > 0) {
        // Clean up the email
        email = matches[0].replace(/\s/g, '').toLowerCase();
        if (email.includes('@')) {
          console.log("[ResumeParser] Found email:", email);
          break;
        }
      }
    }

    // Extract name - try multiple approaches
    let name: string | undefined;
    
    // Method 1: Look at first few lines
    const lines = cleanText.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
    console.log("[ResumeParser] First 5 lines:", lines.slice(0, 5));
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Name is usually 2-4 words, starts with capital letter
      if (line.length < 50 && /^[A-Z][a-z]/.test(line)) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          // Make sure it's not a common header
          if (!/^(resume|cv|curriculum|experience|education|skills|profile)/i.test(line)) {
            name = line;
            console.log("[ResumeParser] Found name from lines:", name);
            break;
          }
        }
      }
    }

    // Method 2: Look for name pattern near email
    if (!name && email) {
      const emailIndex = cleanText.toLowerCase().indexOf(email);
      if (emailIndex > 0) {
        const beforeEmail = cleanText.substring(Math.max(0, emailIndex - 200), emailIndex);
        const nameMatch = beforeEmail.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
        if (nameMatch) {
          name = nameMatch[1];
          console.log("[ResumeParser] Found name near email:", name);
        }
      }
    }

    // Method 3: Extract from email if possible
    if (!name && email) {
      const emailPart = email.split('@')[0];
      // Convert email format to name (john.doe -> John Doe)
      if (emailPart.includes('.')) {
        name = emailPart.split('.').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        console.log("[ResumeParser] Derived name from email:", name);
      }
    }

    // Extract phone
    const phoneMatch = cleanText.match(/(?:\+?1?\s*)?(?:\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}/);
    const phone = phoneMatch ? phoneMatch[0].trim() : undefined;
    if (phone) console.log("[ResumeParser] Found phone:", phone);

    // Extract skills - look for common programming keywords
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 'node',
      'express', 'django', 'spring', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes',
      'git', 'ci/cd', 'agile', 'html', 'css', 'c++', 'c#', 'ruby', 'go', 'rust',
      'machine learning', 'data science', 'devops', 'terraform', 'jenkins'
    ];
    
    const foundSkills = new Set<string>();
    const lowerText = cleanText.toLowerCase();
    for (const skill of skillKeywords) {
      if (lowerText.includes(skill)) {
        // Use proper casing
        const properSkill = skill.split(' ').map(s => 
          s.charAt(0).toUpperCase() + s.slice(1)
        ).join(' ');
        foundSkills.add(properSkill);
      }
    }
    
    const skills = Array.from(foundSkills);
    if (skills.length > 0) {
      console.log("[ResumeParser] Found skills:", skills);
    }

    // Calculate experience years
    let experience_years = 0;
    const expMatch = cleanText.match(/(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/i);
    if (expMatch) {
      experience_years = parseInt(expMatch[1]);
      console.log("[ResumeParser] Found experience years:", experience_years);
    }

    const result = {
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      skills: skills.length > 0 ? skills : undefined,
      experience_years: experience_years > 0 ? experience_years : undefined
    };

    return result;
  }

  private isValidProfile(profile: any): boolean {
    if (!profile || typeof profile !== 'object') return false;
    
    // Count how many meaningful fields we have
    let validFields = 0;
    
    if (profile.name && typeof profile.name === 'string' && profile.name.length > 1) validFields++;
    if (profile.email && typeof profile.email === 'string' && profile.email.includes('@')) validFields++;
    if (profile.phone && typeof profile.phone === 'string') validFields++;
    if (Array.isArray(profile.skills) && profile.skills.length > 0) validFields++;
    if (profile.experience_years && typeof profile.experience_years === 'number') validFields++;
    
    return validFields >= 2; // Need at least 2 valid fields
  }

  private mergeProfiles(primary: UserProfile, secondary: UserProfile): UserProfile {
    return {
      name: primary.name || secondary.name,
      email: primary.email || secondary.email,
      phone: primary.phone || secondary.phone,
      location: primary.location || secondary.location,
      skills: this.mergeArrays(primary.skills, secondary.skills),
      experience: primary.experience || secondary.experience,
      education: primary.education || secondary.education,
      desired_roles: primary.desired_roles || secondary.desired_roles,
      experience_years: primary.experience_years || secondary.experience_years,
    };
  }

  private mergeArrays<T>(arr1?: T[], arr2?: T[]): T[] | undefined {
    if (!arr1 && !arr2) return undefined;
    if (!arr1) return arr2;
    if (!arr2) return arr1;
    
    const combined = [...new Set([...arr1, ...arr2])];
    return combined.length > 0 ? combined : undefined;
  }

  private cleanProfile(profile: UserProfile): UserProfile {
    const cleaned: UserProfile = {};
    
    // Only include fields with actual values
    if (profile.name && profile.name !== 'Unknown' && profile.name !== 'undefined') {
      cleaned.name = profile.name;
    }
    
    if (profile.email && profile.email !== 'Unknown' && profile.email !== 'unknown@example.com') {
      cleaned.email = profile.email;
    }
    
    if (profile.phone && profile.phone !== 'Unknown') {
      cleaned.phone = profile.phone;
    }
    
    if (profile.location && profile.location !== 'Unknown') {
      cleaned.location = profile.location;
    }
    
    if (profile.skills && profile.skills.length > 0) {
      cleaned.skills = profile.skills;
    }
    
    if (profile.experience && profile.experience.length > 0) {
      cleaned.experience = profile.experience;
    }
    
    if (profile.education && profile.education.length > 0) {
      cleaned.education = profile.education;
    }
    
    if (profile.desired_roles && profile.desired_roles.length > 0) {
      cleaned.desired_roles = profile.desired_roles;
    }
    
    if (profile.experience_years && profile.experience_years > 0) {
      cleaned.experience_years = profile.experience_years;
    }
    
    console.log("[ResumeParser] Cleaned profile:", JSON.stringify(cleaned, null, 2));
    return cleaned;
  }
}