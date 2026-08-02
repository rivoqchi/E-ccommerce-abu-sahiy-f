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
import { useAdminApi } from "@/lib/admin-api";

type UserRow = {
  id: string;
  fullName: string;
  phone: string | null;
  username: string | null;
  role: string;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Qidiruv va faollashtirish
        </p>
      </div>

      <Input
        placeholder="Qidirish…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-12 max-w-md rounded-2xl"
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
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-5 font-medium">
                    {u.fullName}
                  </TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                  <TableCell>
                    {u.username ? `@${u.username}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? "Aktiv" : "Bloklangan"}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
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
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
