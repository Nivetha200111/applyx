import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getDodoClient, getDodoProductId, getDodoReturnUrl } from "@/lib/dodo/client";
import { getPlanById } from "@/lib/plans";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  planId: z.enum(["basic", "premium"]),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "billing:checkout",
      identifier: user.id,
      limit: 5,
      windowSeconds: 300,
      message: "Too many checkout attempts. Please wait a few minutes and try again.",
    });

    if (isDeveloperAdminUser(user)) {
      return NextResponse.json(
        { error: "Developer access is already active on this account. Billing is disabled." },
        { status: 400 },
      );
    }

    const parsed = requestSchema.parse(await request.json());
    const plan = getPlanById(parsed.planId);

    if (!plan || plan.id === "free") {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const dodo = getDodoClient();
    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: getDodoProductId(parsed.planId),
          quantity: 1,
        },
      ],
      customer: {
        email: user.email,
        name: user.fullName ?? undefined,
      },
      metadata: {
        applyx_plan_id: plan.id,
        applyx_user_email: user.email,
        applyx_user_id: user.id,
      },
      return_url: getDodoReturnUrl(parsed.planId),
      feature_flags: {
        redirect_immediately: true,
      },
      customization: {
        theme: "dark",
      },
    });

    if (!checkoutSession.checkout_url) {
      return NextResponse.json(
        { error: "Dodo Payments did not return a checkout URL." },
        { status: 502 },
      );
    }

    await dbQuery(
      `insert into public.payments (
        user_id,
        plan_tier,
        amount_inr,
        currency,
        status,
        billing_provider,
        provider_checkout_id,
        payment_metadata
      ) values ($1, $2, $3, $4, 'pending', 'dodo', $5, $6::jsonb)
      on conflict (provider_checkout_id) do update
      set
        plan_tier = excluded.plan_tier,
        amount_inr = excluded.amount_inr,
        currency = excluded.currency,
        billing_provider = excluded.billing_provider,
        payment_metadata = excluded.payment_metadata,
        updated_at = timezone('utc', now())`,
      [
        user.id,
        parsed.planId,
        plan.priceInr,
        "INR",
        checkoutSession.session_id,
        JSON.stringify({
          checkoutUrl: checkoutSession.checkout_url,
          planId: plan.id,
        }),
      ],
    );

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkoutSession.checkout_url,
      sessionId: checkoutSession.session_id,
    });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to start checkout right now.",
      logLabel: "billing/checkout",
    });
  }
}
