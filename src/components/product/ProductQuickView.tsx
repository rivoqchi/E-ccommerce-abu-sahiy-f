"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: ProductQuickViewProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore((s) =>
    product
      ? s.items.some((item) => item.productId === product.id)
      : false,
  );
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (open) {
      setActive(0);
      setQty(1);
      setAdded(false);
    }
  }, [open, product?.id]);

  if (!product) return null;

  const current = product.images[active] ?? product.images[0];

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className={cn(
          "gap-0 rounded-t-[1.75rem] border-0 p-0",
          "h-[min(92dvh,880px)] max-h-[92dvh] w-full",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          "data-[side=bottom]:data-starting-style:translate-y-full",
          "data-[side=bottom]:data-ending-style:translate-y-full",
        )}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <span
            aria-hidden
            className="h-1.5 w-10 rounded-full bg-muted-foreground/30"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="relative mx-4 overflow-hidden rounded-[1.25rem] bg-[#ececee]">
            <div className="relative aspect-[4/5] max-h-[42dvh] w-full sm:aspect-[5/4] sm:max-h-[320px]">
              <ProductImage
                src={current}
                alt={product.name}
                fill
                className="object-cover"
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
                        "relative size-11 overflow-hidden rounded-xl border-2 transition sm:size-12",
                        active === index
                          ? "border-white ring-2 ring-black/20"
                          : "border-transparent opacity-80",
                      )}
                    >
                      <ProductImage
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col px-5 pt-4">
            <SheetHeader className="gap-1 p-0 pr-10">
              <p className="text-xs text-muted-foreground">{product.brand}</p>
              <SheetTitle className="text-left text-xl leading-snug font-semibold sm:text-2xl">
                {product.name}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-xl font-bold tabular-nums">
                {formatUZS(product.price)}
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

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-4">
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

            <div className="sticky bottom-0 mt-auto flex flex-col gap-3 bg-popover pt-5 pb-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 flex-1 items-center justify-between gap-4 rounded-full bg-secondary px-4 sm:flex-none sm:justify-center">
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
                {added ? "Qo'shildi ✓" : "Savatga qo'shish"}
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
