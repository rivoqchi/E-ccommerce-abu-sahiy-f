export type PriceTier = "retail" | "wholesale";

export function resolveUnitPrice(
  product: { price: number; wholesalePrice?: number },
  tier: PriceTier | string | null | undefined = "retail",
): number {
  const retail = Number(product.price) || 0;
  if (tier === "wholesale") {
    const wholesale = Number(product.wholesalePrice);
    if (Number.isFinite(wholesale) && wholesale >= 0) {
      return wholesale;
    }
  }
  return retail;
}
