"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { UNLIMITED_QTY } from "@/lib/quantity";

function clampQty(n: number, max = UNLIMITED_QTY) {
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
  const maxQty = UNLIMITED_QTY;
  const qty = inCart ? cartQty : draftQty;

  useEffect(() => {
    setDraftQty(1);
  }, [productId]);

  const setQty = (next: number) => {
    if (!product) return;
    const clamped = clampQty(next);
    if (inCart) {
      if (clamped === cartQty) return;
      updateQuantity(product.id, clamped, product.source);
      return;
    }
    setDraftQty(clamped);
  };

  const addToCart = (): "added" | "in-cart" | "unavailable" => {
    if (!product) return "unavailable";
    if (inCart) return "in-cart";
    addItem(product, clampQty(draftQty));
    return "added";
  };

  return { qty, setQty, inCart, maxQty, addToCart };
}
