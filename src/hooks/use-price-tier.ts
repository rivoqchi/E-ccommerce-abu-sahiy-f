"use client";

import { useAuthStore } from "@/store/auth";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { resolveUnitPrice, type PriceTier } from "@/lib/pricing";

export function usePriceTier(): PriceTier {
  const tier = useAuthStore((s) => s.user?.priceTier);
  return tier === "wholesale" ? "wholesale" : "retail";
}

export function useProductUnitPrice(product: {
  price: number;
  wholesalePrice?: number;
}): number {
  const tier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  return resolveUnitPrice(product, tier, usdToUzs);
}
