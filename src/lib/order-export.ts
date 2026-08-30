import { downloadBlob } from "@/lib/sold-export";
import {
  givenQty,
  isUnavailable,
  itemFulfillmentLabel,
  type FulfillableItem,
  type OrderSubstitute,
} from "@/lib/order-fulfillment";

export type OrderExportItem = FulfillableItem;

export type OrderExportShipping = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
};

export type OrderExport = {
  _id: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  currency?: string;
  status: string;
  createdAt?: string;
  notes?: string;
  paymentRef?: string;
  items?: OrderExportItem[];
  shippingAddress?: OrderExportShipping;
  originalSubtotal?: number;
  originalShippingFee?: number;
  originalTotal?: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Kutilmoqda",
  paid: "Toʻlangan",
  shipped: "Joʻnatilgan",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
};

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function splitName(fullName?: string) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "—", lastName: "—" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "—" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function formatAddress(addr?: OrderExportShipping) {
  if (!addr) return "—";
  return (
    [addr.line1, addr.line2, addr.city, addr.country, addr.postalCode]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

function sourceLabel(item: { source?: string; partnerName?: string }) {
  if (item.source === "hamkor") return item.partnerName || "Hamkor";
  return "Doʻkon";
}

function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status;
}

function currencyLabel(currency?: string) {
  return currency === "USD" || currency === "wholesale" ? "USD" : "UZS";
}

function excelLineStatus(item: OrderExportItem) {
  const label = itemFulfillmentLabel(item);
  if (!label) return "";
  if (label.startsWith("Berildi ")) return label.slice("Berildi ".length);
  return label;
}

function finiteNumber(value: number | undefined, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function xmlWorkbook(sheetName: string, tableInner: string) {
  const safeName = sheetName.replace(/[\\/*?:\[\]]/g, " ").slice(0, 31) || "Sheet1";
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${escapeXml(safeName)}">
  <Table>
    ${tableInner}
  </Table>
 </Worksheet>
</Workbook>`;
}

function kvRow(label: string, value: string | number, asNumber = false) {
  const data = asNumber
    ? `<Data ss:Type="Number">${finiteNumber(Number(value))}</Data>`
    : `<Data ss:Type="String">${escapeXml(value)}</Data>`;
  return `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(label)}</Data></Cell>
      <Cell>${data}</Cell>
    </Row>`;
}

function emptyRow() {
  return `
    <Row>
      <Cell><Data ss:Type="String"></Data></Cell>
    </Row>`;
}

/** Bitta buyurtma — Excel (.xls, SpreadsheetML). */
export function downloadOrderExcel(order: OrderExport) {
  const names = splitName(order.shippingAddress?.fullName);
  const items = order.items ?? [];
  const currency = currencyLabel(order.currency);
  const shortId = order._id.slice(-8);

  const itemHeader = `
    <Row>
      <Cell><Data ss:Type="String">Mahsulot</Data></Cell>
      <Cell><Data ss:Type="String">Buyurtma</Data></Cell>
      <Cell><Data ss:Type="String">Status</Data></Cell>
      <Cell><Data ss:Type="String">Manba</Data></Cell>
    </Row>`;

  const itemRows = items
    .map((item) => {
      const status = excelLineStatus(item);
      const main = `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(item.name)}</Data></Cell>
      <Cell><Data ss:Type="Number">${finiteNumber(item.quantity)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(status)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(sourceLabel(item))}</Data></Cell>
    </Row>`;
      const subs = (item.substitutes ?? [])
        .map((sub: OrderSubstitute) => {
          const qty = finiteNumber(sub.quantity);
          return `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(`→ Almashtirilgan: ${sub.name}`)}</Data></Cell>
      <Cell><Data ss:Type="Number">${qty}</Data></Cell>
      <Cell><Data ss:Type="String">Almashtirilgan</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(sourceLabel(sub))}</Data></Cell>
    </Row>`;
        })
        .join("");
      return main + subs;
    })
    .join("");

  const table = `
    ${kvRow("Buyurtma ID", order._id)}
    ${kvRow("Qisqa ID", shortId)}
    ${kvRow("Sana", formatDate(order.createdAt))}
    ${kvRow("Status", statusLabel(order.status))}
    ${kvRow("Valyuta", currency)}
    ${emptyRow()}
    ${kvRow("Ism", names.firstName)}
    ${kvRow("Familiya", names.lastName)}
    ${kvRow("Telefon", order.shippingAddress?.phone ?? "—")}
    ${kvRow("Manzil", formatAddress(order.shippingAddress))}
    ${kvRow("Izoh", order.notes?.trim() || "Izoh yoʻq")}
    ${emptyRow()}
    ${itemHeader}
    ${itemRows || `
    <Row>
      <Cell><Data ss:Type="String">Mahsulotlar yoʻq</Data></Cell>
    </Row>`}
    ${emptyRow()}
    ${kvRow("Oraliq summa", finiteNumber(order.subtotal ?? order.total), true)}
    ${
      order.originalTotal != null && order.originalTotal !== order.total
        ? kvRow("Buyurtma jami", finiteNumber(order.originalTotal), true)
        : ""
    }
    ${kvRow("Yakuniy hisob", finiteNumber(order.subtotal ?? order.total), true)}
  `;

  const blob = new Blob(["\ufeff", xmlWorkbook(`Buyurtma ${shortId}`, table)], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  downloadBlob(blob, `buyurtma-${shortId}_${stamp()}.xls`);
}

/** Barcha buyurtmalar roʻyxati — Excel. */
export function downloadOrdersExcel(orders: OrderExport[]) {
  const header = `
    <Row>
      <Cell><Data ss:Type="String">ID</Data></Cell>
      <Cell><Data ss:Type="String">Sana</Data></Cell>
      <Cell><Data ss:Type="String">Mijoz</Data></Cell>
      <Cell><Data ss:Type="String">Mahsulotlar</Data></Cell>
      <Cell><Data ss:Type="String">Status</Data></Cell>
      <Cell><Data ss:Type="String">Valyuta</Data></Cell>
      <Cell><Data ss:Type="String">Jami</Data></Cell>
      <Cell><Data ss:Type="String">Izoh</Data></Cell>
    </Row>`;

  const rows = orders
    .map((order) => {
      const products = (order.items ?? [])
        .map((i) => {
          const given = givenQty(i);
          const label = itemFulfillmentLabel(i);
          const subs = (i.substitutes ?? [])
            .map((s) => `almashtirilgan: ${s.name} ×${finiteNumber(s.quantity)}`)
            .join(", ");
          const core = isUnavailable(i)
            ? `${i.name} qolmagan`
            : given !== i.quantity
              ? `${i.name} ×${given}/${finiteNumber(i.quantity)}`
              : `${i.name} ×${finiteNumber(i.quantity)}`;
          return [core, label && !label.startsWith("Berildi") ? label : "", subs]
            .filter(Boolean)
            .join(" ");
        })
        .join("; ");
      return `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(order._id)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(formatDate(order.createdAt))}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(order.shippingAddress?.fullName ?? "—")}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(products || "—")}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(statusLabel(order.status))}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(currencyLabel(order.currency))}</Data></Cell>
      <Cell><Data ss:Type="Number">${finiteNumber(order.total)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(order.notes?.trim() || "")}</Data></Cell>
    </Row>`;
    })
    .join("");

  const blob = new Blob(["\ufeff", xmlWorkbook("Buyurtmalar", header + rows)], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  downloadBlob(blob, `buyurtmalar_${stamp()}.xls`);
}
