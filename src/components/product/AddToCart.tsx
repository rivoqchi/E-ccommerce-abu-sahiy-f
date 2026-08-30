"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ProductUnitPicker, hasUnitSelection } from "@/components/product/ProductUnitPicker";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";

interface AddToCartProps {
  product: Product;
}

export function AddToCart({ product }: AddToCartProps) {
  const router = useRouter();
  const { units, setUnits, inCart, addToCart, piecesPerBox } =
    useProductCartQty(product);

  const handleClick = () => {
    const result = addToCart();
    if (result === "in-cart") router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-3">
      <ProductUnitPicker
        piecesPerBox={piecesPerBox}
        value={units}
        onChange={setUnits}
      />

      <Button
        size="lg"
        className="w-full sm:w-auto sm:min-w-48"
        disabled={!inCart && !hasUnitSelection(units)}
        onClick={handleClick}
      >
        {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
      </Button>
    </div>
  );
}
