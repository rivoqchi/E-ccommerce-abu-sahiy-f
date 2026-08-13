"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatUZS } from "@/lib/format";
import { usePriceTier } from "@/hooks/use-price-tier";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/catalog/ProductImage";
import { CartItemsSkeleton } from "@/components/skeletons";

export function CartItems() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const linePrice = useCartStore((s) => s.linePrice);
  const priceTier = usePriceTier();

  if (!hydrated) {
    return <CartItemsSkeleton />;
  }

  if (items.length === 0) {
    return (
      <Card className="rounded-3xl border-dashed py-0 shadow-none ring-1 ring-border">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">Savat bo&apos;sh</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Katalogdan mahsulot tanlab qo&apos;shing.
          </p>
          <Button
            className="mt-6 h-11 rounded-full px-5"
            nativeButton={false}
            render={<Link href="/catalog" />}
          >
            Katalogga o&apos;tish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border">
      <ul>
        {items.map((item, index) => {
          const unit = linePrice(item, priceTier);
          return (
            <li key={item.productId}>
              {index > 0 ? <Separator /> : null}
              <div className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="line-clamp-2 text-sm font-semibold text-foreground hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatUZS(unit)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <QuantityStepper
                      size="sm"
                      value={item.quantity}
                      max={
                        typeof item.stock === "number" &&
                        Number.isFinite(item.stock)
                          ? item.stock
                          : Number.MAX_SAFE_INTEGER
                      }
                      onChange={(next) =>
                        updateQuantity(item.productId, next)
                      }
                    />

                    <p className="min-w-20 text-right text-sm font-semibold tabular-nums">
                      {formatUZS(unit * item.quantity)}
                    </p>

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-8 rounded-full text-muted-foreground hover:text-destructive"
                      aria-label="O'chirish"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="size-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
