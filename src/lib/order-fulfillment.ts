export type FulfillmentStatus = "given" | "unavailable" | "substituted";

export type OrderSubstitute = {
  productId?: string;
  name: string;
  slug?: string;
  quantity: number;
  unitPrice: number;
  source?: "store" | "hamkor" | string;
  partnerName?: string;
  image?: string;
};

export type FulfillableItem = {
  name: string;
  slug?: string;
  quantity: number;
  boxQuantity?: number;
  pieceQuantity?: number;
  piecesPerBox?: number;
  unitPrice: number;
  source?: "store" | "hamkor" | string;
  partnerName?: string;
  givenQuantity?: number;
  fulfillmentStatus?: FulfillmentStatus | string;
  substitutes?: OrderSubstitute[];
  image?: string;
};

export function isUnavailable(item: FulfillableItem) {
  return item.fulfillmentStatus === "unavailable";
}

export function givenQty(item: FulfillableItem) {
  if (isUnavailable(item)) return 0;
  const given = Number(item.givenQuantity);
  if (Number.isFinite(given)) return Math.max(0, given);
  return item.quantity;
}

export function originalLineTotal(item: FulfillableItem) {
  return item.quantity * item.unitPrice;
}

export function billedLineTotal(item: FulfillableItem) {
  const orig = givenQty(item) * item.unitPrice;
  const subs = (item.substitutes ?? []).reduce(
    (sum, sub) => sum + sub.quantity * sub.unitPrice,
    0,
  );
  return orig + subs;
}

export function itemFulfillmentLabel(item: FulfillableItem) {
  const given = givenQty(item);
  const subs = item.substitutes?.length ?? 0;
  if (isUnavailable(item) || given === 0) return "Qolmagan";
  if (item.fulfillmentStatus === "substituted" || subs > 0) {
    return "Almashtirilgan";
  }
  if (given < item.quantity) return `Berildi ${given}/${item.quantity}`;
  return null;
}

export function hasFulfillmentChange(item: FulfillableItem) {
  if (isUnavailable(item)) return true;
  if ((item.substitutes?.length ?? 0) > 0) return true;
  return givenQty(item) !== item.quantity;
}
