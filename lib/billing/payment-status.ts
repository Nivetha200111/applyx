import type { PaymentRecord } from "@/lib/types";

export function isManualPaymentAwaitingVerification(
  payment: Pick<PaymentRecord, "billingProvider" | "status" | "providerPaymentId">,
) {
  return (
    payment.billingProvider === "manual"
    && payment.status === "pending"
    && Boolean(payment.providerPaymentId)
  );
}

export function getPaymentStatusLabel(
  payment: Pick<PaymentRecord, "billingProvider" | "status" | "providerPaymentId">,
) {
  if (isManualPaymentAwaitingVerification(payment)) {
    return "awaiting verification";
  }

  return payment.status;
}
