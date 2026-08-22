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

  if (remainder === 0) {
    return `${sign}$${grouped}`;
  }

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

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** `57000` → `57 000` */
export function formatUZS(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  const sign = value < 0 ? "-" : "";
  const rounded = Math.round(Math.abs(value));
  return `${sign}${groupThousands(rounded.toString())}`;
}

export function formatCompactUZS(amount: number): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const label =
      millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${sign}${label} mln`;
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const label =
      thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
    return `${sign}${label} ming`;
  }

  return formatUZS(value);
}

/** CBU kursi: `12 854.89` */
export function formatRateUZS(rate: number): string {
  const value = Number(rate);
  if (!Number.isFinite(value) || value <= 0) return "—";

  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const [intPart, frac = "00"] = abs.toFixed(2).split(".");
  const grouped = groupThousands(intPart);
  if (frac === "00") {
    return `${sign}${grouped}`;
  }
  return `${sign}${grouped}.${frac}`;
}

/** Optom profil → `$12.50`. Oddiy → `57 000`. */
export function formatMoney(
  amount: number,
  tierOrCurrency: string | null | undefined,
): string {
  if (tierOrCurrency === "wholesale" || tierOrCurrency === "USD") {
    return formatUSD(amount);
  }
  return formatUZS(amount);
}
