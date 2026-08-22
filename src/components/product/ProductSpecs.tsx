"use client";

import type { ProductSpec } from "@/types/product";
import { useVisibleSpecs } from "@/components/product/ProductDisplayProvider";

interface ProductSpecsProps {
  specs: ProductSpec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  const visible = useVisibleSpecs(specs);
  if (!visible.length) return null;

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">
        Texnik xususiyatlar
      </h2>
      <dl className="mt-4 divide-y divide-border border-y border-border">
        {visible.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-2 gap-4 py-3 text-sm"
          >
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="font-medium text-foreground">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
