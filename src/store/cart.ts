"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductSource } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { playAddToCartSound } from "@/lib/sounds";
import { resolveUnitPrice, type PriceTier } from "@/lib/pricing";
import { isStorefrontReadyProduct } from "@/lib/product-image";
import { UNLIMITED_QTY } from "@/lib/quantity";

function clampQty(n: number, max = UNLIMITED_QTY) {
  if (!Number.isFinite(n)) return 1;
  return Math.min(max, Math.max(1, Math.floor(n)));
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string, source?: ProductSource) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
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

      addItem: (product, quantity = 1) => {
        if (!isStorefrontReadyProduct(product)) return;

        const addQty = clampQty(quantity);
        const source = productSourceOf(product.source);
        const key = cartLineKey(source, product.id);
        const existing = get().items.find(
          (item) => cartLineKey(item.source, item.productId) === key,
        );
        const currentQty = existing?.quantity ?? 0;
        const nextQty = clampQty(currentQty + addQty);
        if (nextQty <= currentQty) return;

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
            return {
              items: state.items.map((item) =>
                cartLineKey(item.source, item.productId) === key
                  ? {
                      ...item,
                      quantity: nextQty,
                      price: product.price,
                      wholesalePrice,
                      stock: UNLIMITED_QTY,
                      source,
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
                quantity: nextQty,
                stock: UNLIMITED_QTY,
                source,
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

      updateQuantity: (productId, quantity, source) => {
        if (quantity <= 0) {
          get().removeItem(productId, source);
          return;
        }
        const key = cartLineKey(source, productId);
        set((state) => ({
          items: state.items.map((item) => {
            if (cartLineKey(item.source, item.productId) !== key) return item;
            return {
              ...item,
              quantity: clampQty(quantity),
            };
          }),
        }));
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
          // Migrate old cart rows without wholesalePrice / stock
          state.items = state.items.map((item) => {
            const qty = clampQty(item.quantity);
            return {
              ...item,
              wholesalePrice:
                typeof item.wholesalePrice === "number"
                  ? item.wholesalePrice
                  : item.price,
              stock: UNLIMITED_QTY,
              quantity: qty,
              source: productSourceOf(item.source),
            };
          });
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
