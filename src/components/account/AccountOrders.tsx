"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApiClientError, apiFetch } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { useStorefrontPricesVisible } from "@/components/product/ProductDisplayProvider";
import { NegotiatePriceNote } from "@/components/product/NegotiatePriceNote";
import {
  givenQty,
  isUnavailable,
  originalLineTotal,
  type OrderSubstitute,
} from "@/lib/order-fulfillment";

type OrderItem = {
  name: string;
  slug?: string;
  quantity: number;
  unitPrice: number;
  source?: "store" | "hamkor";
  partnerName?: string;
  givenQuantity?: number;
  fulfillmentStatus?: string;
  substitutes?: OrderSubstitute[];
};

type AccountOrder = {
  _id: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  currency?: string;
  status: string;
  createdAt?: string;
  notes?: string;
  items?: OrderItem[];
  originalTotal?: number;
  shippingAddress?: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    country: string;
  };
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Kutilmoqda",
  paid: "Toʻlangan",
  shipped: "Joʻnatilgan",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  paid: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  shipped: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-destructive/10 text-destructive",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AccountOrders() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const showPrice = useStorefrontPricesVisible();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AccountOrder[]>("/orders/mine", {
        token: accessToken,
      });
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : "Buyurtmalarni yuklab boʻlmadi",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Buyurtmalar yuklanmoqda…
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error}
      </p>
    );
  }

  if (!orders.length) {
    return (
      <Card className="mt-6 rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
            <Package className="size-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">
            Buyurtmalar yoʻq
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Buyurtma bersangiz, ular shu yerda koʻrinadi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        Jami {orders.length} ta buyurtma
      </p>
      {orders.map((order) => {
        const expanded = openId === order._id;
        const status = order.status?.toLowerCase() ?? "pending";
        const itemCount =
          order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

        return (
          <Card
            key={order._id}
            className="overflow-hidden rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0"
          >
            <button
              type="button"
              onClick={() => setOpenId(expanded ? null : order._id)}
              className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-secondary/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 border-0 px-2 text-[11px] font-medium",
                      STATUS_CLASS[status] ?? STATUS_CLASS.pending,
                    )}
                  >
                    {STATUS_LABEL[status] ?? order.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                  {itemCount > 0 ? ` · ${itemCount} ta mahsulot` : null}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold tracking-tight text-foreground">
                {showPrice ? (
                  formatMoney(order.total, order.currency)
                ) : (
                  <NegotiatePriceNote as="span" className="font-medium" />
                )}
              </p>
            </button>

            {expanded ? (
              <CardContent className="space-y-3 border-t border-border/50 px-5 py-4">
                {order.items?.length ? (
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => {
                      const given = givenQty(item);
                      const unavailable = isUnavailable(item) || given === 0;
                      const origCharged = unavailable
                        ? 0
                        : given * item.unitPrice;
                      return (
                        <li
                          key={`${item.slug ?? item.name}-${idx}`}
                          className="space-y-1.5 text-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {item.name}
                                {item.source === "hamkor" ? (
                                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    {item.partnerName || "Hamkor"}
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Buyurtma: {item.quantity}
                                {showPrice ? (
                                  <>
                                    {" "}
                                    × {formatMoney(item.unitPrice, order.currency)}
                                  </>
                                ) : null}
                              </p>
                              {unavailable ? (
                                <p className="text-xs font-medium text-destructive">
                                  Qolmagan
                                  {showPrice ? " — narx hisoblanmadi" : ""}
                                </p>
                              ) : given !== item.quantity ? (
                                <p className="text-xs text-muted-foreground">
                                  Berildi: {given} / {item.quantity}
                                </p>
                              ) : null}
                            </div>
                            <p
                              className={cn(
                                "shrink-0 font-medium",
                                unavailable
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground",
                              )}
                            >
                              {showPrice
                                ? unavailable
                                  ? formatMoney(
                                      originalLineTotal(item),
                                      order.currency,
                                    )
                                  : formatMoney(origCharged, order.currency)
                                : null}
                            </p>
                          </div>
                          {item.substitutes?.length ? (
                            <ul className="ml-1 space-y-1 border-l border-border/60 pl-3">
                              <li className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Almashtirilgan tovarlar
                              </li>
                              {item.substitutes.map((sub, sIdx) => (
                                <li
                                  key={`${sub.slug ?? sub.name}-${sIdx}`}
                                  className="flex items-start justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <p className="font-medium text-foreground">
                                      {sub.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {sub.quantity}
                                      {showPrice ? (
                                        <>
                                          {" "}
                                          ×{" "}
                                          {formatMoney(
                                            sub.unitPrice,
                                            order.currency,
                                          )}
                                        </>
                                      ) : null}
                                    </p>
                                  </div>
                                  {showPrice ? (
                                    <p className="shrink-0 font-medium text-foreground">
                                      {formatMoney(
                                        sub.quantity * sub.unitPrice,
                                        order.currency,
                                      )}
                                    </p>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {order.shippingAddress ? (
                  <div className="rounded-2xl bg-secondary/60 px-3.5 py-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.phone}</p>
                    <p>
                      {[
                        order.shippingAddress.line1,
                        order.shippingAddress.city,
                        order.shippingAddress.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                ) : null}

                {order.notes ? (
                  <p className="text-xs text-muted-foreground">
                    Izoh: {order.notes}
                  </p>
                ) : null}

                <div className="space-y-1 border-t border-border/40 pt-3 text-sm">
                  {showPrice &&
                  order.originalTotal != null &&
                  order.originalTotal !== order.total ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Buyurtma jami</span>
                      <span className="line-through">
                        {formatMoney(order.originalTotal, order.currency)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Yakuniy hisob</span>
                    {showPrice ? (
                      <span className="font-bold text-foreground">
                        {formatMoney(order.total, order.currency)}
                      </span>
                    ) : (
                      <NegotiatePriceNote as="span" className="font-medium" />
                    )}
                  </div>
                </div>
              </CardContent>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
