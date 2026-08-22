"use client";

import { createContext, useContext, type ReactNode } from "react";
import type {
  ProductDisplayField,
  ProductDisplaySettings,
} from "@/lib/product-display";
import { normalizeSpecLabel } from "@/lib/product-display";

const EMPTY_SETTINGS: ProductDisplaySettings = {
  hiddenFields: [],
  hiddenSpecLabels: [],
};

const ProductDisplayContext =
  createContext<ProductDisplaySettings>(EMPTY_SETTINGS);

export function ProductDisplayProvider({
  settings,
  children,
}: {
  settings: ProductDisplaySettings;
  children: ReactNode;
}) {
  return (
    <ProductDisplayContext.Provider value={settings}>
      {children}
    </ProductDisplayContext.Provider>
  );
}

export function useProductDisplaySettings(): ProductDisplaySettings {
  return useContext(ProductDisplayContext);
}

export function useProductFieldVisible(field: ProductDisplayField): boolean {
  return !useContext(ProductDisplayContext).hiddenFields.includes(field);
}

export function useStorefrontPricesVisible(): boolean {
  return useProductFieldVisible("price");
}

export function useVisibleSpecs<T extends { label: string }>(specs: T[]): T[] {
  const { hiddenFields, hiddenSpecLabels } = useContext(ProductDisplayContext);
  if (hiddenFields.includes("specs")) return [];
  if (!hiddenSpecLabels.length) return specs;
  const hidden = new Set(hiddenSpecLabels.map((label) => normalizeSpecLabel(label)));
  return specs.filter((spec) => !hidden.has(normalizeSpecLabel(spec.label)));
}
