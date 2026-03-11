const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, minimumFractionDigits?: number, maximumFractionDigits?: number) {
  const key = `${currency}:${minimumFractionDigits ?? "default"}:${maximumFractionDigits ?? "default"}`;
  const cached = formatterCache.get(key);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  formatterCache.set(key, formatter);
  return formatter;
}

export function getCurrencyFractionDigits(currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits ?? 2;
}

export function formatCurrencyAmount(
  amount: number,
  currency: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
) {
  return getFormatter(
    currency,
    options?.minimumFractionDigits,
    options?.maximumFractionDigits,
  ).format(amount);
}

export function minorUnitsToAmount(minorUnits: number, currency: string) {
  const fractionDigits = getCurrencyFractionDigits(currency);
  return minorUnits / 10 ** fractionDigits;
}
