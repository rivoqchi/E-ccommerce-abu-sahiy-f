"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types/product";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { Button } from "@/components/ui/button";
import { HOME_PRODUCTS_PAGE_SIZE } from "@/lib/catalog";
import { fetchProducts } from "@/lib/storefront-api";

interface FeaturedProductsProps {
  initialProducts: Product[];
  total: number;
  initialPage?: number;
}

export function FeaturedProducts({
  initialProducts,
  total: initialTotal,
  initialPage = 1,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [pending, startTransition] = useTransition();

  // SSR cache bo'sh qaytarsa brauzerdan qayta yuklash
  useEffect(() => {
    if (initialProducts.length > 0) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await fetchProducts({
        page: 1,
        limit: HOME_PRODUCTS_PAGE_SIZE,
      });
      if (cancelled || !result.items.length) return;
      setProducts(result.items);
      setTotal(result.total);
      setPage(result.page);
    });
    return () => {
      cancelled = true;
    };
  }, [initialProducts.length]);

  const hasMore = products.length < total;
  function loadMore() {
    if (pending || !hasMore) return;
    const nextPage = page + 1;
    startTransition(async () => {
      const result = await fetchProducts({
        page: nextPage,
        limit: HOME_PRODUCTS_PAGE_SIZE,
      });
      if (!result.items.length) return;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const item of result.items) {
          if (!seen.has(item.id)) merged.push(item);
        }
        return merged;
      });
      setPage(nextPage);
    });
  }

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

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Hozircha mahsulotlar yo&apos;q. Admin paneldan qo&apos;shing.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <ProductGrid products={products} />
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                className="h-11 min-w-36 rounded-full px-8"
                disabled={pending}
                onClick={loadMore}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Yana"
                )}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
