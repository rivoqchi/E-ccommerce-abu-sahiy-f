"use client";

import { useEffect, useRef } from "react";
import { ApiClientError } from "@/lib/api";
import {
  getTelegramWebApp,
  isTelegramMiniApp,
  waitForTelegramInitData,
} from "@/lib/telegram";
import { useAuthStore } from "@/store/auth";

/**
 * Silently authenticates when running inside Telegram Mini App.
 * Outside Telegram this resolves once and stays idle.
 */
export function TelegramAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const attempted = useRef(false);

  useEffect(() => {
    if (!hydrated || attempted.current) return;
    attempted.current = true;

    const { accessToken, setTelegramAuth, loginWithTelegram } =
      useAuthStore.getState();

    if (accessToken) {
      const inTg = isTelegramMiniApp();
      if (inTg) {
        const wa = getTelegramWebApp();
        try {
          wa?.ready();
          wa?.expand();
        } catch {
          // ignore
        }
      }
      setTelegramAuth({ inTelegram: inTg, status: "done" });
      return;
    }

    // telegram-web-app.js always defines window.Telegram.WebApp in the browser —
    // only treat real Mini App sessions as Telegram (initData / platform).
    if (!isTelegramMiniApp()) {
      setTelegramAuth({ inTelegram: false, status: "unavailable" });
      return;
    }

    void (async () => {
      const webApp = getTelegramWebApp();
      try {
        webApp?.ready();
        webApp?.expand();
      } catch {
        // ignore
      }

      setTelegramAuth({ inTelegram: true, status: "pending" });

      const initData = await waitForTelegramInitData(4500);
      if (!initData) {
        setTelegramAuth({ inTelegram: true, status: "unavailable" });
        return;
      }

      try {
        await loginWithTelegram(initData);
        setTelegramAuth({ inTelegram: true, status: "done" });
      } catch (err) {
        console.warn(
          "[TelegramAuth]",
          err instanceof ApiClientError ? err.message : err,
        );
        setTelegramAuth({ inTelegram: true, status: "error" });
      }
    })();
  }, [hydrated]);

  return children;
}
