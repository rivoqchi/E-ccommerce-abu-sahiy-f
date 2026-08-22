import { getApiBaseUrl } from "@/lib/env";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";
import type {
  CatalogBrand,
  CatalogCategory,
  CatalogPartner,
  Product,
  ProductSource,
  ProductSpec,
} from "@/types/product";
import type { Story, StoryItem, StoryVideo } from "@/types/story";
import { resolveProductImages, isStorefrontReadyProduct } from "@/lib/product-image";
import {
  sanitizeHiddenFields,
  sanitizeHiddenSpecLabels,
  type ProductDisplaySettings,
} from "@/lib/product-display";

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
      image?: string;
    }
  | null
  | undefined;

export type ApiProduct = {
  _id: string;
  slug: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  wholesalePrice?: number;
  stock?: number;
  categoryId?: ApiRef;
  partnerId?: ApiRef;
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

export function mapApiProduct(
  raw: ApiProduct,
  source: ProductSource = "store",
): Product {
  const categorySlug = slugOf(raw.categoryId, "uncategorized");
  const categoryLabel = nameOf(raw.categoryId, "Kategoriya");
  const brandName =
    raw.brandId && typeof raw.brandId === "object"
      ? raw.brandId.name?.trim() || ""
      : "Brendsiz";
  const brandSlug = slugOf(raw.brandId) || undefined;
  const partnerId = idOf(raw.partnerId) || undefined;
  const partnerName =
    raw.partnerId && typeof raw.partnerId === "object"
      ? raw.partnerId.name?.trim() || undefined
      : undefined;
  const partnerLogo =
    raw.partnerId && typeof raw.partnerId === "object"
      ? raw.partnerId.image?.trim() || undefined
      : undefined;
  const tags = raw.tags ?? [];
  const price = Number(raw.price);
  const wholesale = Number(raw.wholesalePrice);
  const compareAt = Number(raw.compareAtPrice);

  return {
    id: String(raw._id),
    slug: raw.slug,
    name: raw.name,
    code: raw.code?.trim() || undefined,
    description: raw.description?.trim() ?? "",
    price: Number.isFinite(price) ? price : 0,
    wholesalePrice:
      Number.isFinite(wholesale) && wholesale >= 0 ? wholesale : Number.isFinite(price) ? price : 0,
    ...(Number.isFinite(compareAt) && compareAt > 0
      ? { compareAtPrice: compareAt }
      : {}),
    category: categorySlug,
    categoryLabel,
    brand: source === "hamkor" ? partnerName || "Hamkor" : brandName,
    brandSlug,
    images: normalizeImages(raw.images),
    specs: raw.specs ?? [],
    featured: tags.includes("featured"),
    stock: Math.max(0, Number(raw.stock) || 0),
    inStock: (raw.stock ?? 0) > 0,
    buyerCount: Number(raw.buyerCount) || 0,
    recentBuyers: (raw.recentBuyers ?? [])
      .filter((b) => b?.fullName)
      .map((b) => ({
        fullName: b.fullName,
        avatarUrl: b.avatarUrl || undefined,
      })),
    source,
    partnerId,
    partnerName,
    partnerLogo,
  };
}

/** Build/ISR da API uxlab yoki noto'g'ri URL bo'lsa Vercel 60s timeout bermasin */
const PUBLIC_FETCH_TIMEOUT_MS = 8_000;

async function publicFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number | false } },
): Promise<T> {
  const { next, headers, cache, ...rest } = init ?? {};
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const useNoStore = cache === "no-store" || next?.revalidate === 0;
  const method = String(rest.method ?? "GET").toUpperCase();
  const hasJsonBody =
    rest.body != null && method !== "GET" && method !== "HEAD";
  const isServer = typeof window === "undefined";

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
      ...rest,
      ...(useNoStore ? { cache: "no-store" as RequestCache } : { cache }),
      // AbortSignal.timeout + Next.js fetch patch brauzerda "Failed to fetch" beradi
      ...(isServer
        ? { signal: AbortSignal.timeout(PUBLIC_FETCH_TIMEOUT_MS) }
        : {}),
      headers: {
        ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(isServer
        ? useNoStore
          ? { next: { revalidate: 0 } }
          : { next: { revalidate: 60, ...next } }
        : {}),
    });
  } catch (err) {
    const aborted =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    throw new Error(
      aborted ? "API javob bermadi" : "API bilan aloqa yo'q. Backend ishlayaptimi?",
    );
  }

  const text = await response.text();
  let json: ApiSuccess<T> | ApiError;
  try {
    json = JSON.parse(text) as ApiSuccess<T> | ApiError;
  } catch {
    throw new Error("API javobi o'qilmadi");
  }
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
      Array<{
        _id: string;
        name: string;
        slug: string;
        image?: string;
        productCount?: number;
      }>
    >("/categories");
    return rows.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      image: c.image || undefined,
      productCount: Number(c.productCount ?? 0),
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

export type ExchangeRate = {
  usdToUzs: number;
  date: string;
  source: string;
};

export async function fetchExchangeRate(): Promise<ExchangeRate | null> {
  try {
    const data = await publicFetch<ExchangeRate>("/exchange-rate", {
      next: { revalidate: 300 },
    });
    const usdToUzs = Number(data.usdToUzs);
    if (!Number.isFinite(usdToUzs) || usdToUzs <= 0) return null;
    return {
      usdToUzs,
      date: data.date?.trim() || "",
      source: data.source || "cbu",
    };
  } catch {
    return null;
  }
}

export async function fetchProductDisplaySettings(): Promise<ProductDisplaySettings> {
  try {
    const data = await publicFetch<{
      hiddenFields?: unknown;
      hiddenSpecLabels?: unknown;
    }>("/products/display-settings", {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    return {
      hiddenFields: sanitizeHiddenFields(data.hiddenFields),
      hiddenSpecLabels: sanitizeHiddenSpecLabels(data.hiddenSpecLabels),
    };
  } catch {
    return { hiddenFields: [], hiddenSpecLabels: [] };
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
      // Import/replace dan keyin bo'sh ISR cache qolib ketmasin
      { cache: "no-store", next: { revalidate: 0 } },
    );

    const items = (data.items ?? [])
      .filter(isStorefrontReadyProduct)
      .map((raw) => mapApiProduct(raw));
    const total = data.total ?? items.length;
    return {
      items,
      total,
      page: data.page ?? page,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(total / limit)),
      nextCursor: data.nextCursor ?? null,
    };
  } catch (err) {
    console.warn(
      "[fetchProducts]",
      err instanceof Error ? err.message : "so'rov xatosi",
    );
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
    // Next.js ba'zan params.slug ni allaqachon %D0%BA... ko'rinishida beradi —
    // qayta encode qilmaslik uchun avval decode qilamiz.
    let decoded = slug;
    try {
      for (let i = 0; i < 2; i++) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
    } catch {
      decoded = slug;
    }

    const raw = await publicFetch<ApiProduct>(
      `/products/${encodeURIComponent(decoded)}`,
      { next: { revalidate: 0 } },
    );
    if (!isStorefrontReadyProduct(raw)) return null;
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

export async function fetchHamkorPartners(): Promise<CatalogPartner[]> {
  try {
    const rows = await publicFetch<
      Array<{
        _id: string;
        name: string;
        slug: string;
        image?: string;
      }>
    >("/hamkor/partners");
    return rows.map((p) => ({
      id: String(p._id),
      name: p.name,
      slug: p.slug,
      image: p.image || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchHamkorCategories(options?: {
  partnerId?: string;
}): Promise<CatalogCategory[]> {
  try {
    const rows = await publicFetch<
      Array<{
        _id: string;
        name: string;
        slug: string;
        image?: string;
        productCount?: number;
        partnerId?: ApiRef;
      }>
    >(`/hamkor/categories${toQuery({ partnerId: options?.partnerId })}`);
    return rows.map((c) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      image: c.image || undefined,
      productCount: Number(c.productCount ?? 0),
      partnerId: idOf(c.partnerId) || undefined,
    }));
  } catch {
    return [];
  }
}

export async function fetchHamkorProducts(options?: {
  partnerId?: string;
  categoryId?: string;
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
      `/hamkor/products${toQuery({
        partnerId: options?.partnerId,
        categoryId: options?.categoryId,
        q: options?.q,
        page,
        limit,
      })}`,
      { cache: "no-store", next: { revalidate: 0 } },
    );

    const items = (data.items ?? [])
      .filter(isStorefrontReadyProduct)
      .map((raw) => mapApiProduct(raw, "hamkor"));
    const total = data.total ?? items.length;
    return {
      items,
      total,
      page: data.page ?? page,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil(total / limit)),
      nextCursor: data.nextCursor ?? null,
    };
  } catch (err) {
    console.warn(
      "[fetchHamkorProducts]",
      err instanceof Error ? err.message : "so'rov xatosi",
    );
    return {
      items: [],
      total: 0,
      page: 1,
      totalPages: 1,
      nextCursor: null,
    };
  }
}

export async function fetchHamkorProductBySlug(
  slug: string,
): Promise<Product | null> {
  try {
    let decoded = slug;
    try {
      for (let i = 0; i < 2; i++) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
    } catch {
      decoded = slug;
    }

    const raw = await publicFetch<ApiProduct>(
      `/hamkor/products/${encodeURIComponent(decoded)}`,
      { next: { revalidate: 0 } },
    );
    if (!isStorefrontReadyProduct(raw)) return null;
    return mapApiProduct(raw, "hamkor");
  } catch {
    return null;
  }
}

export async function fetchHamkorRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const categories = await fetchHamkorCategories();
  const category = categories.find((c) => c.slug === product.category);
  if (!category) return [];

  const result = await fetchHamkorProducts({
    categoryId: category.id,
    page: 1,
    limit: limit + 4,
  });

  return result.items.filter((p) => p.id !== product.id).slice(0, limit);
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

/* ── Stories / Reels ─────────────────────────────────────────── */

type ApiStoryItem = {
  _id?: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  mediaUrlLow?: string;
  thumbnailUrl?: string;
  durationMs?: number;
  caption?: string;
};

type ApiStory = {
  _id: string;
  authorName: string;
  avatarUrl?: string;
  items?: ApiStoryItem[];
  isActive?: boolean;
  createdAt?: string;
};

function mapStoryItem(raw: ApiStoryItem, index: number): StoryItem {
  return {
    id: String(raw._id ?? index),
    mediaType: raw.mediaType,
    mediaUrl: raw.mediaUrl,
    mediaUrlLow: raw.mediaUrlLow || undefined,
    thumbnailUrl: raw.thumbnailUrl || undefined,
    durationMs: raw.durationMs ?? 5000,
    caption: raw.caption || undefined,
  };
}

function mapStory(raw: ApiStory): Story {
  return {
    id: String(raw._id),
    authorName: raw.authorName,
    avatarUrl: raw.avatarUrl || undefined,
    items: (raw.items ?? []).map(mapStoryItem),
    isActive: raw.isActive !== false,
    createdAt: raw.createdAt,
  };
}

export async function fetchStories(): Promise<Story[]> {
  try {
    const rows = await publicFetch<ApiStory[]>("/stories");
    return rows.map(mapStory).filter((s) => s.items.length > 0);
  } catch {
    return [];
  }
}

export async function fetchStoryVideos(): Promise<StoryVideo[]> {
  try {
    const rows = await publicFetch<
      Array<{
        id: string;
        storyId: string;
        authorName: string;
        avatarUrl?: string;
        mediaUrl: string;
        mediaUrlLow?: string;
        thumbnailUrl?: string;
        caption?: string;
        createdAt?: string;
      }>
    >("/stories/videos");
    return rows.map((v) => ({
      id: String(v.id),
      storyId: String(v.storyId),
      authorName: v.authorName,
      avatarUrl: v.avatarUrl || undefined,
      mediaUrl: v.mediaUrl,
      mediaUrlLow: v.mediaUrlLow || undefined,
      thumbnailUrl: v.thumbnailUrl || undefined,
      caption: v.caption || undefined,
      createdAt: v.createdAt,
    }));
  } catch {
    return [];
  }
}
