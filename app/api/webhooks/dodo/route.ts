import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { getDodoClient, getPlanIdForDodoProductId } from "@/lib/dodo/client";
import { getPlanById } from "@/lib/plans";
import type { ModelTier } from "@/lib/types";

export const runtime = "nodejs";

type PaidPlanTier = "basic" | "premium";

type MetadataMap = Record<string, string> | null | undefined;

type DodoPaymentPayload = {
  payment_id: string;
  checkout_session_id?: string | null;
  subscription_id?: string | null;
  currency: string;
  total_amount: number;
  metadata: Record<string, string>;
  customer: {
    customer_id: string;
  };
};

type DodoSubscriptionPayload = {
  subscription_id: string;
  product_id: string;
  status: string;
  next_billing_date: string;
  previous_billing_date: string;
  cancel_at_next_billing_date: boolean;
  metadata: Record<string, string>;
  customer: {
    customer_id: string;
  };
};

function normalizeHeaders(request: Request) {
  return Object.fromEntries(
    Array.from(request.headers.entries()).map(([key, value]) => [key.toLowerCase(), value]),
  );
}

function asPaidPlanTier(value: string | null | undefined): PaidPlanTier | null {
  return value === "basic" || value === "premium" ? value : null;
}

function getPlanTierFromMetadataOrProduct(metadata: MetadataMap, productId?: string | null) {
  return asPaidPlanTier(metadata?.applyx_plan_id) ?? getPlanIdForDodoProductId(productId);
}

function getUserIdFromMetadata(metadata: MetadataMap) {
  const userId = metadata?.applyx_user_id?.trim();
  return userId ? userId : null;
}

function getWebhookId(headers: Record<string, string>) {
  return headers["webhook-id"] ?? null;
}

function amountFromMinorUnits(
  amountMinorUnits: number,
  currency: string,
  fallback: number,
) {
  if (!Number.isFinite(amountMinorUnits) || amountMinorUnits <= 0) {
    return fallback;
  }

  const fractionDigits = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).resolvedOptions().maximumFractionDigits ?? 2;

  return Math.max(0, amountMinorUnits / 10 ** fractionDigits);
}

async function resolveUserId(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number; rows: Array<{ id: string }> }>;
  },
  metadata: MetadataMap,
  customerId: string | null | undefined,
) {
  const metadataUserId = getUserIdFromMetadata(metadata);

  if (metadataUserId) {
    return metadataUserId;
  }

  if (!customerId) {
    return null;
  }

  const existingUser = await client.query(
    `select id
     from public.users
     where billing_customer_id = $1
     limit 1`,
    [customerId],
  );

  return existingUser.rows[0]?.id ?? null;
}

async function upsertPurchaseLog(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number }>;
  },
  input: {
    userId: string;
    planId: PaidPlanTier;
    modelTier: ModelTier;
    webhookId: string | null;
    eventType: string;
    metadata: Record<string, unknown>;
  },
) {
  if (input.webhookId) {
    const existing = await client.query(
      `select 1
       from public.usage_log
       where user_id = $1
         and action = 'purchase'
         and metadata->>'webhookId' = $2
       limit 1`,
      [input.userId, input.webhookId],
    );

    if (existing.rowCount) {
      return;
    }
  }

  await client.query(
    `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
     values ($1, 'purchase', $2, $3, $4::jsonb)`,
    [
      input.userId,
      input.planId,
      input.modelTier,
      JSON.stringify({
        ...input.metadata,
        webhookId: input.webhookId,
      }),
    ],
  );
}

async function recordPaymentEvent(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number }>;
  },
  input: {
    userId: string | null;
    planId: PaidPlanTier | null;
    status: "paid" | "failed" | "cancelled";
    amount: number;
    currency: string;
    checkoutId: string | null;
    paymentId: string | null;
    subscriptionId: string | null;
    customerId: string | null;
    eventType: string;
    metadata: Record<string, string>;
    paidAt?: string;
  },
) {
  if (input.checkoutId || input.paymentId) {
    const updated = await client.query(
      `update public.payments
       set
         status = $1,
         billing_provider = 'dodo',
         provider_checkout_id = coalesce($2, provider_checkout_id),
         provider_payment_id = coalesce($3, provider_payment_id),
         provider_subscription_id = coalesce($4, provider_subscription_id),
         provider_customer_id = coalesce($5, provider_customer_id),
         provider_event_type = $6,
         payment_metadata = coalesce(payment_metadata, '{}'::jsonb) || $7::jsonb,
         paid_at = case when $8::timestamptz is null then paid_at else $8::timestamptz end,
         amount = $9,
         currency = $10,
         updated_at = timezone('utc', now())
       where
         ($2::text is not null and provider_checkout_id = $2)
         or ($3::text is not null and provider_payment_id = $3)`,
      [
        input.status,
        input.checkoutId,
        input.paymentId,
        input.subscriptionId,
        input.customerId,
        input.eventType,
        JSON.stringify(input.metadata),
        input.paidAt ?? null,
        input.amount,
        input.currency,
      ],
    );

    if (updated.rowCount > 0 || !input.userId || !input.planId) {
      return;
    }
  }

  if (!input.userId || !input.planId) {
    return;
  }

  if (input.checkoutId) {
    await client.query(
      `insert into public.payments (
        user_id,
        plan_tier,
        amount,
        currency,
        status,
        billing_provider,
        provider_checkout_id,
        provider_payment_id,
        provider_subscription_id,
        provider_customer_id,
        provider_event_type,
        payment_metadata,
        paid_at
      ) values ($1, $2, $3, $4, $5, 'dodo', $6, $7, $8, $9, $10, $11::jsonb, $12::timestamptz)
      on conflict (provider_checkout_id) do update
      set
        status = excluded.status,
        provider_payment_id = coalesce(excluded.provider_payment_id, public.payments.provider_payment_id),
        provider_subscription_id = coalesce(excluded.provider_subscription_id, public.payments.provider_subscription_id),
        provider_customer_id = coalesce(excluded.provider_customer_id, public.payments.provider_customer_id),
        provider_event_type = excluded.provider_event_type,
        payment_metadata = coalesce(public.payments.payment_metadata, '{}'::jsonb) || excluded.payment_metadata,
        paid_at = coalesce(excluded.paid_at, public.payments.paid_at),
        updated_at = timezone('utc', now())`,
      [
        input.userId,
        input.planId,
        input.amount,
        input.currency,
        input.status,
        input.checkoutId,
        input.paymentId,
        input.subscriptionId,
        input.customerId,
        input.eventType,
        JSON.stringify(input.metadata),
        input.paidAt ?? null,
      ],
    );

    return;
  }

  if (input.paymentId) {
    await client.query(
      `insert into public.payments (
        user_id,
        plan_tier,
        amount,
        currency,
        status,
        billing_provider,
        provider_checkout_id,
        provider_payment_id,
        provider_subscription_id,
        provider_customer_id,
        provider_event_type,
        payment_metadata,
        paid_at
      ) values ($1, $2, $3, $4, $5, 'dodo', $6, $7, $8, $9, $10, $11::jsonb, $12::timestamptz)
      on conflict (provider_payment_id) do update
      set
        status = excluded.status,
        provider_checkout_id = coalesce(excluded.provider_checkout_id, public.payments.provider_checkout_id),
        provider_subscription_id = coalesce(excluded.provider_subscription_id, public.payments.provider_subscription_id),
        provider_customer_id = coalesce(excluded.provider_customer_id, public.payments.provider_customer_id),
        provider_event_type = excluded.provider_event_type,
        payment_metadata = coalesce(public.payments.payment_metadata, '{}'::jsonb) || excluded.payment_metadata,
        paid_at = coalesce(excluded.paid_at, public.payments.paid_at),
        updated_at = timezone('utc', now())`,
      [
        input.userId,
        input.planId,
        input.amount,
        input.currency,
        input.status,
        input.checkoutId,
        input.paymentId,
        input.subscriptionId,
        input.customerId,
        input.eventType,
        JSON.stringify(input.metadata),
        input.paidAt ?? null,
      ],
    );
  }
}

async function activatePaidPlan(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number; rows: Array<{ id: string }> }>;
  },
  input: {
    userId: string;
    planId: PaidPlanTier;
    customerId: string;
    subscriptionId: string;
    previousBillingDate: string;
    nextBillingDate: string;
    eventType: string;
    webhookId: string | null;
    metadata: Record<string, string>;
  },
) {
  const plan = getPlanById(input.planId);

  if (!plan || plan.id === "free") {
    return;
  }

  await client.query(
    `update public.users
     set
       plan = $1,
       billing_provider = 'dodo',
       billing_customer_id = $2,
       billing_subscription_id = $3,
       billing_cycle_start = $4::timestamptz,
       billing_cycle_end = $5::timestamptz,
       monthly_tailors_used = 0,
       monthly_tailor_limit = $6,
       monthly_tracker_parses_used = 0,
       preferred_model_tier = $7,
       updated_at = timezone('utc', now())
     where id = $8`,
    [
      plan.id,
      input.customerId,
      input.subscriptionId,
      input.previousBillingDate,
      input.nextBillingDate,
      plan.monthlyTailors,
      plan.modelTier,
      input.userId,
    ],
  );

  await client.query(
    `update public.payments
     set
       provider_subscription_id = $1,
       provider_customer_id = $2,
       provider_event_type = $3,
       payment_metadata = coalesce(payment_metadata, '{}'::jsonb) || $4::jsonb,
       updated_at = timezone('utc', now())
     where user_id = $5
       and plan_tier = $6
       and status in ('pending', 'paid')`,
    [
      input.subscriptionId,
      input.customerId,
      input.eventType,
      JSON.stringify(input.metadata),
      input.userId,
      input.planId,
    ],
  );

  await upsertPurchaseLog(client, {
    userId: input.userId,
    planId: plan.id,
    modelTier: plan.modelTier,
    webhookId: input.webhookId,
    eventType: input.eventType,
    metadata: {
      provider: "dodo",
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
      ...input.metadata,
    },
  });
}

async function handleSubscriptionCancellation(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number }>;
  },
  input: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    nextBillingDate: string;
  },
) {
  await client.query(
    `update public.users
     set
       billing_provider = 'dodo',
       billing_customer_id = $1,
       billing_subscription_id = $2,
       billing_cycle_end = $3::timestamptz,
       updated_at = timezone('utc', now())
     where id = $4`,
    [input.customerId, input.subscriptionId, input.nextBillingDate, input.userId],
  );
}

async function downgradeToFreePlan(
  client: {
    query: (sql: string, values?: readonly unknown[]) => Promise<{ rowCount: number }>;
  },
  input: {
    userId: string;
    customerId: string;
    subscriptionId: string;
    nextBillingDate: string;
  },
) {
  await client.query(
    `update public.users
     set
       plan = 'free',
       billing_provider = 'dodo',
       billing_customer_id = $1,
       billing_subscription_id = $2,
       billing_cycle_start = timezone('utc', now()),
       billing_cycle_end = $3::timestamptz,
       monthly_tailors_used = 0,
       monthly_tailor_limit = 0,
       monthly_tracker_parses_used = 0,
       preferred_model_tier = 'demo',
       updated_at = timezone('utc', now())
     where id = $4`,
    [input.customerId, input.subscriptionId, input.nextBillingDate, input.userId],
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers = normalizeHeaders(request);

  try {
    const dodo = getDodoClient();
    const event = dodo.webhooks.unwrap(rawBody, { headers });
    const webhookId = getWebhookId(headers);

    await withTransaction(async (client) => {
      if (event.type === "payment.succeeded" || event.type === "payment.failed" || event.type === "payment.cancelled") {
        const payment = event.data as DodoPaymentPayload;
        const planId = getPlanTierFromMetadataOrProduct(payment.metadata);
        const userId = await resolveUserId(client, payment.metadata, payment.customer.customer_id);
        const plan = planId ? getPlanById(planId) : null;

        await recordPaymentEvent(client, {
          userId,
          planId,
          status:
            event.type === "payment.succeeded"
              ? "paid"
              : event.type === "payment.failed"
                ? "failed"
                : "cancelled",
          amount:
            amountFromMinorUnits(
              payment.total_amount,
              payment.currency,
              plan?.price ?? 0,
            ),
          currency: payment.currency.toUpperCase(),
          checkoutId: payment.checkout_session_id ?? null,
          paymentId: payment.payment_id,
          subscriptionId: payment.subscription_id ?? null,
          customerId: payment.customer.customer_id,
          eventType: event.type,
          metadata: payment.metadata,
          paidAt: event.type === "payment.succeeded" ? event.timestamp : undefined,
        });
      }

      if (
        event.type === "subscription.active" ||
        event.type === "subscription.renewed" ||
        event.type === "subscription.plan_changed" ||
        event.type === "subscription.updated"
      ) {
        const subscription = event.data as DodoSubscriptionPayload;
        const planId = getPlanTierFromMetadataOrProduct(subscription.metadata, subscription.product_id);
        const userId = await resolveUserId(client, subscription.metadata, subscription.customer.customer_id);

        if (planId && userId) {
          await activatePaidPlan(client, {
            userId,
            planId,
            customerId: subscription.customer.customer_id,
            subscriptionId: subscription.subscription_id,
            previousBillingDate: subscription.previous_billing_date,
            nextBillingDate: subscription.next_billing_date,
            eventType: event.type,
            webhookId,
            metadata: subscription.metadata,
          });
        }
      }

      if (event.type === "subscription.cancelled" || event.type === "subscription.expired" || event.type === "subscription.failed" || event.type === "subscription.on_hold") {
        const subscription = event.data as DodoSubscriptionPayload;
        const userId = await resolveUserId(client, subscription.metadata, subscription.customer.customer_id);

        if (!userId) {
          return;
        }

        if (event.type === "subscription.cancelled") {
          await handleSubscriptionCancellation(client, {
            userId,
            customerId: subscription.customer.customer_id,
            subscriptionId: subscription.subscription_id,
            nextBillingDate: subscription.next_billing_date,
          });
          return;
        }

        await downgradeToFreePlan(client, {
          userId,
          customerId: subscription.customer.customer_id,
          subscriptionId: subscription.subscription_id,
          nextBillingDate: subscription.next_billing_date,
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid Dodo webhook.",
      },
      { status: 400 },
    );
  }
}
