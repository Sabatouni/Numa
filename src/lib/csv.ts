/** Minimal, dependency-free, Excel-friendly CSV writer. */

function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote whenever the cell contains a comma, quote, or newline; double up
  // any internal quotes. Excel and Sheets both parse this correctly.
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // Leading BOM so Excel opens UTF-8 CSVs (e.g. names with accents) without
  // mangling the encoding.
  return "﻿" + lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
