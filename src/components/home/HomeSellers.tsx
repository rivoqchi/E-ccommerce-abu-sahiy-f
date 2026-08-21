"use client";

import { useState } from "react";
import { Phone, Send } from "lucide-react";
import type { StorefrontSeller } from "@/lib/storefront-api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HomeSellersProps {
  sellers: StorefrontSeller[];
}

function telegramHref(username?: string) {
  if (!username) return null;
  const clean = username.replace(/^@+/, "");
  return clean ? `https://t.me/${clean}` : null;
}

function telHref(phone?: string) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SellerPhoto({
  seller,
  className,
  imgClassName,
}: {
  seller: StorefrontSeller;
  className?: string;
  imgClassName?: string;
}) {
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(seller.avatarUrl) && !broken;

  return (
    <span className={className}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={seller.avatarUrl}
          alt={seller.fullName}
          className={imgClassName}
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
          {initials(seller.fullName)}
        </span>
      )}
    </span>
  );
}

export function HomeSellers({ sellers }: HomeSellersProps) {
  const [selected, setSelected] = useState<StorefrontSeller | null>(null);

  if (!sellers.length) return null;

  const tg = telegramHref(selected?.telegramUsername);
  const tel = telHref(selected?.phone);
  const username = selected?.telegramUsername?.replace(/^@+/, "");

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Sotuvchilar
      </h2>

      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sellers.map((seller) => {
          const handle = seller.telegramUsername?.replace(/^@+/, "");

          return (
            <li key={seller.id} className="w-[7.5rem] shrink-0">
              <button
                type="button"
                onClick={() => setSelected(seller)}
                className="group flex w-full flex-col items-center text-center outline-none"
                aria-label={`${seller.fullName} maʼlumotlari`}
              >
                <SellerPhoto
                  key={seller.id}
                  seller={seller}
                  className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-border transition group-hover:ring-foreground/30 group-active:scale-[0.98]"
                  imgClassName="size-full object-cover object-top"
                />
                <span className="mt-2.5 line-clamp-2 w-full text-sm font-semibold leading-snug text-foreground">
                  {seller.fullName}
                </span>
                {handle ? (
                  <span className="mt-0.5 line-clamp-1 w-full text-xs font-medium text-sky-600 dark:text-sky-400">
                    @{handle}
                  </span>
                ) : null}
                <span className="mt-0.5 line-clamp-1 w-full text-xs text-muted-foreground">
                  {seller.phone}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader className="items-center text-center pr-0">
                <DialogTitle className="text-lg font-semibold">
                  {selected.fullName}
                </DialogTitle>
              </DialogHeader>

              <SellerPhoto
                key={selected.id}
                seller={selected}
                className="relative mx-auto flex aspect-[3/4] w-full max-w-[13.5rem] items-center justify-center overflow-hidden rounded-2xl bg-muted"
                imgClassName="size-full object-cover object-top"
              />

              <div className="space-y-1 text-center">
                {username ? (
                  <p className="text-sm font-medium text-sky-600 dark:text-sky-400">
                    @{username}
                  </p>
                ) : null}
                {selected.phone ? (
                  <p className="text-sm text-muted-foreground">{selected.phone}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                {tg ? (
                  <Button
                    nativeButton={false}
                    render={
                      <a href={tg} target="_blank" rel="noopener noreferrer" />
                    }
                    className="h-10 w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
                  >
                    <Send className="size-4" strokeWidth={2} />
                    Telegramdan yozish
                  </Button>
                ) : null}
                {tel ? (
                  <Button
                    nativeButton={false}
                    variant={tg ? "outline" : "default"}
                    render={<a href={tel} />}
                    className="h-10 w-full gap-2"
                  >
                    <Phone className="size-4" strokeWidth={2} />
                    Telefon qilish
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
