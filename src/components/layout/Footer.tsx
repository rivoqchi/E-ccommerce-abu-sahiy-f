import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { CATEGORY_LABELS } from "@/types/product";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
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
          <ul className="mt-3 space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <li key={key}>
                <Link
                  href={`/catalog?category=${key}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
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
                href="mailto:info@uytexnika.uz"
                className="hover:text-foreground"
              >
                info@uytexnika.uz
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
