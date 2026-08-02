import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export function CatalogPageSkeleton() {
  return (
    <div
      className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div aria-hidden>
        <header className="space-y-4">
          <div>
            <Skeleton className="h-8 w-36 md:h-10 md:w-44" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <div className="flex items-center gap-2.5 md:hidden">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="size-12 shrink-0 rounded-full" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[220px_1fr]">
          <div className="hidden space-y-4 lg:block">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
          <ProductGridSkeleton count={6} variant="catalog" />
        </div>
      </div>
    </div>
  );
}
