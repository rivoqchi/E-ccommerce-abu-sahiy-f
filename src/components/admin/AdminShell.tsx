"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  ChevronDown,
  Clapperboard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  User,
  Users,
  X,
  BadgePercent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutConfirm } from "@/components/auth/LogoutConfirm";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    label: "Roʻyxatga olish",
    icon: Package,
    children: [
      { href: "/admin/register/brands", label: "Brendlar", icon: BadgePercent },
      { href: "/admin/register/categories", label: "Kategoriyalar", icon: Tags },
      { href: "/admin/register/products", label: "Mahsulotlar", icon: Boxes },
    ],
  },
  { href: "/admin/stories", label: "Istoriyalar", icon: Clapperboard },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/sellers", label: "Sotuvchilar", icon: Store },
  { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingBag },
  { href: "/admin/sold", label: "Sotilgan", icon: Package },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const [open, setOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(true);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    void (async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          if (!cancelled) {
            setAllowed(false);
            router.replace("/login?next=/admin");
          }
          return;
        }

        const latest = await refreshMe();
        if (cancelled) return;

        if (latest?.role === "admin") {
          setAllowed(true);
        } else {
          setAllowed(false);
          router.replace("/account");
        }
      } catch {
        if (!cancelled) {
          setAllowed(false);
          const stillHasToken = Boolean(useAuthStore.getState().accessToken);
          router.replace(stillHasToken ? "/account" : "/login?next=/admin");
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, refreshMe, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!hydrated || checking || !allowed || !user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-sm text-muted-foreground">
        Tekshirilmoqda…
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-5 py-6">
          <p className="text-xs font-medium tracking-wide text-sidebar-foreground/50 uppercase">
            Super Admin
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">Sami</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          <AdminNav
            pathname={pathname}
            regOpen={regOpen}
            onToggleReg={() => setRegOpen((v) => !v)}
          />
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <LogoutConfirm
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Chiqish
          </LogoutConfirm>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Yopish"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <p className="font-semibold">Super Admin</p>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
              <AdminNav
                pathname={pathname}
                regOpen={regOpen}
                onToggleReg={() => setRegOpen((v) => !v)}
              />
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menyu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.phone || user.username || "Admin"}
            </p>
          </div>
          <Button
            size="sm"
            className="h-9 gap-2 rounded-full bg-black px-3.5 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            nativeButton={false}
            render={<Link href="/account" />}
          >
            <User className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">Profil</span>
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function AdminNav({
  pathname,
  regOpen,
  onToggleReg,
}: {
  pathname: string;
  regOpen: boolean;
  onToggleReg: () => void;
}) {
  return (
    <>
      {nav.map((item) => {
        if ("children" in item) {
          const childActive = item.children.some((c) =>
            pathname.startsWith(c.href),
          );
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={onToggleReg}
                className={cn(
                  "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition",
                  childActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition",
                    regOpen || childActive ? "rotate-180" : "",
                  )}
                />
              </button>
              {(regOpen || childActive) && (
                <div className="mt-1 ml-3 space-y-1.5 border-l border-sidebar-border pl-3">
                  {item.children.map((child) => {
                    const active = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm transition",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <child.icon className="size-3.5" strokeWidth={1.75} />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        const linkItem = item;
        const active =
          "exact" in linkItem && linkItem.exact
            ? pathname === linkItem.href
            : pathname.startsWith(linkItem.href);
        const Icon = linkItem.icon;
        return (
          <Link
            key={linkItem.href}
            href={linkItem.href}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            {linkItem.label}
          </Link>
        );
      })}
    </>
  );
}
