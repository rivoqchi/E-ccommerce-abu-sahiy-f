/** Mahsulot qo'shilgandan keyin shuncha kun "Yangi" deb ko'rsatiladi */
export const NEW_PRODUCT_DAYS = 30;

/**
 * "Yangi" badge faqat shu vaqtdan KEYIN qo'shilgan mahsulotlarga.
 * Bazadagi eski tavarlar (shu sanadan oldin) hech qachon "Yangi" bo'lmaydi.
 * O'zgartirish: .env.local → NEXT_PUBLIC_NEW_PRODUCT_SINCE=2026-08-29T12:29:00.000Z
 */
const NEW_PRODUCT_SINCE = (
  process.env.NEXT_PUBLIC_NEW_PRODUCT_SINCE?.trim() ||
  "2026-08-29T12:29:00.000Z"
);

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isProductNew(
  createdAt?: string,
  days = NEW_PRODUCT_DAYS,
): boolean {
  if (!createdAt) return false;

  const created = parseDate(createdAt);
  const since = parseDate(NEW_PRODUCT_SINCE);
  if (!created || !since) return false;

  // Eski bazadagi mahsulotlar — badge yo'q
  if (created.getTime() < since.getTime()) return false;

  const ageMs = Date.now() - created.getTime();
  return ageMs >= 0 && ageMs <= days * 24 * 60 * 60 * 1000;
}
