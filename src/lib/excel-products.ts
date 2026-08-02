import { readSheet } from "read-excel-file/browser";
import type { Row } from "read-excel-file/browser";

export type ExcelProductRow = {
  rowNumber: number;
  code: string;
  name: string;
  categoryName: string;
  price: number;
  wholesalePrice: number;
  stock: number;
  specs: Array<{ label: string; value: string }>;
};

function cellStr(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value).trim();
}

function cellNum(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = cellStr(value).replace(/\s/g, "").replace(",", ".");
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeHeader(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\(\*\)/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type ColumnKind =
  | "code"
  | "name"
  | "category"
  | "price"
  | "wholesale"
  | "stock"
  | "skip"
  | "spec";

function classifyHeader(header: string): { kind: ColumnKind; label: string } {
  const h = normalizeHeader(header);
  if (!h) return { kind: "skip", label: header };

  if (
    h === "код" ||
    h === "code" ||
    h === "kod" ||
    h === "артикул" ||
    h === "sku"
  ) {
    return { kind: "code", label: header };
  }
  if (
    h === "название" ||
    h === "наименование" ||
    h === "name" ||
    h === "nomi" ||
    h === "mahsulot"
  ) {
    return { kind: "name", label: header };
  }
  if (
    h === "группа" ||
    h === "group" ||
    h === "kategoriya" ||
    h === "категория" ||
    h === "category"
  ) {
    return { kind: "category", label: header };
  }
  if (
    h === "цена" ||
    h === "price" ||
    h === "narx" ||
    h === "oddiy narx" ||
    h.includes("цена розн")
  ) {
    return { kind: "price", label: header };
  }
  if (
    h === "оптом" ||
    h === "wholesale" ||
    h === "optom" ||
    h.includes("цена опт")
  ) {
    return { kind: "wholesale", label: header };
  }
  if (
    h === "склад" ||
    h === "stock" ||
    h === "ombor" ||
    h === "остаток" ||
    (h.includes("кол-во") && !h.includes("кейс") && !h.includes("уровен"))
  ) {
    return { kind: "stock", label: header };
  }

  return { kind: "spec", label: header.trim() };
}

/**
 * Brauzer uchun `read-excel-file` — SheetJS "Bad uncompressed size" xatosini beradi.
 */
export async function parseProductsExcel(
  file: File | Blob | ArrayBuffer,
): Promise<ExcelProductRow[]> {
  const input =
    file instanceof ArrayBuffer ? new Blob([file]) : file;

  // Birinchi sheet
  const matrix: Row[] = await readSheet(input);
  if (!matrix.length || matrix.length < 2) return [];

  const headerRow = (matrix[0] ?? []).map((c: unknown) => cellStr(c));
  while (headerRow.length && !headerRow[headerRow.length - 1]) {
    headerRow.pop();
  }
  if (!headerRow.length) return [];

  const columns = headerRow.map((h: string) => classifyHeader(h));
  const rows: ExcelProductRow[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r] ?? [];
    const specs: Array<{ label: string; value: string }> = [];
    let code = "";
    let name = "";
    let categoryName = "";
    let price = 0;
    let wholesalePrice = 0;
    let stock = 0;
    let hasWholesale = false;

    for (let c = 0; c < columns.length; c++) {
      const col = columns[c]!;
      const raw = line[c];
      const value = cellStr(raw);
      if (!value && col.kind !== "price" && col.kind !== "wholesale") continue;

      switch (col.kind) {
        case "code":
          code = value.toUpperCase();
          break;
        case "name":
          name = value;
          break;
        case "category":
          categoryName = value;
          break;
        case "price":
          price = cellNum(raw, 0);
          break;
        case "wholesale":
          wholesalePrice = cellNum(raw, 0);
          hasWholesale = true;
          break;
        case "stock":
          stock = Math.max(0, Math.floor(cellNum(raw, 0)));
          break;
        case "spec":
          if (value) specs.push({ label: col.label, value });
          break;
        default:
          break;
      }
    }

    if (!code && !name) continue;
    if (!code) code = `ROW-${r + 1}`;
    if (!name) name = code;
    if (!hasWholesale) wholesalePrice = price;

    rows.push({
      rowNumber: r + 1,
      code,
      name,
      categoryName,
      price,
      wholesalePrice,
      stock,
      specs,
    });
  }

  return rows;
}
