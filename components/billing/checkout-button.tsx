"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { PlanTier } from "@/lib/types";

interface CheckoutButtonProps {
  planId: Exclude<PlanTier, "free">;
  label: string;
}

export function CheckoutButton({ planId, label }: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
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
                checkoutUrl?: string;
              }
            | null;

          if (!checkoutResponse.ok || !checkoutPayload?.checkoutUrl) {
            toast.error(checkoutPayload?.error ?? "Unable to start checkout.");
            return;
          }

          window.location.assign(checkoutPayload.checkoutUrl);
        })
      }
      variant="default"
    >
      {isPending ? "Redirecting..." : label}
    </Button>
  );
}
