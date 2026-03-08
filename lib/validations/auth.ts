import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Full name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
  next: z.string().trim().optional().default("/dashboard"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
  next: z.string().trim().optional().default("/dashboard"),
});

export function sanitizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/")) {
    return "/dashboard";
  }

  const normalized = new URL(next, "http://localhost");
  return `${normalized.pathname}${normalized.search}`;
}
