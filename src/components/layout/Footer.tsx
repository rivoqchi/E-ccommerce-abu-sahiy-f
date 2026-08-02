"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { fetchCategories } from "@/lib/storefront-api";
import type { CatalogCategory } from "@/types/product";

export function Footer() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchCategories().then((rows) => {
      if (!cancelled) setCategories(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="mt-auto border-border bg-card">
      <div className="mx-auto grid w-[80%] max-w-6xl gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {SITE_NAME}
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {SITE_TAGLINE}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Kategoriyalar</p>
          {categories.length > 0 ? (
            <>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {categories.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/catalog?category=${cat.slug}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/catalog"
                className="mt-3 inline-block text-sm font-medium text-foreground transition-colors hover:opacity-80"
              >
                {categories.length > 4 ? "Barcha katalog" : "Katalog"}
              </Link>
            </>
          ) : (
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/catalog"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Katalog
                </Link>
              </li>
            </ul>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Aloqa</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="tel:+998901234567" className="hover:text-foreground">
                +998 90 123 45 67
              </a>
            </li>
            <li>
              <a
                href="mailto:info@sami.uz"
                className="hover:text-foreground"
              >
                info@sami.uz
              </a>
            </li>
            <li>Toshkent, O&apos;zbekiston</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto w-[80%] max-w-6xl py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Barcha huquqlar
          himoyalangan.
        </p>
      </div>
    </footer>
  );
}
