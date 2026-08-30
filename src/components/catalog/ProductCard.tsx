"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { productHref, productSourceOf } from "@/types/product";
import { formatMoney } from "@/lib/format";
import { resolveCompareAtPrice } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/ProductImage";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { useWishlistStore } from "@/store/wishlist";
import { usePriceTier, useProductUnitPrice } from "@/hooks/use-price-tier";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { useProductFieldVisible } from "@/components/product/ProductDisplayProvider";
import { isProductNew } from "@/lib/product-new";
import { NewProductBadge } from "@/components/catalog/NewProductBadge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  /** Image frame aspect, e.g. aspect-square or aspect-[3/4] for masonry */
  imageAspectClass?: string;
}

/** Scoop radius — same for pad corner + both concave fills */
const R = 20;

function productRating(product: Product): number {
  if (product.rating) return Math.round(product.rating);
  const n = Number(product.id) || 1;
  return n % 2 === 0 ? 4 : 5;
}

export function ProductCard({
  product,
  className,
  priority,
  imageAspectClass = "aspect-square",
}: ProductCardProps) {
  const [quickOpen, setQuickOpen] = useState(false);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore((s) =>
    s.items.some(
      (item) =>
        item.productId === product.id &&
        productSourceOf(item.source) === productSourceOf(product.source),
    ),
  );
  const href = productHref(product);
  const rating = productRating(product);
  const unitPrice = useProductUnitPrice(product);
  const priceTier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  const showPrice = useProductFieldVisible("price");
  const showCompareAtField = useProductFieldVisible("compareAtPrice");
  const showCompareAt = showPrice && showCompareAtField;
  const showRating = useProductFieldVisible("rating");
  const isNew = isProductNew(product.newHighlightUntil);

  const scoopFill = {
    width: R,
    height: R,
    background: `radial-gradient(circle at 0 0, transparent ${R - 0.5}px, var(--background) ${R}px)`,
  } as const;

  return (
    <>
      <article className={cn("group flex flex-col", className)}>
        <div className="relative">
          <Link
            href={href}
            prefetch={false}
            className={cn(
              "relative block overflow-hidden rounded-[28px] bg-muted",
              imageAspectClass,
            )}
            aria-label={product.name}
          >
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="transition duration-500 group-hover:scale-[1.02]"
            />
          </Link>

          {isNew ? <NewProductBadge /> : null}

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-3.5 right-3.5 z-20 size-9 rounded-full border-0 bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-white active:scale-95"
            aria-label={liked ? "Sevimlilardan olib tashlash" : "Sevimlilarga"}
            aria-pressed={liked}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
          >
            <Heart
              className={cn(
                "size-[18px]",
                liked ? "fill-red-500 text-red-500" : "text-black",
              )}
              strokeWidth={1.6}
            />
          </Button>

          <div
            className="absolute right-0 bottom-0 z-20 bg-background pt-2.5 pl-2.5"
            style={{ borderTopLeftRadius: R }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute right-0"
              style={{ ...scoopFill, top: -R }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0"
              style={{ ...scoopFill, left: -R }}
            />

            <Button
              type="button"
              size="sm"
              className="relative h-10 gap-1.5 rounded-full bg-black px-4 text-[13px] font-medium text-white shadow-none hover:bg-neutral-900"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickOpen(true);
              }}
              aria-label="Mahsulotni ko'rish"
            >
              <ShoppingBag className="size-3.5" strokeWidth={1.75} />
              Shop
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="line-clamp-2 min-h-[2lh] text-[15px] font-medium leading-snug text-foreground">
            <Link href={href} prefetch={false}>
              {product.name}
            </Link>
          </h3>
          {showPrice || showCompareAt || showRating ? (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {showPrice ? (
                  <p className="text-[15px] font-bold leading-snug tracking-tight text-foreground tabular-nums">
                    {formatMoney(unitPrice, priceTier)}
                  </p>
                ) : null}
                {showCompareAt && product.compareAtPrice ? (
                  <p className="text-xs text-muted-foreground line-through tabular-nums">
                    {formatMoney(
                      resolveCompareAtPrice(
                        product.compareAtPrice,
                        usdToUzs,
                        priceTier,
                      ),
                      priceTier,
                    )}
                  </p>
                ) : null}
              </div>
              {showRating ? (
                <span className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-medium text-foreground">
                  <Star
                    className={cn(
                      "size-3.5",
                      rating >= 5
                        ? "fill-black text-black"
                        : "fill-amber-400 text-amber-400",
                    )}
                  />
                  {rating}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {quickOpen ? (
        <ProductQuickView
          product={product}
          open={quickOpen}
          onOpenChange={setQuickOpen}
        />
      ) : null}
    </>
  );
}
