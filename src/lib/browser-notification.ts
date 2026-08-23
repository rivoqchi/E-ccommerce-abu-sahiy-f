import type { AdminNotification } from "@/store/admin-notifications";

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(item: AdminNotification) {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return;
  }
  if (Notification.permission !== "granted") return;

  try {
    const note = new Notification(item.title, {
      body: item.body,
      tag: item.id,
      lang: "uz",
    });
    note.onclick = () => {
      note.close();
      window.focus();
      const href = item.href;
      if (!href.startsWith("/admin/") || href.includes("//") || href.includes("\\")) {
        return;
      }
      window.location.assign(href);
    };
  } catch {
    // Ignore OS notification errors (Safari private mode, etc.)
  }
}

let titleFlash: number | null = null;
let originalTitle: string | null = null;

export function flashDocumentTitle(text: string) {
  if (typeof document === "undefined") return;
  if (document.visibilityState === "visible") return;

  if (titleFlash != null) {
    window.clearInterval(titleFlash);
    titleFlash = null;
  }
  originalTitle = originalTitle ?? document.title;
  let on = false;
  titleFlash = window.setInterval(() => {
    document.title = on ? (originalTitle ?? "Sami") : text;
    on = !on;
  }, 1100);

  const stop = () => {
    if (titleFlash != null) {
      window.clearInterval(titleFlash);
      titleFlash = null;
    }
    if (originalTitle != null) document.title = originalTitle;
    originalTitle = null;
    document.removeEventListener("visibilitychange", stop);
  };
  document.addEventListener("visibilitychange", stop);
}
