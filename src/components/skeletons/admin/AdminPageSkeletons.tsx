import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TableHead, TableRow } from "@/components/ui/table";
import {
  AdminActionsCellSkeleton,
  AdminAvatarNameCellSkeleton,
  AdminCellSkeleton,
  AdminImageCellSkeleton,
  AdminPageHeaderSkeleton,
  AdminPaginationSkeleton,
  AdminSearchToolbarSkeleton,
  AdminSkeletonRoot,
  AdminStatCardsSkeleton,
  AdminTableCardSkeleton,
} from "./primitives";

export function AdminShellSkeleton() {
  return (
    <div
      className="flex min-h-[100dvh] bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="px-5 py-6">
          <Skeleton className="h-3 w-24 bg-sidebar-accent" />
          <Skeleton className="mt-2 h-6 w-16 bg-sidebar-accent" />
        </div>
        <nav className="flex-1 space-y-2 px-3 pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-full rounded-xl bg-sidebar-accent"
            />
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <Skeleton className="h-10 w-full rounded-xl bg-sidebar-accent" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-8">
          <Skeleton className="size-9 rounded-md md:hidden" />
          <div className="min-w-0 flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-8 w-20 rounded-full sm:block" />
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <AdminDashboardSkeleton />
        </main>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-40" />
      <AdminStatCardsSkeleton />
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0 md:col-span-1">
          <CardContent className="space-y-3 px-5 py-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0 md:col-span-2">
          <CardContent className="px-5 py-5">
            <Skeleton className="mb-3 h-4 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSkeletonRoot>
  );
}

export function AdminXitoyPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-56" subtitle />
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <AdminTableCardSkeleton
          columns={
            <TableRow>
              {Array.from({ length: 12 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-14" />
                </TableHead>
              ))}
            </TableRow>
          }
          rows={5}
          renderRow={() => (
            <>
              <AdminImageCellSkeleton />
              <AdminCellSkeleton width="w-32" />
              <AdminCellSkeleton className="text-right" width="w-12" />
              <AdminCellSkeleton className="text-right" width="w-10" />
              <AdminCellSkeleton className="text-right" width="w-10" />
              <AdminCellSkeleton className="text-right" width="w-14" />
              <AdminCellSkeleton className="text-right" width="w-14" />
              <AdminCellSkeleton className="text-right" width="w-14" />
              <AdminCellSkeleton className="text-right" width="w-16" />
              <AdminCellSkeleton className="text-right" width="w-10" />
              <AdminCellSkeleton className="text-right" width="w-10" />
              <AdminActionsCellSkeleton count={2} />
            </>
          )}
        />
      </div>
    </AdminSkeletonRoot>
  );
}

export function AdminBrandsPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-32" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminCellSkeleton className="pl-5" width="w-28" />
            <AdminCellSkeleton width="w-24" />
            <AdminCellSkeleton width="w-14" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminCategoriesPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-40" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminImageCellSkeleton className="pl-5" />
            <AdminCellSkeleton width="w-32" />
            <AdminCellSkeleton width="w-24" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminProductsPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <Skeleton className="h-11 w-full max-w-xl rounded-2xl" />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableHead key={i} className={i === 0 ? "pl-5" : i === 9 ? "pr-5" : ""}>
                <Skeleton className="h-4 w-12" />
              </TableHead>
            ))}
          </TableRow>
        }
        rows={8}
        renderRow={() => (
          <>
            <AdminImageCellSkeleton className="pl-5" />
            <AdminCellSkeleton width="w-36" />
            <AdminCellSkeleton width="w-16" />
            <AdminCellSkeleton width="w-16" />
            <AdminCellSkeleton width="w-14" />
            <AdminCellSkeleton width="w-10" />
            <AdminCellSkeleton width="w-20" />
            <AdminCellSkeleton width="w-24" />
            <AdminCellSkeleton width="w-14" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
        footer={<AdminPaginationSkeleton />}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminHamkorPartnersPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-32" subtitle action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminImageCellSkeleton className="pl-5" />
            <AdminCellSkeleton width="w-32" />
            <AdminCellSkeleton width="w-24" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminHamkorCategoriesPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-40" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-10" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminImageCellSkeleton className="pl-5" />
            <AdminCellSkeleton width="w-28" />
            <AdminCellSkeleton width="w-32" />
            <AdminCellSkeleton width="w-24" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminStoriesPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-36" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-14" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminAvatarNameCellSkeleton />
            <AdminCellSkeleton width="w-40" />
            <AdminCellSkeleton width="w-14" />
            <AdminActionsCellSkeleton count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminUsersPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-44" />
      <AdminSearchToolbarSkeleton filters />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            {["pl-5", "", "", "", "", "", "pr-5"].map((cls, i) => (
              <TableHead key={i} className={cls}>
                <Skeleton className="h-4 w-14" />
              </TableHead>
            ))}
          </TableRow>
        }
        rows={7}
        renderRow={() => (
          <>
            <AdminCellSkeleton className="pl-5" width="w-32" />
            <AdminCellSkeleton width="w-28" />
            <AdminCellSkeleton width="w-20" />
            <AdminCellSkeleton width="w-16" />
            <AdminCellSkeleton width="w-14" />
            <AdminCellSkeleton width="w-20" />
            <AdminActionsCellSkeleton className="pr-5" count={3} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminSellersPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-36" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-14" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        renderRow={() => (
          <>
            <AdminAvatarNameCellSkeleton className="pl-5" />
            <AdminCellSkeleton width="w-28" />
            <AdminCellSkeleton width="w-24" />
            <AdminCellSkeleton width="w-14" />
            <AdminActionsCellSkeleton className="pr-5" count={2} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminOrdersPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <AdminPageHeaderSkeleton titleWidth="w-36" action />
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-8" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-12" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-14" />
            </TableHead>
          </TableRow>
        }
        rows={6}
        renderRow={() => (
          <>
            <AdminCellSkeleton className="pl-5 font-mono" width="w-12" />
            <AdminCellSkeleton width="w-28" />
            <AdminCellSkeleton width="w-40" />
            <AdminCellSkeleton width="w-16" />
            <AdminCellSkeleton width="w-16" />
            <AdminActionsCellSkeleton className="pr-5" count={3} />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminSoldPageSkeleton() {
  return (
    <AdminSkeletonRoot>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Skeleton className="h-8 w-52" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
      <AdminTableCardSkeleton
        columns={
          <TableRow>
            <TableHead className="pl-5">
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-14" />
            </TableHead>
            <TableHead className="pr-5 text-right">
              <Skeleton className="ml-auto h-4 w-12" />
            </TableHead>
          </TableRow>
        }
        rows={6}
        renderRow={() => (
          <>
            <AdminCellSkeleton className="pl-5" width="w-40" />
            <AdminCellSkeleton width="w-10" />
            <AdminCellSkeleton className="pr-5 text-right" width="w-20" />
          </>
        )}
      />
    </AdminSkeletonRoot>
  );
}

export function AdminSettingsPageSkeleton() {
  return (
    <AdminSkeletonRoot className="mx-auto max-w-xl">
      <AdminPageHeaderSkeleton titleWidth="w-32" />
      <Card className="rounded-3xl border-0 py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="size-10 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </CardContent>
      </Card>
    </AdminSkeletonRoot>
  );
}

export function AdminProductTableRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <AdminImageCellSkeleton className="pl-5" />
          <AdminCellSkeleton width="w-36" />
          <AdminCellSkeleton width="w-16" />
          <AdminCellSkeleton width="w-16" />
          <AdminCellSkeleton width="w-14" />
          <AdminCellSkeleton width="w-10" />
          <AdminCellSkeleton width="w-20" />
          <AdminCellSkeleton width="w-24" />
          <AdminCellSkeleton width="w-14" />
          <AdminActionsCellSkeleton className="pr-5" count={2} />
        </TableRow>
      ))}
    </>
  );
}

export function AdminXitoyTableRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <AdminImageCellSkeleton />
          <AdminCellSkeleton width="w-32" />
          <AdminCellSkeleton className="text-right" width="w-12" />
          <AdminCellSkeleton className="text-right" width="w-10" />
          <AdminCellSkeleton className="text-right" width="w-10" />
          <AdminCellSkeleton className="text-right" width="w-14" />
          <AdminCellSkeleton className="text-right" width="w-14" />
          <AdminCellSkeleton className="text-right" width="w-14" />
          <AdminCellSkeleton className="text-right" width="w-16" />
          <AdminCellSkeleton className="text-right" width="w-10" />
          <AdminCellSkeleton className="text-right" width="w-10" />
          <AdminActionsCellSkeleton count={2} />
        </TableRow>
      ))}
    </>
  );
}

export function AdminDisplaySettingsSkeleton() {
  return (
    <div className="space-y-5" aria-hidden>
      <section>
        <Skeleton className="mb-2 h-3 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-7 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </section>
      <section>
        <Skeleton className="mb-2 h-3 w-28" />
        <Skeleton className="mb-2 h-10 w-full rounded-2xl" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AdminPickerResultsSkeleton() {
  return (
    <ul className="mt-1 max-h-40 space-y-1 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-3 w-16" />
        </li>
      ))}
    </ul>
  );
}
