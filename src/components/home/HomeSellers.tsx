import type { StorefrontSeller } from "@/lib/storefront-api";

interface HomeSellersProps {
  sellers: StorefrontSeller[];
}

function telegramHref(username?: string) {
  if (!username) return null;
  const clean = username.replace(/^@+/, "");
  return clean ? `https://t.me/${clean}` : null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function HomeSellers({ sellers }: HomeSellersProps) {
  if (!sellers.length) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Sotuvchilar
      </h2>

      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sellers.map((seller) => {
          const tg = telegramHref(seller.telegramUsername);
          const href = tg ?? (seller.phone ? `tel:${seller.phone}` : undefined);
          const username = seller.telegramUsername?.replace(/^@+/, "");

          return (
            <li
              key={seller.id}
              className="flex w-[7.5rem] shrink-0 flex-col items-center text-center"
            >
              {href ? (
                <a
                  href={href}
                  target={tg ? "_blank" : undefined}
                  rel={tg ? "noopener noreferrer" : undefined}
                  className="group flex w-full flex-col items-center"
                  aria-label={`${seller.fullName} — Telegram`}
                >
                  <span className="relative size-20 overflow-hidden rounded-full bg-muted ring-2 ring-border transition group-hover:ring-foreground/30 sm:size-24">
                    {seller.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seller.avatarUrl}
                        alt={seller.fullName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                        {initials(seller.fullName)}
                      </span>
                    )}
                  </span>
                  <span className="mt-2.5 line-clamp-2 w-full text-sm font-semibold leading-snug text-foreground">
                    {seller.fullName}
                  </span>
                  {username ? (
                    <span className="mt-0.5 line-clamp-1 w-full text-xs font-medium text-sky-600 dark:text-sky-400">
                      @{username}
                    </span>
                  ) : null}
                  <span className="mt-0.5 line-clamp-1 w-full text-xs text-muted-foreground">
                    {seller.phone}
                  </span>
                </a>
              ) : (
                <div className="flex w-full flex-col items-center">
                  <span className="relative size-20 overflow-hidden rounded-full bg-muted ring-2 ring-border sm:size-24">
                    {seller.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seller.avatarUrl}
                        alt={seller.fullName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                        {initials(seller.fullName)}
                      </span>
                    )}
                  </span>
                  <span className="mt-2.5 line-clamp-2 w-full text-sm font-semibold leading-snug text-foreground">
                    {seller.fullName}
                  </span>
                  <span className="mt-0.5 line-clamp-1 w-full text-xs text-muted-foreground">
                    {seller.phone}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
