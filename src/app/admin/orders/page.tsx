"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminApi } from "@/lib/admin-api";
import { formatUZS } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderItem = {
  name: string;
  slug?: string;
  quantity: number;
  unitPrice: number;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postalCode?: string;
};

type Order = {
  _id: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  status: string;
  createdAt?: string;
  notes?: string;
  paymentRef?: string;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress;
};

const NEXT: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Kutilmoqda",
  paid: "Toʻlangan",
  shipped: "Joʻnatilgan",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function splitName(fullName?: string) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "—", lastName: "—" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "—" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function AdminOrdersPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setItems(await adminFetch<Order[]>("/orders"));
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function updateStatus(id: string, status: string) {
    startTransition(async () => {
      try {
        await adminFetch(`/orders/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        await load();
        setSelected((prev) =>
          prev && prev._id === id ? { ...prev, status } : prev,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xato");
      }
    });
  }

  const nameParts = splitName(selected?.shippingAddress?.fullName);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buyurtmalar</h1>
      </div>

      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="px-0 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">ID</TableHead>
                <TableHead>Mijoz</TableHead>
                <TableHead>Mahsulotlar</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((o) => (
                <TableRow
                  key={o._id}
                  className="cursor-pointer"
                  onClick={() => setSelected(o)}
                >
                  <TableCell className="pl-5 font-mono text-xs">
                    {o._id.slice(-8)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">
                      {o.shippingAddress?.fullName ?? "—"}
                    </div>
                    <div className="text-muted-foreground">
                      {o.shippingAddress?.phone ?? ""}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {(o.items ?? [])
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell>{formatUZS(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelected(o)}
                      >
                        Batafsil
                      </Button>
                      {(NEXT[o.status] ?? []).length ? (
                        <Select
                          onValueChange={(v) => {
                            if (typeof v === "string" && v)
                              updateStatus(o._id, v);
                          }}
                          disabled={pending}
                        >
                          <SelectTrigger className="h-9 w-32 rounded-full">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {(NEXT[o.status] ?? []).map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_LABEL[s] ?? s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Buyurtmalar yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent
          side="bottom"
          className={cn(
            "gap-0 rounded-t-[1.75rem] border-0 p-0",
            "h-[min(92dvh,820px)] max-h-[92dvh] w-full",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            "data-[side=bottom]:data-starting-style:translate-y-full",
            "data-[side=bottom]:data-ending-style:translate-y-full",
          )}
        >
          <div className="flex shrink-0 justify-center pt-3 pb-1">
            <span
              aria-hidden
              className="h-1.5 w-10 rounded-full bg-muted-foreground/30"
            />
          </div>

          {selected ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <SheetHeader className="shrink-0 gap-1 px-5 py-3 pr-14">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-left text-xl font-semibold">
                    Buyurtma #{selected._id.slice(-8)}
                  </SheetTitle>
                  <Badge variant="secondary">
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </Badge>
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatDate(selected.createdAt)}
                </p>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-4 text-sm">
                <section className="space-y-2 rounded-2xl bg-muted/50 p-4">
                  <h3 className="font-semibold">Mijoz maʼlumotlari</h3>
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">Ism</dt>
                      <dd className="font-medium">{nameParts.firstName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Familiya</dt>
                      <dd className="font-medium">{nameParts.lastName}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        Telefon raqam
                      </dt>
                      <dd className="font-medium">
                        {selected.shippingAddress?.phone ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Manzil</h3>
                  <p className="text-muted-foreground">
                    {[
                      selected.shippingAddress?.line1,
                      selected.shippingAddress?.line2,
                      selected.shippingAddress?.city,
                      selected.shippingAddress?.country,
                      selected.shippingAddress?.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="font-semibold">Mahsulotlar</h3>
                  <ul className="divide-y rounded-2xl bg-muted/50">
                    {(selected.items ?? []).map((item, idx) => (
                      <li
                        key={`${item.slug ?? item.name}-${idx}`}
                        className="flex items-start justify-between gap-3 px-3 py-2.5"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            {formatUZS(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-medium">
                          {formatUZS(item.unitPrice * item.quantity)}
                        </p>
                      </li>
                    ))}
                    {!selected.items?.length ? (
                      <li className="px-3 py-2.5 text-muted-foreground">
                        Mahsulotlar yoʻq
                      </li>
                    ) : null}
                  </ul>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold">Izoh</h3>
                  <p className="rounded-2xl bg-muted/50 px-3 py-2.5 text-muted-foreground">
                    {selected.notes?.trim() || "Izoh yoʻq"}
                  </p>
                </section>
              </div>

              <SheetFooter className="mt-0 shrink-0 gap-3 border-t border-border/60 px-5 py-4">
                <div className="w-full space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Oraliq summa</span>
                    <span>
                      {formatUZS(selected.subtotal ?? selected.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Yetkazib berish</span>
                    <span>{formatUZS(selected.shippingFee ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span>Jami</span>
                    <span>{formatUZS(selected.total)}</span>
                  </div>
                </div>

                {(NEXT[selected.status] ?? []).length ? (
                  <div className="flex w-full flex-wrap gap-2">
                    {(NEXT[selected.status] ?? []).map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() => updateStatus(selected._id, s)}
                      >
                        {STATUS_LABEL[s] ?? s}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </SheetFooter>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
