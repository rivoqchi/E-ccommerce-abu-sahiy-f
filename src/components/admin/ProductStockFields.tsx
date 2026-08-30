"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatUnitsUz, splitStockToKorDona, stockAdjustTotalDelta } from "@/lib/product-units";
import { cn } from "@/lib/utils";

export type ProductStockFormState = {
  piecesPerBox: string;
  stock: string;
  stockAdjustBoxes: string;
  stockAdjustPieces: string;
};

export const emptyStockForm: ProductStockFormState = {
  piecesPerBox: "",
  stock: "0",
  stockAdjustBoxes: "",
  stockAdjustPieces: "",
};

type ProductStockFieldsProps = {
  value: ProductStockFormState;
  onChange: (next: ProductStockFormState) => void;
  isEditing: boolean;
  className?: string;
};

export function ProductStockFields({
  value,
  onChange,
  isEditing,
  className,
}: ProductStockFieldsProps) {
  const ppb = Number(value.piecesPerBox);
  const hasPpb = Number.isFinite(ppb) && ppb >= 1;
  const stockNum = Number(value.stock);
  const stockBreakdown = useMemo(
    () =>
      splitStockToKorDona(
        Number.isFinite(stockNum) ? stockNum : 0,
        hasPpb ? ppb : undefined,
      ),
    [stockNum, hasPpb, ppb],
  );

  const adjustPreview = useMemo(() => {
    if (!isEditing || !hasPpb) return null;
    const adjust = buildStockAdjustPayload(value, hasPpb);
    if (!adjust) return null;
    const delta = stockAdjustTotalDelta(adjust, ppb);
    if (!Number.isFinite(delta) || delta === 0) return null;
    const nextTotal = Math.max(0, (Number.isFinite(stockNum) ? stockNum : 0) + delta);
    const next = splitStockToKorDona(nextTotal, ppb);
    return {
      delta,
      nextTotal,
      label: formatUnitsUz(next.boxes, next.pieces, { alwaysShowBoth: true }),
    };
  }, [isEditing, hasPpb, value, ppb, stockNum]);

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pieces-per-box">Karobkada nechta dona</Label>
          <Input
            id="pieces-per-box"
            inputMode="numeric"
            placeholder="Masalan: 4"
            value={value.piecesPerBox}
            onChange={(e) =>
              onChange({ ...value, piecesPerBox: e.target.value })
            }
            className="h-11"
          />
        </div>
        {isEditing ? (
          <div className="space-y-1.5">
            <Label>Ombor (hozir)</Label>
            <div className="flex h-11 items-center rounded-lg border border-input bg-background px-3 text-sm">
              {hasPpb
                ? formatUnitsUz(stockBreakdown.boxes, stockBreakdown.pieces, {
                    alwaysShowBoth: true,
                  })
                : `${Math.max(0, stockNum || 0)} dona`}
              <span className="ml-2 text-muted-foreground">
                (jami {Math.max(0, stockNum || 0)} dona)
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="initial-stock">Boshlang&apos;ich ombor (dona)</Label>
            <Input
              id="initial-stock"
              inputMode="numeric"
              value={value.stock}
              onChange={(e) => onChange({ ...value, stock: e.target.value })}
              className="h-11"
            />
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Label>Omborga qo&apos;shish (saqlashda)</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="stock-adjust-boxes"
                className="text-xs text-muted-foreground"
              >
                Kor
              </Label>
              <Input
                id="stock-adjust-boxes"
                inputMode="numeric"
                placeholder="0"
                disabled={!hasPpb}
                value={value.stockAdjustBoxes}
                onChange={(e) =>
                  onChange({ ...value, stockAdjustBoxes: e.target.value })
                }
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="stock-adjust-pieces"
                className="text-xs text-muted-foreground"
              >
                Dona
              </Label>
              <Input
                id="stock-adjust-pieces"
                inputMode="numeric"
                placeholder="0"
                value={value.stockAdjustPieces}
                onChange={(e) =>
                  onChange({ ...value, stockAdjustPieces: e.target.value })
                }
                className="h-11"
              />
            </div>
          </div>
          {!hasPpb ? (
            <p className="text-xs text-muted-foreground">
              Kor qo&apos;shish uchun avval «Karobkada nechta dona» maydonini
              to&apos;ldiring.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Ikkala maydonni bir vaqtda to&apos;ldirish mumkin (masalan: 4 kor
              + 5 dona = 45 dona jami).
            </p>
          )}
          {adjustPreview ? (
            <p className="text-xs font-medium text-foreground">
              Saqlagandan keyin: {adjustPreview.label} (jami{" "}
              {adjustPreview.nextTotal} dona, +{adjustPreview.delta})
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export type StockAdjustPayload = {
  boxAmount?: number;
  pieceAmount?: number;
};

export function buildStockAdjustPayload(
  value: ProductStockFormState,
  hasPiecesPerBox = false,
): StockAdjustPayload | undefined {
  const boxAmount = Math.trunc(Number(value.stockAdjustBoxes));
  const pieceAmount = Math.trunc(Number(value.stockAdjustPieces));
  const box = Number.isFinite(boxAmount) ? boxAmount : 0;
  const piece = Number.isFinite(pieceAmount) ? pieceAmount : 0;
  if (box === 0 && piece === 0) return undefined;
  const payload: StockAdjustPayload = {};
  if (box !== 0 && hasPiecesPerBox) payload.boxAmount = box;
  if (piece !== 0) payload.pieceAmount = piece;
  if (!payload.boxAmount && !payload.pieceAmount) return undefined;
  return payload;
}

export function stockAdjustValidationError(
  value: ProductStockFormState,
  hasPiecesPerBox: boolean,
): string | null {
  const boxAmount = Math.trunc(Number(value.stockAdjustBoxes));
  const box = Number.isFinite(boxAmount) ? boxAmount : 0;
  if (box !== 0 && !hasPiecesPerBox) {
    return "Karobka qo'shish uchun avval «Karobkada nechta dona» maydonini to'ldiring";
  }
  return null;
}
