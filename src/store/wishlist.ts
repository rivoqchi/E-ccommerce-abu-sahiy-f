"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductSource, WishlistItem } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { isStorefrontReadyProduct } from "@/lib/product-image";

interface WishlistState {
  items: WishlistItem[];
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string, source?: ProductSource) => void;
  toggleItem: (product: Product) => void;
  hasItem: (productId: string, source?: ProductSource) => boolean;
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
    stock: Math.max(0, product.stock || 0),
    source: productSourceOf(product.source),
    code: product.code,
    partnerId: product.partnerId,
    partnerName: product.partnerName,
    partnerLogo: product.partnerLogo,
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
        if (!isStorefrontReadyProduct(product)) return;
        const key = cartLineKey(product.source, product.id);
        set((state) => {
          if (
            state.items.some(
              (item) => cartLineKey(item.source, item.productId) === key,
            )
          ) {
            return state;
          }
          return { items: [...state.items, toWishlistItem(product)] };
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

      toggleItem: (product) => {
        const key = cartLineKey(product.source, product.id);
        const exists = get().items.some(
          (item) => cartLineKey(item.source, item.productId) === key,
        );
        if (exists) {
          get().removeItem(product.id, product.source);
        } else {
          get().addItem(product);
        }
      },

      hasItem: (productId, source) => {
        const key = cartLineKey(source, productId);
        return get().items.some(
          (item) => cartLineKey(item.source, item.productId) === key,
        );
      },

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
          state.items = state.items.map((item) => ({
            ...item,
            source: productSourceOf(item.source),
          }));
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
