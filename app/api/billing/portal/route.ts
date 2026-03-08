import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getDodoClient } from "@/lib/dodo/client";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "billing:portal",
      identifier: user.id,
      limit: 10,
      windowSeconds: 300,
      message: "Too many billing portal requests. Please wait before trying again.",
    });

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
    return toErrorResponse(error, {
      fallbackMessage: "Unable to open the billing portal right now.",
      logLabel: "billing/portal",
    });
  }
}
