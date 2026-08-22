"use client";

import { useState, type MouseEvent } from "react";
import { X } from "lucide-react";
import { ProductImage } from "@/components/catalog/ProductImage";
import { resolveProductImage } from "@/lib/product-image";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "size-10",
  md: "size-14",
  lg: "size-16",
} as const;

export function ProductThumb({
  src,
  alt,
  size = "md",
  className,
  zoom = true,
}: {
  src?: string | null;
  alt: string;
  size?: keyof typeof SIZE;
  className?: string;
  zoom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const url = resolveProductImage(src);
  const hasImage = Boolean(src?.trim()) && url !== PRODUCT_IMAGE_PLACEHOLDER;
  const canZoom = zoom && hasImage;

  const Wrap = canZoom ? "button" : "span";

  return (
    <>
      <Wrap
        {...(canZoom
          ? {
              type: "button" as const,
              onClick: (e: MouseEvent) => {
                e.stopPropagation();
                setOpen(true);
              },
              "aria-label": `${alt} — kattalashtirish`,
            }
          : {})}
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/60",
          SIZE[size],
          canZoom
            ? "cursor-zoom-in hover:ring-foreground/30"
            : "cursor-default",
          className,
        )}
      >
        <ProductImage src={url} alt={alt} fill className="size-full" />
      </Wrap>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Yopish"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            className="max-h-[90dvh] max-w-[min(96vw,920px)] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
