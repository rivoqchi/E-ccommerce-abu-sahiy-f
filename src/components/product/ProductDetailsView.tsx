"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { formatUZS } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { ProductImage } from "@/components/catalog/ProductImage";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const BUYERS = [
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    alt: "A",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    alt: "B",
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    alt: "C",
  },
];

interface ProductDetailsViewProps {
  product: Product;
}

export function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const current = product.images[active] ?? product.images[0];

  const handleBuy = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl pb-28 md:pb-10">
      {/* Mobile Sense layout */}
      <div className="md:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-background/90 px-[5%] py-3 backdrop-blur-md">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-card shadow-[var(--shadow-soft)]"
            onClick={() => router.back()}
            aria-label="Orqaga"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} />
          </Button>
          <h1 className="text-base font-semibold tracking-tight">Tafsilotlar</h1>
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-full bg-card shadow-[var(--shadow-soft)]"
            onClick={() => setLiked((v) => !v)}
            aria-label="Sevimlilarga"
          >
            <Heart
              className={cn(
                "size-[18px]",
                liked && "fill-red-500 text-red-500",
              )}
              strokeWidth={1.75}
            />
          </Button>
        </header>

        <div className="relative mx-auto mt-2 aspect-[4/5] w-[86%] max-w-sm overflow-hidden rounded-[2rem] bg-secondary">
          <ProductImage
            src={current}
            alt={product.name}
            fill
            priority
            sizes="90vw"
            className="object-cover animate-fade-in"
          />
        </div>

        {product.images.length > 1 ? (
          <ul className="mt-4 flex justify-center gap-2.5 px-[5%]">
            {product.images.map((src, index) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`${product.name} — ${index + 1}-rasm`}
                  className={cn(
                    "relative size-14 overflow-hidden rounded-2xl border-2 transition",
                    active === index
                      ? "border-sky-400 ring-2 ring-sky-400/30"
                      : "border-transparent opacity-80",
                  )}
                >
                  <ProductImage
                    src={src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5 rounded-t-[2rem] bg-card px-[5%] pt-6 pb-8 shadow-[0_-8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {product.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-xl font-bold tracking-tight tabular-nums">
                  {formatUZS(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-muted-foreground line-through tabular-nums">
                    {formatUZS(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="inline-flex h-10 shrink-0 items-center gap-3 rounded-full bg-secondary px-3">
              <button
                type="button"
                aria-label="Kamaytirish"
                className="text-lg leading-none text-muted-foreground transition hover:text-foreground"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" strokeWidth={2.5} />
              </button>
              <span className="min-w-4 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Ko'paytirish"
                className="text-lg leading-none text-muted-foreground transition hover:text-foreground"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <AvatarGroup>
              {BUYERS.map((buyer) => (
                <Avatar key={buyer.alt} size="sm">
                  <AvatarImage src={buyer.src} alt={buyer.alt} />
                  <AvatarFallback>{buyer.alt}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
            <p className="text-xs text-muted-foreground">
              120+ odam sotib olgan
            </p>
          </div>

          <Separator className="my-5" />

          <h3 className="text-base font-semibold tracking-tight">Tavsif</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center",
            "pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))]",
          )}
        >
          <div className="pointer-events-auto flex w-[90%] max-w-lg items-center gap-3">
            <Button
              variant="secondary"
              size="icon-lg"
              className="size-14 shrink-0 rounded-2xl bg-card shadow-[var(--shadow-soft)]"
              onClick={handleBuy}
              disabled={!product.inStock}
              aria-label="Savatga"
            >
              <ShoppingBag className="size-5" strokeWidth={1.75} />
            </Button>
            <Button
              size="lg"
              className="h-14 flex-1 rounded-full text-base font-semibold shadow-lg"
              onClick={handleBuy}
              disabled={!product.inStock}
            >
              {added ? "Qo'shildi ✓" : "Sotib olish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sense layout */}
      <div className="hidden md:block">
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Sahifa yo'li"
        >
          <Link href="/" className="hover:text-foreground">
            Bosh sahifa
          </Link>
          <span aria-hidden>/</span>
          <Link href="/catalog" className="hover:text-foreground">
            Katalog
          </Link>
          <span aria-hidden>/</span>
          <span className="line-clamp-1 text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-secondary lg:aspect-square">
              <ProductImage
                src={current}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 40vw"
                className="object-cover animate-fade-in"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-5 right-5 size-11 rounded-full bg-card/95 shadow-sm"
                onClick={() => setLiked((v) => !v)}
                aria-label="Sevimlilarga"
              >
                <Heart
                  className={cn(
                    "size-[18px]",
                    liked && "fill-red-500 text-red-500",
                  )}
                  strokeWidth={1.75}
                />
              </Button>
            </div>

            {product.images.length > 1 ? (
              <ul className="mt-4 flex gap-3">
                {product.images.map((src, index) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`${product.name} — ${index + 1}-rasm`}
                      className={cn(
                        "relative size-20 overflow-hidden rounded-2xl border-2 transition",
                        active === index
                          ? "border-sky-400 ring-2 ring-sky-400/30"
                          : "border-transparent opacity-75 hover:opacity-100",
                      )}
                    >
                      <ProductImage
                        src={src}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.brand}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {formatUZS(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-base text-muted-foreground line-through tabular-nums">
                    {formatUZS(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>

              <div className="inline-flex h-11 items-center gap-4 rounded-full bg-secondary px-4">
                <button
                  type="button"
                  aria-label="Kamaytirish"
                  className="text-muted-foreground transition hover:text-foreground"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-5 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Ko'paytirish"
                  className="text-muted-foreground transition hover:text-foreground"
                  onClick={() => setQty((q) => q + 1)}
                >
                  <Plus className="size-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <AvatarGroup>
                {BUYERS.map((buyer) => (
                  <Avatar key={buyer.alt}>
                    <AvatarImage src={buyer.src} alt={buyer.alt} />
                    <AvatarFallback>{buyer.alt}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <p className="text-sm text-muted-foreground">
                120+ odam shu mahsulotni sotib olgan
              </p>
            </div>

            <Separator className="my-8" />

            <h2 className="text-lg font-semibold tracking-tight">Tavsif</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-10 flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon-lg"
                className="size-14 shrink-0 rounded-2xl"
                onClick={handleBuy}
                disabled={!product.inStock}
                aria-label="Savatga"
              >
                <ShoppingBag className="size-5" strokeWidth={1.75} />
              </Button>
              <Button
                size="lg"
                className="h-14 flex-1 rounded-full text-base font-semibold"
                onClick={handleBuy}
                disabled={!product.inStock}
              >
                {added ? "Qo'shildi ✓" : "Sotib olish"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
