import type { Metadata } from "next";
import {
  CatalogFilters,
  CatalogMobileFilters,
} from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { paginateProducts } from "@/lib/catalog";
import { filterProducts, getBrands } from "@/lib/products";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Katalog",
  description:
    "Maishiy texnika, pishirish idishlari va oshxona anjomlari katalogi. Brend va kategoriya bo'yicha filtrlang.",
  alternates: {
    canonical: "/catalog",
  },
};

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const brand = params.brand ?? "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const filtered = filterProducts({ category, brand });
  const pagination = paginateProducts(filtered, page);
  const brands = getBrands();

  const filterState = {
    category,
    brand,
    brands,
  };

  const categoryLabel =
    category !== "all" && category in CATEGORY_LABELS
      ? CATEGORY_LABELS[category as ProductCategory]
      : "Barcha mahsulotlar";

  return (
    <div className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Katalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoryLabel}
            {pagination.total > 0
              ? ` — ${pagination.from}–${pagination.to} / ${pagination.total} ta`
              : " — 0 ta mahsulot"}
          </p>
        </div>
        <CatalogMobileFilters {...filterState} />
      </header>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[200px_1fr]">
        <CatalogFilters {...filterState} />

        <div className="min-w-0">
          <ProductGrid products={pagination.items} />
          <CatalogPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            query={{ category, brand }}
          />
        </div>
      </div>
    </div>
  );
}
