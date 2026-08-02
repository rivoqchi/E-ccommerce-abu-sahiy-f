/** Locale-stable USD formatting (avoids Intl Node/browser mismatches). */
export function formatUSD(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const cents = Math.round(abs * 100);
  const dollars = Math.floor(cents / 100);
  const remainder = cents % 100;
  const grouped = dollars
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${sign}$${grouped}.${remainder.toString().padStart(2, "0")}`;
}

export function formatCompactUSD(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const label =
      millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${sign}$${label}M`;
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const label =
      thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
    return `${sign}$${label}K`;
  }

  return formatUSD(value);
}

/** @deprecated Use formatUSD — kept so existing imports keep working. */
export const formatUZS = formatUSD;

/** @deprecated Use formatCompactUSD */
export const formatCompactUZS = formatCompactUSD;
