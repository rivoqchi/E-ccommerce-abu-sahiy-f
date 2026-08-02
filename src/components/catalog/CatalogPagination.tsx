import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  buildCatalogHref,
  getPaginationItems,
  type CatalogQuery,
} from "@/lib/catalog";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  query: Omit<CatalogQuery, "page">;
}

export function CatalogPagination({
  page,
  totalPages,
  query,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages);
  const prevHref =
    page > 1 ? buildCatalogHref({ ...query, page: page - 1 }) : undefined;
  const nextHref =
    page < totalPages
      ? buildCatalogHref({ ...query, page: page + 1 })
      : undefined;

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Oldingi"
            href={prevHref}
            aria-disabled={!prevHref}
            className={!prevHref ? "pointer-events-none opacity-40" : undefined}
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`e-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={buildCatalogHref({ ...query, page: item })}
                isActive={item === page}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text="Keyingi"
            href={nextHref}
            aria-disabled={!nextHref}
            className={!nextHref ? "pointer-events-none opacity-40" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
