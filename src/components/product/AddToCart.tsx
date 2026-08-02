"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    s.items.some((item) => item.productId === product.id),
  );
  const [qty, setQty] = useState(1);

  const handleClick = () => {
    if (!product.inStock) return;
    if (inCart) {
      router.push("/cart");
      return;
    }
    addItem(product, qty);
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
        onClick={handleClick}
      >
        {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
      </Button>
    </div>
  );
}
