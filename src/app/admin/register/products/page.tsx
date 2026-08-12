"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";
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
import { ProductExcelImport } from "@/components/admin/ProductExcelImport";
import { useAdminApi } from "@/lib/admin-api";
import { formatUZS } from "@/lib/format";
import {
  PRODUCT_IMAGE_SIZE,
  fileToProductImageDataUrl,
} from "@/lib/product-upload";
import { cn } from "@/lib/utils";

type RefItem = { _id: string; name: string };
type Spec = { label: string; value: string };
type Product = {
  _id: string;
  name: string;
  code?: string;
  price: number;
  wholesalePrice?: number;
  stock: number;
  status: string;
  categoryId: string;
  brandId?: string;
  images?: string[];
  specs?: Spec[];
  description?: string;
  createdAt?: string;
};

function formatProductDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hasRealProductImage(images?: string[]) {
  const url = images?.[0]?.trim();
  if (!url) return false;
  if (url === PRODUCT_IMAGE_PLACEHOLDER) return false;
  if (url.includes("photo-1556911220-e15b29be8c8f")) return false;
  return true;
}

/** Yetishmaydigan maydonlar — qizil qator / Muammoli tab. */
function getProductIssues(p: {
  name?: string;
  code?: string;
  price?: number;
  images?: string[];
}): string[] {
  const issues: string[] = [];
  if (!p.name?.trim()) issues.push("Nom");
  if (!p.code?.trim()) issues.push("Kod");
  if (p.price == null || Number(p.price) <= 0) issues.push("Narx");
  if (!hasRealProductImage(p.images)) issues.push("Rasm");
  return issues;
}

type ListTab = "all" | "incomplete";

const PAGE_SIZE = 100;

type AdminProductsPage = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const emptyForm = {
  name: "",
  code: "",
  price: "",
  wholesalePrice: "",
  stock: "0",
  categoryId: "",
  brandId: "",
  description: "",
  status: "active",
  images: [] as string[],
  specs: [{ label: "", value: "" }] as Spec[],
};

function SearchableCategory({
  categories,
  value,
  onChange,
}: {
  categories: RefItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c._id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 pl-9"
          placeholder="Kategoriyani qidirish…"
          value={open ? query : selected?.name || query}
          onFocus={() => {
            setOpen(true);
            setQuery(selected?.name || "");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
        />
      </div>
      {open ? (
        <ul className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg">
          {filtered.length ? (
            filtered.map((c) => (
              <li key={c._id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted",
                    c._id === value && "bg-muted font-medium",
                  )}
                  onClick={() => {
                    onChange(c._id);
                    setQuery(c.name);
                    setOpen(false);
                  }}
                >
                  {c.name}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Topilmadi
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

export default function AdminProductsPage() {
  const { adminFetch } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<RefItem[]>([]);
  const [brands, setBrands] = useState<RefItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [listTab, setListTab] = useState<ListTab>("all");
  const [loadingList, setLoadingList] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadMeta = useCallback(async () => {
    const [cats, brs] = await Promise.all([
      adminFetch<RefItem[]>("/categories?all=true"),
      adminFetch<RefItem[]>("/brands?all=true"),
    ]);
    setCategories(cats);
    setBrands(brs);
  }, [adminFetch]);

  const loadProducts = useCallback(
    async (pageNum: number, q: string, tab: ListTab = listTab) => {
      setLoadingList(true);
      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: String(PAGE_SIZE),
        });
        if (q.trim()) params.set("q", q.trim());
        if (tab === "incomplete") params.set("incomplete", "true");
        const data = await adminFetch<AdminProductsPage>(
          `/products/admin/all?${params.toString()}`,
        );
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(data.page ?? pageNum);
      } finally {
        setLoadingList(false);
      }
    },
    [adminFetch, listTab],
  );

  useEffect(() => {
    void loadMeta().catch((e: Error) => setError(e.message));
  }, [loadMeta]);

  useEffect(() => {
    void loadProducts(page, query, listTab).catch((e: Error) =>
      setError(e.message),
    );
  }, [loadProducts, page, query, listTab]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditingId(p._id);
    setForm({
      name: p.name,
      code: p.code ?? "",
      price: String(p.price),
      wholesalePrice: String(p.wholesalePrice ?? p.price),
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
          dataUrls.push(await fileToProductImageDataUrl(file));
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
    const wholesalePrice = Number(form.wholesalePrice);
    const stock = Number(form.stock);
    if (
      !form.name.trim() ||
      !form.code.trim() ||
      !form.categoryId ||
      Number.isNaN(price) ||
      Number.isNaN(wholesalePrice)
    ) {
      setError("Nom, kod, kategoriya, oddiy va optom narx majburiy");
      return;
    }
    if (form.images.length === 0) {
      setError("Kamida 1 ta rasm yuklash majburiy");
      return;
    }
    startTransition(async () => {
      try {
        const payload = {
          name: form.name.trim(),
          code: form.code.trim(),
          price,
          wholesalePrice,
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
        if (editingId) {
          await loadProducts(page, query);
        } else if (page === 1) {
          await loadProducts(1, query);
        } else {
          setPage(1);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Saqlanmadi");
      }
    });
  }

  async function remove(id: string) {
    try {
      await adminFetch(`/products/${id}`, { method: "DELETE" });
      const nextTotal = Math.max(0, total - 1);
      const nextPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      const nextPage = Math.min(page, nextPages);
      if (nextPage !== page) setPage(nextPage);
      else await loadProducts(nextPage, query);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Oʻchirilmadi");
      throw e;
    }
  }

  function applySearch() {
    setPage(1);
    setQuery(searchInput.trim());
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mahsulotlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jami {total} ta · sahifada {PAGE_SIZE} tadan
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProductExcelImport
            mode="add"
            onDone={async () => {
              await loadMeta();
              if (page === 1) await loadProducts(1, query);
              else setPage(1);
            }}
          />
          <ProductExcelImport
            mode="replace"
            onDone={async () => {
              setQuery("");
              setSearchInput("");
              setPage(1);
              await loadMeta();
              await loadProducts(1, "");
            }}
          />
          <Button className="rounded-full" onClick={openCreate}>
            <Plus className="size-4" />
            Qoʻshish
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={listTab === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => {
            if (listTab === "all") return;
            setListTab("all");
            setPage(1);
          }}
        >
          Barcha
        </Button>
        <Button
          type="button"
          variant={listTab === "incomplete" ? "default" : "outline"}
          className={cn(
            "rounded-full",
            listTab === "incomplete" &&
              "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          )}
          onClick={() => {
            if (listTab === "incomplete") return;
            setListTab("incomplete");
            setPage(1);
          }}
        >
          Muammoli
          {listTab === "incomplete" && total > 0 ? (
            <span className="ml-1 tabular-nums opacity-90">({total})</span>
          ) : null}
        </Button>
      </div>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          applySearch();
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 pl-9"
            placeholder="Nom yoki kod boʻyicha qidirish…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" className="h-11 rounded-full">
          Qidirish
        </Button>
        {query ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-full"
            onClick={() => {
              setSearchInput("");
              setQuery("");
              setPage(1);
            }}
          >
            Tozalash
          </Button>
        ) : null}
      </form>

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
                <TableHead className="pl-5">Rasm</TableHead>
                <TableHead>Nomi</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Oddiy ($)</TableHead>
                <TableHead>Optom ($)</TableHead>
                <TableHead>Soni</TableHead>
                <TableHead>Muammo</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingList ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : null}
              {!loadingList &&
                items.map((p) => {
                  const issues = getProductIssues(p);
                  const hasProblems = issues.length > 0;
                  const hasImage = hasRealProductImage(p.images);
                  const thumb = hasImage ? p.images?.[0] : undefined;
                  return (
                    <TableRow
                      key={p._id}
                      className={cn(
                        hasProblems &&
                          "bg-destructive/10 text-destructive hover:bg-destructive/15",
                      )}
                    >
                      <TableCell className="pl-5">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={p.name}
                            className="size-12 rounded-xl object-cover bg-muted"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 text-xs text-destructive">
                            —
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[220px] font-medium">
                        <span className="line-clamp-2">{p.name || "—"}</span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.code || "—"}
                      </TableCell>
                      <TableCell>{formatUZS(p.price)}</TableCell>
                      <TableCell>
                        {formatUZS(p.wholesalePrice ?? p.price)}
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {p.stock}
                      </TableCell>
                      <TableCell className="max-w-[140px] text-xs">
                        {hasProblems ? (
                          <span className="font-medium text-destructive">
                            {issues.join(" · ")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap text-sm",
                          hasProblems
                            ? "text-destructive/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatProductDate(p.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            hasProblems &&
                              "bg-destructive/15 text-destructive",
                          )}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-5 text-right space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className={cn(
                            "rounded-full",
                            hasProblems &&
                              "text-destructive hover:text-destructive",
                          )}
                          onClick={() => openEdit(p)}
                          aria-label="Tahrirlash"
                          title="Tahrirlash"
                        >
                          <Pencil className="size-4" />
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
                  );
                })}
              {!loadingList && !items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {listTab === "incomplete"
                      ? "Muammoli mahsulotlar yoʻq"
                      : "Mahsulotlar yoʻq"}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
            <p className="text-sm text-muted-foreground">
              {from}–{to} / {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1 || loadingList}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" />
                Oldingi
              </Button>
              <span className="min-w-20 text-center text-sm tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= totalPages || loadingList}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Keyingi
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
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
            <Input
              placeholder="Kod (masalan: SM-001)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="h-12 font-mono uppercase"
              autoCapitalize="characters"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Oddiy narx ($)"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-12"
              />
              <Input
                placeholder="Optom narx ($)"
                inputMode="decimal"
                value={form.wholesalePrice}
                onChange={(e) =>
                  setForm({ ...form, wholesalePrice: e.target.value })
                }
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
              <SearchableCategory
                categories={categories}
                value={form.categoryId}
                onChange={(id) => setForm({ ...form, categoryId: id })}
              />

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
                <p className="text-sm font-medium">Xususiyatlar</p>
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
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Rasmlar <span className="text-destructive">*</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Majburiy · yuqori sifat (max {PRODUCT_IMAGE_SIZE}px,
                    kichik rasm kattalashtirilmaydi)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  disabled={pending}
                  onClick={() => fileRef.current?.click()}
                >
                  Yuklash
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
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
                  <div
                    key={url}
                    className="relative size-20 overflow-hidden rounded-2xl bg-secondary"
                  >
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
