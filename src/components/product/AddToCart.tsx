"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex h-11 items-center rounded-md border border-border bg-surface">
        <button
          type="button"
          aria-label="Kamaytirish"
          className="h-full px-3 text-lg text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm font-medium">{qty}</span>
        <button
          type="button"
          aria-label="Ko'paytirish"
          className="h-full px-3 text-lg text-muted-foreground hover:text-foreground"
          onClick={() => setQty((q) => q + 1)}
        >
          +
        </button>
      </div>

      <Button
        size="lg"
        className="flex-1 sm:flex-none sm:min-w-48"
        disabled={!product.inStock}
        onClick={handleAdd}
      >
        {added ? "Qo'shildi ✓" : "Savatga qo'shish"}
      </Button>
    </div>
  );
}
