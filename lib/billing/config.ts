import { getSiteUrl } from "@/lib/site-url";

export type ManualBillingConfig = {
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
    upiPaymentUrl: trimEnv("MANUAL_UPI_PAYMENT_URL"),
    internationalPaymentUrl: trimEnv("MANUAL_INTERNATIONAL_PAYMENT_URL"),
    supportEmail: trimEnv("MANUAL_BILLING_SUPPORT_EMAIL"),
    supportWhatsapp: trimEnv("MANUAL_BILLING_SUPPORT_WHATSAPP"),
  };
}

export function hasManualBillingConfig() {
  const config = getManualBillingConfig();
  return Boolean(config.upiPaymentUrl || config.internationalPaymentUrl);
}

export function getManualBillingReturnUrl(paymentId: string) {
  return `${getSiteUrl()}/billing/manual?payment=${encodeURIComponent(paymentId)}`;
}
