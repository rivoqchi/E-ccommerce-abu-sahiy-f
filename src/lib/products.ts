/**
 * Storefront product helpers — all data comes from the Nest API.
 * Kept as a thin re-export so existing imports keep working.
 */
export {
  fetchFeaturedProducts as getFeaturedProducts,
  fetchProductBySlug as getProductBySlug,
  fetchRelatedProducts as getRelatedProducts,
  fetchProductSlugs,
  fetchProducts,
  fetchCategories,
  fetchBrands,
  mapApiProduct,
} from "@/lib/storefront-api";

import { fetchProducts } from "@/lib/storefront-api";
import type { Product } from "@/types/product";

/** Sitemap / static params — first page of active products. */
export async function getAllProducts(): Promise<Product[]> {
  const result = await fetchProducts({ page: 1, limit: 200 });
  return result.items;
}
