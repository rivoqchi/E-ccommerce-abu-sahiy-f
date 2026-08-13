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

/** Node fetch `localhost` ni avval ::1 qiladi; Windowsda ECONNREFUSED bo'lishi mumkin */
function preferIpv4(url: string): string {
  return url.replace(/:\/\/localhost(?=[:/]|$)/, "://127.0.0.1");
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

export function getApiBaseUrl(): string {
  // Brauzer + next dev: same-origin rewrite (CORS / Failed to fetch yo'qoladi)
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    return "/api/v1";
  }

  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return preferIpv4(stripSlash(explicit));

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:4000/api/v1";
  }

  console.warn(
    "[env] NEXT_PUBLIC_API_URL belgilanmagan. Vercel Environment Variables ga qo'shing (masalan https://api.example.com/api/v1).",
  );
  return "http://127.0.0.1:4000/api/v1";
}

export const SITE_URL = resolveSiteUrl();

export const API_BASE_URL = getApiBaseUrl();

/** Realtime (Socket.io) — ixtiyoriy; berilmasa API hostidan olinadi */
export const WS_URL = (() => {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) return preferIpv4(stripSlash(explicit));
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) return preferIpv4(stripSlash(api).replace(/\/api\/v1\/?$/, ""));
  return "http://127.0.0.1:4000";
})();
