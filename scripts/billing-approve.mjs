import { Pool } from "@neondatabase/serverless";

const targetPayment = process.argv[2]?.trim();
const connectionString = process.env.DATABASE_URL?.trim();

if (!targetPayment) {
  console.error("Usage: npm run billing:approve -- <payment-id-or-checkout-id>");
  process.exit(1);
}

if (!connectionString) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const planCatalog = {
  basic: {
    monthlyTailors: 40,
    modelTier: "basic",
  },
  premium: {
    monthlyTailors: 50,
    modelTier: "premium",
  },
};

const pool = new Pool({ connectionString, max: 1 });
const client = await pool.connect();

try {
  await client.query("begin");

  const paymentResult = await client.query(
    `
      select
        p.id,
        p.user_id,
        p.plan_tier,
        p.amount,
        p.status,
        p.provider_checkout_id,
        p.provider_payment_id,
        u.email
      from public.payments p
      join public.users u on u.id = p.user_id
      where p.id = $1 or p.provider_checkout_id = $1
      limit 1
    `,
    [targetPayment],
  );

  const payment = paymentResult.rows[0];

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (!(payment.plan_tier in planCatalog)) {
    throw new Error(`Unsupported plan tier: ${payment.plan_tier}`);
  }

  if (payment.status === "paid") {
    throw new Error("Payment has already been approved.");
  }

  const plan = planCatalog[payment.plan_tier];

  await client.query(
    `
      update public.payments
      set
        status = 'paid',
        provider_event_type = 'manual.approved',
        paid_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
      where id = $1
    `,
    [payment.id],
  );

  await client.query(
    `
      update public.users
      set
        plan = $1,
        billing_provider = 'manual',
        billing_subscription_id = $2,
        billing_cycle_start = timezone('utc', now()),
        billing_cycle_end = timezone('utc', now()) + interval '30 days',
        monthly_tailors_used = 0,
        monthly_tracker_parses_used = 0,
        monthly_tailor_limit = $3,
        preferred_model_tier = $4,
        updated_at = timezone('utc', now())
      where id = $5
    `,
    [
      payment.plan_tier,
      payment.provider_checkout_id,
      plan.monthlyTailors,
      plan.modelTier,
      payment.user_id,
    ],
  );

  await client.query(
    `
      insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
      values ($1, 'purchase', $2, $3, $4::jsonb)
    `,
    [
      payment.user_id,
      payment.plan_tier,
      plan.modelTier,
      JSON.stringify({
        provider: "manual",
        paymentId: payment.id,
        checkoutId: payment.provider_checkout_id,
        transactionReference: payment.provider_payment_id,
      }),
    ],
  );

  await client.query("commit");

  console.log(
    `Approved ${payment.plan_tier} for ${payment.email} using payment ${payment.provider_checkout_id}.`,
  );
} catch (error) {
  await client.query("rollback");
  console.error(error instanceof Error ? error.message : "Unable to approve payment.");
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
