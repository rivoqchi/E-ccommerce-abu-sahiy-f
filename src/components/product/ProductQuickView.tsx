"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductImage } from "@/components/catalog/ProductImage";
import { NewProductBadge } from "@/components/catalog/NewProductBadge";
import { isProductNew } from "@/lib/product-new";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductUnitPicker, hasUnitSelection } from "@/components/product/ProductUnitPicker";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { useProductFieldVisible } from "@/components/product/ProductDisplayProvider";
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
  const { units, setUnits, inCart, addToCart, piecesPerBox } =
    useProductCartQty(product);
  const [active, setActive] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const showBuyerCount = useProductFieldVisible("buyerCount");
  const keyboardInset = useKeyboardInset();
  const keyboardOpen = keyboardInset > 0;

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
  const isNew = isProductNew(product.newHighlightUntil);

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
        initialFocus={false}
        style={{
          ...(keyboardOpen
            ? {
                bottom: keyboardInset,
                maxHeight: `min(90dvh, calc(100dvh - ${keyboardInset}px))`,
              }
            : undefined),
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          opacity: dragY > 0 ? Math.max(0.35, 1 - dragY / 420) : undefined,
          transition: isDragging
            ? "none"
            : "transform 0.22s ease-out, opacity 0.22s ease-out, bottom 0.2s ease-out, max-height 0.2s ease-out",
        }}
        className={cn(
          "gap-0 overflow-y-auto rounded-t-[1.75rem] border-0 p-0",
          "mx-auto h-auto max-h-[90dvh] w-full max-w-[26rem] sm:max-w-[28rem]",
          "sm:bottom-6 sm:rounded-3xl sm:border sm:border-border/60 sm:shadow-2xl",
          keyboardOpen
            ? "pb-3"
            : "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          "data-[side=bottom]:data-starting-style:translate-y-full",
          "data-[side=bottom]:data-ending-style:translate-y-full",
          "max-sm:[&_[data-slot=sheet-close]]:hidden",
        )}
      >
        <SheetTitle className="sr-only">{product.name}</SheetTitle>

        <div
          className={cn(
            "flex shrink-0 touch-none justify-center sm:hidden",
            keyboardOpen ? "py-2" : "py-4",
          )}
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

        <div className={cn("px-4", keyboardOpen ? "pb-3" : "pb-4")}>
          {!keyboardOpen ? (
            <div className="relative overflow-hidden rounded-[1.25rem] bg-muted">
              <div className="relative aspect-square w-full">
                <ProductImage
                  src={current}
                  alt={product.name}
                  fill
                />
                {isNew ? <NewProductBadge /> : null}
              </div>

              {showBuyerCount ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-4 pt-12 pb-4">
                  <p className="text-center text-sm font-semibold tracking-tight text-white tabular-nums">
                    {formatSoldLabel(soldCount)}
                  </p>
                </div>
              ) : null}

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
          ) : null}

          <div className={cn("space-y-3", !keyboardOpen && "mt-4")}>
            <ProductUnitPicker
              piecesPerBox={piecesPerBox}
              value={units}
              onChange={setUnits}
            />
            {!keyboardOpen ? (
              <Button
                type="button"
                size="lg"
                className="h-11 w-full gap-2 rounded-full text-sm font-semibold"
                disabled={!inCart && !hasUnitSelection(units)}
                onClick={handleAdd}
              >
                <ShoppingBag className="size-4" strokeWidth={1.75} />
                {inCart ? "Savatga qaytish" : "Savatga"}
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
