import type { Product } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-base font-medium text-foreground">
          Mahsulot topilmadi
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtrlarni o&apos;zgartirib ko&apos;ring.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
