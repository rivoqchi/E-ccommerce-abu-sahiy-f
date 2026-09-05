export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

export type TelegramContactInfo = {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
};

export type TelegramContactResponse =
  | {
      status: "sent";
      response: string;
      responseUnsafe?: {
        auth_date: string;
        contact: TelegramContactInfo;
        hash: string;
      };
    }
  | { status: "cancelled" };

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
  };
  version?: string;
  platform?: string;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  ready: () => void;
  expand: () => void;
  close?: () => void;
  isVersionAtLeast?: (version: string) => boolean;
  requestContact?: (
    callback?: (shared: boolean, response?: TelegramContactResponse) => void,
  ) => void;
  onEvent?: (
    eventType: string,
    eventHandler: (eventData: unknown) => void,
  ) => void;
  offEvent?: (
    eventType: string,
    eventHandler: (eventData: unknown) => void,
  ) => void;
};

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return (
    (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram
      ?.WebApp ?? null
  );
}

/** True when opened as a real Telegram Mini App (initData bor). */
export function isTelegramMiniApp(): boolean {
  const wa = getTelegramWebApp();
  if (!wa) return false;
  // Faqat initData — Telegram in-app browser ham WebApp script yuklaydi,
  // platform bo‘lishi mumkin, lekin Mini App emas (Open Web link).
  return Boolean(wa.initData && wa.initData.length > 0);
}

/** WebApp obyekti bor (script yuklangan), lekin Mini App bo‘lishi shart emas */
export function hasTelegramWebAppObject(): boolean {
  return getTelegramWebApp() != null;
}

export function waitForTelegramInitData(
  timeoutMs = 4000,
): Promise<string | null> {
  return new Promise((resolve) => {
    const started = Date.now();

    const tick = () => {
      const wa = getTelegramWebApp();
      const initData = wa?.initData ?? "";
      if (initData) {
        resolve(initData);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 80);
    };

    tick();
  });
}

/**
 * Ask Telegram for the user's phone (native popup).
 * Returns the signed `response` query string for server verification, or null if cancelled / unavailable.
 */
export function requestTelegramContact(
  timeoutMs = 120_000,
): Promise<string | null> {
  return new Promise((resolve) => {
    const wa = getTelegramWebApp();
    if (!wa?.requestContact) {
      resolve(null);
      return;
    }

    if (wa.isVersionAtLeast && !wa.isVersionAtLeast("6.9")) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (value: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    try {
      wa.requestContact((shared, response) => {
        if (!shared || !response || response.status !== "sent") {
          finish(null);
          return;
        }
        const signed = response.response?.trim();
        finish(signed && signed.length > 0 ? signed : null);
      });
    } catch {
      finish(null);
    }
  });
}
