import type { Product } from "@/types/product";

export const CATALOG_PAGE_SIZE = 30;

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "name";

export interface CatalogQuery {
  category?: string;
  brand?: string;
  sort?: CatalogSort;
  inStock?: boolean;
  page?: number;
  q?: string;
}

export function buildCatalogHref(params: CatalogQuery): string {
  const search = new URLSearchParams();
  if (params.category && params.category !== "all") {
    search.set("category", params.category);
  }
  if (params.brand && params.brand !== "all") {
    search.set("brand", params.brand);
  }
  if (params.q?.trim()) {
    search.set("q", params.q.trim());
  }
  if (params.sort && params.sort !== "featured") {
    search.set("sort", params.sort);
  }
  if (params.inStock) {
    search.set("inStock", "1");
  }
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }
  const qs = search.toString();
  return qs ? `/catalog?${qs}` : "/catalog";
}

export function sortProducts(
  products: Product[],
  sort: CatalogSort = "featured",
): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "uz"));
    case "featured":
    default:
      return list.sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
  }
}

export function paginateProducts<T>(
  items: T[],
  page: number,
  pageSize = CATALOG_PAGE_SIZE,
): {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
} {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    page: safePage,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
  };
}

/** Compact page list with ellipsis markers. */
export function getPaginationItems(
  current: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);

  if (left > 2) items.push("ellipsis");
  for (let p = left; p <= right; p += 1) items.push(p);
  if (right < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);
  return items;
}
