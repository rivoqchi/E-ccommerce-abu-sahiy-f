import type { Metadata } from "next";
import {
  CatalogFilters,
  CatalogMobileFilters,
} from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import {
  fetchBrands,
  fetchCategories,
  fetchProducts,
} from "@/lib/storefront-api";

export const revalidate = 60;

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
    q?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const categorySlug = params.category ?? "all";
  const brandSlug = params.brand ?? "all";
  const q = params.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [categories, brands] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
  ]);

  const category = categories.find((c) => c.slug === categorySlug);
  const brand = brands.find((b) => b.slug === brandSlug);

  const result = await fetchProducts({
    categoryId: category?.id,
    brandId: brand?.id,
    q,
    page,
  });

  const filterState = {
    category: categorySlug,
    brand: brandSlug,
    categories,
    brands,
    q,
  };

  const categoryLabel =
    categorySlug !== "all" && category
      ? category.name
      : q
        ? `"${q}" bo'yicha natijalar`
        : "Barcha mahsulotlar";

  const from =
    result.total === 0 ? 0 : (result.page - 1) * CATALOG_PAGE_SIZE + 1;
  const to = result.total === 0 ? 0 : from + result.items.length - 1;

  return (
    <div className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Katalog
          </h1>
        </div>
        <CatalogMobileFilters {...filterState} />
      </header>

      <div className="mt-5 max-w-xl md:mt-6">
        <CatalogSearch
          category={categorySlug}
          brand={brandSlug}
          q={q ?? ""}
        />
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[200px_1fr]">
        <CatalogFilters {...filterState} />

        <div className="min-w-0">
          <ProductGrid products={result.items} />
          <CatalogPagination
            page={result.page}
            totalPages={result.totalPages}
            query={{
              category: categorySlug,
              brand: brandSlug,
              q,
            }}
          />
        </div>
      </div>
    </div>
  );
}
