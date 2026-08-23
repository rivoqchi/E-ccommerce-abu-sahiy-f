import { formatMoney } from "@/lib/format";
import {
  flashDocumentTitle,
  showBrowserNotification,
} from "@/lib/browser-notification";
import { playNewOrderSound } from "@/lib/sounds";
import {
  useAdminNotifications,
  type AdminNotification,
} from "@/store/admin-notifications";

export const ADMIN_NEW_ORDER_EVENT = "admin:new-order";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export type NewOrderAlert = {
  type: "new_order";
  orderId: string;
  total: number;
  currency?: string;
  customerName?: string;
  itemCount?: number;
};

export type LowStockAlert = {
  type: "low_stock";
  productId: string;
  name: string;
  stock: number;
};

export type AdminAlert = NewOrderAlert | LowStockAlert;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function parseAdminAlert(payload: unknown): AdminAlert | null {
  const row = asRecord(payload);
  if (!row) return null;

  if (row.type === "new_order") {
    const orderId = asString(row.orderId);
    const total = asNumber(row.total);
    if (!OBJECT_ID.test(orderId) || total == null) return null;
    return {
      type: "new_order",
      orderId,
      total,
      currency: asString(row.currency) || undefined,
      customerName: asString(row.customerName) || undefined,
      itemCount: asNumber(row.itemCount) ?? undefined,
    };
  }

  if (row.type === "low_stock") {
    const productId = asString(row.productId);
    const name = asString(row.name);
    const stock = asNumber(row.stock);
    if (!OBJECT_ID.test(productId) || !name || stock == null) return null;
    return { type: "low_stock", productId, name, stock };
  }

  return null;
}

export function alertToNotification(alert: AdminAlert): AdminNotification {
  if (alert.type === "new_order") {
    const bits = [
      alert.customerName,
      formatMoney(alert.total, alert.currency),
      alert.itemCount
        ? `${alert.itemCount} ta mahsulot`
        : null,
    ].filter(Boolean);
    return {
      id: `new_order:${alert.orderId}`,
      type: "new_order",
      title: "Yangi buyurtma",
      body: bits.join(" · ") || "Buyurtmalar sahifasini oching",
      href: `/admin/orders?order=${alert.orderId}`,
      createdAt: Date.now(),
      read: false,
      orderId: alert.orderId,
    };
  }

  return {
    id: `low_stock:${alert.productId}:${alert.stock}`,
    type: "low_stock",
    title: "Kam qolgan mahsulot",
    body: `${alert.name} · ${alert.stock} dona`,
    href: "/admin/register/products",
    createdAt: Date.now(),
    read: false,
  };
}

export function ingestAdminAlert(
  payload: unknown,
  seen: Set<string>,
): AdminNotification | null {
  const alert = parseAdminAlert(payload);
  if (!alert) return null;

  const key =
    alert.type === "new_order"
      ? `new_order:${alert.orderId}`
      : `low_stock:${alert.productId}`;

  if (seen.has(key)) return null;
  seen.add(key);

  const item = alertToNotification(alert);
  const added = useAdminNotifications.getState().add(item);
  if (!added) return null;

  showBrowserNotification(item);
  if (alert.type === "new_order") {
    playNewOrderSound();
    flashDocumentTitle("Yangi buyurtma");
    window.dispatchEvent(
      new CustomEvent(ADMIN_NEW_ORDER_EVENT, {
        detail: { orderId: alert.orderId },
      }),
    );
  }

  return item;
}

export function goToAdminHref(href: string) {
  if (typeof window === "undefined") return;
  if (
    !href.startsWith("/admin/") ||
    href.includes("//") ||
    href.includes("\\")
  ) {
    return;
  }

  if (window.location.pathname.startsWith("/admin")) {
    const next = href;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current === next) {
      window.dispatchEvent(
        new CustomEvent(ADMIN_NEW_ORDER_EVENT, {
          detail: { orderId: new URL(next, window.location.origin).searchParams.get("order") },
        }),
      );
      return;
    }
    window.location.assign(next);
    return;
  }

  window.location.assign(href);
}
