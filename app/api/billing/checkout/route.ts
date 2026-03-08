import Razorpay from "razorpay";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { getPlanById } from "@/lib/plans";

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

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured." },
        { status: 500 },
      );
    }

    const parsed = requestSchema.parse(await request.json());
    const plan = getPlanById(parsed.planId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: plan.priceInr * 100,
      currency: "INR",
      receipt: `applyx_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        planId: parsed.planId,
      },
    });

    await dbQuery(
      `insert into public.payments (
        user_id,
        plan_tier,
        amount_inr,
        currency,
        status,
        razorpay_order_id
      ) values ($1, $2, $3, $4, 'pending', $5)
      on conflict (razorpay_order_id) do nothing`,
      [user.id, parsed.planId, plan.priceInr, "INR", order.id],
    );

    return NextResponse.json({
      ok: true,
      keyId: razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      userName: user.fullName,
      userEmail: user.email,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to start checkout.",
      },
      { status: 400 },
    );
  }
}
