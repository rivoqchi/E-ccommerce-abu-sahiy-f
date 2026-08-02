"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ConfirmAction } from "@/components/ui/confirm-action";
import { useAdminApi } from "@/lib/admin-api";
import { fileToAvatarDataUrl } from "@/lib/avatar";

type Seller = {
  _id: string;
  fullName: string;
  phone: string;
  telegramUsername?: string;
  avatarUrl?: string;
  status: string;
};

function telegramHref(username?: string) {
  if (!username) return null;
  const clean = username.replace(/^@+/, "");
  return clean ? `https://t.me/${clean}` : null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const emptyForm = {
  fullName: "",
  phone: "",
  telegramUsername: "",
  avatarUrl: "",
  status: "active",
};

export default function AdminSellersPage() {
  const { adminFetch } = useAdminApi();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Seller[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setItems(await adminFetch<Seller[]>("/sellers?all=true"));
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const res = await adminFetch<{ urls: string[] }>("/uploads/images", {
        method: "POST",
        body: JSON.stringify({ dataUrls: [dataUrl] }),
      });
      const url = res.urls[0];
      if (url) setForm((f) => ({ ...f, avatarUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rasm yuklanmadi");
    } finally {
      setUploading(false);
    }
  }

  function create() {
    setError(null);
    const username = form.telegramUsername.trim().replace(/^@+/, "");
    startTransition(async () => {
      try {
        await adminFetch("/sellers", {
          method: "POST",
          body: JSON.stringify({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            telegramUsername: username || undefined,
            avatarUrl: form.avatarUrl || undefined,
            status: form.status,
          }),
        });
        setOpen(false);
        setForm(emptyForm);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xato");
      }
    });
  }

  async function remove(id: string) {
    try {
      await adminFetch(`/sellers/${id}`, { method: "DELETE" });
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
          <h1 className="text-2xl font-bold tracking-tight">Sotuvchilar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rasm, ism, telefon va Telegram — bosh sahifada koʻrsatiladi
          </p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
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
                <TableHead className="pl-5">Sotuvchi</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Telegram</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => {
                const tg = telegramHref(s.telegramUsername);
                return (
                  <TableRow key={s._id}>
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <Avatar size="default">
                          {s.avatarUrl ? (
                            <AvatarImage src={s.avatarUrl} alt={s.fullName} />
                          ) : null}
                          <AvatarFallback>
                            {initials(s.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${s.phone}`}
                        className="text-sm hover:underline"
                      >
                        {s.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      {tg ? (
                        <a
                          href={tg}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
                        >
                          @{s.telegramUsername?.replace(/^@+/, "")}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <ConfirmAction
                        className="text-destructive"
                        title="Sotuvchini oʻchirasizmi?"
                        description={`“${s.fullName}” sotuvchisi oʻchiriladi. Davom etasizmi?`}
                        onConfirm={() => remove(s._id)}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmAction>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Sotuvchilar yoʻq
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" bodyClassName="pb-0">
          <DialogHeader>
            <DialogTitle>Yangi sotuvchi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                {form.avatarUrl ? (
                  <AvatarImage src={form.avatarUrl} alt="" />
                ) : null}
                <AvatarFallback className="text-lg">
                  {initials(form.fullName || "S")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    void onPickAvatar(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Rasm yuklash
                </Button>
              </div>
            </div>

            <Input
              placeholder="Ism familiya"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              className="h-12"
            />
            <Input
              placeholder="+998901234567"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className="h-12"
            />
            <Input
              placeholder="Telegram: username (masalan: samishop)"
              value={form.telegramUsername}
              onChange={(e) =>
                setForm((f) => ({ ...f, telegramUsername: e.target.value }))
              }
              className="h-12"
            />
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, status: v || "active" }))
              }
            >
              <SelectTrigger className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              className="rounded-full"
              disabled={
                pending ||
                uploading ||
                !form.fullName.trim() ||
                !form.phone.trim()
              }
              onClick={create}
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
