import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Copy, ExternalLink } from "lucide-react";
import { ManualPaymentForm } from "@/components/billing/manual-payment-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getManualBillingConfig } from "@/lib/billing/config";
import { getPaymentForUserByCheckoutId, refreshUserAccess } from "@/lib/data";
import { cn } from "@/lib/utils";

export default async function ManualBillingPage({
  searchParams,
}: {
  searchParams?: { payment?: string };
}) {
  const sessionUser = await requireUser("/billing/manual");
  const user = await refreshUserAccess(sessionUser);
  const paymentId = searchParams?.payment;

  if (!paymentId) {
    redirect("/settings");
  }

  const payment = await getPaymentForUserByCheckoutId(user.id, paymentId);

  if (!payment || payment.billingProvider !== "manual") {
    redirect("/settings");
  }

  const config = getManualBillingConfig();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="space-y-3">
        <Badge variant="warning" className="w-fit">
          Manual billing fallback
        </Badge>
        <h1 className="text-3xl font-semibold">Complete payment and submit the reference</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Gateway onboarding is bypassed for now. Pay using one of your configured links,
          then submit the transaction reference so the subscription can be approved.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payment request</CardTitle>
            <CardDescription>
              {payment.planTier[0].toUpperCase()}
              {payment.planTier.slice(1)} plan • ₹{payment.amountInr}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground">
              Request ID: <span className="font-mono text-foreground">{payment.providerCheckoutId}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <a
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "justify-between rounded-3xl",
                  !config.upiPaymentUrl && "pointer-events-none opacity-50",
                )}
                href={config.upiPaymentUrl ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                Pay with UPI
                <ExternalLink className="h-4 w-4" />
              </a>

              <a
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "justify-between rounded-3xl",
                  !config.internationalPaymentUrl && "pointer-events-none opacity-50",
                )}
                href={config.internationalPaymentUrl ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                Pay internationally
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {!config.upiPaymentUrl && !config.internationalPaymentUrl ? (
              <div className="rounded-3xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
                No manual payment links are configured yet. Add `MANUAL_UPI_PAYMENT_URL` or
                `MANUAL_INTERNATIONAL_PAYMENT_URL` in Vercel to make this page usable.
              </div>
            ) : null}

            <ManualPaymentForm paymentId={paymentId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How approval works</CardTitle>
            <CardDescription>
              Manual billing is operationally simple and works without provider KYC.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              1. Open one of the payment links and pay the exact amount for the plan.
            </p>
            <p>
              2. Copy the UTR / receipt / transaction ID and submit it here.
            </p>
            <p>
              3. Approve the payment from your founder admin flow, and the user&apos;s plan is
              activated for 30 days.
            </p>
            <div className="rounded-3xl border border-border/70 bg-card/60 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Copy className="h-4 w-4" />
                Support fallback
              </div>
              <div className="mt-2 space-y-1">
                <p>
                  Email: {config.supportEmail ?? "Not configured"}
                </p>
                <p>
                  WhatsApp: {config.supportWhatsapp ?? "Not configured"}
                </p>
              </div>
            </div>

            <Link
              className={cn(buttonVariants({ variant: "outline" }), "mt-2 w-full justify-between rounded-3xl")}
              href="/settings"
            >
              Back to settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
