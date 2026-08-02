"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { useAdminApi } from "@/lib/admin-api";
import { fileToAvatarDataUrl } from "@/lib/avatar";
import { formatUZS } from "@/lib/format";

type RefItem = { _id: string; name: string };
type Spec = { label: string; value: string };
type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  categoryId: string;
  brandId?: string;
  images?: string[];
  specs?: Spec[];
  description?: string;
};

const emptyForm = {
  name: "",
  price: "",
  stock: "0",
  categoryId: "",
  brandId: "",
  description: "",
  status: "active",
  images: [] as string[],
  specs: [{ label: "", value: "" }] as Spec[],
};

export default function AdminProductsPage() {
  const { adminFetch } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<RefItem[]>([]);
  const [brands, setBrands] = useState<RefItem[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const [products, cats, brs] = await Promise.all([
      adminFetch<Product[]>("/products/admin/all"),
      adminFetch<RefItem[]>("/categories?all=true"),
      adminFetch<RefItem[]>("/brands?all=true"),
    ]);
    setItems(products);
    setCategories(cats);
    setBrands(brs);
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      categoryId: String(p.categoryId),
      brandId: p.brandId ? String(p.brandId) : "",
      description: p.description ?? "",
      status: p.status || "active",
      images: p.images ?? [],
      specs: p.specs?.length ? p.specs : [{ label: "", value: "" }],
    });
    setOpen(true);
  }

  async function onUploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    startTransition(async () => {
      try {
        const dataUrls: string[] = [];
        for (const file of Array.from(files).slice(0, 8)) {
          dataUrls.push(await fileToAvatarDataUrl(file));
        }
        const res = await adminFetch<{ urls: string[] }>("/uploads/images", {
          method: "POST",
          body: JSON.stringify({ dataUrls }),
        });
        setForm((f) => ({ ...f, images: [...f.images, ...res.urls] }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rasm yuklanmadi");
      }
    });
  }

  function save() {
    setError(null);
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.categoryId || Number.isNaN(price)) {
      setError("Nom, kategoriya va narx majburiy");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          name: form.name.trim(),
          price,
          stock: Number.isNaN(stock) ? 0 : stock,
          categoryId: form.categoryId,
          brandId: form.brandId || undefined,
          description: form.description.trim() || form.name.trim(),
          status: form.status,
          images: form.images,
          specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
        };
        if (editingId) {
          await adminFetch(`/products/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
        }
        setOpen(false);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Saqlanmadi");
      }
    });
  }

  async function remove(id: string) {
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Oʻchirilmadi");
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mahsulotlar</h1>
        </div>
        <Button className="rounded-full" onClick={openCreate}>
          <Plus className="size-4" />
          Qoʻshish
        </Button>
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
                <TableHead className="pl-5">Nomi</TableHead>
                <TableHead>Narx ($)</TableHead>
                <TableHead>Ombor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="pl-5 font-medium">{p.name}</TableCell>
                  <TableCell>{formatUZS(p.price)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.status}</Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => openEdit(p)}
                    >
                      Tahrir
                    </Button>
                    <ConfirmAction
                      className="text-destructive"
                      title="Mahsulotni oʻchirasizmi?"
                      description={`“${p.name}” mahsuloti butunlay oʻchiriladi. Davom etasizmi?`}
                      onConfirm={() => remove(p._id)}
                    >
                      <Trash2 className="size-4" />
                    </ConfirmAction>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Mahsulotlar yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-2">
            <Input
              placeholder="Mahsulot nomi"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-12"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Narx ($)"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-12"
              />
              <Input
                placeholder="Ombor"
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                value={form.categoryId || null}
                onValueChange={(v) =>
                  setForm({ ...form, categoryId: v ?? "" })
                }
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Kategoriya" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={form.brandId || null}
                onValueChange={(v) => setForm({ ...form, brandId: v ?? "" })}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Brend (ixtiyoriy)" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v || "active" })
              }
            >
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Tavsif (ixtiyoriy)"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-24"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Xarakteristika</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() =>
                    setForm({
                      ...form,
                      specs: [...form.specs, { label: "", value: "" }],
                    })
                  }
                >
                  <Plus className="size-4" />
                  Qoʻshish
                </Button>
              </div>
              {form.specs.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Nomi"
                    value={spec.label}
                    onChange={(e) => {
                      const specs = [...form.specs];
                      specs[idx] = { ...specs[idx]!, label: e.target.value };
                      setForm({ ...form, specs });
                    }}
                    className="h-11"
                  />
                  <Input
                    placeholder="Qiymati"
                    value={spec.value}
                    onChange={(e) => {
                      const specs = [...form.specs];
                      specs[idx] = { ...specs[idx]!, value: e.target.value };
                      setForm({ ...form, specs });
                    }}
                    className="h-11"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setForm({
                        ...form,
                        specs: form.specs.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Rasmlar</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={pending}
                  onClick={() => fileRef.current?.click()}
                >
                  Yuklash
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void onUploadFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {form.images.map((url) => (
                  <div key={url} className="relative size-20 overflow-hidden rounded-2xl bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                      onClick={() =>
                        setForm({
                          ...form,
                          images: form.images.filter((u) => u !== url),
                        })
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0">
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
    </div>
  );
}
