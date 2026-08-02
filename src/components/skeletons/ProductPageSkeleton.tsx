import { Skeleton } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";

export function ProductPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-6xl md:w-[80%] md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative mx-auto w-full max-w-6xl pb-28 md:pb-10" aria-hidden>
        {/* Mobile */}
        <div className="md:hidden">
          <div className="sticky top-0 z-30 flex items-center justify-between bg-background/90 px-[5%] py-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="size-10 rounded-full" />
          </div>
          <Skeleton className="mx-[5%] aspect-square rounded-[28px]" />
          <div className="mt-5 space-y-3 px-[5%]">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-[80%]" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
          <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))]">
            <div className="flex w-[90%] max-w-lg items-center gap-3">
              <Skeleton className="size-14 shrink-0 rounded-2xl" />
              <Skeleton className="h-14 flex-1 rounded-full" />
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <Skeleton className="mb-8 h-4 w-72" />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Skeleton className="aspect-[4/5] rounded-[2rem] lg:aspect-square" />
              <div className="mt-4 flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="size-20 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <Skeleton className="h-12 w-[85%] lg:h-14" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 w-32 rounded-full" />
                <Skeleton className="h-12 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 hidden md:mt-16 md:block" aria-hidden>
        <Skeleton className="h-8 w-52" />
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
