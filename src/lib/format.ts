/** Locale-stable grouping — Intl.NumberFormat("uz-UZ") differs between Node and browsers. */
export function formatUZS(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped} so'm`;
}

export function formatCompactUZS(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} mln so'm`;
  }
  return formatUZS(amount);
}
