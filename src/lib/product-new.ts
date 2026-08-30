/** Mahsulot qo'shilgandan keyin shuncha kun "Yangi" deb ko'rsatiladi */
export const NEW_PRODUCT_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** MongoDB ObjectId ning birinchi 4 bayti — yaratilgan vaqt */
function dateFromObjectId(id?: string): Date | null {
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) return null;
  const seconds = Number.parseInt(id.slice(0, 8), 16);
  if (!Number.isFinite(seconds)) return null;
  const d = new Date(seconds * 1000);
  return Number.isNaN(d.getTime()) ? null : d;
}

function resolveCreatedAt(createdAt?: string, productId?: string): Date | null {
  if (createdAt) {
    const fromIso = parseDate(createdAt);
    if (fromIso) return fromIso;
  }
  return dateFromObjectId(productId);
}

/**
 * Qo'shilganidan keyin 30 kun "Yangi".
 * 30 kun o'tgach belgi o'zi yo'qoladi — qo'lda o'chirish shart emas.
 */
export function isProductNew(
  createdAt?: string,
  productId?: string,
  days = NEW_PRODUCT_DAYS,
): boolean {
  const created = resolveCreatedAt(createdAt, productId);
  if (!created) return false;

  const ageMs = Date.now() - created.getTime();
  return ageMs >= 0 && ageMs <= days * DAY_MS;
}
