"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/catalog/ProductImage";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DISMISS_DISTANCE = 110;

function formatSoldLabel(count: number): string {
  if (count <= 0) return "Hali sotilmagan";
  if (count === 1) return "1 marta sotib olingan";
  return `${count} marta sotib olingan`;
}

export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: ProductQuickViewProps) {
  const router = useRouter();
  const { qty, setQty, inCart, maxQty, addToCart } =
    useProductCartQty(product);
  const [active, setActive] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setActive(0);
      setDragY(0);
      dragYRef.current = 0;
      draggingRef.current = false;
      setIsDragging(false);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const current = product.images[active] ?? product.images[0];
  const soldCount = product.buyerCount ?? 0;

  const handleAdd = () => {
    if (addToCart() === "in-cart") {
      onOpenChange(false);
      router.push("/cart");
    }
  };

  const isDesktopTouch = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 640px)").matches;

  const onHandleTouchStart = (e: React.TouchEvent) => {
    if (isDesktopTouch()) return;
    startYRef.current = e.touches[0].clientY;
    dragYRef.current = 0;
    draggingRef.current = true;
    setIsDragging(true);
  };

  const onHandleTouchMove = (e: React.TouchEvent) => {
    if (!draggingRef.current || isDesktopTouch()) return;
    const dy = Math.max(0, e.touches[0].clientY - startYRef.current);
    dragYRef.current = dy;
    setDragY(dy);
  };

  const onHandleTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (dragYRef.current >= DISMISS_DISTANCE) {
      onOpenChange(false);
      return;
    }
    setDragY(0);
    dragYRef.current = 0;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          opacity: dragY > 0 ? Math.max(0.35, 1 - dragY / 420) : undefined,
          transition: isDragging
            ? "none"
            : "transform 0.22s ease-out, opacity 0.22s ease-out",
        }}
        className={cn(
          "gap-0 rounded-t-[1.75rem] border-0 p-0",
          "mx-auto h-auto max-h-[90dvh] w-full max-w-[26rem] sm:max-w-[28rem]",
          "sm:bottom-6 sm:rounded-3xl sm:border sm:border-border/60 sm:shadow-2xl",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          "data-[side=bottom]:data-starting-style:translate-y-full",
          "data-[side=bottom]:data-ending-style:translate-y-full",
          "max-sm:[&_[data-slot=sheet-close]]:hidden",
        )}
      >
        <SheetTitle className="sr-only">{product.name}</SheetTitle>

        <div
          className="flex shrink-0 touch-none justify-center py-4 sm:hidden"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          onTouchCancel={onHandleTouchEnd}
        >
          <span
            aria-hidden
            className="h-1.5 w-10 rounded-full bg-muted-foreground/30"
          />
          <span className="sr-only">Pastga tortib yoping</span>
        </div>

        <div className="hidden shrink-0 justify-center pt-3 pb-1 sm:flex">
          <span className="sr-only">Mahsulot rasmi</span>
        </div>

        <div className="px-4 pb-4">
          <div className="relative overflow-hidden rounded-[1.25rem] bg-muted">
            <div className="relative aspect-square w-full">
              <ProductImage
                src={current}
                alt={product.name}
                fill
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pt-12 pb-4">
              <p className="text-center text-sm font-semibold tracking-tight text-white tabular-nums">
                {formatSoldLabel(soldCount)}
              </p>
            </div>

            {product.images.length > 1 ? (
              <ul className="absolute inset-x-0 top-3 flex justify-center gap-1.5 px-3">
                {product.images.map((src, index) => (
                  <li key={`${src}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`${product.name} — ${index + 1}-rasm`}
                      className={cn(
                        "h-1.5 rounded-full transition",
                        active === index
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/45",
                      )}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <QuantityStepper
              size="md"
              className="h-11 flex-1 justify-between"
              value={qty}
              max={maxQty}
              disabled={!product.inStock}
              onChange={setQty}
            />

            <Button
              type="button"
              size="lg"
              className="h-11 flex-1 gap-2 rounded-full text-sm font-semibold"
              disabled={!product.inStock || maxQty <= 0}
              onClick={handleAdd}
            >
              <ShoppingBag className="size-4" strokeWidth={1.75} />
              {inCart ? "Savatga qaytish" : "Savatga"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
