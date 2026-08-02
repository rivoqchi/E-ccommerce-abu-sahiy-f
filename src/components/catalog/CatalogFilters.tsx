"use client";

import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildCatalogHref } from "@/lib/catalog";
import type { CatalogBrand, CatalogCategory } from "@/types/product";
import { cn } from "@/lib/utils";

export interface CatalogFiltersState {
  category: string;
  brand: string;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  q?: string;
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary font-medium text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function FilterPanel({
  category,
  brand,
  categories,
  brands,
  q,
  className,
}: CatalogFiltersState & { className?: string }) {
  const hasActive = category !== "all" || brand !== "all" || Boolean(q);

  return (
    <div className={cn("space-y-8", className)}>
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Kategoriya
          </h2>
          {hasActive ? (
            <Link
              href="/catalog"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Tozalash
            </Link>
          ) : null}
        </div>
        <ul className="space-y-0.5">
          <li>
            <FilterLink
              href={buildCatalogHref({ category: "all", brand, q, page: 1 })}
              active={category === "all"}
            >
              Barchasi
            </FilterLink>
          </li>
          {categories.map((item) => (
            <li key={item.id}>
              <FilterLink
                href={buildCatalogHref({
                  category: item.slug,
                  brand,
                  q,
                  page: 1,
                })}
                active={category === item.slug}
              >
                {item.name}
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
          Brendlar
        </h2>
        <ul className="space-y-0.5">
          <li>
            <FilterLink
              href={buildCatalogHref({
                category,
                brand: "all",
                q,
                page: 1,
              })}
              active={brand === "all"}
            >
              Barcha brendlar
            </FilterLink>
          </li>
          {brands.map((b) => (
            <li key={b.id}>
              <FilterLink
                href={buildCatalogHref({
                  category,
                  brand: b.slug,
                  q,
                  page: 1,
                })}
                active={brand === b.slug}
              >
                {b.name}
              </FilterLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersState) {
  return (
    <aside className="sticky top-20 hidden self-start lg:block">
      <FilterPanel {...props} />
    </aside>
  );
}

export function CatalogMobileFilters(props: CatalogFiltersState) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    props.category !== "all",
    props.brand !== "all",
    Boolean(props.q),
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 rounded-full px-4 lg:hidden"
          />
        }
      >
        <SlidersHorizontal className="size-4" strokeWidth={1.75} />
        Kategoriya
        {activeCount > 0 ? (
          <Badge className="h-5 min-w-5 rounded-full px-1.5">{activeCount}</Badge>
        ) : null}
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100%,20rem)] p-0">
        <SheetHeader className="border-b border-border/60 px-4 py-4">
          <SheetTitle>Kategoriya va brend</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5.5rem)] px-3 py-4">
          <div
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest("a")) setOpen(false);
            }}
          >
            <FilterPanel {...props} className="pr-1" />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
