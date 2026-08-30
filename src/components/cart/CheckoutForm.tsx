"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { safeReplace } from "@/lib/safe-navigate";
import { usePriceTier } from "@/hooks/use-price-tier";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { useStorefrontPricesVisible } from "@/components/product/ProductDisplayProvider";
import { NegotiatePriceNote } from "@/components/product/NegotiatePriceNote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (phone.trim().startsWith("+998") && digits.length === 12) {
    return `+${digits}`;
  }
  return phone.trim();
}

export function CheckoutForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const hydrated = useCartStore((s) => s.hydrated);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPriceFn = useCartStore((s) => s.totalPrice);
  const priceTier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  const showPrice = useStorefrontPricesVisible();
  const totalPrice = showPrice ? totalPriceFn(priceTier, usdToUzs) : 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && !done) {
      safeReplace(router, "/cart");
    }
  }, [hydrated, items.length, done, router]);

  useEffect(() => {
    setError(null);
    setNotes("");
    setFirstName(user?.firstName?.trim() || "");
    setLastName(user?.lastName?.trim() || "");
    const fromFull = user?.fullName?.trim().split(/\s+/) ?? [];
    if (!user?.firstName && fromFull[0]) setFirstName(fromFull[0]);
    if (!user?.lastName && fromFull.length > 1) {
      setLastName(fromFull.slice(1).join(" "));
    }
    const rawPhone = user?.phone?.replace(/^\+998/, "") ?? "";
    setPhone(rawPhone);
  }, [user]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fn = firstName.trim();
    const ln = lastName.trim();
    const e164 = toE164(phone);
    if (fn.length < 2 || ln.length < 2) {
      setError("Ism va familiyani to'liq kiriting");
      return;
    }
    if (!/^\+998\d{9}$/.test(e164)) {
      setError("Telefon: 90 123 45 67 formatida kiriting");
      return;
    }
    if (items.length === 0) {
      setError("Savat bo'sh");
      return;
    }

    startTransition(async () => {
      try {
        await apiFetch("/orders/checkout", {
          method: "POST",
          body: JSON.stringify({
            firstName: fn,
            lastName: ln,
            phone: e164,
            notes: notes.trim() || undefined,
            items: items.map((item) => ({
              productId: item.productId,
              boxQuantity: item.boxQuantity,
              pieceQuantity: item.pieceQuantity,
              source: item.source ?? "store",
            })),
          }),
        });
        clearCart();
        setDone(true);
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Buyurtma yuborilmadi";
        setError(message);
      }
    });
  }

  if (!hydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
        <div className="h-24 rounded-xl bg-muted" />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="size-8" strokeWidth={1.75} />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          Buyurtma qilindi
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Tez orada siz bilan bog&apos;lanamiz. Rahmat!
          {showPrice ? null : (
            <>
              {" "}
              Narxni do&apos;kon bilan kelishasiz.
            </>
          )}
        </p>
        <Button className="mt-6 h-11 rounded-full px-8" render={<Link href="/" />}>
          Bosh sahifa
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Orqaga"
          onClick={() => router.push("/cart")}
        >
          <ArrowLeft className="size-[18px]" strokeWidth={1.75} />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Rasmiylashtirish
        </h1>
      </div>

      <div className="mb-6 space-y-2 rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Mahsulotlar ({totalItems})</span>
          {showPrice ? (
            <span className="font-medium tabular-nums">{formatMoney(totalPrice, priceTier)}</span>
          ) : (
            <NegotiatePriceNote as="span" className="text-right font-medium" />
          )}
        </div>
        <Separator />
        <div className="flex justify-between gap-3 text-base">
          <span className="font-semibold">Jami</span>
          {showPrice ? (
            <span className="font-semibold tabular-nums">{formatMoney(totalPrice, priceTier)}</span>
          ) : (
            <NegotiatePriceNote as="span" className="text-right font-semibold" />
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Ism</span>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ism"
              autoComplete="given-name"
              required
              className="h-12"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Familiya
            </span>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Familiya"
              autoComplete="family-name"
              required
              className="h-12"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Telefon raqam
          </span>
          <div className="flex h-12 items-center gap-2 rounded-xl bg-secondary px-4 focus-within:ring-2 focus-within:ring-ring/20">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              +998
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))
              }
              placeholder="90 123 45 67"
              autoComplete="tel-national"
              required
              className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Izoh</span>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Yetkazib berish bo'yicha izoh (ixtiyoriy)"
            rows={3}
          />
        </label>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-full"
            onClick={() => router.push("/cart")}
            disabled={pending}
          >
            Bekor qilish
          </Button>
          <Button type="submit" className="h-11 rounded-full" disabled={pending}>
            {pending ? "Yuborilmoqda…" : "Buyurtma berish"}
          </Button>
        </div>
      </form>
    </div>
  );
}
