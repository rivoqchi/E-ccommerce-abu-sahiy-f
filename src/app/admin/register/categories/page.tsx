"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { ProductImage } from "@/components/catalog/ProductImage";
import { useAdminApi } from "@/lib/admin-api";
import { fileToCategoryImageDataUrl } from "@/lib/product-upload";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
};

const emptyForm = { name: "", image: "" };

export default function AdminCategoriesPage() {
  const { adminFetch } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const data = await adminFetch<Category[]>("/categories?all=true");
    setItems(data);
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditingId(c._id);
    setForm({ name: c.name, image: c.image ?? "" });
    setError(null);
    setOpen(true);
  }

  async function onPickImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await fileToCategoryImageDataUrl(file);
      const res = await adminFetch<{ urls: string[] }>("/uploads/images", {
        method: "POST",
        body: JSON.stringify({ dataUrls: [dataUrl] }),
      });
      const url = res.urls[0];
      if (url) setForm((f) => ({ ...f, image: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rasm yuklanmadi");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (!form.name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          name: form.name.trim(),
          image: form.image.trim() || undefined,
        };
        if (editingId) {
          await adminFetch(`/categories/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/categories", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        setForm(emptyForm);
        setEditingId(null);
        setOpen(false);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xato");
      }
    });
  }

  async function remove(id: string) {
    try {
      await adminFetch(`/categories/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategoriyalar</h1>
        </div>
        <Button className="rounded-full" onClick={openCreate}>
          <Plus className="size-4" />
          Qoʻshish
        </Button>
      </div>

      {error && !open ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="px-0 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="pl-5">
                    <span className="relative flex size-12 items-center justify-center overflow-hidden rounded-full bg-secondary">
                      {c.image ? (
                        <ProductImage
                          src={c.image}
                          alt={c.name}
                          fill
                          fit="contain"
                          className="p-1.5"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(c)}
                        aria-label="Tahrirlash"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmAction
                        className="text-destructive"
                        title="Kategoriyani oʻchirasizmi?"
                        description={`“${c.name}” kategoriyasi oʻchiriladi. Davom etasizmi?`}
                        onConfirm={() => remove(c._id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmAction>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Kategoriyalar yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditingId(null);
            setForm(emptyForm);
            setError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || pending}
                className="relative flex size-28 items-center justify-center overflow-hidden rounded-full bg-secondary transition hover:ring-2 hover:ring-foreground/15 hover:ring-offset-2 disabled:opacity-60"
              >
                {form.image ? (
                  <ProductImage
                    src={form.image}
                    alt={form.name || "Kategoriya"}
                    fill
                    fit="contain"
                    className="p-4"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-muted-foreground">
                    {uploading ? (
                      <Loader2 className="size-6 animate-spin" />
                    ) : (
                      <ImagePlus className="size-6" />
                    )}
                    <span className="text-xs font-medium">Rasm</span>
                  </span>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void onPickImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              {form.image ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setForm((f) => ({ ...f, image: "" }))}
                >
                  Rasmni olib tashlash
                </Button>
              ) : null}
            </div>

            <Input
              placeholder="Kategoriya nomi"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-12"
            />

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              className="rounded-full"
              disabled={pending || uploading || !form.name.trim()}
              onClick={save}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
