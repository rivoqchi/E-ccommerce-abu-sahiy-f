"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, CheckCheck, ShoppingBag, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { goToAdminHref } from "@/lib/admin-alerts";
import {
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/browser-notification";
import { cn } from "@/lib/utils";
import {
  unreadCount,
  useAdminNotifications,
  type AdminNotification,
} from "@/store/admin-notifications";

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "hozir";
  if (min < 60) return `${min} daqiqa`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} soat`;
  const day = Math.floor(hr / 24);
  return `${day} kun`;
}

export function AdminNotifications() {
  const items = useAdminNotifications((s) => s.items);
  const markRead = useAdminNotifications((s) => s.markRead);
  const markAllRead = useAdminNotifications((s) => s.markAllRead);
  const unread = unreadCount(items);
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState(notificationPermission);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setPerm(notificationPermission());
  }, [open]);

  async function enableBrowser() {
    const next = await requestNotificationPermission();
    setPerm(next);
  }

  function openItem(item: AdminNotification) {
    markRead(item.id);
    setOpen(false);
    goToAdminHref(item.href);
  }

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        aria-label="Bildirishnomalar"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="size-5" strokeWidth={1.75} />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
            <p className="text-sm font-semibold">Bildirishnomalar</p>
            {items.length ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={markAllRead}
              >
                <CheckCheck className="size-3.5" />
                Oʻqilgan
              </button>
            ) : null}
          </div>

          {perm !== "granted" && perm !== "unsupported" ? (
            <div className="border-b border-border/60 bg-muted/40 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                Sahifa yopiq boʻlsa ham zakaz kelganini koʻrish uchun brauzer
                bildirishnomasini yoqing.
              </p>
              {perm === "denied" ? (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-destructive">
                  <BellOff className="size-3.5" />
                  Brauzer sozlamasidan ruxsat bering
                </p>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2 h-8 rounded-full"
                  onClick={() => void enableBrowser()}
                >
                  Yoqish
                </Button>
              )}
            </div>
          ) : null}

          <ul className="max-h-[min(24rem,60dvh)] overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-muted/70",
                      !item.read && "bg-primary/5",
                    )}
                    onClick={() => openItem(item)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        item.type === "new_order"
                          ? "bg-foreground text-background"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {item.type === "new_order" ? (
                        <ShoppingBag className="size-3.5" />
                      ) : (
                        <TriangleAlert className="size-3.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.title}</span>
                        {!item.read ? (
                          <span className="size-1.5 rounded-full bg-destructive" />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {item.body}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                        {timeAgo(item.createdAt)} oldin
                      </span>
                    </span>
                  </button>
                </li>
              ))
            ) : (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                Hozircha bildirishnoma yoʻq
              </li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AdminIncomingToast() {
  const items = useAdminNotifications((s) => s.items);
  const latest = items[0];
  const [visible, setVisible] = useState<AdminNotification | null>(null);
  const seenId = useRef<string | null>(null);

  useEffect(() => {
    if (!latest || latest.read) return;
    if (seenId.current === latest.id) return;
    seenId.current = latest.id;
    if (Date.now() - latest.createdAt > 15_000) return;
    setVisible(latest);
    const t = window.setTimeout(() => setVisible(null), 8000);
    return () => window.clearTimeout(t);
  }, [latest]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="fixed top-16 right-4 z-[80] flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-left shadow-xl ring-1 ring-foreground/5"
      onClick={() => {
        useAdminNotifications.getState().markRead(visible.id);
        setVisible(null);
        goToAdminHref(visible.href);
      }}
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
        <ShoppingBag className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{visible.title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {visible.body}
        </span>
        <span className="mt-1 block text-xs font-medium">Ochish →</span>
      </span>
    </button>
  );
}
