"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatUZS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

/** Scoop radius — same for pad corner + both concave fills */
const R = 20;

function productRating(product: Product): number {
  if (product.rating) return Math.round(product.rating);
  const n = Number(product.id) || 1;
  return n % 2 === 0 ? 4 : 5;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const rating = productRating(product);

  const scoopFill = {
    width: R,
    height: R,
    background: `radial-gradient(circle at 0 0, transparent ${R - 0.5}px, var(--background) ${R}px)`,
  } as const;

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="relative block aspect-[3/4] overflow-hidden rounded-[28px] bg-[#ececee]"
          aria-label={product.name}
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
          />
        </Link>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          nativeButton={false}
          render={<Link href="/wishlist" />}
          className="absolute top-3.5 right-3.5 z-20 size-9 rounded-full border-0 bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-white active:scale-95"
          aria-label="Sevimlilarga"
        >
          <Heart className="size-[18px] text-black" strokeWidth={1.6} />
        </Button>

        {/* Shop cutout — opaque pad + matching concave scoops (reference style) */}
        <div
          className="absolute right-0 bottom-0 z-20 bg-background pt-2.5 pl-2.5"
          style={{ borderTopLeftRadius: R }}
        >
          {/* Top scoop */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-0"
            style={{ ...scoopFill, top: -R }}
          />
          {/* Left scoop */}
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
              addItem(product, 1);
            }}
            aria-label="Shop"
          >
            <ShoppingBag className="size-3.5" strokeWidth={1.75} />
            Shop
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <h3 className="line-clamp-1 text-[15px] font-medium leading-snug text-foreground">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold tracking-tight text-foreground">
            {formatUZS(product.price)}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
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
        </div>
      </div>
    </article>
  );
}
