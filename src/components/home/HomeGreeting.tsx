"use client";

import Link from "next/link";
import { Bell, ShoppingBag, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

function useCartCount() {
  return useSyncExternalStore(
    useCartStore.subscribe,
    () =>
      useCartStore.getState().items.reduce((sum, item) => sum + item.quantity, 0),
    () => 0,
  );
}

function greetingName(fullName?: string | null, firstName?: string | null) {
  const raw = (firstName?.trim() || fullName?.trim() || "").replace(/\s+/g, " ");
  if (!raw) return "Mehmon";
  return raw;
}

export function HomeGreeting() {
  const count = useCartCount();
  const user = useAuthStore((s) => s.user);

  const name = greetingName(user?.fullName, user?.firstName);
  const profileHref = user ? "/account" : "/login";

  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={profileHref}
        prefetch={false}
        className="flex min-w-0 items-center gap-3 rounded-2xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar size="lg" className="size-12 ring-2 ring-background shadow-sm">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={name} />
          ) : null}
          <AvatarFallback className="bg-secondary text-muted-foreground">
            <User className="size-5" strokeWidth={1.75} />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">
            Salom, {name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            Samiga xush kelibsiz
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-card px-1.5 py-1.5 shadow-[var(--shadow-soft)]">
        <ThemeToggle size="icon-sm" />
        <Separator orientation="vertical" className="mx-0.5 h-5!" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Bildirishnomalar"
        >
          <Bell className="size-[18px]" strokeWidth={1.75} />
        </Button>
        <Separator orientation="vertical" className="mx-0.5 h-5!" />
        <Link
          href="/cart"
          prefetch={false}
          aria-label="Savat"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "relative rounded-full",
          )}
        >
          <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}
