"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildCatalogHref } from "@/lib/catalog";

interface CatalogSearchProps {
  category?: string;
  brand?: string;
  q?: string;
}

export function CatalogSearch({
  category = "all",
  brand = "all",
  q = "",
}: CatalogSearchProps) {
  const router = useRouter();

  return (
    <form
      action="/catalog"
      method="get"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const nextQ = String(fd.get("q") ?? "").trim();
        router.push(
          buildCatalogHref({
            category,
            brand,
            q: nextQ || undefined,
            page: 1,
          }),
        );
      }}
    >
      {category !== "all" ? (
        <input type="hidden" name="category" value={category} />
      ) : null}
      {brand !== "all" ? (
        <input type="hidden" name="brand" value={brand} />
      ) : null}

      <label className="relative block">
        <span className="sr-only">Mahsulot qidirish</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          name="q"
          type="search"
          defaultValue={q}
          key={q}
          placeholder="Mahsulot, brend yoki model qidirish..."
          className="h-12 rounded-full border-0 bg-card pr-12 pl-11 text-sm shadow-[var(--shadow-soft)] placeholder:text-muted-foreground focus-visible:ring-1 dark:bg-card"
        />
      </label>

      {q ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-2 size-8 -translate-y-1/2 rounded-full"
          aria-label="Qidiruvni tozalash"
          onClick={() =>
            router.push(
              buildCatalogHref({
                category,
                brand,
                page: 1,
              }),
            )
          }
        >
          <X className="size-4" strokeWidth={1.75} />
        </Button>
      ) : null}
    </form>
  );
}
