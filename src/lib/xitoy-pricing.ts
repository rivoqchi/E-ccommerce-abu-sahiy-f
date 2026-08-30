export type YuanRateUnit = "yuan" | "usd";

export type XitoyPricingInput = {
  chinaPriceYuan: number;
  cubicM3: number;
  weightKg: number;
  yuanRate: number;
  yuanRateUnit?: YuanRateUnit;
  customsFee: number;
};

export type XitoyPricingResult = {
  priceUsd: number;
  logisticsUsd: number;
  customsUsd: number;
  costPriceUsd: number;
  costPriceYuan: number | null;
  yuanPerUsd: number | null;
};

export function yuanPerUsdFromRate(
  rate: number,
  unit: YuanRateUnit,
): number | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  if (unit === "yuan") return rate;
  return 1 / rate;
}

export function formatYuanRateLabel(rate: number, unit: YuanRateUnit): string {
  if (unit === "yuan") {
    return `1 $ = ${rate.toLocaleString("uz-UZ", { maximumFractionDigits: 4 })} ¥`;
  }
  return `1 ¥ = ${rate.toLocaleString("uz-UZ", { maximumFractionDigits: 4 })} $`;
}

export function calculateXitoyCostPrice(
  input: XitoyPricingInput,
): XitoyPricingResult {
  const {
    chinaPriceYuan,
    cubicM3,
    weightKg,
    yuanRate,
    yuanRateUnit = "yuan",
    customsFee,
  } = input;

  const logisticsUsd = cubicM3 * 100;
  const customsUsd = weightKg * customsFee;

  if (yuanRateUnit === "usd") {
    const priceUsd = chinaPriceYuan;
    const costPriceUsd = priceUsd + logisticsUsd + customsUsd;
    return {
      priceUsd,
      logisticsUsd,
      customsUsd,
      costPriceUsd,
      costPriceYuan: null,
      yuanPerUsd: null,
    };
  }

  const yuanPerUsd = yuanPerUsdFromRate(yuanRate, "yuan");
  const priceUsd =
    yuanPerUsd && yuanPerUsd > 0 ? chinaPriceYuan / yuanPerUsd : 0;
  const costPriceUsd = priceUsd + logisticsUsd + customsUsd;
  const costPriceYuan = yuanPerUsd ? costPriceUsd * yuanPerUsd : null;

  return {
    priceUsd,
    logisticsUsd,
    customsUsd,
    costPriceUsd,
    costPriceYuan,
    yuanPerUsd,
  };
}

export function parseXitoyNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!normalized.trim()) return null;
  const num = Number(normalized);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
}

export function chinaPriceFieldLabel(unit: YuanRateUnit): string {
  return unit === "yuan" ? "Xitoy narxi (¥)" : "Xitoy narxi ($)";
}
