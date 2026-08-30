"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UNLIMITED_QTY } from "@/lib/quantity";

type UnitQuantityStepperProps = {
  label: string;
  suffix: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
};

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function clampUnit(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(UNLIMITED_QTY, Math.max(0, Math.floor(n)));
}

function UnitQuantityStepper({
  label,
  suffix,
  value,
  disabled = false,
  onChange,
  className,
}: UnitQuantityStepperProps) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const digits = digitsOnly(raw);
    const next = digits === "" ? 0 : clampUnit(Number.parseInt(digits, 10));
    onChange(next);
    setDraft(String(next));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex h-11 items-center justify-between gap-1 rounded-full border border-input bg-background px-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 rounded-full"
          disabled={disabled || value <= 0}
          aria-label={`${label} kamaytirish`}
          onClick={() => onChange(clampUnit(value - 1))}
        >
          <Minus className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            autoComplete="off"
            aria-label={`${label} miqdori`}
            disabled={disabled}
            value={focused ? draft : String(value)}
            onChange={(e) => {
              const digits = digitsOnly(e.target.value);
              if (digits === "") {
                setDraft("");
                return;
              }
              const n = Number.parseInt(digits, 10);
              if (n > UNLIMITED_QTY) {
                setDraft(String(UNLIMITED_QTY));
                onChange(UNLIMITED_QTY);
                return;
              }
              setDraft(digits);
              onChange(clampUnit(n));
            }}
            onFocus={(e) => {
              setFocused(true);
              setDraft(String(value));
              e.target.select();
            }}
            onBlur={() => {
              setFocused(false);
              commit(draft);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className={cn(
              "w-full min-w-8 max-w-24 bg-transparent p-0 text-center text-sm font-semibold tabular-nums text-foreground outline-none",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
            style={{
              width: `${Math.max(2, (focused ? draft : String(value)).length)}ch`,
            }}
          />
          <span className="shrink-0 text-sm font-semibold text-muted-foreground">
            {suffix}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-8 shrink-0 rounded-full"
          disabled={disabled || value >= UNLIMITED_QTY}
          aria-label={`${label} ko'paytirish`}
          onClick={() => onChange(clampUnit(value + 1))}
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export type ProductUnitValues = {
  boxQuantity: number;
  pieceQuantity: number;
};

type ProductUnitPickerProps = {
  piecesPerBox?: number;
  value: ProductUnitValues;
  onChange: (value: ProductUnitValues) => void;
  className?: string;
};

export function ProductUnitPicker({
  piecesPerBox,
  value,
  onChange,
  className,
}: ProductUnitPickerProps) {
  const canUseBox = Boolean(piecesPerBox && piecesPerBox >= 1);

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      <UnitQuantityStepper
        label="Karobka"
        suffix="kor"
        value={value.boxQuantity}
        disabled={!canUseBox}
        onChange={(boxQuantity) => onChange({ ...value, boxQuantity })}
      />
      <UnitQuantityStepper
        label="Dona"
        suffix="dona"
        value={value.pieceQuantity}
        onChange={(pieceQuantity) => onChange({ ...value, pieceQuantity })}
      />
    </div>
  );
}

export function hasUnitSelection(value: ProductUnitValues): boolean {
  return value.boxQuantity > 0 || value.pieceQuantity > 0;
}
