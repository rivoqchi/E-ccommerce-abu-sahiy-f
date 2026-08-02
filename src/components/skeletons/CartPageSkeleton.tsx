import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function CartItemsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card
      className="gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border"
      aria-hidden
    >
      <ul>
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i}>
            {i > 0 ? <Separator /> : null}
            <div className="flex gap-4 p-4 sm:p-5">
              <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-[75%]" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-24 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CartSummarySkeleton() {
  return (
    <Card
      className="h-fit gap-0 overflow-hidden rounded-3xl py-0 shadow-none ring-1 ring-border"
      aria-hidden
    >
      <CardHeader className="px-5 pt-5 pb-0">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-3 px-5 py-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Separator />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-2 h-11 w-full rounded-full" />
      </CardContent>
    </Card>
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
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]" aria-hidden>
        <CartItemsSkeleton />
        <CartSummarySkeleton />
      </div>
    </div>
  );
}
