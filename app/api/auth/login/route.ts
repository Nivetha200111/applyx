import { NextResponse } from "next/server";
import { signInUser } from "@/lib/auth";
import { sanitizeNextPath, signInSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signInSchema.parse(body);

    await signInUser({
      email: parsed.email,
      password: parsed.password,
      ipAddress: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      ok: true,
      next: sanitizeNextPath(parsed.next),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to sign in.",
      },
      { status: 400 },
    );
  }
}
