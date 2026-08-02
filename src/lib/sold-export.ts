/** Trigger a browser file download from a Blob or string. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string | number): string {
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

export type SoldExportRow = {
  name: string;
  slug?: string;
  quantitySold: number;
  revenue: number;
};

/** Excel-compatible .xls (SpreadsheetML). */
export function downloadSoldExcel(rows: SoldExportRow[]) {
  const totalQty = rows.reduce((s, r) => s + r.quantitySold, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const dataRows = rows
    .map(
      (r) => `
    <Row>
      <Cell><Data ss:Type="String">${escapeHtml(r.name)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeHtml(r.slug ?? "")}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.quantitySold}</Data></Cell>
      <Cell><Data ss:Type="Number">${r.revenue}</Data></Cell>
    </Row>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Sotilgan">
  <Table>
    <Row>
      <Cell><Data ss:Type="String">Mahsulot</Data></Cell>
      <Cell><Data ss:Type="String">Slug</Data></Cell>
      <Cell><Data ss:Type="String">Sotilgan soni</Data></Cell>
      <Cell><Data ss:Type="String">Tushum</Data></Cell>
    </Row>
    ${dataRows}
    <Row>
      <Cell><Data ss:Type="String">Jami</Data></Cell>
      <Cell><Data ss:Type="String"></Data></Cell>
      <Cell><Data ss:Type="Number">${totalQty}</Data></Cell>
      <Cell><Data ss:Type="Number">${totalRevenue}</Data></Cell>
    </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob(["\ufeff", xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  downloadBlob(blob, `sotilgan-mahsulotlar_${stamp()}.xls`);
}

/** Word-compatible .doc (HTML). */
export function downloadSoldWord(rows: SoldExportRow[]) {
  const totalQty = rows.reduce((s, r) => s + r.quantitySold, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const bodyRows = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.quantitySold)}</td>
        <td>${escapeHtml(r.revenue)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>Sotilgan mahsulotlar</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; }
    h1 { font-size: 18pt; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #333; padding: 8px; text-align: left; }
    th { background: #f0f0f0; }
    .right { text-align: right; }
  </style>
</head>
<body>
  <h1>Sotilgan mahsulotlar</h1>
  <p>Sana: ${escapeHtml(
    new Date().toLocaleString("uz-UZ"),
  )}</p>
  <table>
    <thead>
      <tr>
        <th>Mahsulot</th>
        <th>Sotilgan soni</th>
        <th>Tushum</th>
      </tr>
    </thead>
    <tbody>
      ${bodyRows}
      <tr>
        <td><strong>Jami</strong></td>
        <td><strong>${escapeHtml(totalQty)}</strong></td>
        <td><strong>${escapeHtml(totalRevenue)}</strong></td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  });
  downloadBlob(blob, `sotilgan-mahsulotlar_${stamp()}.doc`);
}
