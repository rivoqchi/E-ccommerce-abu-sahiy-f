import type { Product } from "@/types/product";
import { ProductCard } from "@/components/catalog/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-6 md:mt-16">
      <h2 className="px-[5%] text-base font-semibold tracking-tight text-foreground md:px-0 md:text-2xl">
        O&apos;xshash mahsulotlar
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 px-[5%] sm:gap-5 md:mt-6 md:px-0 lg:grid-cols-4">
        {products.map((item) => (
          <li key={item.id}>
            <ProductCard product={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
