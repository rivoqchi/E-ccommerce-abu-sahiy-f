"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatMoney } from "@/lib/format";
import { usePriceTier } from "@/hooks/use-price-tier";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { useStorefrontPricesVisible } from "@/components/product/ProductDisplayProvider";
import { NegotiatePriceNote } from "@/components/product/NegotiatePriceNote";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { UNLIMITED_QTY } from "@/lib/quantity";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/catalog/ProductImage";
import { CartItemsSkeleton } from "@/components/skeletons";
import type { CartItem } from "@/types/product";
import { cartLineKey, productHref, productSourceOf } from "@/types/product";

function CartLine({
  item,
  showSeparator,
}: {
  item: CartItem;
  showSeparator: boolean;
}) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const linePrice = useCartStore((s) => s.linePrice);
  const priceTier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  const showPrice = useStorefrontPricesVisible();
  const unit = showPrice ? linePrice(item, priceTier, usdToUzs) : 0;
  const href = productHref({
    slug: item.slug,
    source: productSourceOf(item.source),
  });

  return (
    <li>
      {showSeparator ? <Separator /> : null}
      <div className="flex gap-4 p-4 sm:p-5">
        <Link
          href={href}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
        >
          <ProductImage src={item.image} alt={item.name} fill sizes="96px" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href={href}
              className="line-clamp-2 text-sm font-semibold text-foreground hover:text-accent"
            >
              {item.name}
            </Link>
            {showPrice ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {formatMoney(unit, priceTier)}
              </p>
            ) : (
              <NegotiatePriceNote className="mt-1" />
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <QuantityStepper
              size="sm"
              value={item.quantity}
              max={UNLIMITED_QTY}
              onChange={(next) =>
                updateQuantity(item.productId, next, item.source)
              }
            />

            {showPrice ? (
              <p className="min-w-20 text-right text-sm font-semibold tabular-nums">
                {formatMoney(unit * item.quantity, priceTier)}
              </p>
            ) : null}

            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full text-muted-foreground hover:text-destructive"
              aria-label="O'chirish"
              onClick={() => removeItem(item.productId, item.source)}
            >
              <Trash2 className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartItems() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);

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

  const storeItems = items.filter(
    (item) => productSourceOf(item.source) === "store",
  );
  const hamkorItems = items.filter(
    (item) => productSourceOf(item.source) === "hamkor",
  );

  const hamkorGroups = new Map<string, CartItem[]>();
  for (const item of hamkorItems) {
    const key = item.partnerId || item.partnerName || "hamkor";
    const list = hamkorGroups.get(key) ?? [];
    list.push(item);
    hamkorGroups.set(key, list);
  }

  return (
    <div className="space-y-4">
      {storeItems.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border">
          <ul>
            {storeItems.map((item, index) => (
              <CartLine
                key={cartLineKey(item.source, item.productId)}
                item={item}
                showSeparator={index > 0}
              />
            ))}
          </ul>
        </Card>
      ) : null}

      {Array.from(hamkorGroups.entries()).map(([groupKey, groupItems]) => {
        const first = groupItems[0]!;
        const name = first.partnerName?.trim() || "Hamkor";
        const logo = first.partnerLogo || "/hamkor-logo.svg";
        return (
          <Card
            key={groupKey}
            className="gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border"
          >
            <div className="flex items-center gap-2.5 px-4 pt-4 sm:px-5">
              <img src={logo} alt="" className="size-8 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-semibold tracking-tight">{name}</p>
                <p className="text-xs text-muted-foreground">
                  Hamkor mahsulotlari
                </p>
              </div>
            </div>
            <ul>
              {groupItems.map((item) => (
                <CartLine
                  key={cartLineKey(item.source, item.productId)}
                  item={item}
                  showSeparator
                />
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
