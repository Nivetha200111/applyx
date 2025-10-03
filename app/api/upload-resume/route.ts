import { NextRequest, NextResponse } from "next/server";
import { ResumeParser } from "@/lib/resume-parser";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let filename = "upload";
    let fileType = "application/octet-stream";

    if (contentType.includes("application/json")) {
      // Support JSON uploads from extensions: { filename, type, content(base64 or data URL) }
      const jsonData = await request.json();
      const base64Data = typeof jsonData.content === "string"
        ? (jsonData.content.includes(',') ? jsonData.content.split(',')[1] : jsonData.content)
        : "";
      if (!base64Data) {
        return NextResponse.json({ error: "No file content provided" }, { status: 400 });
      }
      buffer = Buffer.from(base64Data, "base64");
      if (typeof jsonData.filename === "string") filename = jsonData.filename;
      if (typeof jsonData.type === "string") fileType = jsonData.type;
    } else {
      // Default to FormData file uploads
      const formData = await request.formData();
      const file = formData.get("resume");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      filename = file.name;
      fileType = file.type || fileType;
    }

    const parser = new ResumeParser();
    const profile = await parser.parseResume(buffer);

    // Heuristic post-processing to fill missing fields without modifying parser implementation
    const rawText = toText(buffer, filename, fileType);
    const fallback = deriveFieldsFromText(rawText);
    const merged = {
      ...profile,
      name: profile.name ?? fallback.name,
      email: profile.email ?? fallback.email,
      phone: profile.phone ?? fallback.phone,
      location: profile.location ?? fallback.location,
      experience_years: profile.experience_years ?? fallback.experience_years,
      // Only add skills if parser returned none
      skills: (profile.skills && profile.skills.length > 0) ? profile.skills : fallback.skills,
    } as Record<string, unknown>;

    // Optionally save if Supabase is configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const { supabaseAdmin } = await import("@/lib/supabase-admin");
        const userId = request.headers.get("x-user-id") ?? "anonymous-user";
        await supabaseAdmin.from("profiles").upsert({
          user_id: userId,
          resume_data: merged as Record<string, unknown>,
          skills: (merged.skills as string[] | undefined) ?? [],
          experience_years: (merged.experience_years as number | undefined) ?? null,
        });
      } catch (dbErr) {
        // Non-fatal for this endpoint; return parsed profile regardless
      }
    }

    return NextResponse.json({ profile: merged });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process resume" }, { status: 500 });
  }
}

function toText(buffer: Buffer, filename: string, fileType: string): string {
  try {
    const isPDF = fileType === "application/pdf" || filename.toLowerCase().endsWith(".pdf") || buffer.subarray(0, 4).toString("ascii") === "%PDF";
    if (isPDF) {
      // Lightweight PDF text attempt without pulling pdf-parse here
      const pdfText = buffer.toString("utf-8");
      const matches = pdfText.match(/BT\s+([^E]+)ET/g);
      if (matches) {
        return matches
          .map((m) => m.replace(/BT\s+/, "").replace(/ET/, ""))
          .join(" ")
          .replace(/[^\x20-\x7E\n\r]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
      return pdfText.replace(/[^\x20-\x7E\n\r]/g, " ").replace(/\s+/g, " ").trim();
    }
  } catch {
    // ignore
  }
  return buffer.toString("utf-8");
}

function deriveFieldsFromText(text: string) {
  const lines = (text || "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const joined = text || "";

  const email = (joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
  const phone = (joined.match(/\+?\d[\d\s().-]{7,}\d/) || [])[0];

  // Name: prefer labeled, else first plausible line near top
  let name: string | undefined;
  const labeled = joined.match(/\bname\s*[:|-]\s*([^\n\r]+)/i);
  if (labeled) {
    name = labeled[1].trim();
  } else {
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      const candidate = lines[i];
      if (email && candidate.includes(email)) continue;
      if (/https?:\/\//i.test(candidate)) continue;
      if (/linkedin|github|mailto:/i.test(candidate)) continue;
      if (/^(skills?|technical skills?|summary|professional|experience|education)\b/i.test(candidate)) break;
      if (/^[A-Za-z][A-Za-z .'-]{1,60}$/.test(candidate) && candidate.split(/\s+/).length <= 6) {
        name = candidate;
        break;
      }
    }
  }

  // Location: take a line containing comma and letters near top if not a link/email
  let location: string | undefined;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const l = lines[i];
    if (email && l.includes(email)) continue;
    if (/https?:\/\//i.test(l)) continue;
    if (/,/.test(l) && /[A-Za-z]/.test(l)) { location = l; break; }
  }

  // Experience years: capture 1+, 1.5, etc.
  let experience_years = undefined as number | undefined;
  const reYears = [
    /(\d+(?:\.\d+)?)\s*\+?\s*(years?|yrs?)/i,
    /(experience|exp|overall experience|total experience)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*\+?\s*(years?|yrs?)/i,
  ];
  for (const re of reYears) {
    const m = joined.match(re);
    if (m) { experience_years = Number(m[2] ?? m[1]); break; }
  }

  // Skills: capture after a skills header
  let skills: string[] = [];
  const headerIdx = lines.findIndex((l) => /^(technical\s+)?skills?\b|technologies|stack/i.test(l));
  if (headerIdx !== -1) {
    const slice = lines.slice(headerIdx, headerIdx + 8).join("\n");
    skills = Array.from(new Set(slice.split(/[\n,•\-\u2022]/).map((s) => s.trim()).filter((s) => s && s.length <= 40 && /[A-Za-z]/.test(s)))).slice(0, 50);
  }

  return { name, email, phone, location, experience_years, skills };
}



