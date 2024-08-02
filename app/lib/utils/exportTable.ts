import { type Transaction } from "~/lib/db/schema";

export type ExportFormat = "csv" | "json";

export interface ExportOptions {
  filename?: string;
  format?: ExportFormat;
}

function formatDataToCSV(data: Transaction[]): string {
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header as keyof Transaction];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(","))
          return `"${value}"`;
        return String(value);
      })
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function formatDataToJSON(data: Transaction[]): string {
  return JSON.stringify(data, null, 2);
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsTable(
  data: Transaction[],
  options: ExportOptions = {},
): void {
  const { filename = "transactions", format = "csv" } = options;

  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  let content: string;
  let mimeType: string;

  switch (format) {
    case "csv":
      content = formatDataToCSV(data);
      mimeType = "text/csv;charset=utf-8;";
      break;
    case "json":
      content = formatDataToJSON(data);
      mimeType = "application/json";
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadFile(content, `${filename}.${format}`, mimeType);
}
