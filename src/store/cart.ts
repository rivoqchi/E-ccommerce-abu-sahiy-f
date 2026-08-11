"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";
import { playAddToCartSound } from "@/lib/sounds";
import { resolveUnitPrice, type PriceTier } from "@/lib/pricing";

function resolveStock(product: Product): number {
  if (typeof product.stock === "number" && Number.isFinite(product.stock)) {
    return Math.max(0, Math.floor(product.stock));
  }
  return product.inStock ? Number.MAX_SAFE_INTEGER : 0;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: (tier?: PriceTier | null) => number;
  linePrice: (item: CartItem, tier?: PriceTier | null) => number;
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
        const stock = resolveStock(product);
        if (stock <= 0) return;

        const addQty = Math.max(1, Math.floor(quantity));
        const existing = get().items.find(
          (item) => item.productId === product.id,
        );
        const currentQty = existing?.quantity ?? 0;
        if (currentQty >= stock) return;

        const nextQty = Math.min(stock, currentQty + addQty);
        if (nextQty <= currentQty) return;

        playAddToCartSound();
        const wholesalePrice =
          Number.isFinite(product.wholesalePrice) && product.wholesalePrice >= 0
            ? product.wholesalePrice
            : product.price;

        set((state) => {
          const found = state.items.find(
            (item) => item.productId === product.id,
          );

          if (found) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: nextQty,
                      price: product.price,
                      wholesalePrice,
                      stock,
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
                stock,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId !== productId) return item;
            const max =
              typeof item.stock === "number" && Number.isFinite(item.stock)
                ? Math.max(0, Math.floor(item.stock))
                : Number.MAX_SAFE_INTEGER;
            if (max <= 0) return item;
            return {
              ...item,
              quantity: Math.min(max, Math.floor(quantity)),
            };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      linePrice: (item, tier = "retail") =>
        resolveUnitPrice(
          { price: item.price, wholesalePrice: item.wholesalePrice ?? item.price },
          tier,
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: (tier = "retail") =>
        get().items.reduce(
          (sum, item) => sum + get().linePrice(item, tier) * item.quantity,
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
            const qty = Math.max(1, Math.floor(item.quantity) || 1);
            const stock =
              typeof item.stock === "number" && Number.isFinite(item.stock)
                ? Math.max(0, Math.floor(item.stock))
                : qty;
            return {
              ...item,
              wholesalePrice:
                typeof item.wholesalePrice === "number"
                  ? item.wholesalePrice
                  : item.price,
              stock,
              quantity: Math.min(qty, Math.max(1, stock) || qty),
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
