"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminApi } from "@/lib/admin-api";
import {
  parseProductsExcel,
  type ExcelProductRow,
} from "@/lib/excel-products";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";
import { cn } from "@/lib/utils";

type RefItem = { _id: string; name: string };

type ImportResult = {
  ok: number;
  failed: number;
  createdCategories: number;
  errors: string[];
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normName(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

interface ProductExcelImportProps {
  categories: RefItem[];
  productsByCode: Map<string, string>;
  onCategoriesChange: (cats: RefItem[]) => void;
  onDone: () => Promise<void>;
}

export function ProductExcelImport({
  categories,
  productsByCode,
  onCategoriesChange,
  onDone,
}: ProductExcelImportProps) {
  const { adminFetch } = useAdminApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ExcelProductRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(0);
  const [statusLine, setStatusLine] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onPickFile(file: File | null) {
    if (!file) return;
    setError(null);
    setResult(null);
    setCurrent(0);
    setStatusLine("");
    try {
      const parsed = await parseProductsExcel(file);
      if (!parsed.length) {
        setError("Excelda mahsulot qatorlari topilmadi");
        setRows([]);
        setFileName("");
        return;
      }
      setRows(parsed);
      setFileName(file.name);
      setOpen(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Excel oʻqilmadi. Faylni .xlsx formatida saqlab qayta urinib koʻring.",
      );
      setRows([]);
    }
  }

  async function ensureCategory(
    name: string,
    cache: Map<string, string>,
    list: RefItem[],
  ): Promise<{ id: string; created: boolean; list: RefItem[] }> {
    const key = normName(name);
    const existingId = cache.get(key);
    if (existingId) return { id: existingId, created: false, list };

    const created = await adminFetch<RefItem & { _id: string }>("/categories", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), isActive: true }),
    });
    const id = String(created._id);
    cache.set(key, id);
    const next = [...list, { _id: id, name: created.name || name.trim() }];
    return { id, created: true, list: next };
  }

  async function startImport() {
    if (!rows.length || running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setCurrent(0);

    const catCache = new Map<string, string>();
    for (const c of categories) {
      catCache.set(normName(c.name), c._id);
    }
    let catList = [...categories];
    let createdCategories = 0;
    let ok = 0;
    let failed = 0;
    const errors: string[] = [];
    const codeToId = new Map(productsByCode);

    // Fallback kategoriya — Группа boʻsh boʻlsa
    const fallbackName = "Boshqa";
    if (![...catCache.keys()].includes(normName(fallbackName))) {
      try {
        const ensured = await ensureCategory(fallbackName, catCache, catList);
        catList = ensured.list;
        if (ensured.created) createdCategories += 1;
      } catch {
        /* ignore — later rows may still have groups */
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      setCurrent(i + 1);
      setStatusLine(`${row.code} — ${row.name}`);

      try {
        let categoryId = catCache.get(normName(fallbackName)) || "";
        if (row.categoryName.trim()) {
          const ensured = await ensureCategory(
            row.categoryName,
            catCache,
            catList,
          );
          catList = ensured.list;
          categoryId = ensured.id;
          if (ensured.created) createdCategories += 1;
        }
        if (!categoryId) {
          throw new Error("Kategoriya topilmadi");
        }

        const payload = {
          name: row.name,
          code: row.code,
          price: row.price,
          wholesalePrice: row.wholesalePrice,
          stock: row.stock,
          categoryId,
          description: row.name,
          status: "active",
          images: [PRODUCT_IMAGE_PLACEHOLDER],
          specs: row.specs,
        };

        const existingId = codeToId.get(row.code.toUpperCase());
        if (existingId) {
          await adminFetch(`/products/${existingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          const created = await adminFetch<{ _id: string }>("/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          codeToId.set(row.code.toUpperCase(), String(created._id));
        }
        ok += 1;
      } catch (e) {
        failed += 1;
        const msg = e instanceof Error ? e.message : "Xato";
        errors.push(`Qator ${row.rowNumber} (${row.code}): ${msg}`);
      }

      // Sekin progress — UI yangilanishi uchun
      await sleep(180);
    }

    onCategoriesChange(catList);
    setResult({ ok, failed, createdCategories, errors: errors.slice(0, 40) });
    setStatusLine("Tugadi");
    setRunning(false);
    await onDone();
  }

  const progress = rows.length ? Math.round((current / rows.length) * 100) : 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => inputRef.current?.click()}
      >
        <FileSpreadsheet className="size-4" />
        Excel yuklash
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
        onChange={(e) => {
          void onPickFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {error && !open ? (
        <p className="w-full rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (running) return;
          setOpen(v);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Excel dan import</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">{fileName || "Fayl"}</p>
              <p className="mt-1 text-muted-foreground">
                {rows.length} ta mahsulot topildi.{" "}
                <span className="text-foreground/80">
                  Kod, nom, kategoriya (Группа) va xususiyatlar saqlanadi.
                </span>
              </p>
            </div>

            {running || result ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {current} / {rows.length}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full bg-foreground transition-[width] duration-200 ease-out",
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {statusLine ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {running ? "Yozilmoqda: " : ""}
                    {statusLine}
                  </p>
                ) : null}
              </div>
            ) : null}

            {result ? (
              <div className="space-y-2 rounded-2xl border border-border/60 p-3 text-sm">
                <p>
                  Muvaffaqiyatli:{" "}
                  <span className="font-semibold text-emerald-600">
                    {result.ok}
                  </span>
                </p>
                <p>
                  Xato:{" "}
                  <span className="font-semibold text-destructive">
                    {result.failed}
                  </span>
                </p>
                {result.createdCategories > 0 ? (
                  <p className="text-muted-foreground">
                    Yangi kategoriya: {result.createdCategories}
                  </p>
                ) : null}
                {result.errors.length ? (
                  <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-destructive">
                    {result.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={running}
              onClick={() => setOpen(false)}
            >
              {result ? "Yopish" : "Bekor"}
            </Button>
            {!result ? (
              <Button
                className="rounded-full"
                disabled={running || !rows.length}
                onClick={() => void startImport()}
              >
                {running ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {running ? "Import…" : "Boshlash"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
