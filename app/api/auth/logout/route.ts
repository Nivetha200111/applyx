import { NextResponse } from "next/server";
import { signOutUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  await signOutUser();
  return NextResponse.json({ ok: true });
}
