import QRCode from "qrcode";
import Image from "next/image";
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
import { buildUpiPaymentUrl, getManualBillingConfig } from "@/lib/billing/config";
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
  const upiPaymentUrl =
    config.upiPaymentUrl ??
    buildUpiPaymentUrl({
      upiId: config.upiId,
      upiName: config.upiName,
      amountInr: payment.amountInr,
      note: `ApplyX ${payment.planTier} plan`,
      transactionReference: payment.providerCheckoutId,
    });
  const qrCodeDataUrl = upiPaymentUrl
    ? await QRCode.toDataURL(upiPaymentUrl, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 420,
      })
    : null;

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

            {qrCodeDataUrl ? (
              <div className="rounded-[32px] border border-border/70 bg-card/70 p-5">
                <div className="mx-auto max-w-[320px] overflow-hidden rounded-[28px] border border-border/60 bg-white p-4 shadow-sm">
                  <Image
                    alt={`UPI QR code for ${config.upiName ?? "ApplyX payments"}`}
                    className="h-auto w-full rounded-2xl"
                    height={320}
                    src={qrCodeDataUrl}
                    width={320}
                  />
                </div>
                <div className="mt-4 space-y-1 text-center">
                  <div className="text-sm font-medium text-foreground">
                    Scan to pay ₹{payment.amountInr}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {config.upiName ?? "UPI payee"}
                  </div>
                  <div className="font-mono text-sm text-foreground">
                    {config.upiId ?? "UPI ID not configured"}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <a
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "justify-between rounded-3xl",
                  !upiPaymentUrl && "pointer-events-none opacity-50",
                )}
                href={upiPaymentUrl ?? "#"}
                rel="noreferrer"
                target="_blank"
              >
                Open UPI app
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

            {!upiPaymentUrl && !config.internationalPaymentUrl ? (
              <div className="rounded-3xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-7 text-amber-100">
                No manual payment options are configured yet. Add `MANUAL_UPI_ID` or
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
