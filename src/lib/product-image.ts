import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";

/** Haqiqiy mahsulot rasmi bor (placeholder emas). */
export function hasRealProductImage(images?: string[]): boolean {
  const url = images?.[0]?.trim();
  if (!url) return false;
  if (url === PRODUCT_IMAGE_PLACEHOLDER) return false;
  if (url.includes("photo-1556911220-e15b29be8c8f")) return false;
  return true;
}

/** Do‘kon UI: nom va haqiqiy rasm. Kod/narx yashirilganda ham tovar chiqadi. */
export function isStorefrontReadyProduct(p: {
  name?: string;
  code?: string;
  price?: number;
  images?: string[];
}): boolean {
  if (!p.name?.trim()) return false;
  return hasRealProductImage(p.images);
}

function isLocalBackendUploadHost(hostname: string, port: string): boolean {
  return (
    (hostname === "localhost" || hostname === "127.0.0.1") &&
    (port === "4000" || port === "")
  );
}

/** Keep usable image URLs; replace broken/demo hosts with placeholder. */
export function resolveProductImage(src?: string | null): string {
  if (!src?.trim()) return PRODUCT_IMAGE_PLACEHOLDER;
  const value = src.trim();
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("/uploads/")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return PRODUCT_IMAGE_PLACEHOLDER;
    }
    // Seed/demo URLs that are not real assets
    if (
      url.hostname === "example.com" ||
      url.hostname.endsWith(".example.com")
    ) {
      return PRODUCT_IMAGE_PLACEHOLDER;
    }
    // Lokal backend uploads → Next.js /uploads rewrite (same-origin)
    if (
      url.pathname.startsWith("/uploads/") &&
      isLocalBackendUploadHost(url.hostname, url.port)
    ) {
      return url.pathname;
    }
    return value;
  } catch {
    return PRODUCT_IMAGE_PLACEHOLDER;
  }
}

export function resolveProductImages(images?: string[]): string[] {
  const resolved = (images ?? [])
    .map(resolveProductImage)
    .filter((src, index, arr) => arr.indexOf(src) === index);
  const withoutOnlyPlaceholder = resolved.filter(
    (src) => src !== PRODUCT_IMAGE_PLACEHOLDER,
  );
  return withoutOnlyPlaceholder.length > 0
    ? withoutOnlyPlaceholder
    : [PRODUCT_IMAGE_PLACEHOLDER];
}
