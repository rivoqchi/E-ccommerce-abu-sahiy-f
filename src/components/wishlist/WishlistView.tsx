"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/catalog/ProductImage";
import { formatUZS } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { usePriceTier } from "@/hooks/use-price-tier";
import { resolveUnitPrice } from "@/lib/pricing";

export function WishlistView() {
  const items = useWishlistStore((s) => s.items);
  const hydrated = useWishlistStore((s) => s.hydrated);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const priceTier = usePriceTier();

  if (!hydrated) {
    return (
      <div className="mt-8 h-48 animate-pulse rounded-3xl bg-secondary/60" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-3xl bg-card px-6 py-16 text-center shadow-[var(--shadow-soft)]">
        <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
          <Heart className="size-7 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="mt-5 text-lg font-semibold text-foreground">
          Hali sevimlilar yo&apos;q
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.productId}
          className="overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)]"
        >
          <Link
            href={`/product/${item.slug}`}
            className="relative block aspect-square bg-muted"
          >
            <ProductImage
              src={item.image}
              alt={item.name}
              fill
            />
          </Link>

          <div className="space-y-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">{item.brand}</p>
              <Link
                href={`/product/${item.slug}`}
                className="mt-0.5 line-clamp-2 text-sm font-semibold text-foreground"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {formatUZS(
                  resolveUnitPrice(
                    {
                      price: item.price,
                      wholesalePrice: item.wholesalePrice ?? item.price,
                    },
                    priceTier,
                  ),
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                className="h-10 flex-1 gap-1.5 rounded-full"
                disabled={(item.stock ?? 0) <= 0}
                onClick={() => {
                  const stock = Math.max(0, item.stock ?? 0);
                  if (stock <= 0) return;
                  addToCart(
                    {
                      id: item.productId,
                      slug: item.slug,
                      name: item.name,
                      description: item.name,
                      price: item.price,
                      wholesalePrice: item.wholesalePrice ?? item.price,
                      category: "",
                      categoryLabel: "",
                      brand: item.brand,
                      images: [item.image],
                      specs: [],
                      stock,
                      inStock: stock > 0,
                    },
                    1,
                  );
                }}
              >
                <ShoppingBag className="size-3.5" strokeWidth={1.75} />
                {(item.stock ?? 0) <= 0 ? "Tugagan" : "Savatga"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="size-10 shrink-0 rounded-full"
                aria-label="Sevimlilardan olib tashlash"
                onClick={() => removeItem(item.productId)}
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
