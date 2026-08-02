"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-image";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/types/product";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Native img for product media — avoids Next `/_next/image` 400 on
 * localhost API uploads and arbitrary admin image hosts.
 */
export function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  priority,
  className,
}: ProductImageProps) {
  const [current, setCurrent] = useState(() => resolveProductImage(src));

  useEffect(() => {
    setCurrent(resolveProductImage(src));
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- product CDN/upload URLs are not always in next.config
    <img
      src={current}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn(fill && "absolute inset-0 size-full", className)}
      onError={() => {
        if (current !== PRODUCT_IMAGE_PLACEHOLDER) {
          setCurrent(PRODUCT_IMAGE_PLACEHOLDER);
        }
      }}
    />
  );
}
