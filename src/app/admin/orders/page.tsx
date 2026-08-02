"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
                <TableRow key={o._id}>
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
                    <div className="flex items-center justify-end gap-2">
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

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-lg" bodyClassName="pb-0">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  Buyurtma #{selected._id.slice(-8)}
                </DialogTitle>
              </DialogHeader>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {STATUS_LABEL[selected.status] ?? selected.status}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatDate(selected.createdAt)}
                  </span>
                </div>

                <section className="space-y-1.5">
                  <h3 className="font-semibold">Mijoz</h3>
                  <p>{selected.shippingAddress?.fullName ?? "—"}</p>
                  <p className="text-muted-foreground">
                    {selected.shippingAddress?.phone ?? "—"}
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h3 className="font-semibold">Yetkazish manzili</h3>
                  {selected.shippingAddress ? (
                    <p className="text-muted-foreground">
                      {[
                        selected.shippingAddress.line1,
                        selected.shippingAddress.line2,
                        selected.shippingAddress.city,
                        selected.shippingAddress.country,
                        selected.shippingAddress.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
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

                {selected.notes ? (
                  <section className="space-y-1.5">
                    <h3 className="font-semibold">Izoh</h3>
                    <p className="text-muted-foreground">{selected.notes}</p>
                  </section>
                ) : null}
              </div>

              <DialogFooter className="flex-col gap-3 sm:flex-col">
                <div className="w-full space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Oraliq summa</span>
                    <span>
                      {formatUZS(selected.subtotal ?? selected.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Yetkazish</span>
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
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
