"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { useCartStore } from "@/store/cart";

function clampQty(n: number, max: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.min(max, Math.max(1, Math.floor(n)));
}

export function useProductCartQty(product: Product | null) {
  const productId = product?.id;
  const source = productSourceOf(product?.source);
  const lineKey = productId ? cartLineKey(source, productId) : "";
  const cartQty = useCartStore((s) =>
    lineKey
      ? s.items.find(
          (item) => cartLineKey(item.source, item.productId) === lineKey,
        )?.quantity
      : undefined,
  );
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const [draftQty, setDraftQty] = useState(1);
  const inCart = cartQty != null;
  const maxQty = Math.max(0, Math.floor(product?.stock || 0));
  const qty = inCart ? cartQty : draftQty;

  useEffect(() => {
    setDraftQty(1);
  }, [productId]);

  const setQty = (next: number) => {
    if (!product || maxQty <= 0) return;
    const clamped = clampQty(next, maxQty);
    if (inCart) {
      if (clamped === cartQty) return;
      updateQuantity(product.id, clamped, product.source);
      return;
    }
    setDraftQty(clamped);
  };

  const addToCart = (): "added" | "in-cart" | "unavailable" => {
    if (!product?.inStock || maxQty <= 0) return "unavailable";
    if (inCart) return "in-cart";
    addItem(product, clampQty(draftQty, maxQty));
    return "added";
  };

  return { qty, setQty, inCart, maxQty, addToCart };
}
