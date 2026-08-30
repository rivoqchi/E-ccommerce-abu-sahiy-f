"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type ImportResult = {
  ok: number;
  failed: number;
  created: number;
  updated: number;
  deleted?: number;
  createdCategories: number;
  totalRows: number;
  errors: string[];
};

type ImportMode = "add" | "replace";

interface ProductExcelImportProps {
  mode?: ImportMode;
  onDone: () => Promise<void>;
}

export function ProductExcelImport({
  mode = "add",
  onDone,
}: ProductExcelImportProps) {
  const { adminFetch } = useAdminApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  const isReplace = mode === "replace";

  function onPickFile(picked: File | null) {
    if (!picked) return;
    setError(null);
    setResult(null);
    setStatusLine("");
    const name = picked.name.toLowerCase();
    if (!name.endsWith(".xlsx")) {
      setError("Faqat .xlsx format qabul qilinadi. Faylni .xlsx qilib saqlang.");
      setFile(null);
      return;
    }
    setFile(picked);
    setOpen(true);
  }

  async function startImport() {
    if (!file || running) return;
    setRunning(true);
    setError(null);
    setResult(null);
    setStatusLine(
      isReplace
        ? "Kod bo‘yicha yangilanmoqda; mavjud rasmlarga tegilmaydi…"
        : "Excel yuklanmoqda; mavjud tovar rasmlari saqlanadi…",
    );

    try {
      const form = new FormData();
      form.append("file", file);
      if (isReplace) form.append("replace", "true");

      const path = isReplace
        ? "/products/import-excel?replace=true"
        : "/products/import-excel";

      const data = await adminFetch<ImportResult>(path, {
        method: "POST",
        body: form,
      });

      setResult(data);
      setStatusLine("Tugadi");
      await onDone();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Excel oʻqilmadi. Faylni .xlsx formatida saqlab qayta urinib koʻring.",
      );
      setStatusLine("");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={isReplace ? "default" : "outline"}
        className="rounded-full"
        onClick={() => inputRef.current?.click()}
      >
        {isReplace ? (
          <RefreshCw className="size-4" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}
        {isReplace ? "Tovarlarni yangilash" : "Excel yuklash"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={(e) => {
          onPickFile(e.target.files?.[0] ?? null);
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
          if (!v) {
            setFile(null);
            setResult(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isReplace ? "Tovarlarni yangilash" : "Excel dan import"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {file?.name || "Fayl"}
              </p>
              {isReplace ? (
                <p className="mt-1 text-muted-foreground">
                  Faqat nom, narx, soni va boshqa maydonlar yangilanadi.
                  Rasm hech qachon o‘zgarmaydi (Cloudflare R2 dagi eski URL
                  qoladi). Mahsulotlar o‘chirilmaydi.
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  Прайс-лист (.xlsx). Bir xil kod bo‘lsa rasm umuman
                  o‘zgarmaydi — faqat yangi tovarlarga rasm qo‘yiladi.
                </p>
              )}
              {file ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Hajm: {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              ) : null}
            </div>

            {running ? (
              <div className="space-y-2" aria-busy="true">
                <Skeleton className="h-4 w-full max-w-xs" />
                <Skeleton className="h-3 w-48" />
              </div>
            ) : null}

            {!running && statusLine && result ? (
              <p className="text-xs text-muted-foreground">{statusLine}</p>
            ) : null}

            {result ? (
              <div className="space-y-2 rounded-2xl border border-border/60 p-3 text-sm">
                {typeof result.deleted === "number" && result.deleted > 0 ? (
                  <p>
                    O‘chirilgan:{" "}
                    <span className="font-semibold text-destructive">
                      {result.deleted}
                    </span>
                  </p>
                ) : null}
                <p>
                  Muvaffaqiyatli:{" "}
                  <span className="font-semibold text-emerald-600">
                    {result.ok}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    (yangi: {result.created}, yangilangan: {result.updated})
                  </span>
                </p>
                <p>
                  Xato:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      result.failed ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {result.failed}
                  </span>
                </p>
                {result.createdCategories > 0 ? (
                  <p className="text-muted-foreground">
                    Yangi kategoriya: {result.createdCategories}
                  </p>
                ) : null}
                {result.errors?.length ? (
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
                variant="default"
                className="rounded-full"
                disabled={running || !file}
                onClick={() => void startImport()}
              >
                {running ? (
                  <Upload className="size-4 opacity-50" />
                ) : (
                  <Upload className="size-4" />
                )}
                {running
                  ? "Import…"
                  : isReplace
                    ? "Yangilash"
                    : "Boshlash"}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
