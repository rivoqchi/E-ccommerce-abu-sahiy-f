"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatMoney } from "@/lib/format";
import { usePriceTier } from "@/hooks/use-price-tier";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { useStorefrontPricesVisible } from "@/components/product/ProductDisplayProvider";
import { NegotiatePriceNote } from "@/components/product/NegotiatePriceNote";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartSummarySkeleton } from "@/components/skeletons";

export function CartSummary() {
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const totalPriceFn = useCartStore((s) => s.totalPrice);
  const priceTier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  const showPrice = useStorefrontPricesVisible();
  const totalPrice = showPrice ? totalPriceFn(priceTier, usdToUzs) : 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!hydrated) {
    return <CartSummarySkeleton />;
  }

  if (items.length === 0) return null;

  return (
    <Card className="h-fit gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border">
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle>Buyurtma xulosasi</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 px-5 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Mahsulotlar ({totalItems})
          </span>
          {showPrice ? (
            <span className="font-medium tabular-nums">
              {formatMoney(totalPrice, priceTier)}
            </span>
          ) : (
            <NegotiatePriceNote as="span" className="text-right font-medium" />
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Yetkazib berish</span>
          <span className="font-medium text-success">Hisoblanadi</span>
        </div>
        <Separator />
        <div className="flex justify-between text-base">
          <span className="font-semibold">Jami</span>
          {showPrice ? (
            <span className="font-semibold tabular-nums">
              {formatMoney(totalPrice, priceTier)}
            </span>
          ) : (
            <NegotiatePriceNote as="span" className="text-right font-semibold" />
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t-0 bg-transparent px-5 pb-5 pt-0">
        <Button
          size="lg"
          className="w-full rounded-full"
          render={<Link href="/checkout" />}
        >
          Rasmiylashtirish
        </Button>
      </CardFooter>
    </Card>
  );
}
