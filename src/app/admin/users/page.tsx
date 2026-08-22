"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

type UserRow = {
  id: string;
  fullName: string;
  phone: string | null;
  username: string | null;
  role: string;
  priceTier: "retail" | "wholesale";
  isActive: boolean;
};

export default function AdminUsersPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const path = q.trim()
      ? `/users?q=${encodeURIComponent(q.trim())}`
      : "/users";
    setItems(await adminFetch<UserRow[]>(path));
  }, [adminFetch, q]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function toggleActive(user: UserRow) {
    startTransition(async () => {
      try {
        await adminFetch(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !user.isActive }),
        });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xato");
      }
    });
  }

  function togglePriceTier(user: UserRow) {
    const next = user.priceTier === "wholesale" ? "retail" : "wholesale";
    startTransition(async () => {
      try {
        await adminFetch(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ priceTier: next }),
        });
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Xato");
      }
    });
  }

  async function setRole(user: UserRow, role: "admin" | "customer") {
    setError(null);
    try {
      await adminFetch(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
      </div>

      <Input
        placeholder="Qidirish…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-12 max-w-md"
      />

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
                <TableHead className="pl-5">Ism</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Narx</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const isAdmin = u.role === "admin";
                return (
                  <TableRow key={u.id}>
                    <TableCell className="pl-5 font-medium">
                      {u.fullName}
                    </TableCell>
                    <TableCell>{u.phone ?? "—"}</TableCell>
                    <TableCell>
                      {u.username ? `@${u.username}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isAdmin ? "default" : "secondary"}>
                        {isAdmin ? "Admin" : "Customer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.priceTier === "wholesale" ? "default" : "secondary"
                        }
                      >
                        {u.priceTier === "wholesale" ? "Optom" : "Oddiy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? "Aktiv" : "Bloklangan"}
                    </TableCell>
                    <TableCell className="space-x-1 pr-5 text-right">
                      {isAdmin ? (
                        <ConfirmAction
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled={pending}
                          title="Admin huquqini olasizmi?"
                          description={`“${u.fullName}” endi admin panelga kira olmaydi. Davom etasizmi?`}
                          confirmLabel="Ha, olish"
                          pendingLabel="Olinmoqda…"
                          onConfirm={() => setRole(u, "customer")}
                        >
                          Admindan olish
                        </ConfirmAction>
                      ) : (
                        <ConfirmAction
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled={pending}
                          title="Admin qilasizmi?"
                          description={`“${u.fullName}” admin panelga kira oladi. Davom etasizmi?`}
                          confirmLabel="Ha, admin qilish"
                          pendingLabel="Saqlanmoqda…"
                          onConfirm={() => setRole(u, "admin")}
                        >
                          Admin qilish
                        </ConfirmAction>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() => togglePriceTier(u)}
                      >
                        {u.priceTier === "wholesale"
                          ? "Oddiyga"
                          : "Optomga"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={pending}
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive ? "Bloklash" : "Faollashtirish"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Foydalanuvchilar topilmadi
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
