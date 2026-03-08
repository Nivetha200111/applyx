import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery, firstRow } from "@/lib/db";

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
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const parsed = requestSchema.parse(await request.json());

    const existing = await dbQuery<PaymentRow>(
      `select id, status
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

    if (payment.status === "paid") {
      return NextResponse.json(
        { error: "This payment has already been approved." },
        { status: 400 },
      );
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
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to submit payment reference.",
      },
      { status: 400 },
    );
  }
}
