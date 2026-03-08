import { getSiteUrl } from "@/lib/site-url";

export type ManualBillingConfig = {
  upiId: string | null;
  upiName: string | null;
  upiPaymentUrl: string | null;
  internationalPaymentUrl: string | null;
  supportEmail: string | null;
  supportWhatsapp: string | null;
};

function trimEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getManualBillingConfig(): ManualBillingConfig {
  return {
    upiId: trimEnv("MANUAL_UPI_ID"),
    upiName: trimEnv("MANUAL_UPI_NAME"),
    upiPaymentUrl: trimEnv("MANUAL_UPI_PAYMENT_URL"),
    internationalPaymentUrl: trimEnv("MANUAL_INTERNATIONAL_PAYMENT_URL"),
    supportEmail: trimEnv("MANUAL_BILLING_SUPPORT_EMAIL"),
    supportWhatsapp: trimEnv("MANUAL_BILLING_SUPPORT_WHATSAPP"),
  };
}

export function hasManualBillingConfig() {
  const config = getManualBillingConfig();
  return Boolean(config.upiId || config.upiPaymentUrl || config.internationalPaymentUrl);
}

export function getManualBillingReturnUrl(paymentId: string) {
  return `${getSiteUrl()}/billing/manual?payment=${encodeURIComponent(paymentId)}`;
}

export function buildUpiPaymentUrl(input: {
  upiId: string | null;
  upiName: string | null;
  amountInr?: number | null;
  note?: string | null;
  transactionReference?: string | null;
}) {
  if (!input.upiId) {
    return null;
  }

  const params = new URLSearchParams({
    pa: input.upiId,
    cu: "INR",
  });

  if (input.upiName) {
    params.set("pn", input.upiName);
  }

  if (typeof input.amountInr === "number" && input.amountInr > 0) {
    params.set("am", input.amountInr.toFixed(2));
  }

  if (input.note) {
    params.set("tn", input.note);
  }

  if (input.transactionReference) {
    params.set("tr", input.transactionReference);
  }

  return `upi://pay?${params.toString()}`;
}
