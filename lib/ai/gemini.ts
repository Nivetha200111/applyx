import { GoogleGenerativeAI } from "@google/generative-ai";

// Read API key lazily — avoids module-level env issues on Vercel edge/serverless
function getApiKey(): string {
  return process.env.GEMINI_API_KEY ?? "";
}

const globalForGemini = globalThis as typeof globalThis & {
  __geminiClient?: GoogleGenerativeAI;
  __geminiKeyUsed?: string;
};

function getGeminiClient() {
  const key = getApiKey();

  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Set it in your environment variables.",
    );
  }

  // Reuse cached client only if the key hasn't changed
  if (globalForGemini.__geminiClient && globalForGemini.__geminiKeyUsed === key) {
    return globalForGemini.__geminiClient;
  }

  const client = new GoogleGenerativeAI(key);
  globalForGemini.__geminiClient = client;
  globalForGemini.__geminiKeyUsed = key;
  return client;
}

export function isGeminiConfigured() {
  return Boolean(getApiKey());
}

// ── Models ──
// Embedding: gemini-embedding-001 (stable, 3072 dims)
// Generative: gemini-2.5-flash (latest stable flash model)
const EMBEDDING_MODEL = "gemini-embedding-001";
const GENERATIVE_MODEL = "gemini-2.5-flash";

/**
 * Generate an embedding vector using Gemini Embedding 2.
 * Supports text input with up to 8192 tokens.
 */
export async function embedText(text: string): Promise<number[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Compute cosine similarity between two embedding vectors.
 * Returns a value between -1 and 1 (1 = identical meaning).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Generate text content using Gemini generative model.
 */
export async function generateContent(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GENERATIVE_MODEL,
    generationConfig: { temperature: 0.7, maxOutputTokens: 16384 },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate text content and force JSON output using responseMimeType.
 * This tells Gemini to return raw JSON without markdown fences.
 * Uses a high token limit to prevent truncation of large JSON responses.
 */
export async function generateJsonRaw(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GENERATIVE_MODEL,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 16384,
      responseMimeType: "application/json",
    },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Analyze an image using Gemini 2.0 Flash vision capabilities.
 * Accepts a base64-encoded image (without the data: prefix) and a text prompt.
 */
export async function analyzeImage(
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: GENERATIVE_MODEL,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
  ]);

  return result.response.text();
}

/**
 * Analyze an image and return structured JSON using Gemini vision.
 */
export async function analyzeImageJson<T>(
  base64Image: string,
  mimeType: string,
  prompt: string,
  validate: (value: unknown) => T,
): Promise<T> {
  const raw = await analyzeImage(base64Image, mimeType, prompt);
  const parsed = extractAndParseJson(raw);
  return validate(parsed);
}

/**
 * Extract JSON from a string that may contain markdown fences or extra text.
 */
function extractAndParseJson(raw: string): unknown {
  // Try direct parse first (works when responseMimeType is application/json)
  try {
    return JSON.parse(raw);
  } catch {
    // Fall through to manual extraction
  }

  // Extract from markdown code fences
  const fenced =
    raw.match(/```json\s*([\s\S]*?)```/i) ||
    raw.match(/```\s*([\s\S]*?)```/i);
  const jsonStr = fenced?.[1]?.trim() ?? raw.trim();

  // Find the outermost JSON object or array
  const start =
    jsonStr.indexOf("{") >= 0 ? jsonStr.indexOf("{") : jsonStr.indexOf("[");
  const end =
    jsonStr.lastIndexOf("}") >= 0
      ? jsonStr.lastIndexOf("}")
      : jsonStr.lastIndexOf("]");

  const cleaned =
    start >= 0 && end > start ? jsonStr.slice(start, end + 1) : jsonStr;

  return JSON.parse(cleaned);
}

/**
 * Generate structured JSON content with Gemini.
 * Uses responseMimeType: "application/json" for reliable JSON output.
 */
export async function generateJsonContent<T>(
  prompt: string,
  validate: (value: unknown) => T,
): Promise<T> {
  const raw = await generateJsonRaw(prompt);
  const parsed = extractAndParseJson(raw);
  return validate(parsed);
}

