
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a price supplied in naira, not kobo.
 * Example: formatPrice(12500) -> ₦12,500.00
 */
export function formatPrice(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return nairaFormatter.format(0);
  }

  return nairaFormatter.format(value);
}

export function fromKobo(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return 0;

  return value / 100;
}

export function formatKoboPrice(amount) {
  return formatPrice(fromKobo(amount));
}