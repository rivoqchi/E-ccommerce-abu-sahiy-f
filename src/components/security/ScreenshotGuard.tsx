"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { isScreenshotShortcut } from "@/lib/screenshot-keys";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

const LOCAL_KEY = "sami-screenshot-attempts";
const DEBOUNCE_MS = 1600;
const FLASH_MS = 5200;
const WATERMARK_COPIES = 36;

type GuardPhase = "idle" | "warn" | "blocked";

function readLocalAttempts(): number {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const n = Number.parseInt(raw ?? "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeLocalAttempts(n: number) {
  try {
    localStorage.setItem(LOCAL_KEY, String(n));
  } catch {
    // ignore quota / private mode
  }
}

export function ScreenshotGuard() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const [phase, setPhase] = useState<GuardPhase>("idle");
  const lastAt = useRef(0);
  const flashTimer = useRef<number>(0);

  const skip =
    pathname.startsWith("/admin") ||
    pathname === "/welcome" ||
    pathname === "/login" ||
    user?.role === "admin";

  const mark = user?.phone || user?.fullName || "mehmon";
  const warnText = "Yana screenshot qilsangiz, ilovadan bloklanasiz";

  const onCaught = useCallback(async () => {
    const now = Date.now();
    if (now - lastAt.current < DEBOUNCE_MS) return;
    lastAt.current = now;

    const nextLocal = readLocalAttempts() + 1;
    writeLocalAttempts(nextLocal);

    window.clearTimeout(flashTimer.current);
    setPhase("warn");
    flashTimer.current = window.setTimeout(() => {
      setPhase((current) => (current === "blocked" ? current : "idle"));
    }, FLASH_MS);

    if (!accessToken || user?.role === "admin") {
      return;
    }

    try {
      const result = await apiFetch<{ attempts: number; blocked: boolean }>(
        "/users/me/screenshot-attempt",
        { method: "POST", token: accessToken, body: "{}" },
      );
      writeLocalAttempts(result.attempts);
      if (result.blocked) {
        window.clearTimeout(flashTimer.current);
        setPhase("blocked");
        await logout();
      }
    } catch {
      // Network failure: keep the on-screen warning; do not lock guests out.
    }
  }, [accessToken, logout, user?.role]);

  useEffect(() => {
    if (skip) return;

    const onKey = (event: KeyboardEvent) => {
      if (!isScreenshotShortcut(event)) return;
      event.preventDefault();
      void onCaught();
    };

    const onPrint = () => {
      void onCaught();
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    window.addEventListener("beforeprint", onPrint);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      window.removeEventListener("beforeprint", onPrint);
      window.clearTimeout(flashTimer.current);
    };
  }, [onCaught, skip]);

  if (skip) return null;

  const watermarkLine = `${warnText} · ${mark}`;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[40] overflow-hidden select-none"
      >
        <div className="absolute -inset-32 flex flex-wrap content-start justify-center gap-x-16 gap-y-24 opacity-[0.14] dark:opacity-[0.18]">
          {Array.from({ length: WATERMARK_COPIES }, (_, i) => (
            <span
              key={i}
              className="-rotate-[28deg] whitespace-nowrap text-[13px] font-semibold tracking-wide text-foreground"
            >
              {watermarkLine}
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-[5.75rem] z-[45] flex justify-center px-4 md:bottom-5"
      >
        <p className="max-w-[min(92vw,28rem)] rounded-full bg-destructive/90 px-4 py-2 text-center text-[11px] font-semibold leading-snug text-destructive-foreground shadow-lg md:text-xs">
          {warnText}
        </p>
      </div>

      {phase === "warn" ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-destructive/92 p-6 text-destructive-foreground"
          role="alert"
        >
          <div className="max-w-sm text-center">
            <ShieldAlert className="mx-auto size-12" strokeWidth={1.75} />
            <p className="mt-4 text-2xl font-bold tracking-tight">
              Screenshot aniqlandi
            </p>
            <p className="mt-3 text-base font-medium leading-relaxed">
              {warnText}
            </p>
            {mark !== "mehmon" ? (
              <p className="mt-4 text-xs opacity-80">{mark}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "blocked" ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background p-6"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="screenshot-blocked-title"
        >
          <div className="max-w-sm text-center">
            <ShieldAlert className="mx-auto size-12 text-destructive" />
            <h2
              id="screenshot-blocked-title"
              className="mt-4 text-2xl font-bold tracking-tight text-foreground"
            >
              Ilovadan bloklandingiz
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Screenshot qayta aniqlandi. Hisobingiz o‘chirildi. Qayta ochish
              uchun administrator bilan bog‘laning.
            </p>
            <Button
              className="mt-6 h-11 rounded-full"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Kirish sahifasi
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
