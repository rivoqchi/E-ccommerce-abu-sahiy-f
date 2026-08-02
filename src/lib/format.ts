/** Locale-stable grouping — Intl.NumberFormat("uz-UZ") differs between Node and browsers. */
export function formatUZS(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped}\u00a0so'm`;
}

export function formatCompactUZS(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    const label =
      millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${label}\u00a0mln so'm`;
  }
  return formatUZS(value);
}
