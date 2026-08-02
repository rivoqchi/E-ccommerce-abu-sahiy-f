"use client";

import { useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
        <ProductImage
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="animate-fade-in"
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${name} rasm ${index + 1}`}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-xl border-2 bg-muted transition",
                  active === index
                    ? "border-foreground/40 ring-1 ring-foreground/15"
                    : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <ProductImage
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
