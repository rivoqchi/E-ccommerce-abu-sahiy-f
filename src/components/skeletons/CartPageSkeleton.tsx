import { Skeleton } from "@/components/ui/skeleton";

export function CartItemsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card"
      aria-hidden
    >
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-4 p-4 sm:p-5">
          <Skeleton className="h-24 w-24 shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-24 rounded-md" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartSummarySkeleton() {
  return (
    <aside
      className="h-fit rounded-3xl border border-border bg-card p-5"
      aria-hidden
    >
      <Skeleton className="h-5 w-36" />
      <div className="mt-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="mt-5 h-10 w-full rounded-lg" />
      <Skeleton className="mx-auto mt-3 h-3 w-48" />
    </aside>
  );
}

export function CartPageSkeleton() {
  return (
    <div
      className="mx-auto w-[90%] max-w-6xl py-6 md:w-[80%] md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <header aria-hidden>
        <Skeleton className="h-8 w-28 md:h-10 md:w-36" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]" aria-hidden>
        <CartItemsSkeleton />
        <CartSummarySkeleton />
      </div>
    </div>
  );
}
