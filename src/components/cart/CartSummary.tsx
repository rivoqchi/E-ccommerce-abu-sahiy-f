"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatUZS } from "@/lib/format";
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
import { CheckoutDialog } from "@/components/cart/CheckoutDialog";

export function CartSummary() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!hydrated) {
    return <CartSummarySkeleton />;
  }

  if (items.length === 0) return null;

  return (
    <>
      <Card className="h-fit gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>Buyurtma xulosasi</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 px-5 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Mahsulotlar ({totalItems})
            </span>
            <span className="font-medium tabular-nums">
              {formatUZS(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yetkazib berish</span>
            <span className="font-medium text-success">Hisoblanadi</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Jami</span>
            <span className="font-semibold tabular-nums">
              {formatUZS(totalPrice)}
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-t-0 bg-transparent px-5 pb-5 pt-0">
          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={() => setCheckoutOpen(true)}
          >
            Rasmiylashtirish
          </Button>
        </CardFooter>
      </Card>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
