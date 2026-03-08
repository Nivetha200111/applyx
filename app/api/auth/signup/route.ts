import { NextResponse } from "next/server";
import { createUserAccount } from "@/lib/auth";
import { sanitizeNextPath, signUpSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.parse(body);

    await createUserAccount({
      fullName: parsed.fullName,
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
        error: error instanceof Error ? error.message : "Unable to create account.",
      },
      { status: 400 },
    );
  }
}
