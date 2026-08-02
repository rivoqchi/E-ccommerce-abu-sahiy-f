"use client";

import Link from "next/link";
import { Bell, ShoppingBag } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useCartStore } from "@/store/cart";

function useCartCount() {
  return useSyncExternalStore(
    useCartStore.subscribe,
    () =>
      useCartStore.getState().items.reduce((sum, item) => sum + item.quantity, 0),
    () => 0,
  );
}

export function HomeGreeting() {
  const count = useCartCount();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg" className="size-12 ring-2 ring-background shadow-sm">
          <AvatarImage
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80"
            alt="Foydalanuvchi"
          />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight text-foreground">
            Salom, Mehmon
          </p>
          <p className="truncate text-sm text-muted-foreground">
            UyTexnikaga xush kelibsiz
          </p>
        </div>
      </div>

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
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/cart" />}
          className="relative rounded-full"
          aria-label="Savat"
        >
          <ShoppingBag className="size-[18px]" strokeWidth={1.75} />
          {count > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {count}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );
}
