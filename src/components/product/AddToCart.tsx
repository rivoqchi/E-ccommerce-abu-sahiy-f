"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

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

  const maxQty = Math.max(0, product.stock || 0);

  const handleClick = () => {
    if (!product.inStock || maxQty <= 0) return;
    if (inCart) {
      router.push("/cart");
      return;
    }
    addItem(product, Math.min(qty, maxQty));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityStepper
        size="md"
        value={qty}
        max={maxQty}
        disabled={!product.inStock}
        onChange={setQty}
      />

      <Button
        size="lg"
        className="flex-1 sm:flex-none sm:min-w-48"
        disabled={!product.inStock || maxQty <= 0}
        onClick={handleClick}
      >
        {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
      </Button>
    </div>
  );
}
