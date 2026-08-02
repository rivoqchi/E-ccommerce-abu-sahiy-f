"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

type Order = {
  _id: string;
  total: number;
  status: string;
  createdAt?: string;
  items?: Array<{ name: string; quantity: number }>;
};

const NEXT: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
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
                <TableHead>Mahsulotlar</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Oʻzgartirish</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="pl-5 font-mono text-xs">
                    {o._id.slice(-8)}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">
                    {(o.items ?? [])
                      .map((i) => `${i.name} ×${i.quantity}`)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell>{formatUZS(o.total)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {(NEXT[o.status] ?? []).length ? (
                      <Select
                        onValueChange={(v) => {
                          if (typeof v === "string" && v) updateStatus(o._id, v);
                        }}
                        disabled={pending}
                      >
                        <SelectTrigger className="ml-auto h-9 w-36 rounded-full">
                          <SelectValue placeholder="Keyingi" />
                        </SelectTrigger>
                        <SelectContent>
                          {(NEXT[o.status] ?? []).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        —
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
    </div>
  );
}
