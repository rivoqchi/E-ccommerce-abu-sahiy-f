export type XitoyPricingInput = {
  chinaPriceYuan: number;
  cubicM3: number;
  weightKg: number;
  yuanRate: number;
  customsFee: number;
};

export type XitoyPricingResult = {
  priceUsd: number;
  logisticsUsd: number;
  customsUsd: number;
  costPriceUsd: number;
  costPriceYuan: number;
};

export function calculateXitoyCostPrice(
  input: XitoyPricingInput,
): XitoyPricingResult {
  const { chinaPriceYuan, cubicM3, weightKg, yuanRate, customsFee } = input;

  const priceUsd = yuanRate > 0 ? chinaPriceYuan / yuanRate : 0;
  const logisticsUsd = cubicM3 * 100;
  const customsUsd = weightKg * customsFee;
  const costPriceUsd = priceUsd + logisticsUsd + customsUsd;
  const costPriceYuan = costPriceUsd * yuanRate;

  return {
    priceUsd,
    logisticsUsd,
    customsUsd,
    costPriceUsd,
    costPriceYuan,
  };
}

export function parseXitoyNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!normalized.trim()) return null;
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}
