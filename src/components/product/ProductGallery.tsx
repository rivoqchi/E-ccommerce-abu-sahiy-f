"use client";

import { useState } from "react";
import { ProductImage } from "@/components/catalog/ProductImage";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-background-elevated">
        <ProductImage
          src={current}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover animate-fade-in"
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
                className={`relative h-16 w-16 overflow-hidden rounded-sm border transition ${
                  active === index
                    ? "border-accent ring-1 ring-accent"
                    : "border-border opacity-80 hover:opacity-100"
                }`}
              >
                <ProductImage
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
