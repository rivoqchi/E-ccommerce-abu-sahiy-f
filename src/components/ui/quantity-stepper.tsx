"use client";

import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type QuantityStepperSize = "sm" | "md" | "lg";

interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  className?: string;
  size?: QuantityStepperSize;
}

const sizeStyles: Record<
  QuantityStepperSize,
  { wrap: string; btn: string; icon: string; input: string }
> = {
  sm: {
    wrap: "h-9 gap-0.5 rounded-full bg-secondary px-1",
    btn: "size-7",
    icon: "size-3.5",
    input: "min-w-6 text-sm font-medium",
  },
  md: {
    wrap: "h-11 gap-4 rounded-full bg-secondary px-4",
    btn: "size-8",
    icon: "size-3.5",
    input: "min-w-4 text-sm font-semibold",
  },
  lg: {
    wrap: "h-12 shrink-0 gap-2.5 rounded-full bg-secondary px-3 shadow-sm",
    btn: "size-8",
    icon: "size-4",
    input: "min-w-5 text-sm font-semibold",
  },
};

function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

function clampQty(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function QuantityStepper({
  value,
  max,
  min = 1,
  disabled = false,
  onChange,
  className,
  size = "md",
}: QuantityStepperProps) {
  const cap = Math.max(0, Math.floor(Number(max)) || 0);
  const styles = sizeStyles[size];
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const digits = digitsOnly(raw);
    const next = digits === "" ? min : clampQty(Number.parseInt(digits, 10), min, cap);
    onChange(next);
    setDraft(String(next));
  };

  const inactive = disabled || cap < min;

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center",
        styles.wrap,
        className,
      )}
    >
      <button
        type="button"
        aria-label="Kamaytirish"
        className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-40",
          styles.btn,
        )}
        disabled={inactive || value <= min}
        onClick={() => {
          const next = clampQty(value - 1, min, cap);
          onChange(next);
          setDraft(String(next));
        }}
      >
        <Minus className={styles.icon} strokeWidth={2.5} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        autoComplete="off"
        aria-label="Miqdor"
        disabled={inactive}
        value={focused ? draft : String(value)}
        maxLength={Math.min(6, String(Math.max(cap, 1)).length)}
        onChange={(e) => {
          const digits = digitsOnly(e.target.value);
          if (digits === "") {
            setDraft("");
            return;
          }
          const n = Number.parseInt(digits, 10);
          if (n > cap) {
            setDraft(String(cap));
            onChange(cap);
            return;
          }
          setDraft(digits);
          if (n >= min) onChange(n);
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
          "min-w-8 flex-1 bg-transparent p-0 text-center text-base tabular-nums text-foreground outline-none",
          "disabled:opacity-40",
          styles.input,
        )}
      />
      <button
        type="button"
        aria-label="Ko'paytirish"
        className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-40",
          styles.btn,
        )}
        disabled={inactive || value >= cap}
        onClick={() => {
          const next = clampQty(value + 1, min, cap);
          onChange(next);
          setDraft(String(next));
        }}
      >
        <Plus className={styles.icon} strokeWidth={2.5} />
      </button>
    </div>
  );
}
