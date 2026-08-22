"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const router = useRouter();
  const { qty, setQty, inCart, maxQty, addToCart } = useProductCartQty(product);

  const handleClick = () => {
    const result = addToCart();
    if (result === "in-cart") router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QuantityStepper
        size="md"
        value={qty}
        max={maxQty}
        onChange={setQty}
      />

      <Button
        size="lg"
        className="flex-1 sm:flex-none sm:min-w-48"
        onClick={handleClick}
      >
        {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
      </Button>
    </div>
  );
}
