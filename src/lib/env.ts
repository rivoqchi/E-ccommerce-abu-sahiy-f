/**
 * Barcha URL / base URL lar faqat env orqali.
 * Kod ichida localhost fallback yo'q.
 *
 * Next.js NEXT_PUBLIC_* ni faqat to'liq statik nom bilan inline qiladi —
 * process.env[name] ishlatilmasin.
 */
function requirePublic(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `Kerakli muhit o'zgaruvchisi topilmadi: ${name}. Frontend/.env.local ni tekshiring.`,
    );
  }
  return trimmed.replace(/\/$/, "");
}

export const SITE_URL = requirePublic(
  process.env.NEXT_PUBLIC_SITE_URL,
  "NEXT_PUBLIC_SITE_URL",
);

export const API_BASE_URL = requirePublic(
  process.env.NEXT_PUBLIC_API_URL,
  "NEXT_PUBLIC_API_URL",
);

/** Realtime (Socket.io) — ixtiyoriy; berilmasa API hostidan olinadi */
export const WS_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
})();
