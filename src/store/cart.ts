"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductSource } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { playAddToCartSound } from "@/lib/sounds";
import { resolveUnitPrice, type PriceTier } from "@/lib/pricing";
import { isStorefrontReadyProduct } from "@/lib/product-image";
import { UNLIMITED_QTY } from "@/lib/quantity";
import { totalPieces } from "@/lib/product-units";

function clampUnit(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(UNLIMITED_QTY, Math.max(0, Math.floor(n)));
}

export type CartUnitInput = {
  boxQuantity?: number;
  pieceQuantity?: number;
  /** Legacy single-unit add */
  quantity?: number;
};

function normalizeUnits(
  input: CartUnitInput,
  piecesPerBox?: number,
): { boxQuantity: number; pieceQuantity: number; quantity: number } {
  let boxQuantity = clampUnit(input.boxQuantity ?? 0);
  let pieceQuantity = clampUnit(input.pieceQuantity ?? 0);
  if (
    input.quantity != null &&
    input.boxQuantity == null &&
    input.pieceQuantity == null
  ) {
    pieceQuantity = clampUnit(input.quantity);
    boxQuantity = 0;
  }
  const quantity = totalPieces(boxQuantity, pieceQuantity, piecesPerBox);
  return { boxQuantity, pieceQuantity, quantity };
}

function migrateCartItem(item: CartItem): CartItem {
  const boxQuantity = clampUnit(item.boxQuantity ?? 0);
  const pieceQuantity =
    item.pieceQuantity != null
      ? clampUnit(item.pieceQuantity)
      : clampUnit(item.quantity);
  const quantity = totalPieces(
    boxQuantity,
    pieceQuantity,
    item.piecesPerBox,
  );
  return {
    ...item,
    boxQuantity,
    pieceQuantity,
    quantity: quantity > 0 ? quantity : clampUnit(item.quantity) || 1,
    wholesalePrice:
      typeof item.wholesalePrice === "number"
        ? item.wholesalePrice
        : item.price,
    stock: UNLIMITED_QTY,
    source: productSourceOf(item.source),
  };
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (product: Product, units?: CartUnitInput) => void;
  removeItem: (productId: string, source?: ProductSource) => void;
  updateUnits: (
    productId: string,
    units: { boxQuantity: number; pieceQuantity: number },
    source?: ProductSource,
  ) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: (tier?: PriceTier | null, usdToUzs?: number) => number;
  linePrice: (
    item: CartItem,
    tier?: PriceTier | null,
    usdToUzs?: number,
  ) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      setHydrated: (value) => {
        if (get().hydrated === value) return;
        set({ hydrated: value });
      },

      addItem: (product, units = { boxQuantity: 0, pieceQuantity: 0 }) => {
        if (!isStorefrontReadyProduct(product)) return;

        const source = productSourceOf(product.source);
        const key = cartLineKey(source, product.id);
        const ppb = product.piecesPerBox;
        const incoming = normalizeUnits(units, ppb);
        if (incoming.quantity < 1) return;

        playAddToCartSound();
        const wholesalePrice =
          Number.isFinite(product.wholesalePrice) && product.wholesalePrice >= 0
            ? product.wholesalePrice
            : product.price;

        set((state) => {
          const found = state.items.find(
            (item) => cartLineKey(item.source, item.productId) === key,
          );

          if (found) {
            const merged = normalizeUnits(
              {
                boxQuantity: found.boxQuantity + incoming.boxQuantity,
                pieceQuantity: found.pieceQuantity + incoming.pieceQuantity,
              },
              ppb ?? found.piecesPerBox,
            );
            if (merged.quantity < 1) return state;
            return {
              items: state.items.map((item) =>
                cartLineKey(item.source, item.productId) === key
                  ? {
                      ...item,
                      ...merged,
                      price: product.price,
                      wholesalePrice,
                      stock: UNLIMITED_QTY,
                      source,
                      piecesPerBox: ppb ?? item.piecesPerBox,
                      partnerId: product.partnerId,
                      partnerName: product.partnerName,
                      partnerLogo: product.partnerLogo,
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                wholesalePrice,
                image: product.images[0],
                ...incoming,
                stock: UNLIMITED_QTY,
                source,
                piecesPerBox: ppb,
                partnerId: product.partnerId,
                partnerName: product.partnerName,
                partnerLogo: product.partnerLogo,
              },
            ],
          };
        });
      },

      removeItem: (productId, source) => {
        const key = cartLineKey(source, productId);
        set((state) => ({
          items: state.items.filter(
            (item) => cartLineKey(item.source, item.productId) !== key,
          ),
        }));
      },

      updateUnits: (productId, units, source) => {
        const key = cartLineKey(source, productId);
        set((state) => {
          const item = state.items.find(
            (i) => cartLineKey(i.source, i.productId) === key,
          );
          if (!item) return state;
          const next = normalizeUnits(units, item.piecesPerBox);
          if (next.quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => cartLineKey(i.source, i.productId) !== key,
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              cartLineKey(i.source, i.productId) === key
                ? { ...i, ...next }
                : i,
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      linePrice: (item, tier = "retail", usdToUzs = 0) =>
        resolveUnitPrice(
          { price: item.price, wholesalePrice: item.wholesalePrice ?? item.price },
          tier,
          usdToUzs,
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: (tier = "retail", usdToUzs = 0) =>
        get().items.reduce(
          (sum, item) =>
            sum + get().linePrice(item, tier, usdToUzs) * item.quantity,
          0,
        ),
    }),
    {
      name: "sami-cart",
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[cart] rehydrate failed", error);
        }
        if (state) {
          state.items = state.items.map(migrateCartItem);
          state.setHydrated(true);
        } else {
          queueMicrotask(() => {
            useCartStore.setState({ hydrated: true });
          });
        }
      },
    },
  ),
);
