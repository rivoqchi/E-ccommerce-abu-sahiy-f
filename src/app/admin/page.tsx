"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  ShoppingBag,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdminApi } from "@/lib/admin-api";
import { formatMoney, formatUZS } from "@/lib/format";
import { AdminDashboardSkeleton } from "@/components/skeletons/admin";

type Stats = {
  usersCount: number;
  ordersCount: number;
  productsCount: number;
  sellersCount: number;
  lowStock: number;
  todayOrders: number;
  revenue: number;
  recentOrders: Array<{
    _id: string;
    total: number;
    status: string;
    currency?: string;
    createdAt?: string;
  }>;
};

export default function AdminDashboardPage() {
  const { adminFetch } = useAdminApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void adminFetch<Stats>("/admin/stats")
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const cards = [
    { label: "Foydalanuvchilar", value: stats?.usersCount, icon: Users },
    { label: "Buyurtmalar", value: stats?.ordersCount, icon: ShoppingBag },
    { label: "Mahsulotlar", value: stats?.productsCount, icon: Boxes },
    { label: "Sotuvchilar", value: stats?.sellersCount, icon: Store },
  ];

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
       
      </div>

      {error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0"
          >
            <CardContent className="flex items-center gap-4 px-5 py-5">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary">
                <card.icon className="size-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold tracking-tight">
                  {card.value ?? "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0 md:col-span-1">
          <CardContent className="px-5 py-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="size-4" />
              <span className="text-xs">Tushum (paid+)</span>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {stats ? formatUZS(stats.revenue) : "—"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Bugun: {stats?.todayOrders ?? "—"} ta buyurtma · Past stock:{" "}
              {stats?.lowStock ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0 md:col-span-2">
          <CardContent className="px-5 py-5">
            <p className="mb-3 text-sm font-semibold">Soʻnggi buyurtmalar</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Summa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(stats?.recentOrders ?? []).map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-mono text-xs">
                        {o._id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(o.total, o.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!stats?.recentOrders?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Hali buyurtma yoʻq
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
