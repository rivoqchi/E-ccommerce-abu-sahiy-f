"use client";

import { useEffect, useState, type MouseEvent, type PointerEvent } from "react";
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

  const bump = (delta: number) => {
    const next = clampUnit(value + delta);
    if (next === value) return;
    if (disabled) return;
    onChange(next);
    setDraft(String(next));
  };

  const onStepPointerDown = (e: PointerEvent, delta: number) => {
    e.preventDefault();
    if (e.button !== 0) return;
    bump(delta);
  };

  const onStepClick = (e: MouseEvent, delta: number) => {
    if (e.detail !== 0) return;
    bump(delta);
  };

  const commit = (raw: string) => {
    const digits = digitsOnly(raw);
    const next = digits === "" ? 0 : clampUnit(Number.parseInt(digits, 10));
    onChange(next);
    setDraft(String(next));
  };

  const display = focused ? draft : String(value);

  return (
    <div data-qty-stepper className={cn("min-w-0 space-y-1", className)}>
      <p className="truncate text-[11px] font-medium leading-none text-muted-foreground sm:text-xs">
        {label}
      </p>
      <div className="grid h-11 min-w-0 grid-cols-[1.75rem_minmax(2.75ch,1fr)_1.75rem] items-center rounded-full border border-input bg-background px-0.5 sm:grid-cols-[2rem_minmax(2.75ch,1fr)_auto_2rem] sm:px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 justify-self-center rounded-full sm:size-8"
          disabled={disabled || value <= 0}
          aria-label={`${label} kamaytirish`}
          onPointerDown={(e) => onStepPointerDown(e, -1)}
          onClick={(e) => onStepClick(e, -1)}
        >
          <Minus className="size-4" />
        </Button>
        <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            autoComplete="off"
            aria-label={`${label} miqdori`}
            disabled={disabled}
            value={display}
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
              const row = e.currentTarget.closest("[data-qty-stepper]");
              const reveal = () =>
                row?.scrollIntoView({
                  block: "end",
                  inline: "nearest",
                  behavior: "smooth",
                });
              requestAnimationFrame(reveal);
              window.setTimeout(reveal, 280);
              window.setTimeout(reveal, 520);
            }}
            onBlur={() => {
              setFocused(false);
              commit(draft);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className={cn(
              "h-full w-full min-w-0 bg-transparent p-0 text-center font-semibold tabular-nums text-foreground outline-none",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              display.length >= 4 ? "text-sm" : "text-base",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          />
        <span className="hidden pr-0.5 text-[10px] font-semibold text-muted-foreground sm:inline sm:text-xs">
          {suffix}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 justify-self-center rounded-full sm:size-8"
          disabled={disabled || value >= UNLIMITED_QTY}
          aria-label={`${label} ko'paytirish`}
          onPointerDown={(e) => onStepPointerDown(e, 1)}
          onClick={(e) => onStepClick(e, 1)}
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
    <div className={cn("grid grid-cols-2 gap-2 sm:gap-3", className)}>
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
