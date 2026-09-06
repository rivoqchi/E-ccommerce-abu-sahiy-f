"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";
import { UNLIMITED_QTY } from "@/lib/quantity";
import { cn } from "@/lib/utils";

type UnitMode = "piece" | "box";

function clampUnit(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(UNLIMITED_QTY, Math.max(0, Math.floor(n)));
}

const shopSurface =
  "bg-black text-white dark:bg-white dark:text-black";

function MiniStepper({
  value,
  suffix,
  onChange,
}: {
  value: number;
  suffix: string;
  onChange: (next: number) => void;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-full min-w-0 items-center justify-between rounded-full pl-0.5 pr-1.5",
        shopSurface,
      )}
    >
      <button
        type="button"
        aria-label="Kamaytirish"
        disabled={value <= 0}
        className="flex size-8 shrink-0 items-center justify-center rounded-full opacity-90 transition-transform active:scale-90 disabled:opacity-35"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(clampUnit(value - 1));
        }}
      >
        <Minus className="size-3.5" strokeWidth={2.5} />
      </button>
      <span className="flex min-w-[2.5rem] items-baseline justify-center gap-0.5 px-0.5 text-center leading-none">
        <span className="text-[13px] font-semibold tabular-nums">{value}</span>
        <span className="text-[9px] font-medium opacity-65">{suffix}</span>
      </span>
      <button
        type="button"
        aria-label="Ko'paytirish"
        disabled={value >= UNLIMITED_QTY}
        className="flex size-8 shrink-0 items-center justify-center rounded-full opacity-90 transition-transform active:scale-90 disabled:opacity-35"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(clampUnit(value + 1));
        }}
      >
        <Plus className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function ProductCardShop({ product }: { product: Product }) {
  const { units, commitUnits, inCart, piecesPerBox } =
    useProductCartQty(product);
  const canUseBox = Boolean(piecesPerBox && piecesPerBox >= 1);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<UnitMode>("piece");

  useEffect(() => {
    if (inCart) setOpen(true);
  }, [inCart]);

  useEffect(() => {
    if (!canUseBox && mode === "box") setMode("piece");
  }, [canUseBox, mode]);

  if (!open) {
    return (
      <button
        type="button"
        className={cn(
          "relative inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-medium shadow-none transition active:scale-[0.98]",
          shopSurface,
          "hover:bg-neutral-900 dark:hover:bg-neutral-100",
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
          setMode("piece");
        }}
        aria-label="Savatga qo'shish"
      >
        <ShoppingBag className="size-3.5" strokeWidth={1.75} />
        Shop
      </button>
    );
  }

  return (
    <div
      className="relative flex w-full max-w-full items-center gap-1.5 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1 duration-200"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {canUseBox ? (
        <button
          type="button"
          aria-pressed={mode === "box"}
          aria-label={mode === "box" ? "Donaga o'tish" : "Karobkaga o'tish"}
          className={cn(
            "inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tracking-tight transition-colors duration-200 active:scale-[0.97]",
            shopSurface,
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMode((prev) => (prev === "box" ? "piece" : "box"));
          }}
        >
          <span
            key={mode}
            className="animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {mode === "box" ? "dona" : "kor"}
          </span>
        </button>
      ) : null}

      <div
        key={mode}
        className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-right-1 duration-200"
      >
        {mode === "box" && canUseBox ? (
          <MiniStepper
            value={units.boxQuantity}
            suffix="kor"
            onChange={(boxQuantity) =>
              commitUnits({ ...units, boxQuantity })
            }
          />
        ) : (
          <MiniStepper
            value={units.pieceQuantity}
            suffix="dona"
            onChange={(pieceQuantity) =>
              commitUnits({ ...units, pieceQuantity })
            }
          />
        )}
      </div>
    </div>
  );
}
