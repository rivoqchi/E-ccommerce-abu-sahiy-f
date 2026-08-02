"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (phone.trim().startsWith("+998") && digits.length === 12) {
    return `+${digits}`;
  }
  return phone.trim();
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setDone(false);
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
  }, [open, user]);

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
              quantity: item.quantity,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="flex flex-col items-center px-2 py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <CheckCircle2 className="size-8" strokeWidth={1.75} />
            </div>
            <DialogHeader className="mt-5 items-center pr-0">
              <DialogTitle className="text-center text-xl">
                Buyurtma qilindi
              </DialogTitle>
            </DialogHeader>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Tez orada siz bilan bog&apos;lanamiz. Rahmat!
            </p>
            <Button
              className="mt-6 h-11 rounded-full px-8"
              onClick={() => onOpenChange(false)}
            >
              Yopish
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
            <DialogHeader>
              <DialogTitle>Rasmiylashtirish</DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-3 overflow-y-auto pb-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ism
                  </span>
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
                <span className="text-xs font-medium text-muted-foreground">
                  Izoh
                </span>
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
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={pending}
              >
                {pending ? "Yuborilmoqda…" : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
