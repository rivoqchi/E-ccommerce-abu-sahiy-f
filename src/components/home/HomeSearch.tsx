import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeSearch() {
  return (
    <form
      action="/catalog"
      method="get"
      className="flex items-center gap-2.5"
    >
      <label className="relative flex-1">
        <span className="sr-only">Qidiruv</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <Input
          name="q"
          type="search"
          placeholder="Mahsulot qidirish..."
          className="h-12 rounded-full border-0 bg-card pr-4 pl-11 text-sm shadow-[var(--shadow-soft)] placeholder:text-muted-foreground focus-within:ring-1 dark:bg-card"
        />
      </label>
      <Button
        type="button"
        variant="secondary"
        size="icon-lg"
        nativeButton={false}
        render={<Link href="/catalog" />}
        className="size-12 shrink-0 rounded-full bg-card shadow-[var(--shadow-soft)] dark:bg-card"
        aria-label="Filtr"
      >
        <SlidersHorizontal className="size-[18px]" strokeWidth={1.75} />
      </Button>
    </form>
  );
}
