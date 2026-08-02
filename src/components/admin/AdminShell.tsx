"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Tags,
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
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col bg-nav-dock text-nav-dock-foreground md:flex">
        <div className="px-5 py-6">
          <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
            Super Admin
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">UyTexnika</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          <AdminNav
            pathname={pathname}
            regOpen={regOpen}
            onToggleReg={() => setRegOpen((v) => !v)}
          />
        </nav>
        <div className="border-t border-white/10 p-3">
          <LogoutConfirm
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
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
          <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col bg-nav-dock text-nav-dock-foreground shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <p className="font-semibold">Super Admin</p>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
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
            variant="outline"
            size="sm"
            className="hidden rounded-full sm:inline-flex"
            nativeButton={false}
            render={<Link href="/account" />}
          >
            Profil
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
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
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
                <div className="mt-1 ml-3 space-y-1.5 border-l border-white/15 pl-3">
                  {item.children.map((child) => {
                    const active = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm transition",
                          active
                            ? "bg-nav-dock-foreground text-nav-dock"
                            : "text-white/65 hover:bg-white/10 hover:text-white",
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
                ? "bg-nav-dock-foreground text-nav-dock"
                : "text-white/70 hover:bg-white/10 hover:text-white",
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
