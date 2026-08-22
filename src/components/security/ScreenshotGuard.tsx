"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { isScreenshotShortcut } from "@/lib/screenshot-keys";
import { useAuthStore } from "@/store/auth";

const DEBOUNCE_MS = 1600;
const FLASH_MS = 4200;

export function ScreenshotGuard() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const [visible, setVisible] = useState(false);
  const lastAt = useRef(0);
  const flashTimer = useRef<number>(0);

  const skip =
    pathname.startsWith("/admin") ||
    pathname === "/welcome" ||
    pathname === "/login" ||
    role === "admin";

  const show = useCallback(() => {
    const now = Date.now();
    if (now - lastAt.current < DEBOUNCE_MS) return;
    lastAt.current = now;

    setVisible(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setVisible(false), FLASH_MS);
  }, []);

  useEffect(() => {
    if (skip) return;

    const onKey = (event: KeyboardEvent) => {
      if (!isScreenshotShortcut(event)) return;
      show();
    };

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    window.addEventListener("beforeprint", show);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      window.removeEventListener("beforeprint", show);
      window.clearTimeout(flashTimer.current);
    };
  }, [show, skip]);

  if (skip || !visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center bg-destructive/92 p-6 text-destructive-foreground"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-sm text-center">
        <ShieldAlert className="mx-auto size-12" strokeWidth={1.75} />
        <p className="mt-4 text-2xl font-bold tracking-tight">
          Screenshot qilish mumkin emas
        </p>
      </div>
    </div>
  );
}
