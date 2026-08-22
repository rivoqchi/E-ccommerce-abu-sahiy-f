"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/lib/admin-api";
import { formatMoney } from "@/lib/format";
import {
  billedLineTotal,
  givenQty,
  isUnavailable,
  type FulfillableItem,
  type OrderSubstitute,
} from "@/lib/order-fulfillment";
import { cn } from "@/lib/utils";

type DraftSub = OrderSubstitute & {
  productId: string;
  source: "store" | "hamkor";
};

type DraftLine = {
  givenQuantity: number;
  unavailable: boolean;
  substitutes: DraftSub[];
  pickerOpen: boolean;
  pickerQ: string;
};

type PickerProduct = {
  _id: string;
  name: string;
  slug: string;
  stock?: number;
  code?: string;
  source: "store" | "hamkor";
};

type ProductsPage = { items?: Array<Omit<PickerProduct, "source">> };

function productIdOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if ("_id" in value) return String((value as { _id: unknown })._id);
    if ("$oid" in value) return String((value as { $oid: unknown }).$oid);
  }
  return String(value ?? "");
}

function toDraft(items: FulfillableItem[]): DraftLine[] {
  return items.map((item) => ({
    givenQuantity: givenQty(item),
    unavailable: isUnavailable(item) || givenQty(item) === 0,
    substitutes: (item.substitutes ?? []).map((s) => ({
      ...s,
      productId: productIdOf(s.productId),
      source: s.source === "hamkor" ? "hamkor" : "store",
    })),
    pickerOpen: false,
    pickerQ: "",
  }));
}

export function OrderFulfillmentEditor({
  orderId,
  items,
  currency,
  shippingFee,
  readOnly,
  disabled,
  onSaved,
  onError,
}: {
  orderId: string;
  items: FulfillableItem[];
  currency?: string;
  shippingFee: number;
  readOnly?: boolean;
  disabled?: boolean;
  onSaved: (order: unknown) => void;
  onError: (message: string) => void;
}) {
  const { adminFetch } = useAdminApi();
  const [draft, setDraft] = useState<DraftLine[]>(() => toDraft(items));
  const [saving, setSaving] = useState(false);
  const [pickerHits, setPickerHits] = useState<PickerProduct[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [activePicker, setActivePicker] = useState<number | null>(null);

  useEffect(() => {
    setDraft(toDraft(items));
  }, [items, orderId]);

  const pickerQuery =
    activePicker != null ? draft[activePicker]?.pickerQ.trim() ?? "" : "";

  useEffect(() => {
    if (activePicker == null) {
      setPickerHits([]);
      return;
    }
    const q = pickerQuery;
    if (q.length < 2) {
      setPickerHits([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      setPickerLoading(true);
      void Promise.all([
        adminFetch<ProductsPage>(
          `/products/admin/all?q=${encodeURIComponent(q)}&limit=8`,
        ),
        adminFetch<ProductsPage>(
          `/hamkor/products/admin/all?q=${encodeURIComponent(q)}&limit=8`,
        ),
      ])
        .then(([store, hamkor]) => {
          if (cancelled) return;
          const rows: PickerProduct[] = [
            ...(store.items ?? []).map((p) => ({ ...p, source: "store" as const })),
            ...(hamkor.items ?? []).map((p) => ({
              ...p,
              source: "hamkor" as const,
            })),
          ];
          setPickerHits(rows.slice(0, 12));
        })
        .catch((e: Error) => {
          if (!cancelled) onError(e.message);
        })
        .finally(() => {
          if (!cancelled) setPickerLoading(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [activePicker, pickerQuery, adminFetch, onError]);

  const billedSubtotal = useMemo(() => {
    return items.reduce((sum, item, i) => {
      const line = draft[i];
      if (!line) return sum + billedLineTotal(item);
      const given = line.unavailable ? 0 : line.givenQuantity;
      const orig = given * item.unitPrice;
      const subs = line.substitutes.reduce(
        (s, sub) => s + sub.quantity * (sub.unitPrice || 0),
        0,
      );
      return sum + orig + subs;
    }, 0);
  }, [draft, items]);

  function patchLine(index: number, next: Partial<DraftLine>) {
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...next } : row)),
    );
  }

  async function save() {
    setSaving(true);
    try {
      const updated = await adminFetch(`/orders/${orderId}/fulfillment`, {
        method: "PATCH",
        body: JSON.stringify({
          items: draft.map((row) => ({
            givenQuantity: row.unavailable ? 0 : row.givenQuantity,
            unavailable: row.unavailable,
            substitutes: row.substitutes.map((s) => ({
              productId: s.productId,
              quantity: s.quantity,
              source: s.source,
            })),
          })),
        }),
      });
      onSaved(updated);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Hisob saqlanmadi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-2">
      <h3 className="font-semibold">Mahsulotlar va hisob</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => {
          const line = draft[idx];
          if (!line) return null;
          const given = line.unavailable ? 0 : line.givenQuantity;
          const lineCharge =
            given * item.unitPrice +
            line.substitutes.reduce(
              (s, sub) => s + sub.quantity * (sub.unitPrice || 0),
              0,
            );

          return (
            <li
              key={`${item.slug ?? item.name}-${idx}`}
              className="rounded-2xl bg-muted/50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.name}
                    {item.source === "hamkor" ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {item.partnerName || "Hamkor"}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Buyurtma: {item.quantity} ×{" "}
                    {formatMoney(item.unitPrice, currency)}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-medium",
                    line.unavailable && "text-muted-foreground line-through",
                  )}
                >
                  {line.unavailable
                    ? "Hisoblanmadi"
                    : formatMoney(lineCharge, currency)}
                </p>
              </div>

              {line.unavailable ? (
                <Badge variant="destructive" className="mt-2">
                  Qolmagan
                </Badge>
              ) : given < item.quantity ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Berildi: {given} / {item.quantity}
                </p>
              ) : null}

              {!readOnly ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Berilgan son
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      disabled={line.unavailable || disabled}
                      value={line.unavailable ? 0 : line.givenQuantity}
                      onChange={(e) => {
                        const n = Number.parseInt(e.target.value, 10);
                        const next = Number.isFinite(n)
                          ? Math.min(item.quantity, Math.max(0, n))
                          : 0;
                        patchLine(idx, {
                          givenQuantity: next,
                          unavailable: next === 0,
                        });
                      }}
                      className="h-8 w-16 rounded-xl bg-background px-2 text-center text-sm text-foreground outline-none ring-1 ring-border"
                    />
                  </label>
                  <Button
                    type="button"
                    variant={line.unavailable ? "secondary" : "outline"}
                    size="sm"
                    className="rounded-full"
                    disabled={disabled}
                    onClick={() =>
                      patchLine(idx, {
                        unavailable: !line.unavailable,
                        givenQuantity: line.unavailable ? item.quantity : 0,
                      })
                    }
                  >
                    Qolmagan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={disabled}
                    onClick={() => {
                      const open = !line.pickerOpen;
                      patchLine(idx, { pickerOpen: open });
                      setActivePicker(open ? idx : null);
                    }}
                  >
                    Almashtirish
                  </Button>
                </div>
              ) : null}

              {line.substitutes.length ? (
                <div className="mt-3 space-y-1.5 border-t border-border/50 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Almashtirilgan tovarlar
                  </p>
                  {line.substitutes.map((sub, sIdx) => (
                    <div
                      key={`${sub.productId}-${sIdx}`}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{sub.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.quantity} ×{" "}
                          {sub.unitPrice
                            ? formatMoney(sub.unitPrice, currency)
                            : "narx saqlangach"}
                        </p>
                      </div>
                      {!readOnly ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            disabled={disabled}
                            value={sub.quantity}
                            onChange={(e) => {
                              const n = Number.parseInt(e.target.value, 10);
                              const qty = Number.isFinite(n)
                                ? Math.max(1, n)
                                : 1;
                              patchLine(idx, {
                                substitutes: line.substitutes.map((s, j) =>
                                  j === sIdx ? { ...s, quantity: qty } : s,
                                ),
                              });
                            }}
                            className="h-8 w-14 rounded-xl bg-background px-2 text-center text-sm outline-none ring-1 ring-border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            disabled={disabled}
                            onClick={() =>
                              patchLine(idx, {
                                substitutes: line.substitutes.filter(
                                  (_, j) => j !== sIdx,
                                ),
                              })
                            }
                            aria-label="Olib tashlash"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <p className="shrink-0 font-medium">
                          {formatMoney(
                            sub.quantity * sub.unitPrice,
                            currency,
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {line.pickerOpen && !readOnly ? (
                <div className="mt-3 rounded-xl bg-background p-2 ring-1 ring-border">
                  <div className="flex items-center gap-2 px-1">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input
                      value={line.pickerQ}
                      onChange={(e) => {
                        patchLine(idx, { pickerQ: e.target.value });
                        setActivePicker(idx);
                      }}
                      placeholder="Mahsulot nomi yoki kod"
                      className="h-8 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  {pickerLoading && activePicker === idx ? (
                    <p className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Qidirilmoqda…
                    </p>
                  ) : null}
                  {activePicker === idx && pickerHits.length ? (
                    <ul className="mt-1 max-h-40 overflow-y-auto">
                      {pickerHits.map((p) => (
                        <li key={`${p.source}-${p._id}`}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              const remaining = line.unavailable
                                ? item.quantity
                                : Math.max(item.quantity - line.givenQuantity, 1);
                              patchLine(idx, {
                                substitutes: [
                                  ...line.substitutes,
                                  {
                                    productId: p._id,
                                    name: p.name,
                                    slug: p.slug,
                                    quantity: remaining,
                                    unitPrice: 0,
                                    source: p.source,
                                  },
                                ],
                                pickerOpen: false,
                                pickerQ: "",
                              });
                              setActivePicker(null);
                            }}
                          >
                            <span className="min-w-0 truncate">{p.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {p.source === "hamkor" ? "Hamkor" : "Doʻkon"}
                              {typeof p.stock === "number"
                                ? ` · ${p.stock}`
                                : ""}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="space-y-1 rounded-2xl bg-muted/40 px-3 py-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Mahsulotlar hisobi</span>
          <span>{formatMoney(billedSubtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Yetkazib berish</span>
          <span>{formatMoney(shippingFee, currency)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Yakuniy hisob</span>
          <span>{formatMoney(billedSubtotal + shippingFee, currency)}</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Qolmagan tovarlar narxi hisoblanmaydi. Almashtirish narxi saqlagandan
          keyin aniq boʻladi.
        </p>
      </div>

      {!readOnly ? (
        <Button
          type="button"
          className="w-full rounded-full"
          disabled={disabled || saving}
          onClick={() => void save()}
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saqlanmoqda…
            </>
          ) : (
            "Hisobni saqlash"
          )}
        </Button>
      ) : null}
    </section>
  );
}
