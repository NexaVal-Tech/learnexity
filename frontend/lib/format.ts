// lib/format.ts — consistent money formatting everywhere on the site.
//
//   formatMoney(250000, "NGN")  → "₦250,000"
//   formatMoney(592.5, "USD")   → "$592.50"
//   formatMoney(1200, "USD", { decimals: 2 }) → "$1,200.00"

export type CurrencyCode = "USD" | "NGN" | string;

export function currencySymbol(currency?: CurrencyCode | null): string {
  return String(currency ?? "USD").toUpperCase() === "NGN" ? "₦" : "$";
}

/** Thousands separators; cents only when the amount has them (or when `decimals` is forced). */
export function formatAmount(value: number | string | null | undefined, opts: { decimals?: number } = {}): string {
  const n = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const hasCents = Math.round(safe * 100) % 100 !== 0;
  const digits = opts.decimals ?? (hasCents ? 2 : 0);
  return safe.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: Math.max(digits, 2) });
}

export function formatMoney(
  value: number | string | null | undefined,
  currency?: CurrencyCode | null,
  opts: { decimals?: number } = {}
): string {
  const n = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : Number(value ?? 0);
  const sign = Number.isFinite(n) && n < 0 ? "-" : "";
  return `${sign}${currencySymbol(currency)}${formatAmount(Math.abs(Number.isFinite(n) ? n : 0), opts)}`;
}

/**
 * For money <input>s: show "1,250,000" / "1,250.5" while typing, keep the
 * raw number for saving. `parseMoneyInput("1,250.50") → 1250.5`.
 */
export function formatMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (cleaned === "") return "";
  const [int, ...rest] = cleaned.split(".");
  const dec = rest.join("").slice(0, 2);
  const intFmt = (int.replace(/^0+(?=\d)/, "") || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return cleaned.includes(".") ? `${intFmt}.${dec}` : intFmt;
}

export function parseMoneyInput(display: string | number | null | undefined): number {
  if (typeof display === "number") return display;
  const n = parseFloat(String(display ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}
