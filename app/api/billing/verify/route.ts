import { createHmac } from "crypto";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { withTransaction } from "@/lib/db";
import { getPlanById } from "@/lib/plans";

export const runtime = "nodejs";

const verifySchema = z.object({
  planId: z.enum(["basic", "premium"]),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!razorpayKeySecret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured." },
        { status: 500 },
      );
    }

    const parsed = verifySchema.parse(await request.json());
    const expectedSignature = createHmac("sha256", razorpayKeySecret)
      .update(`${parsed.razorpayOrderId}|${parsed.razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== parsed.razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const plan = getPlanById(parsed.planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    await withTransaction(async (client) => {
      await client.query(
        `update public.payments
         set
           status = 'paid',
           razorpay_payment_id = $1,
           razorpay_signature = $2,
           paid_at = timezone('utc', now()),
           updated_at = timezone('utc', now())
         where user_id = $3 and razorpay_order_id = $4`,
        [
          parsed.razorpayPaymentId,
          parsed.razorpaySignature,
          user.id,
          parsed.razorpayOrderId,
        ],
      );

      await client.query(
        `update public.users
         set
           plan = $1,
           preferred_model_tier = $2,
           billing_cycle_start = timezone('utc', now()),
           billing_cycle_end = timezone('utc', now()) + interval '30 days',
           monthly_tailors_used = 0,
           monthly_tailor_limit = $3,
           updated_at = timezone('utc', now())
         where id = $4`,
        [plan.id, plan.modelTier, plan.monthlyTailors, user.id],
      );

      await client.query(
        `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
         values ($1, 'purchase', $2, $3, $4::jsonb)`,
        [
          user.id,
          plan.id,
          plan.modelTier,
          JSON.stringify({
            razorpayOrderId: parsed.razorpayOrderId,
            razorpayPaymentId: parsed.razorpayPaymentId,
            amountInr: plan.priceInr,
          }),
        ],
      );
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to verify payment.",
      },
      { status: 400 },
    );
  }
}
