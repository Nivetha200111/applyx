"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      disabled={isPending}
      variant="outline"
      onClick={() =>
        startTransition(async () => {
          const response = await fetch("/api/billing/portal", {
            method: "POST",
          });

          const payload = (await response.json().catch(() => null)) as
            | {
                error?: string;
                portalUrl?: string;
              }
            | null;

          if (!response.ok || !payload?.portalUrl) {
            toast.error(payload?.error ?? "Unable to open billing portal.");
            return;
          }

          window.location.assign(payload.portalUrl);
        })
      }
    >
      {isPending ? "Opening..." : "Manage billing"}
    </Button>
  );
}
