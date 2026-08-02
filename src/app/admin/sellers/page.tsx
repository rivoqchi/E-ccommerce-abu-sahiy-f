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

type Seller = {
  _id: string;
  fullName: string;
  phone: string;
  status: string;
};

export default function AdminSellersPage() {
  const { adminFetch } = useAdminApi();
  const [items, setItems] = useState<Seller[]>([]);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setItems(await adminFetch<Seller[]>("/sellers"));
  }, [adminFetch]);

  useEffect(() => {
    void load().catch((e: Error) => setError(e.message));
  }, [load]);

  function create() {
    setError(null);
    startTransition(async () => {
      try {
        await adminFetch("/sellers", {
          method: "POST",
          body: JSON.stringify({ fullName, phone, status }),
        });
        setOpen(false);
        setFullName("");
        setPhone("");
        setStatus("active");
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
         
        </div>
        <Button className="rounded-full" onClick={() => setOpen(true)}>
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
                <TableHead className="pl-5">Ism</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="pl-5 font-medium">
                    {s.fullName}
                  </TableCell>
                  <TableCell>{s.phone}</TableCell>
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
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangi sotuvchi</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Ism familiya"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12"
            />
            <Input
              placeholder="+998901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
            <Select
              value={status}
              onValueChange={(v) => setStatus(v || "active")}
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
              disabled={pending || !fullName.trim() || !phone.trim()}
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
