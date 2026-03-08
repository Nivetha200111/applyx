"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ManualPaymentFormProps {
  paymentId: string;
}

export function ManualPaymentForm({ paymentId }: ManualPaymentFormProps) {
  const router = useRouter();
  const [channel, setChannel] = useState<"upi" | "international" | "other">("upi");
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();

        startTransition(async () => {
          const response = await fetch("/api/billing/manual-submit", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              paymentId,
              channel,
              transactionReference,
              notes,
            }),
          });

          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;

          if (!response.ok) {
            toast.error(payload?.error ?? "Unable to submit payment reference.");
            return;
          }

          toast.success("Payment reference submitted. Approve it from your admin flow.");
          setNotes("");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { value: "upi", label: "UPI" },
          { value: "international", label: "International link" },
          { value: "other", label: "Other" },
        ].map((option) => (
          <button
            key={option.value}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
              channel === option.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card/70 text-muted-foreground"
            }`}
            onClick={() => setChannel(option.value as "upi" | "international" | "other")}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="transaction-reference">
          Transaction reference
        </label>
        <Input
          id="transaction-reference"
          onChange={(event) => setTransactionReference(event.target.value)}
          placeholder="UTR, PayPal transaction ID, bank ref, or payment link receipt ID"
          required
          value={transactionReference}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="payment-notes">
          Notes
        </label>
        <Textarea
          id="payment-notes"
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional: mention which payment link you used or any issue during payment."
          value={notes}
        />
      </div>

      <Button disabled={isPending || transactionReference.trim().length < 3} type="submit">
        {isPending ? "Submitting..." : "Submit payment reference"}
      </Button>
    </form>
  );
}
