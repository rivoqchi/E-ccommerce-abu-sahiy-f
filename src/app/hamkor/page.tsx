import type { Metadata } from "next";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { HomeCategoryPills } from "@/components/home/HomeCategoryPills";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import {
  fetchHamkorCategories,
  fetchHamkorPartners,
  fetchHamkorProducts,
} from "@/lib/storefront-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hamkor",
  description: "Hamkor kategoriyalari va mahsulotlari.",
  alternates: {
    canonical: "/hamkor",
  },
};

interface HamkorPageProps {
  searchParams: Promise<{
    partner?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function HamkorPage({ searchParams }: HamkorPageProps) {
  const params = await searchParams;
  const partnerSlug = params.partner ?? "all";
  const categorySlug = params.category ?? "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const partners = await fetchHamkorPartners();
  const partner = partners.find((p) => p.slug === partnerSlug);

  const categories = await fetchHamkorCategories({
    partnerId: partner?.id,
  });
  const category = categories.find((c) => c.slug === categorySlug);

  const result = await fetchHamkorProducts({
    partnerId: partner?.id,
    categoryId: category?.id,
    page,
    limit: CATALOG_PAGE_SIZE,
  });

  return (
    <div className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
          Hamkor
        </h1>
      </header>

      <div className="mt-6 md:mt-8">
        <HomeCategoryPills
          title="Hamkorlar"
          categories={partners}
          active={partnerSlug}
          hrefFor={(slug) => `/hamkor?partner=${slug}`}
        />
      </div>

      {partner ? (
        <div className="mt-8 md:mt-10">
          <HomeCategoryPills
            categories={categories}
            active={categorySlug}
            hrefFor={(slug) =>
              `/hamkor?partner=${partner.slug}&category=${slug}`
            }
          />
        </div>
      ) : null}

      <div className="mt-8 md:mt-10">
        <ProductGrid products={result.items} />
        <CatalogPagination
          page={result.page}
          totalPages={result.totalPages}
          query={{
            category: categorySlug,
            partner: partnerSlug,
            pathname: "/hamkor",
          }}
        />
      </div>
    </div>
  );
}
