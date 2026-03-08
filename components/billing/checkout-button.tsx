"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface CheckoutButtonProps {
  planId: Exclude<PlanTier, "free">;
  label: string;
}

export function CheckoutButton({ planId, label }: CheckoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]',
    );

    if (existing) {
      setScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, []);

  return (
    <Button
      disabled={!scriptReady || isPending}
      onClick={() =>
        startTransition(async () => {
          const checkoutResponse = await fetch("/api/billing/checkout", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ planId }),
          });

          const checkoutPayload = (await checkoutResponse.json().catch(() => null)) as
            | {
                error?: string;
                amount?: number;
                currency?: string;
                keyId?: string;
                orderId?: string;
                userName?: string | null;
                userEmail?: string;
              }
            | null;

          if (!checkoutResponse.ok || !checkoutPayload?.orderId || !window.Razorpay) {
            toast.error(checkoutPayload?.error ?? "Unable to start checkout.");
            return;
          }

          const razorpay = new window.Razorpay({
            key: checkoutPayload.keyId,
            amount: checkoutPayload.amount,
            currency: checkoutPayload.currency,
            order_id: checkoutPayload.orderId,
            name: "ApplyX",
            description: `${planId} monthly access`,
            prefill: {
              name: checkoutPayload.userName ?? undefined,
              email: checkoutPayload.userEmail,
            },
            theme: {
              color: "#10b981",
            },
            handler: async (response: Record<string, string>) => {
              const verifyResponse = await fetch("/api/billing/verify", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  planId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyPayload = (await verifyResponse.json().catch(() => null)) as
                | { error?: string }
                | null;

              if (!verifyResponse.ok) {
                toast.error(verifyPayload?.error ?? "Payment verification failed.");
                return;
              }

              toast.success("Plan upgraded successfully.");
              router.refresh();
            },
          });

          razorpay.open();
        })
      }
      variant="default"
    >
      {isPending ? "Opening checkout..." : label}
    </Button>
  );
}
