"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useAdminApi } from "@/lib/admin-api";

type Brand = { _id: string; name: string; slug: string; isActive: boolean };

export default function AdminBrandsPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const data = await adminFetch<Brand[]>("/brands?all=true");
    setItems(data);
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setIsActive(true);
    setError(null);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditingId(brand._id);
    setName(brand.name);
    setIsActive(brand.isActive);
    setError(null);
    setOpen(true);
  }

  function handleDialogChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function save() {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = { name: name.trim(), isActive };
        if (editingId) {
          await adminFetch(`/brands/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          await adminFetch("/brands", {
            method: "POST",
            body: JSON.stringify(payload),
          });
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
    setItems((list) => list.filter((b) => b._id !== id));
    setError(null);
    try {
      await adminFetch(`/brands/${id}`, { method: "DELETE" });
    } catch (e) {
      setItems(prev);
      setError(e instanceof Error ? e.message : "Oʻchirilmadi");
      throw e;
    }
  }

  async function toggleActive(brand: Brand) {
    const next = !brand.isActive;
    setItems((list) =>
      list.map((b) => (b._id === brand._id ? { ...b, isActive: next } : b)),
    );
    try {
      await adminFetch(`/brands/${brand._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: next }),
      });
    } catch (e) {
      setItems((list) =>
        list.map((b) =>
          b._id === brand._id ? { ...b, isActive: brand.isActive } : b,
        ),
      );
      setError(e instanceof Error ? e.message : "Holat yangilanmadi");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brendlar</h1>
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
                <TableHead>Slug</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="pl-5 font-medium">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => void toggleActive(b)}>
                      <Badge variant={b.isActive ? "default" : "outline"}>
                        {b.isActive ? "Faol" : "Yashirin"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="space-x-1 pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => openEdit(b)}
                    >
                      Tahrir
                    </Button>
                    <ConfirmAction
                      className="text-destructive"
                      title="Brendni oʻchirasizmi?"
                      description={`“${b.name}” brendi oʻchiriladi. Davom etasizmi?`}
                      onConfirm={() => remove(b._id)}
                    >
                      <Trash2 className="size-4" />
                    </ConfirmAction>
                  </TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Brendlar yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Brendni tahrirlash" : "Yangi brend"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Brend nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim() && !pending) save();
              }}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border"
              />
              Faol brend
            </label>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => handleDialogChange(false)}
            >
              Bekor
            </Button>
            <Button
              className="rounded-full"
              disabled={pending || !name.trim()}
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
