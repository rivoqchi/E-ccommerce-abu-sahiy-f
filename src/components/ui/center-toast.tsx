"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

const TOAST_MS = 2400;
const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];
let nextId = 1;

function emit() {
  for (const listener of listeners) listener(items);
}

export function showCenterToast(
  message: string,
  variant: ToastVariant = "success",
) {
  const toast: ToastItem = { id: nextId++, message, variant };
  items = [...items, toast];
  emit();
  window.setTimeout(() => {
    items = items.filter((t) => t.id !== toast.id);
    emit();
  }, TOAST_MS);
}

export function CenterToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>(items);

  useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  if (!toasts.length) return null;

  const current = toasts[toasts.length - 1];
  if (!current) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center p-4"
      aria-live="polite"
      role="status"
    >
      <div
        key={current.id}
        className={cn(
          "flex max-w-sm items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-lg ring-1",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          current.variant === "success"
            ? "bg-foreground text-background ring-foreground/10"
            : "bg-destructive text-destructive-foreground ring-destructive/20",
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            current.variant === "success"
              ? "bg-background/15"
              : "bg-background/20",
          )}
        >
          {current.variant === "success" ? (
            <Check className="size-4" strokeWidth={2.25} />
          ) : (
            <X className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <p className="leading-snug">{current.message}</p>
      </div>
    </div>
  );
}
