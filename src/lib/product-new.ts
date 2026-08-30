import { isNewHighlightActive } from "@/lib/product-new-highlight";

/** Katalog badge — faqat admin «30 kun yangi» switchi yoqilgan mahsulotlar. */
export function isProductNew(newHighlightUntil?: string | null): boolean {
  return isNewHighlightActive(newHighlightUntil);
}
