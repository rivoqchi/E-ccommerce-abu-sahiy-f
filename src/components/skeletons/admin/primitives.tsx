import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AdminSkeletonRoot({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("space-y-6", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <div aria-hidden>{children}</div>
    </div>
  );
}

export function AdminPageHeaderSkeleton({
  titleWidth = "w-48",
  subtitle = false,
  action = false,
}: {
  titleWidth?: string;
  subtitle?: boolean;
  action?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <Skeleton className={cn("h-8 md:h-9", titleWidth)} />
        {subtitle ? <Skeleton className="mt-2 h-4 w-72 max-w-full" /> : null}
      </div>
      {action ? <Skeleton className="h-10 w-28 rounded-full" /> : null}
    </div>
  );
}

export function AdminSearchToolbarSkeleton({
  filters = false,
}: {
  filters?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Skeleton className="h-12 max-w-md flex-1 rounded-2xl" />
      {filters ? (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      ) : null}
    </div>
  );
}

export function AdminTableCardSkeleton({
  columns,
  rows = 6,
  renderRow,
  footer,
}: {
  columns: React.ReactNode;
  rows?: number;
  renderRow: (index: number) => React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
      <CardContent className="px-0 py-2">
        <Table>
          <TableHeader>{columns}</TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>{renderRow(i)}</TableRow>
            ))}
          </TableBody>
        </Table>
        {footer}
      </CardContent>
    </Card>
  );
}

export function AdminCellSkeleton({
  className,
  width = "w-24",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <TableCell className={className}>
      <Skeleton className={cn("h-4", width)} />
    </TableCell>
  );
}

export function AdminImageCellSkeleton({ className }: { className?: string }) {
  return (
    <TableCell className={className}>
      <Skeleton className="size-12 rounded-xl" />
    </TableCell>
  );
}

export function AdminAvatarNameCellSkeleton({ className }: { className?: string }) {
  return (
    <TableCell className={className}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </TableCell>
  );
}

export function AdminActionsCellSkeleton({
  className,
  count = 2,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <TableCell className={cn("text-right", className)}>
      <div className="flex items-center justify-end gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
    </TableCell>
  );
}

export function AdminStatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0"
        >
          <CardContent className="flex items-center gap-4 px-5 py-5">
            <Skeleton className="size-11 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-14" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminPaginationSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}
