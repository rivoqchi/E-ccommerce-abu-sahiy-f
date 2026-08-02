"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { downloadSoldExcel, downloadSoldWord } from "@/lib/sold-export";

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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sotilgan mahsulotlar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Excel yoki Word fayl sifatida yuklab oling
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!items.length}
            onClick={() => downloadSoldExcel(items)}
          >
            <FileSpreadsheet className="size-4" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!items.length}
            onClick={() => downloadSoldWord(items)}
          >
            <FileText className="size-4" />
            Word
          </Button>
          <Button
            type="button"
            className="rounded-full"
            disabled={!items.length}
            onClick={() => {
              downloadSoldExcel(items);
              downloadSoldWord(items);
            }}
          >
            <Download className="size-4" />
            Ikkalasi
          </Button>
        </div>
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
