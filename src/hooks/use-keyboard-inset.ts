"use client";

import { useEffect, useState } from "react";
import { getTelegramWebApp } from "@/lib/telegram";

const KEYBOARD_THRESHOLD = 72;
/** iPhone numeric pad + home indicator, so +/- stays tappable above the keys. */
const IOS_NUMERIC_FALLBACK = 372;

function isTextField(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLInputElement) {
    const type = el.type;
    return (
      type !== "button" &&
      type !== "checkbox" &&
      type !== "radio" &&
      type !== "file" &&
      type !== "submit"
    );
  }
  return (el as HTMLElement).isContentEditable === true;
}

function isIosLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iP(hone|ad|od)/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }
  const platform = getTelegramWebApp()?.platform?.toLowerCase();
  return platform === "ios" || platform === "macos";
}

function measuredInset(): number {
  if (typeof window === "undefined") return 0;

  const wa = getTelegramWebApp();
  const stable = wa?.viewportStableHeight;
  const current = wa?.viewportHeight;
  if (
    typeof stable === "number" &&
    typeof current === "number" &&
    stable - current > KEYBOARD_THRESHOLD
  ) {
    return Math.round(stable - current);
  }

  const vv = window.visualViewport;
  if (vv) {
    const inset = window.innerHeight - vv.height - vv.offsetTop;
    if (inset > KEYBOARD_THRESHOLD) return Math.round(inset);
  }

  return 0;
}

function readInset(textFieldFocused: boolean): number {
  const measured = measuredInset();
  // Telegram iOS overlays the keyboard and often reports little or no shrink.
  // Always lift at least the numeric-pad height while a qty field is focused.
  if (textFieldFocused && isIosLike()) {
    const fallback = Math.round(
      Math.min(
        IOS_NUMERIC_FALLBACK,
        Math.max(300, window.innerHeight * 0.44),
      ),
    );
    return Math.max(measured, fallback);
  }
  return measured;
}

/** Pixels the software keyboard covers at the bottom of the screen. */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    let focused = isTextField(document.activeElement);
    let frame = 0;
    const timers: number[] = [];

    const apply = () => {
      const next = readInset(focused);
      setInset(next);
      document.documentElement.style.setProperty(
        "--keyboard-inset",
        `${next}px`,
      );
    };

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    const bump = () => {
      timers.splice(0).forEach((id) => window.clearTimeout(id));
      update();
      for (const ms of [80, 200, 360, 520]) {
        timers.push(window.setTimeout(update, ms));
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!isTextField(e.target)) return;
      focused = true;
      bump();
    };

    const onFocusOut = () => {
      timers.push(
        window.setTimeout(() => {
          focused = isTextField(document.activeElement);
          update();
        }, 80),
      );
    };

    apply();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    const wa = getTelegramWebApp();
    wa?.onEvent?.("viewportChanged", update);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((id) => window.clearTimeout(id));
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      wa?.offEvent?.("viewportChanged", update);
      document.documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);

  return inset;
}
