"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

const NAV_BRAND = "UyTexnika";

const desktopBaseLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/catalog", label: "Katalog" },
  { href: "/wishlist", label: "Sevimlilar" },
  { href: "/cart", label: "Savat" },
] as const;

const AUTH_STORAGE_KEY = "uytexnika-auth";

function peekStoredSession(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      state?: { user?: unknown; accessToken?: string | null };
    };
    return Boolean(parsed.state?.user || parsed.state?.accessToken);
  } catch {
    return false;
  }
}

/** Avoids Kirish→Profil flash on refresh by sync-reading persisted session. */
function useAuthNav(): "pending" | "login" | "profile" {
  return useSyncExternalStore(
    useAuthStore.subscribe,
    () => {
      const { hydrated, user, accessToken } = useAuthStore.getState();
      if (hydrated) {
        return user || accessToken ? "profile" : "login";
      }
      return peekStoredSession() ? "profile" : "login";
    },
    () => "pending",
  );
}

function useCartCount() {
  return useSyncExternalStore(
    useCartStore.subscribe,
    () =>
      useCartStore.getState().items.reduce((sum, item) => sum + item.quantity, 0),
    () => 0,
  );
}

export function Header() {
  const pathname = usePathname();
  const count = useCartCount();
  const authNav = useAuthNav();
  const isHome = pathname === "/";
  const isWelcome = pathname === "/welcome";
  const isLogin = pathname === "/login";
  const isProduct = pathname.startsWith("/product/");

  const authLink =
    authNav === "profile"
      ? { href: "/account", label: "Profil" }
      : authNav === "login"
        ? { href: "/login", label: "Kirish" }
        : null;

  if (isWelcome || isLogin) {
    return null;
  }

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-50 hidden border-b border-border/60 bg-background/80 backdrop-blur-md md:block">
        <div className="mx-auto flex h-16 w-[80%] max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            {NAV_BRAND}
          </Link>

          <nav
            className="flex items-center gap-1"
            aria-label="Asosiy navigatsiya"
          >
            {desktopBaseLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Button
                  key={link.href}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  nativeButton={false}
                  render={<Link href={link.href} />}
                  className="rounded-full px-4"
                >
                  {link.label}
                  {link.href === "/cart" && count > 0 ? (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 min-w-5 rounded-full px-1.5"
                    >
                      {count}
                    </Badge>
                  ) : null}
                </Button>
              );
            })}
            {authLink ? (
              <Button
                variant={
                  pathname.startsWith(authLink.href) ? "default" : "ghost"
                }
                size="sm"
                nativeButton={false}
                render={<Link href={authLink.href} />}
                className="rounded-full px-4"
              >
                {authLink.label}
              </Button>
            ) : (
              <span
                aria-hidden
                className="inline-flex h-7 w-[4.75rem] rounded-full bg-muted/80"
              />
            )}
            <ThemeToggle className="ml-1" size="icon-sm" />
          </nav>
        </div>
      </header>

      {/* Mobile top actions — off home & product (those have own chrome) */}
      {!isHome && !isProduct ? (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-md md:hidden">
          <div className="mx-auto flex h-14 w-[90%] max-w-lg items-center justify-between">
            <Link href="/" className="text-base font-semibold tracking-tight">
              {NAV_BRAND}
            </Link>
            <div className="flex items-center gap-0.5 rounded-full bg-secondary px-1.5 py-1">
              <ThemeToggle size="icon-sm" />
              <Separator orientation="vertical" className="mx-0.5 h-4!" />
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Bildirishnomalar"
              >
                <Bell className="size-4" strokeWidth={1.75} />
              </Button>
              <Separator orientation="vertical" className="mx-0.5 h-4!" />
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={<Link href="/cart" />}
                className="relative rounded-full"
                aria-label="Savat"
              >
                <ShoppingBag className="size-4" strokeWidth={1.75} />
                {count > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </Button>
            </div>
          </div>
        </header>
      ) : null}

      <MobileBottomNav pathname={pathname} />
    </>
  );
}

const mobileItems = [
  {
    href: "/",
    label: "Asosiy",
    icon: Home,
    match: (path: string) => path === "/",
  },
  {
    href: "/catalog",
    label: "Qidiruv",
    icon: Search,
    match: (path: string) =>
      path.startsWith("/catalog") || path.startsWith("/product"),
  },
  {
    href: "/wishlist",
    label: "Sevimlilar",
    icon: Heart,
    match: (path: string) => path.startsWith("/wishlist"),
  },
  {
    href: "/account",
    label: "Profil",
    icon: User,
    match: (path: string) => path.startsWith("/account"),
  },
] as const;

function MobileBottomNav({ pathname }: { pathname: string }) {
  if (pathname === "/welcome" || pathname === "/login") return null;

  return (
    <nav
      aria-label="Mobil pastki menyu"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center",
        "pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden",
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-nav-dock p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.28)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {mobileItems.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          if (active) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current="page"
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-nav-dock-foreground px-4 text-nav-dock transition-transform active:scale-[0.98]"
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-nav-dock-muted text-nav-dock-foreground transition-opacity hover:opacity-90 active:scale-[0.96]"
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
