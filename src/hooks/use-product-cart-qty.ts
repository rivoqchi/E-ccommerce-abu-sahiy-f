"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { cartLineKey, productSourceOf } from "@/types/product";
import { useCartStore } from "@/store/cart";
import {
  hasUnitSelection,
  type ProductUnitValues,
} from "@/components/product/ProductUnitPicker";

const emptyUnits = (): ProductUnitValues => ({
  boxQuantity: 0,
  pieceQuantity: 0,
});

export function useProductCartQty(product: Product | null) {
  const productId = product?.id;
  const source = productSourceOf(product?.source);
  const lineKey = productId ? cartLineKey(source, productId) : "";
  const cartLine = useCartStore((s) =>
    lineKey
      ? s.items.find(
          (item) => cartLineKey(item.source, item.productId) === lineKey,
        )
      : undefined,
  );
  const addItem = useCartStore((s) => s.addItem);
  const updateUnits = useCartStore((s) => s.updateUnits);

  const [draftUnits, setDraftUnits] = useState<ProductUnitValues>(emptyUnits);
  const inCart = cartLine != null;
  const units: ProductUnitValues = inCart
    ? {
        boxQuantity: cartLine.boxQuantity,
        pieceQuantity: cartLine.pieceQuantity,
      }
    : draftUnits;

  useEffect(() => {
    setDraftUnits(emptyUnits());
  }, [productId]);

  const setUnits = (next: ProductUnitValues) => {
    if (!product) return;
    if (inCart) {
      updateUnits(product.id, next, product.source);
      return;
    }
    setDraftUnits(next);
  };

  const addToCart = (): "added" | "in-cart" | "unavailable" => {
    if (!product) return "unavailable";
    if (inCart) return "in-cart";
    if (!hasUnitSelection(draftUnits)) return "unavailable";
    addItem(product, draftUnits);
    return "added";
  };

  return {
    units,
    setUnits,
    inCart,
    addToCart,
    piecesPerBox: product?.piecesPerBox,
  };
}
