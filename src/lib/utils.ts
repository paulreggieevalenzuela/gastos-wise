import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a decimal amount (as stored/returned by the DB) as a currency string. */
export function formatMoney(amount: number | string, currency: string = "PHP"): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(n);
}

export function formatSignedMoney(amount: number | string, currency: string = "PHP"): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  const sign = n > 0 ? "+" : "";
  return `${sign}${formatMoney(n, currency)}`;
}

export function formatDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function formatRelativeDay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  return formatDate(d);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
