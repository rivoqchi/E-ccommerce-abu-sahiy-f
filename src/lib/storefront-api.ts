import { API_BASE_URL } from "@/lib/env";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import type {
  CatalogBrand,
  CatalogCategory,
  Product,
  ProductSpec,
} from "@/types/product";
import { resolveProductImages } from "@/lib/product-image";

type ApiSuccess<T> = { success: true; data: T };
type ApiError = {
  success: false;
  statusCode: number;
  message: string | string[];
};

type ApiRef =
  | string
  | {
      _id: string;
      name?: string;
      slug?: string;
    }
  | null
  | undefined;

export type ApiProduct = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  wholesalePrice?: number;
  stock?: number;
  categoryId?: ApiRef;
  brandId?: ApiRef;
  images?: string[];
  specs?: ProductSpec[];
  tags?: string[];
  isActive?: boolean;
  status?: string;
  buyerCount?: number;
  recentBuyers?: Array<{
    fullName: string;
    avatarUrl?: string;
  }>;
};

export type ProductsListResult = {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
  nextCursor: string | null;
};

function idOf(ref: ApiRef): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  return ref._id ?? "";
}

function nameOf(ref: ApiRef, fallback = ""): string {
  if (!ref || typeof ref === "string") return fallback;
  return ref.name?.trim() || fallback;
}

function slugOf(ref: ApiRef, fallback = ""): string {
  if (!ref || typeof ref === "string") return fallback;
  return ref.slug?.trim() || fallback;
}

function normalizeImages(images?: string[]): string[] {
  return resolveProductImages(images);
}

export function mapApiProduct(raw: ApiProduct): Product {
  const categorySlug = slugOf(raw.categoryId, "uncategorized");
  const categoryLabel = nameOf(raw.categoryId, "Kategoriya");
  const brandName = nameOf(raw.brandId, "Brendsiz");
  const brandSlug = slugOf(raw.brandId) || undefined;
  const tags = raw.tags ?? [];
  const price = Number(raw.price);
  const wholesale = Number(raw.wholesalePrice);
  const compareAt = Number(raw.compareAtPrice);

  return {
    id: String(raw._id),
    slug: raw.slug,
    name: raw.name,
    description: raw.description?.trim() || raw.name,
    price: Number.isFinite(price) ? price : 0,
    wholesalePrice:
      Number.isFinite(wholesale) && wholesale >= 0 ? wholesale : Number.isFinite(price) ? price : 0,
    ...(Number.isFinite(compareAt) && compareAt > 0
      ? { compareAtPrice: compareAt }
      : {}),
    category: categorySlug,
    categoryLabel,
    brand: brandName,
    brandSlug,
    images: normalizeImages(raw.images),
    specs: raw.specs ?? [],
    featured: tags.includes("featured"),
    inStock: (raw.stock ?? 0) > 0,
    buyerCount: Number(raw.buyerCount) || 0,
    recentBuyers: (raw.recentBuyers ?? [])
      .filter((b) => b?.fullName)
      .map((b) => ({
        fullName: b.fullName,
        avatarUrl: b.avatarUrl || undefined,
      })),
  };
}

/** Build/ISR da API uxlab yoki noto'g'ri URL bo'lsa Vercel 60s timeout bermasin */
const PUBLIC_FETCH_TIMEOUT_MS = 8_000;

async function publicFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number | false } },
): Promise<T> {
  const { next, headers, ...rest } = init ?? {};
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...rest,
    signal: AbortSignal.timeout(PUBLIC_FETCH_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    next: { revalidate: 60, ...next },
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiError;
  if (!response.ok || !json.success) {
    const err = json as ApiError;
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : (err.message ?? "So'rov muvaffaqiyatsiz tugadi");
    throw new Error(message);
  }
  return json.data;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  try {
    const rows = await publicFetch<
      Array<{ _id: string; name: string; slug: string }>
    >("/categories");
    return rows.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}

export async function fetchBrands(): Promise<CatalogBrand[]> {
  try {
    const rows = await publicFetch<
      Array<{ _id: string; name: string; slug: string }>
    >("/brands");
    return rows.map((b) => ({
      id: String(b._id),
      name: b.name,
      slug: b.slug,
    }));
  } catch {
    return [];
  }
}

export async function fetchProducts(options?: {
  categoryId?: string;
  brandId?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<ProductsListResult> {
  const limit = options?.limit ?? CATALOG_PAGE_SIZE;
  const page = options?.page ?? 1;
  try {
    const data = await publicFetch<{
      items: ApiProduct[];
      nextCursor: string | null;
      total?: number;
      page?: number;
      totalPages?: number;
    }>(
      `/products${toQuery({
        categoryId: options?.categoryId,
        brandId: options?.brandId,
        q: options?.q,
        page,
        limit,
      })}`,
    );

    const items = (data.items ?? []).map(mapApiProduct);
    const total = data.total ?? items.length;
    return {
      items,
      total,
      page: data.page ?? page,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(total / limit)),
      nextCursor: data.nextCursor ?? null,
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
      nextCursor: null,
    };
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    const raw = await publicFetch<ApiProduct>(
      `/products/${encodeURIComponent(slug)}`,
    );
    return mapApiProduct(raw);
  } catch {
    return null;
  }
}

export async function fetchFeaturedProducts(
  limit = 8,
): Promise<Product[]> {
  const result = await fetchProducts({ page: 1, limit });
  return result.items;
}

export type StorefrontSeller = {
  id: string;
  fullName: string;
  phone: string;
  telegramUsername?: string;
  avatarUrl?: string;
};

export async function fetchSellers(): Promise<StorefrontSeller[]> {
  try {
    const rows = await publicFetch<
      Array<{
        _id: string;
        fullName: string;
        phone: string;
        telegramUsername?: string;
        avatarUrl?: string;
        status?: string;
      }>
    >("/sellers");
    return rows.map((s) => ({
      id: String(s._id),
      fullName: s.fullName,
      phone: s.phone,
      telegramUsername: s.telegramUsername,
      avatarUrl: s.avatarUrl,
    }));
  } catch {
    return [];
  }
}

export async function fetchRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const categories = await fetchCategories();
  const category = categories.find((c) => c.slug === product.category);
  if (!category) return [];

  const result = await fetchProducts({
    categoryId: category.id,
    page: 1,
    limit: limit + 4,
  });

  return result.items
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

export async function fetchProductSlugs(limit = 200): Promise<string[]> {
  const result = await fetchProducts({ page: 1, limit });
  return result.items.map((p) => p.slug);
}
