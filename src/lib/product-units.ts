export function normalizePiecesPerBox(value?: number | null): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return Math.floor(n);
}

export function totalPieces(
  boxQuantity: number,
  pieceQuantity: number,
  piecesPerBox?: number | null,
): number {
  const boxes = Math.max(0, Math.trunc(boxQuantity) || 0);
  const pieces = Math.max(0, Math.trunc(pieceQuantity) || 0);
  const ppb = normalizePiecesPerBox(piecesPerBox);
  if (boxes > 0 && !ppb) return pieces;
  return boxes * (ppb ?? 0) + pieces;
}

export function resolveCheckoutQuantities(input: {
  quantity?: number;
  boxQuantity?: number;
  pieceQuantity?: number;
  piecesPerBox?: number | null;
}): {
  boxQuantity: number;
  pieceQuantity: number;
  piecesPerBox?: number;
  quantity: number;
} {
  const ppb = normalizePiecesPerBox(input.piecesPerBox);
  const hasBox = input.boxQuantity != null;
  const hasPiece = input.pieceQuantity != null;

  if (hasBox || hasPiece) {
    const boxQuantity = Math.max(0, Math.trunc(input.boxQuantity ?? 0));
    const pieceQuantity = Math.max(0, Math.trunc(input.pieceQuantity ?? 0));
    if (boxQuantity === 0 && pieceQuantity === 0) {
      return { boxQuantity: 0, pieceQuantity: 0, quantity: 0 };
    }
    const quantity = totalPieces(boxQuantity, pieceQuantity, ppb);
    return {
      boxQuantity,
      pieceQuantity,
      ...(ppb ? { piecesPerBox: ppb } : {}),
      quantity,
    };
  }

  const quantity = Math.trunc(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { boxQuantity: 0, pieceQuantity: 0, quantity: 0 };
  }
  return {
    boxQuantity: 0,
    pieceQuantity: quantity,
    ...(ppb ? { piecesPerBox: ppb } : {}),
    quantity,
  };
}

export function splitStockToKorDona(
  stock: number,
  piecesPerBox?: number | null,
): { boxes: number; pieces: number } {
  const total = Math.max(0, Math.trunc(stock) || 0);
  const ppb = normalizePiecesPerBox(piecesPerBox);
  if (!ppb) return { boxes: 0, pieces: total };
  return {
    boxes: Math.floor(total / ppb),
    pieces: total % ppb,
  };
}

export function stockAdjustTotalDelta(
  adjust: { boxAmount?: number; pieceAmount?: number },
  piecesPerBox?: number | null,
): number {
  let delta = 0;
  const boxAmount = Math.trunc(adjust.boxAmount ?? 0);
  const pieceAmount = Math.trunc(adjust.pieceAmount ?? 0);
  const ppb = normalizePiecesPerBox(piecesPerBox);
  if (boxAmount !== 0) {
    if (!ppb) return NaN;
    delta += boxAmount * ppb;
  }
  if (pieceAmount !== 0) delta += pieceAmount;
  return delta;
}

/** Kor/dona matni. `alwaysShowBoth` — omborda: 4 kor / 0 dona */
export function formatUnitsUz(
  boxQuantity: number,
  pieceQuantity: number,
  opts?: { alwaysShowBoth?: boolean },
): string {
  const box = Math.max(0, Math.trunc(boxQuantity) || 0);
  const piece = Math.max(0, Math.trunc(pieceQuantity) || 0);
  if (opts?.alwaysShowBoth || box > 0) {
    return `${box} kor / ${piece} dona`;
  }
  if (piece > 0) return `${piece} dona`;
  return "0 dona";
}

export function formatStockDisplay(
  stock: number,
  piecesPerBox?: number | null,
): string {
  const total = Math.max(0, Math.trunc(stock) || 0);
  const ppb = normalizePiecesPerBox(piecesPerBox);
  if (!ppb) return `${total} dona`;
  const { boxes, pieces } = splitStockToKorDona(total, ppb);
  return formatUnitsUz(boxes, pieces, { alwaysShowBoth: true });
}

export function formatNakladnoyCase(
  boxQuantity?: number | null,
  pieceQuantity?: number | null,
): string {
  const box = Math.max(0, Math.trunc(boxQuantity ?? 0));
  const piece = Math.max(0, Math.trunc(pieceQuantity ?? 0));
  const parts: string[] = [];
  if (box > 0) parts.push(`${box} kor.`);
  if (piece > 0) parts.push(`${piece} dona.`);
  if (!parts.length) return "—";
  return parts.join(" / ");
}
