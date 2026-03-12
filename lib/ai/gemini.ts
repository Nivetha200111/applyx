import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

const globalForGemini = globalThis as typeof globalThis & {
  __geminiClient?: GoogleGenerativeAI;
};

function getGeminiClient() {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (globalForGemini.__geminiClient) {
    return globalForGemini.__geminiClient;
  }

  const client = new GoogleGenerativeAI(GEMINI_API_KEY);
  globalForGemini.__geminiClient = client;
  return client;
}

export function isGeminiConfigured() {
  return Boolean(GEMINI_API_KEY);
}

// ── Gemini Embedding 2 ──
// https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/
const EMBEDDING_MODEL = "gemini-embedding-exp-03-07";
const GENERATIVE_MODEL = "gemini-2.0-flash";

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
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
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
    generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
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
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i);
  const jsonStr = fenced?.[1]?.trim() ?? raw.trim();

  const start = jsonStr.indexOf("{") >= 0 ? jsonStr.indexOf("{") : jsonStr.indexOf("[");
  const end = jsonStr.lastIndexOf("}") >= 0 ? jsonStr.lastIndexOf("}") : jsonStr.lastIndexOf("]");

  const cleaned = start >= 0 && end > start ? jsonStr.slice(start, end + 1) : jsonStr;
  return validate(JSON.parse(cleaned));
}

/**
 * Generate structured JSON content with Gemini.
 */
export async function generateJsonContent<T>(
  prompt: string,
  validate: (value: unknown) => T,
): Promise<T> {
  const raw = await generateContent(prompt);
  // Extract JSON from possible markdown fencing
  const fenced = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i);
  const jsonStr = fenced?.[1]?.trim() ?? raw.trim();

  const start = jsonStr.indexOf("{") >= 0 ? jsonStr.indexOf("{") : jsonStr.indexOf("[");
  const end = jsonStr.lastIndexOf("}") >= 0 ? jsonStr.lastIndexOf("}") : jsonStr.lastIndexOf("]");

  const cleaned = start >= 0 && end > start ? jsonStr.slice(start, end + 1) : jsonStr;
  return validate(JSON.parse(cleaned));
}

