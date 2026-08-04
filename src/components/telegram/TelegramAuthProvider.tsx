"use client";

import { useEffect, useRef } from "react";
import { ApiClientError } from "@/lib/api";
import {
  getTelegramWebApp,
  isTelegramMiniApp,
  requestTelegramContact,
  waitForTelegramInitData,
} from "@/lib/telegram";
import { useAuthStore } from "@/store/auth";

const CONTACT_PROMPTED_KEY = "sami-tg-contact-prompted";

function wasContactPrompted(telegramId: string | null | undefined): boolean {
  if (!telegramId || typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(`${CONTACT_PROMPTED_KEY}:${telegramId}`) === "1";
  } catch {
    return false;
  }
}

function markContactPrompted(telegramId: string | null | undefined) {
  if (!telegramId || typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${CONTACT_PROMPTED_KEY}:${telegramId}`, "1");
  } catch {
    // ignore
  }
}

/**
 * Silently authenticates when running inside Telegram Mini App.
 * Every open re-syncs Telegram first/last name + latest profile photo.
 * If phone is missing, asks once via native requestContact popup.
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

    const { setTelegramAuth, loginWithTelegram, linkTelegramContact } =
      useAuthStore.getState();

    const ensurePhone = async () => {
      const current = useAuthStore.getState().user;
      if (!current || current.phone) return;
      if (wasContactPrompted(current.telegramId)) return;

      markContactPrompted(current.telegramId);
      const contactData = await requestTelegramContact();
      if (!contactData) return;

      try {
        await linkTelegramContact(contactData);
      } catch (err) {
        console.warn(
          "[TelegramAuth] contact",
          err instanceof ApiClientError ? err.message : err,
        );
      }
    };

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
        // Keep existing session if any; mark unavailable for silent auth
        const hasToken = Boolean(useAuthStore.getState().accessToken);
        setTelegramAuth({
          inTelegram: true,
          status: hasToken ? "done" : "unavailable",
        });
        return;
      }

      try {
        // Always re-auth with fresh initData so name + photo stay up to date
        await loginWithTelegram(initData);
        setTelegramAuth({ inTelegram: true, status: "done" });
        await ensurePhone();
      } catch (err) {
        console.warn(
          "[TelegramAuth]",
          err instanceof ApiClientError ? err.message : err,
        );
        const hasToken = Boolean(useAuthStore.getState().accessToken);
        setTelegramAuth({
          inTelegram: true,
          status: hasToken ? "done" : "error",
        });
      }
    })();
  }, [hydrated]);

  return children;
}
