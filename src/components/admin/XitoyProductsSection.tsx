"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Bot, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { showCenterToast } from "@/components/ui/center-toast";
import { useAdminApi } from "@/lib/admin-api";
import { WS_URL } from "@/lib/env";
import { resolveProductImage } from "@/lib/product-image";
import { fileToProductImageDataUrl } from "@/lib/product-upload";
import { useAuthStore } from "@/store/auth";
import { AdminXitoyTableRowsSkeleton } from "@/components/skeletons/admin";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim() ||
  "samipricebot";

export type XitoyProduct = {
  _id: string;
  imageUrl: string;
  name: string;
  chinaPriceYuan: number;
  cubicM3: number;
  weightKg: number;
  wholesalePrice: number;
  yuanRate: number;
  customsFee: number;
  createdAt?: string;
};

type FormState = {
  imageUrl: string;
  name: string;
  chinaPriceYuan: string;
  cubicM3: string;
  weightKg: string;
  wholesalePrice: string;
  yuanRate: string;
  customsFee: string;
};

const emptyForm = (): FormState => ({
  imageUrl: "",
  name: "",
  chinaPriceYuan: "",
  cubicM3: "",
  weightKg: "",
  wholesalePrice: "",
  yuanRate: "",
  customsFee: "",
});

function formatNum(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("uz-UZ", { maximumFractionDigits: 2 });
}

export function XitoyProductsSection() {
  const { adminFetch } = useAdminApi();
  const token = useAuthStore((s) => s.accessToken);
  const [items, setItems] = useState<XitoyProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const data = await adminFetch<XitoyProduct[]>("/admin/xitoy-products");
    setItems(data);
  }, [adminFetch]);

  useEffect(() => {
    void load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    let socket: {
      on: (event: string, fn: () => void) => void;
      emit: (event: string, payload?: unknown) => void;
      disconnect: () => void;
    } | null = null;

    void (async () => {
      try {
        const { io } = await import("socket.io-client");
        if (cancelled) return;
        socket = io(`${WS_URL}/realtime`, {
          transports: ["websocket", "polling"],
          withCredentials: true,
        }) as typeof socket;

        socket.on("connect", () => {
          socket?.emit("join", { token });
        });

        socket.on("xitoy.product.changed", () => {
          void load().catch(() => undefined);
        });
      } catch {
        // Realtime ixtiyoriy
      }
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [token, load]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(item: XitoyProduct) {
    setEditingId(item._id);
    setForm({
      imageUrl: item.imageUrl,
      name: item.name,
      chinaPriceYuan: String(item.chinaPriceYuan),
      cubicM3: String(item.cubicM3),
      weightKg: String(item.weightKg),
      wholesalePrice: String(item.wholesalePrice),
      yuanRate: String(item.yuanRate),
      customsFee: String(item.customsFee),
    });
    setError(null);
    setOpen(true);
  }

  function handleDialogChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  async function onUploadFile(file: File | null) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const dataUrl = await fileToProductImageDataUrl(file);
        const res = await adminFetch<{ urls: string[] }>("/uploads/images", {
          method: "POST",
          body: JSON.stringify({ dataUrls: [dataUrl], folder: "xitoy" }),
        });
        const url = res.urls[0];
        if (!url) {
          throw new Error("Server rasm URL qaytarmadi");
        }
        const displayUrl = resolveProductImage(url);
        setForm((f) => ({
          ...f,
          imageUrl: displayUrl.startsWith("/uploads/") ? displayUrl : url,
        }));
        showCenterToast("Rasm yuklandi");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Rasm yuklanmadi";
        setError(msg);
        showCenterToast(msg);
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function parseFormPayload() {
    const chinaPriceYuan = Number(form.chinaPriceYuan.replace(",", "."));
    const cubicM3 = Number(form.cubicM3.replace(",", "."));
    const weightKg = Number(form.weightKg.replace(",", "."));
    const wholesalePrice = Number(form.wholesalePrice.replace(",", "."));
    const yuanRate = Number(form.yuanRate.replace(",", "."));
    const customsFee = Number(form.customsFee.replace(",", "."));

    if (!form.name.trim()) {
      return { error: "Tovar nomi majburiy" as const };
    }
    if (!form.imageUrl.trim()) {
      return { error: "Rasm yuklash majburiy" as const };
    }

    const fields = [
      chinaPriceYuan,
      cubicM3,
      weightKg,
      wholesalePrice,
      yuanRate,
      customsFee,
    ];
    if (fields.some((v) => !Number.isFinite(v) || v < 0)) {
      return { error: "Barcha raqamli maydonlar to'g'ri bo'lishi kerak" as const };
    }

    return {
      payload: {
        imageUrl: form.imageUrl.trim(),
        name: form.name.trim(),
        chinaPriceYuan,
        cubicM3,
        weightKg,
        wholesalePrice,
        yuanRate,
        customsFee,
      },
    };
  }

  function save() {
    const parsed = parseFormPayload();
    if ("error" in parsed) {
      setError(parsed.error);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        if (editingId) {
          await adminFetch(`/admin/xitoy-products/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(parsed.payload),
          });
          showCenterToast("Yangilandi");
        } else {
          await adminFetch("/admin/xitoy-products", {
            method: "POST",
            body: JSON.stringify(parsed.payload),
          });
          showCenterToast("Qo'shildi");
        }
        setOpen(false);
        resetForm();
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Saqlanmadi");
      }
    });
  }

  async function remove(id: string) {
    const prev = items;
    setItems((list) => list.filter((item) => item._id !== id));
    setError(null);
    try {
      await adminFetch(`/admin/xitoy-products/${id}`, { method: "DELETE" });
      showCenterToast("O'chirildi");
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "O'chirilmadi");
      throw e;
    }
  }

  const botUrl = `https://t.me/${BOT_USERNAME}?start=xitoy_add`;

  return (
    <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
      <CardContent className="px-5 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              render={
                <a
                  href={botUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Bot className="size-4" />
              Bot orqali
            </Button>
          <Button className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Qo&apos;shish
          </Button>
        </div>

        {error && !open ? (
          <p className="mb-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto">
          <Table className="min-w-[960px]">
            <TableHeader>
              <TableRow>
                <TableHead>Rasm</TableHead>
                <TableHead>Tovar nomi</TableHead>
                <TableHead className="text-right">Xitoy (¥)</TableHead>
                <TableHead className="text-right">Kubi</TableHead>
                <TableHead className="text-right">kg</TableHead>
                <TableHead className="text-right">Tan narxi</TableHead>
                <TableHead className="text-right">Yuan kursi</TableHead>
                <TableHead className="text-right">Rastamoshka</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <AdminXitoyTableRowsSkeleton rows={5} />
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="relative size-12 overflow-hidden rounded-xl bg-secondary">
                        <Image
                          src={resolveProductImage(item.imageUrl)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[180px] font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.chinaPriceYuan)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.cubicM3)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.weightKg)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.wholesalePrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.yuanRate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNum(item.customsFee)}
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="size-3.5" />
                        Tahrir
                      </Button>
                      <ConfirmAction
                        className="text-destructive"
                        title="O'chirasizmi?"
                        description={`"${item.name}" ro'yxatdan o'chiriladi.`}
                        onConfirm={() => remove(item._id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmAction>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Hali mahsulot yo&apos;q
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error ? (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <p className="text-sm font-medium">Tovar rasmi</p>
              {form.imageUrl ? (
                <div className="relative mx-auto size-28 overflow-hidden rounded-2xl bg-secondary">
                  <Image
                    src={resolveProductImage(form.imageUrl)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized
                  />
                </div>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onUploadFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={pending}
                onClick={() => fileRef.current?.click()}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {form.imageUrl ? "Rasmni almashtirish" : "Rasm yuklash"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="xitoy-name">
                Tovar nomi
              </label>
              <Input
                id="xitoy-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Mahsulot nomi"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["chinaPriceYuan", "Xitoy (yuan)"],
                  ["cubicM3", "Kubi (m³)"],
                  ["weightKg", "kg"],
                  ["wholesalePrice", "Tan narxi"],
                  ["yuanRate", "Yuan kursi"],
                  ["customsFee", "Rastamoshka to'lovi"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium" htmlFor={`xitoy-${key}`}>
                    {label}
                  </label>
                  <Input
                    id={`xitoy-${key}`}
                    inputMode="decimal"
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => handleDialogChange(false)}
            >
              Bekor
            </Button>
            <Button
              className="rounded-full"
              disabled={pending}
              onClick={save}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
