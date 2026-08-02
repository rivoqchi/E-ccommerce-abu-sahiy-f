import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Yangi mahsulotlar
        </h2>
        <Link
          href="/catalog"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Barchasi
        </Link>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
