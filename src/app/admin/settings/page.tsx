"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutConfirm } from "@/components/auth/LogoutConfirm";
import { useAuthStore } from "@/store/auth";
import { SITE_NAME } from "@/lib/site";

export default function AdminSettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
      </div>

      <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="space-y-4 px-5 py-5">
          <div>
            <p className="text-xs text-muted-foreground">Doʻkon</p>
            <p className="text-lg font-semibold">{SITE_NAME}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Admin</p>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {user?.phone || user?.username || "—"}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">Light / Dark</p>
            </div>
            <ThemeToggle className="rounded-full bg-card" />
          </div>
          <Button
            className="h-11 w-full rounded-full"
            nativeButton={false}
            render={<Link href="/account" />}
          >
            Profilga oʻtish
          </Button>
          <LogoutConfirm className="h-11 w-full rounded-full">
            Chiqish
          </LogoutConfirm>
        </CardContent>
      </Card>
    </div>
  );
}
