export type PriceTier = "retail" | "wholesale";

export const RETAIL_MARKUP = 0.1;

/** So'm narxni minglikka yaxlitlash: 234 574 → 235 000. */
export const UZS_ROUND_TO = 1_000;

export function isWholesaleTier(
  tier: PriceTier | string | null | undefined,
): boolean {
  return tier === "wholesale";
}

export function sourceUsd(product: {
  price: number;
  wholesalePrice?: number;
}): number {
  const wholesale = Number(product.wholesalePrice);
  if (Number.isFinite(wholesale) && wholesale > 0) return wholesale;
  return Number(product.price) || 0;
}

export function usdToUzs(usd: number, rate: number, markup = 0): number {
  if (!Number.isFinite(usd) || !Number.isFinite(rate) || rate <= 0) {
    return Number.NaN;
  }
  const raw = usd * rate * (1 + markup);
  return Math.round(raw / UZS_ROUND_TO) * UZS_ROUND_TO;
}

/** Optom → USD. Oddiy → so'm +10%. */
export function resolveUnitPrice(
  product: { price: number; wholesalePrice?: number },
  tier: PriceTier | string | null | undefined = "retail",
  usdToUzsRate = 0,
): number {
  const usd = sourceUsd(product);
  if (isWholesaleTier(tier)) return usd;
  return usdToUzs(usd, usdToUzsRate, RETAIL_MARKUP);
}

export function resolveCompareAtUzs(
  compareAtUsd: number,
  usdToUzsRate: number,
): number {
  return usdToUzs(compareAtUsd, usdToUzsRate, RETAIL_MARKUP);
}

export function resolveCompareAtPrice(
  compareAtUsd: number,
  usdToUzsRate: number,
  tier: PriceTier | string | null | undefined = "retail",
): number {
  if (isWholesaleTier(tier)) return Number(compareAtUsd) || 0;
  return resolveCompareAtUzs(compareAtUsd, usdToUzsRate);
}
