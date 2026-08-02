/**
 * Public URL lar.
 * Next.js NEXT_PUBLIC_* ni faqat to'liq statik nom bilan inline qiladi —
 * process.env[name] dinamik kalit ishlatilmasin.
 *
 * Muhim: bu modul client bundle ga ham tushadi — hech qachon throw qilmang,
 * aks holda butun sahifa Uncaught Error bilan yiqiladi.
 */

function stripSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripSlash(explicit);

  // Vercel avtomatik beradi (protokolsiz host)
  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  console.warn(
    "[env] NEXT_PUBLIC_SITE_URL belgilanmagan. Vercel Environment Variables ga qo'shing.",
  );
  return "http://localhost:3000";
}

function resolveApiUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return stripSlash(explicit);

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:4000/api/v1";
  }

  console.warn(
    "[env] NEXT_PUBLIC_API_URL belgilanmagan. Vercel Environment Variables ga qo'shing (masalan https://api.example.com/api/v1).",
  );
  return "http://localhost:4000/api/v1";
}

export const SITE_URL = resolveSiteUrl();

export const API_BASE_URL = resolveApiUrl();

/** Realtime (Socket.io) — ixtiyoriy; berilmasa API hostidan olinadi */
export const WS_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) return stripSlash(explicit);
  return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
})();
