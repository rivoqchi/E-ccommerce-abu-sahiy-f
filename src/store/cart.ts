"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types/product";
import { playAddToCartSound } from "@/lib/sounds";
import { resolveUnitPrice, type PriceTier } from "@/lib/pricing";

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
        playAddToCartSound();
        const wholesalePrice =
          Number.isFinite(product.wholesalePrice) && product.wholesalePrice >= 0
            ? product.wholesalePrice
            : product.price;

        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id,
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      price: product.price,
                      wholesalePrice,
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
                quantity,
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
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
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
          // Migrate old cart rows without wholesalePrice
          state.items = state.items.map((item) => ({
            ...item,
            wholesalePrice:
              typeof item.wholesalePrice === "number"
                ? item.wholesalePrice
                : item.price,
          }));
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
