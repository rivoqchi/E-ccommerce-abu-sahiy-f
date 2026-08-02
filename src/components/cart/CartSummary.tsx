"use client";

import { useCartStore } from "@/store/cart";
import { formatUZS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CartSummarySkeleton } from "@/components/skeletons";

export function CartSummary() {
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
    <aside className="h-fit rounded-3xl border border-border bg-white p-5">
      <h2 className="text-base font-semibold text-foreground">
        Buyurtma xulosasi
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Mahsulotlar ({totalItems})</dt>
          <dd className="font-medium">{formatUZS(totalPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Yetkazib berish</dt>
          <dd className="font-medium text-success">Hisoblanadi</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base">
          <dt className="font-semibold">Jami</dt>
          <dd className="font-semibold">{formatUZS(totalPrice)}</dd>
        </div>
      </dl>

      <Button
        size="lg"
        className="mt-5 w-full"
        onClick={() => {
          window.alert(
            "To'lov tizimi tez orada Backend orqali ulanadi. Hozircha savat saqlanadi.",
          );
        }}
      >
        Rasmiylashtirish
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        To&apos;lov tizimi keyingi bosqichda ishga tushadi.
      </p>
    </aside>
  );
}
