"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { formatUZS } from "@/lib/format";
import { ProductImage } from "@/components/catalog/ProductImage";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { usePriceTier } from "@/hooks/use-price-tier";
import { resolveUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DISMISS_DISTANCE = 110;

export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: ProductQuickViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    product
      ? s.items.some((item) => item.productId === product.id)
      : false,
  );
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore((s) =>
    product
      ? s.items.some((item) => item.productId === product.id)
      : false,
  );
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const draggingRef = useRef(false);
  const priceTier = usePriceTier();
  const unitPrice = product ? resolveUnitPrice(product, priceTier) : 0;

  useEffect(() => {
    if (open) {
      setActive(0);
      setQty(1);
      setDragY(0);
      dragYRef.current = 0;
      draggingRef.current = false;
      setIsDragging(false);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const current = product.images[active] ?? product.images[0];

  const handleAdd = () => {
    if (!product.inStock) return;
    if (inCart) {
      onOpenChange(false);
      router.push("/cart");
      return;
    }
    addItem(product, qty);
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
          // Mobile: X yo'q; desktop: X bor
          "max-sm:[&_[data-slot=sheet-close]]:hidden",
        )}
      >
        {/* Drag handle — faqat mobile */}
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
          <span className="sr-only">Mahsulot</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="relative mx-4 overflow-hidden rounded-[1.25rem] bg-muted">
            <div className="relative aspect-square w-full">
              <ProductImage
                src={current}
                alt={product.name}
                fill
              />
            </div>
            {product.images.length > 1 ? (
              <ul className="absolute inset-x-0 bottom-3 flex justify-center gap-2 px-3">
                {product.images.map((src, index) => (
                  <li key={`${src}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`${product.name} — ${index + 1}-rasm`}
                      className={cn(
                        "relative size-11 overflow-hidden rounded-xl border-2 bg-card/90 transition sm:size-12",
                        active === index
                          ? "border-foreground/40 ring-2 ring-foreground/15"
                          : "border-transparent opacity-80",
                      )}
                    >
                      <ProductImage
                        src={src}
                        alt=""
                        fill
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col px-5 pt-4">
            <SheetHeader className="gap-1 p-0 sm:pr-10">
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <SheetTitle className="text-left text-xl leading-snug font-semibold">
                {product.name}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-xl font-bold tabular-nums">
                {formatUZS(unitPrice)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatUZS(product.compareAtPrice)}
                </p>
              ) : null}
            </div>

            {!product.inStock ? (
              <p className="mt-2 text-sm font-medium text-destructive">
                Omborida yo&apos;q
              </p>
            ) : null}

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {product.specs?.length ? (
              <ul className="mt-4 space-y-1.5">
                {product.specs.slice(0, 4).map((spec) => (
                  <li
                    key={`${spec.label}-${spec.value}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">{spec.label}</span>
                    <span className="font-medium text-foreground">
                      {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 bg-popover pt-1 pb-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 flex-1 items-center justify-between gap-4 rounded-full bg-secondary px-4">
                  <button
                    type="button"
                    aria-label="Kamaytirish"
                    className="text-muted-foreground transition hover:text-foreground"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="size-3.5" strokeWidth={2.5} />
                  </button>
                  <span className="min-w-4 text-center text-sm font-semibold">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label="Ko'paytirish"
                    className="text-muted-foreground transition hover:text-foreground"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-11 shrink-0 rounded-full"
                  aria-label={
                    liked ? "Sevimlilardan olib tashlash" : "Sevimlilarga"
                  }
                  aria-pressed={liked}
                  onClick={() => toggleWishlist(product)}
                >
                  <Heart
                    className={cn(
                      "size-[18px]",
                      liked && "fill-red-500 text-red-500",
                    )}
                    strokeWidth={1.75}
                  />
                </Button>
              </div>

              <Button
                type="button"
                size="lg"
                className="h-12 w-full gap-2 rounded-full text-base font-semibold"
                disabled={!product.inStock}
                onClick={handleAdd}
              >
                <ShoppingBag className="size-4" strokeWidth={1.75} />
                {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-full"
                nativeButton={false}
                render={
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                  />
                }
              >
                To&apos;liq ma&apos;lumot
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
