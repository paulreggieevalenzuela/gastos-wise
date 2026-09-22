/**
 * Money is handled internally as integer cents to avoid floating-point
 * drift. Every function here is pure — no I/O, no Prisma, no Next.js —
 * so it can be unit tested in isolation and reused by any future client
 * (web, mobile, a CLI) exactly as the architecture roadmap calls for.
 */

/** Convert a decimal amount (number or numeric string, e.g. "1234.50") to integer cents. */
export function toCents(amount: number | string): number {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid monetary amount: ${amount}`);
  }
  return Math.round(n * 100);
}

/** Convert integer cents back to a decimal number, e.g. 123450 -> 1234.5 */
export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}

/** Format cents as a currency string, e.g. 123450 -> "₱1,234.50" */
export function formatCents(
  cents: number,
  currency: string = "PHP",
  locale: string = "en-PH",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(fromCents(cents));
}

export function addCents(...values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0);
}
