import { NextResponse } from "next/server";
import { createUserAccount } from "@/lib/auth";
import { sendSignupConversion } from "@/lib/internal-conversions";
import {
  buildRateLimitIdentifier,
  enforceRateLimit,
  getClientIp,
} from "@/lib/security/rate-limit";
import { toErrorResponse } from "@/lib/security/api";
import { sanitizeNextPath, signUpSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const ipAddress = getClientIp(request);

    await enforceRateLimit({
      key: "auth:signup",
      identifier: buildRateLimitIdentifier(ipAddress, email),
      limit: 5,
      windowSeconds: 1800,
      message: "Too many sign-up attempts. Please wait a bit before trying again.",
    });

    const parsed = signUpSchema.parse(body);

    const user = await createUserAccount({
      fullName: parsed.fullName,
      email: parsed.email,
      password: parsed.password,
      ipAddress,
      userAgent: request.headers.get("user-agent"),
    });

    await sendSignupConversion({
      source: parsed.source,
      slug: parsed.slug,
      userId: user.id,
    });

    return NextResponse.json({
      ok: true,
      next: sanitizeNextPath(parsed.next),
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to create account right now.",
      logLabel: "auth/signup",
    });
  }
}
