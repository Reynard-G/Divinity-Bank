/**
 * Format currency using the Intl.NumberFormat API
 */
export function formatCurrency(
  amount: number,
  opts: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts.currency ?? "USD",
    maximumFractionDigits: opts.maximumFractionDigits ?? 2,
    minimumFractionDigits: opts.minimumFractionDigits ?? 2,
    ...opts,
  }).format(amount);
}
