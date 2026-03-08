import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getDodoClient } from "@/lib/dodo/client";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (isDeveloperAdminUser(user)) {
      return NextResponse.json(
        { error: "Developer access does not use a billing portal." },
        { status: 400 },
      );
    }

    if (!user.billingCustomerId) {
      return NextResponse.json(
        { error: "No active billing customer was found for this account." },
        { status: 400 },
      );
    }

    const dodo = getDodoClient();
    const portalSession = await dodo.customers.customerPortal.create(user.billingCustomerId);

    return NextResponse.json({
      ok: true,
      portalUrl: portalSession.link,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to open billing portal.",
      },
      { status: 400 },
    );
  }
}
