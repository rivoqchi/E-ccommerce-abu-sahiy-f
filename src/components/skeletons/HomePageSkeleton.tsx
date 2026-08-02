import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export function HomePageSkeleton() {
  return (
    <div
      className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-5 md:space-y-8" aria-hidden>
        {/* Mobile greeting */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
          <Skeleton className="h-11 w-28 shrink-0 rounded-full" />
        </div>

        {/* Desktop header + search */}
        <div className="hidden items-end justify-between gap-6 md:flex">
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-10 w-80 max-w-full lg:h-11 lg:w-[28rem]" />
          </div>
          <div className="flex w-full max-w-md items-center gap-2.5">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="size-12 shrink-0 rounded-full" />
          </div>
        </div>

        {/* Mobile search */}
        <div className="flex items-center gap-2.5 md:hidden">
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="size-12 shrink-0 rounded-full" />
        </div>

        {/* Promo banner */}
        <Skeleton className="min-h-[168px] w-full rounded-3xl md:min-h-[200px]" />

        {/* Category pills */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Featured products */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-4">
            <ProductGridSkeleton count={8} variant="featured" />
          </div>
        </section>
      </div>
    </div>
  );
}
