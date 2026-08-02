import type { ProductSpec } from "@/types/product";

interface ProductSpecsProps {
  specs: ProductSpec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">
        Texnik xususiyatlar
      </h2>
      <dl className="mt-4 divide-y divide-border border-y border-border">
        {specs.map((spec) => (
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
