"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Copy, Heart } from "lucide-react";
import type { Product } from "@/types/product";
import { formatMoney } from "@/lib/format";
import { resolveCompareAtPrice } from "@/lib/pricing";
import { useProductFieldVisible } from "@/components/product/ProductDisplayProvider";
import { useWishlistStore } from "@/store/wishlist";
import { usePriceTier, useProductUnitPrice } from "@/hooks/use-price-tier";
import { useUsdToUzs } from "@/components/fx/ExchangeRateProvider";
import { useProductCartQty } from "@/hooks/use-product-cart-qty";
import { ProductImage } from "@/components/catalog/ProductImage";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductDetailsViewProps {
  product: Product;
}

function ProductCodeRow({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={cn(
        "mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-secondary/80 py-1 pr-1 pl-3",
        className,
      )}
    >
      <span className="truncate text-xs text-muted-foreground">Kod:</span>
      <span className="truncate font-mono text-sm font-semibold tracking-tight text-foreground">
        {code}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-8 shrink-0 rounded-full"
        onClick={() => void handleCopy()}
        aria-label={copied ? "Nusxa olindi" : "Kodni nusxalash"}
        title={copied ? "Nusxa olindi" : "Nusxalash"}
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" strokeWidth={2.5} />
        ) : (
          <Copy className="size-3.5" strokeWidth={2} />
        )}
      </Button>
    </div>
  );
}

function formatBuyerLabel(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return "1 odam shu mahsulotni sotib olgan";
  if (count < 10) return `${count} odam shu mahsulotni sotib olgan`;
  // Social-proof style: 12 → 10+, 127 → 120+
  const rounded = Math.floor(count / 10) * 10;
  return `${rounded}+ odam shu mahsulotni sotib olgan`;
}

function buyerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "X";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function PurchaseSocialProof({
  buyerCount = 0,
  recentBuyers = [],
  compact = false,
}: {
  buyerCount?: number;
  recentBuyers?: Product["recentBuyers"];
  compact?: boolean;
}) {
  if (!buyerCount || buyerCount <= 0) return null;

  const buyers = (recentBuyers ?? []).slice(0, 3);
  const label = formatBuyerLabel(buyerCount);

  return (
    <div className={cn("flex items-center gap-3", compact ? "mt-5" : "mt-6")}>
      {buyers.length > 0 ? (
        <AvatarGroup>
          {buyers.map((buyer, index) => (
            <Avatar key={`${buyer.fullName}-${index}`} size={compact ? "sm" : "default"}>
              {buyer.avatarUrl ? (
                <AvatarImage src={buyer.avatarUrl} alt={buyer.fullName} />
              ) : null}
              <AvatarFallback>{buyerInitials(buyer.fullName)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      ) : null}
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function ProductDetailsView({ product }: ProductDetailsViewProps) {
  const router = useRouter();
  const { qty, setQty, inCart, maxQty, addToCart } = useProductCartQty(product);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const liked = useWishlistStore((s) =>
    s.items.some((item) => item.productId === product.id),
  );
  const [active, setActive] = useState(0);
  const current = product.images[active] ?? product.images[0];
  const unitPrice = useProductUnitPrice(product);
  const priceTier = usePriceTier();
  const usdToUzs = useUsdToUzs();
  const showCode = useProductFieldVisible("code");
  const showPrice = useProductFieldVisible("price");
  const showCompareAt = useProductFieldVisible("compareAtPrice");
  const showBrand = useProductFieldVisible("brand");
  const showSpecs = useProductFieldVisible("specs");
  const showDescription = useProductFieldVisible("description");
  const showBuyerCount = useProductFieldVisible("buyerCount");

  const handleBuy = () => {
    if (addToCart() === "in-cart") router.push("/cart");
  };

  const handleWishlist = () => {
    toggleWishlist(product);
  };

  const renderBuyActions = () => (
    <div className="flex w-full items-center gap-2.5">
      <QuantityStepper
        size="lg"
        value={qty}
        max={maxQty}
        disabled={!product.inStock}
        onChange={setQty}
      />
      <Button
        size="lg"
        className="h-12 min-w-0 flex-1 rounded-full px-5 text-sm font-semibold shadow-lg sm:flex-none sm:px-8"
        onClick={handleBuy}
        disabled={!product.inStock || maxQty <= 0}
      >
        {inCart ? "Savatga qaytish" : "Savatga qo'shish"}
      </Button>
    </div>
  );

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
            onClick={handleWishlist}
            aria-label={liked ? "Sevimlilardan olib tashlash" : "Sevimlilarga"}
            aria-pressed={liked}
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

        <div className="relative mx-auto mt-2 aspect-square w-[86%] max-w-sm overflow-hidden rounded-[2rem] bg-muted">
          <ProductImage
            src={current}
            alt={product.name}
            fill
            priority
            sizes="90vw"
            className="animate-fade-in"
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
                    "relative size-14 overflow-hidden rounded-2xl border-2 bg-muted transition",
                    active === index
                      ? "border-foreground/40 ring-2 ring-foreground/15"
                      : "border-transparent opacity-80",
                  )}
                >
                  <ProductImage
                    src={src}
                    alt=""
                    fill
                    sizes="56px"
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
              {showCode && product.code ? (
                <ProductCodeRow code={product.code} />
              ) : null}
              {showPrice || (showCompareAt && product.compareAtPrice) ? (
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {showPrice ? (
                    <p className="text-xl font-bold tracking-tight tabular-nums">
                      {formatMoney(unitPrice, priceTier)}
                    </p>
                  ) : null}
                  {showCompareAt && product.compareAtPrice ? (
                    <p className="text-sm text-muted-foreground line-through tabular-nums">
                      {formatMoney(
                        resolveCompareAtPrice(
                          product.compareAtPrice,
                          usdToUzs,
                          priceTier,
                        ),
                        priceTier,
                      )}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {showBuyerCount ? (
            <PurchaseSocialProof
              buyerCount={product.buyerCount}
              recentBuyers={product.recentBuyers}
              compact
            />
          ) : null}

          <Separator className="my-5" />

          {showSpecs && product.specs?.length ? (
            <ProductSpecs specs={product.specs} />
          ) : null}
        </div>

        {showDescription && product.description ? (
          <section className="mt-2 w-full px-[5%] pt-6 pb-8">
            <h3 className="text-base font-semibold tracking-tight">Tavsif</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </section>
        ) : null}

        <div
          className={cn(
            "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center",
            "pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))]",
          )}
        >
          <div className="pointer-events-auto w-[90%] max-w-lg">{renderBuyActions()}</div>
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
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-muted">
              <ProductImage
                src={current}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 40vw"
                className="animate-fade-in"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-5 right-5 size-11 rounded-full bg-card/95 shadow-sm"
                onClick={handleWishlist}
                aria-label={liked ? "Sevimlilardan olib tashlash" : "Sevimlilarga"}
                aria-pressed={liked}
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
                        "relative size-20 overflow-hidden rounded-2xl border-2 bg-muted transition",
                        active === index
                          ? "border-foreground/40 ring-2 ring-foreground/15"
                          : "border-transparent opacity-75 hover:opacity-100",
                      )}
                    >
                      <ProductImage
                        src={src}
                        alt=""
                        fill
                        sizes="80px"
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
            {showCode && product.code ? (
              <ProductCodeRow code={product.code} />
            ) : null}
            {showBrand && product.brand ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {product.brand}
              </p>
            ) : null}

            {showPrice || (showCompareAt && product.compareAtPrice) ? (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-3">
                  {showPrice ? (
                    <p className="text-3xl font-bold tracking-tight tabular-nums">
                      {formatMoney(unitPrice, priceTier)}
                    </p>
                  ) : null}
                  {showCompareAt && product.compareAtPrice ? (
                    <p className="text-base text-muted-foreground line-through tabular-nums">
                      {formatMoney(
                        resolveCompareAtPrice(
                          product.compareAtPrice,
                          usdToUzs,
                          priceTier,
                        ),
                        priceTier,
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {showBuyerCount ? (
              <PurchaseSocialProof
                buyerCount={product.buyerCount}
                recentBuyers={product.recentBuyers}
              />
            ) : null}

            <Separator className="my-8" />

            {showSpecs && product.specs?.length ? (
              <ProductSpecs specs={product.specs} />
            ) : null}

            <div className="mt-10 max-w-md">{renderBuyActions()}</div>
          </div>
        </div>

        {showDescription && product.description ? (
          <section className="mt-14 w-full border-t border-border pt-10">
            <h2 className="text-lg font-semibold tracking-tight">Tavsif</h2>
            <p className="mt-3 max-w-none text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
