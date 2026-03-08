import { NextResponse } from "next/server";
import { signInUser } from "@/lib/auth";
import {
  buildRateLimitIdentifier,
  enforceRateLimit,
  getClientIp,
} from "@/lib/security/rate-limit";
import { toErrorResponse } from "@/lib/security/api";
import { sanitizeNextPath, signInSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const ipAddress = getClientIp(request);

    await enforceRateLimit({
      key: "auth:login",
      identifier: buildRateLimitIdentifier(ipAddress, email),
      limit: 5,
      windowSeconds: 300,
      message: "Too many sign-in attempts. Please wait a few minutes and try again.",
    });

    const parsed = signInSchema.parse(body);

    await signInUser({
      email: parsed.email,
      password: parsed.password,
      ipAddress,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      ok: true,
      next: sanitizeNextPath(parsed.next),
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to sign in right now.",
      logLabel: "auth/login",
    });
  }
}
