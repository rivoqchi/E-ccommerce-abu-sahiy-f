"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, WishlistItem } from "@/types/product";

interface WishlistState {
  items: WishlistItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  hasItem: (productId: string) => boolean;
  clear: () => void;
  totalItems: () => number;
}

function toWishlistItem(product: Product): WishlistItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    wholesalePrice:
      Number.isFinite(product.wholesalePrice) && product.wholesalePrice >= 0
        ? product.wholesalePrice
        : product.price,
    image: product.images[0],
    brand: product.brand,
  };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      setHydrated: (value) => {
        if (get().hydrated === value) return;
        set({ hydrated: value });
      },

      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.productId === product.id)) {
            return state;
          }
          return { items: [...state.items, toWishlistItem(product)] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      toggleItem: (product) => {
        const exists = get().items.some(
          (item) => item.productId === product.id,
        );
        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      hasItem: (productId) =>
        get().items.some((item) => item.productId === productId),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.length,
    }),
    {
      name: "sami-wishlist",
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[wishlist] rehydrate failed", error);
        }
        if (state) {
          state.setHydrated(true);
        } else {
          queueMicrotask(() => {
            useWishlistStore.setState({ hydrated: true });
          });
        }
      },
    },
  ),
);
