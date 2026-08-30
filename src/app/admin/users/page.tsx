"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
import { AdminUsersPageSkeleton } from "@/components/skeletons/admin";

type ApprovalStatus = "pending" | "approved" | "blocked";

type UserRow = {
  id: string;
  fullName: string;
  phone: string | null;
  username: string | null;
  role: string;
  priceTier: "retail" | "wholesale";
  isActive: boolean;
  approvalStatus?: ApprovalStatus;
  approvedByName?: string | null;
  blockedByName?: string | null;
};

function resolveStatus(user: UserRow): ApprovalStatus {
  if (user.approvalStatus) return user.approvalStatus;
  return user.isActive === false ? "blocked" : "approved";
}

export default function AdminUsersPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "pending">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    const path = q.trim()
      ? `/users?q=${encodeURIComponent(q.trim())}`
      : "/users";
    setItems(await adminFetch<UserRow[]>(path));
  }, [adminFetch, q]);

  useEffect(() => {
    void load()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [load]);

  const visible = useMemo(() => {
    if (filter !== "pending") return items;
    return items.filter((u) => resolveStatus(u) === "pending");
  }, [items, filter]);

  const pendingCount = useMemo(
    () => items.filter((u) => resolveStatus(u) === "pending").length,
    [items],
  );

  function setApproval(user: UserRow, approvalStatus: ApprovalStatus) {
    startTransition(async () => {
      try {
        setError(null);
        await adminFetch(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ approvalStatus }),
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

  if (loading) {
    return <AdminUsersPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Qidirish…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-12 max-w-md"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setFilter("all")}
          >
            Barchasi
          </Button>
          <Button
            type="button"
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setFilter("pending")}
          >
            Kutilmoqda{pendingCount ? ` (${pendingCount})` : ""}
          </Button>
        </div>
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
              {visible.map((u) => {
                const isAdmin = u.role === "admin";
                const status = resolveStatus(u);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="pl-5">
                      <div className="font-medium">{u.fullName}</div>
                      {status === "approved" && u.approvedByName ? (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {u.approvedByName} tasdiqlagan
                        </div>
                      ) : null}
                      {status === "blocked" && u.blockedByName ? (
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {u.blockedByName} bloklagan
                        </div>
                      ) : null}
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
                      {status === "pending" ? (
                        <Badge variant="outline">Kutilmoqda</Badge>
                      ) : status === "blocked" ? (
                        <Badge variant="destructive">Bloklangan</Badge>
                      ) : (
                        <Badge>Tasdiqlangan</Badge>
                      )}
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
                      {status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="rounded-full"
                            disabled={pending}
                            onClick={() => setApproval(u, "approved")}
                          >
                            Tasdiqlash
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            disabled={pending}
                            onClick={() => setApproval(u, "blocked")}
                          >
                            Bloklash
                          </Button>
                        </>
                      ) : status === "blocked" ? (
                        <Button
                          size="sm"
                          className="rounded-full"
                          disabled={pending}
                          onClick={() => setApproval(u, "approved")}
                        >
                          Tasdiqlash
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          disabled={pending}
                          onClick={() => setApproval(u, "blocked")}
                        >
                          Bloklash
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!visible.length ? (
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
