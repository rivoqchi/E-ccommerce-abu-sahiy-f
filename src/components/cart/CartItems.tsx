"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatUZS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CartItemsSkeleton } from "@/components/skeletons";

export function CartItems() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  if (!hydrated) {
    return <CartItemsSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">Savat bo&apos;sh</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Katalogdan mahsulot tanlab qo&apos;shing.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Katalogga o&apos;tish
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
      {items.map((item) => (
        <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
          <Link
            href={`/product/${item.slug}`}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-sm bg-background-elevated"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="96px"
              className="object-cover"
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
                {formatUZS(item.price)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 items-center rounded-md border border-border">
                <button
                  type="button"
                  aria-label="Kamaytirish"
                  className="px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                >
                  −
                </button>
                <span className="min-w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Ko'paytirish"
                  className="px-2.5 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <p className="min-w-24 text-right text-sm font-semibold">
                {formatUZS(item.price * item.quantity)}
              </p>

              <Button
                variant="ghost"
                size="sm"
                aria-label="O'chirish"
                onClick={() => removeItem(item.productId)}
              >
                O&apos;chirish
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
