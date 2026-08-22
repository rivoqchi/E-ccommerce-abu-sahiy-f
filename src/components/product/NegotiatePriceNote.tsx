"use client";

import { PRICE_NEGOTIATE_HINT } from "@/lib/product-display";
import { cn } from "@/lib/utils";

export function NegotiatePriceNote({
  className,
  as = "p",
}: {
  className?: string;
  as?: "p" | "span";
}) {
  const Tag = as;
  return (
    <Tag className={cn("text-sm text-muted-foreground", className)}>
      {PRICE_NEGOTIATE_HINT}
    </Tag>
  );
}
