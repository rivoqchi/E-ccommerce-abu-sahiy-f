export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  ready: () => void;
  expand: () => void;
  close?: () => void;
  platform?: string;
  version?: string;
};

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return (
    (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram
      ?.WebApp ?? null
  );
}

/** True when opened inside Telegram (Mini App / WebApp). */
export function isTelegramMiniApp(): boolean {
  const wa = getTelegramWebApp();
  if (!wa) return false;
  if (wa.initData && wa.initData.length > 0) return true;
  // Some clients expose platform before initData is ready
  const platform = wa.platform;
  return Boolean(platform && platform !== "unknown");
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
