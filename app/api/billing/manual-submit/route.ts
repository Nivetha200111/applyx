import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow } from "@/lib/db";
import { HttpError, toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const requestSchema = z.object({
  paymentId: z.string().min(1),
  transactionReference: z.string().min(3).max(120),
  channel: z.enum(["upi", "international", "other"]).default("other"),
  notes: z.string().max(500).optional().default(""),
});

type PaymentRow = {
  id: string;
  status: string;
  provider_payment_id: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "billing:manual-submit",
      identifier: user.id,
      limit: 5,
      windowSeconds: 300,
      message: "Too many payment reference submissions. Please wait before trying again.",
    });

    const parsed = requestSchema.parse(await request.json());

    const existing = await dbQuery<PaymentRow>(
      `select id, status, provider_payment_id
       from public.payments
       where user_id = $1
         and provider_checkout_id = $2
         and billing_provider = 'manual'
       limit 1`,
      [user.id, parsed.paymentId],
    );

    const payment = firstRow(existing);

    if (!payment) {
      return NextResponse.json({ error: "Payment request not found." }, { status: 404 });
    }

    if (payment.status !== "pending") {
      throw new HttpError(400, "This payment can no longer accept a new reference.");
    }

    if (payment.provider_payment_id) {
      throw new HttpError(400, "A payment reference has already been submitted for this request.");
    }

    await dbQuery(
      `update public.payments
       set
         provider_payment_id = $1,
         provider_event_type = 'manual.submitted',
         payment_metadata = coalesce(payment_metadata, '{}'::jsonb) || $2::jsonb,
         updated_at = timezone('utc', now())
       where id = $3`,
      [
        parsed.transactionReference,
        JSON.stringify({
          channel: parsed.channel,
          notes: parsed.notes,
          submittedAt: new Date().toISOString(),
        }),
        payment.id,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to submit payment reference right now.",
      logLabel: "billing/manual-submit",
    });
  }
}
