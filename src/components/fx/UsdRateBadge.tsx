"use client";

import { formatRateUZS } from "@/lib/format";
import { useExchangeRate } from "@/components/fx/ExchangeRateProvider";
import { cn } from "@/lib/utils";

export function UsdRateBadge({ className }: { className?: string }) {
  const { usdToUzs, date } = useExchangeRate();
  if (!usdToUzs) return null;

  return (
    <span
      className={cn(
        "tabular-nums text-xs font-medium text-muted-foreground",
        className,
      )}
      title={date ? `CBU ${date}` : "CBU kursi"}
    >
      1$ = {formatRateUZS(usdToUzs)}
    </span>
  );
}
