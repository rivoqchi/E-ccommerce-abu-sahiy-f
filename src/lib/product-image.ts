import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";

/** Keep usable image URLs; replace broken/demo hosts with placeholder. */
export function resolveProductImage(src?: string | null): string {
  if (!src?.trim()) return PRODUCT_IMAGE_PLACEHOLDER;
  const value = src.trim();
  if (value.startsWith("data:image/")) return value;
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
