"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

type SoldRow = {
  _id: string;
  name: string;
  slug: string;
  quantitySold: number;
  revenue: number;
};

export default function AdminSoldPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<SoldRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void adminFetch<SoldRow[]>("/admin/sold-products")
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [adminFetch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sotilgan mahsulotlar</h1>
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
                <TableHead className="pl-5">Mahsulot</TableHead>
                <TableHead>Sotilgan</TableHead>
                <TableHead className="pr-5 text-right">Tushum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={String(row._id)}>
                  <TableCell className="pl-5 font-medium">{row.name}</TableCell>
                  <TableCell>{row.quantitySold}</TableCell>
                  <TableCell className="pr-5 text-right">
                    {formatUZS(row.revenue)}
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Hali sotuv yoʻq
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
