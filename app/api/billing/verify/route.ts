import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow, withTransaction } from "@/lib/db";
import { isDeveloperAdminUser } from "@/lib/developer-access";
import { getPlanById } from "@/lib/plans";

export const runtime = "nodejs";

const requestSchema = z.object({
  paymentId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

type PaymentRow = {
  id: string;
  user_id: string;
  plan_tier: string;
  amount_inr: number;
  status: string;
  billing_provider: string;
  provider_payment_id: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!isDeveloperAdminUser(user)) {
      return NextResponse.json(
        { error: "Only developer admins can verify payments." },
        { status: 403 },
      );
    }

    const parsed = requestSchema.parse(await request.json());

    const existing = await dbQuery<PaymentRow>(
      `select id, user_id, plan_tier, amount_inr, status, billing_provider, provider_payment_id
       from public.payments
       where provider_checkout_id = $1
         and billing_provider = 'manual'
       limit 1`,
      [parsed.paymentId],
    );

    const payment = firstRow(existing);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: `Payment already has status: ${payment.status}.` },
        { status: 400 },
      );
    }

    if (parsed.action === "reject") {
      await dbQuery(
        `update public.payments
         set status = 'failed',
             provider_event_type = 'manual.rejected',
             updated_at = timezone('utc', now())
         where id = $1`,
        [payment.id],
      );

      return NextResponse.json({ ok: true, status: "rejected" });
    }

    const planId = payment.plan_tier as "basic" | "premium";
    const plan = getPlanById(planId);

    if (!plan || plan.id === "free") {
      return NextResponse.json({ error: "Invalid plan on payment record." }, { status: 400 });
    }

    const now = new Date();
    const cycleEnd = new Date(now);
    cycleEnd.setDate(cycleEnd.getDate() + 30);

    await withTransaction(async (client) => {
      await client.query(
        `update public.payments
         set status = 'paid',
             provider_event_type = 'manual.approved',
             paid_at = timezone('utc', now()),
             updated_at = timezone('utc', now())
         where id = $1`,
        [payment.id],
      );

      await client.query(
        `update public.users
         set
           plan = $1,
           billing_provider = 'manual',
           billing_cycle_start = $2::timestamptz,
           billing_cycle_end = $3::timestamptz,
           monthly_tailors_used = 0,
           monthly_tailor_limit = $4,
           monthly_tracker_parses_used = 0,
           preferred_model_tier = $5,
           updated_at = timezone('utc', now())
         where id = $6`,
        [
          plan.id,
          now.toISOString(),
          cycleEnd.toISOString(),
          plan.monthlyTailors,
          plan.modelTier,
          payment.user_id,
        ],
      );

      await client.query(
        `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
         values ($1, 'purchase', $2, $3, $4::jsonb)`,
        [
          payment.user_id,
          plan.id,
          plan.modelTier,
          JSON.stringify({
            provider: "manual",
            paymentId: parsed.paymentId,
            verifiedBy: user.email,
          }),
        ],
      );
    });

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 400 },
    );
  }
}
