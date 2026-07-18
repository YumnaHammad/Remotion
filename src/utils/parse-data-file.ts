import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { DataRow } from "@/types/video";

export interface ParsedDataFile {
  rows: DataRow[];
  columns: string[];
  fileName: string;
}

/** Normalize cell values to strings for Remotion text layers. */
function normalizeRow(raw: Record<string, unknown>): DataRow {
  const row: DataRow = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined || value === "") {
      row[key] = "";
    } else if (typeof value === "object") {
      row[key] = JSON.stringify(value);
    } else {
      row[key] =
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
          ? value
          : String(value);
    }
  }
  return row;
}

function extractColumns(rows: DataRow[]): string[] {
  if (rows.length === 0) return [];
  return Object.keys(rows[0]!);
}

/** Parse CSV text into rows. */
export function parseCsv(text: string, fileName: string): ParsedDataFile {
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  const rows = (result.data ?? []).map(normalizeRow);
  return { rows, columns: extractColumns(rows), fileName };
}

/** Parse JSON array or object with rows/items key. */
export function parseJson(text: string, fileName: string): ParsedDataFile {
  const parsed = JSON.parse(text) as unknown;
  let rawRows: Record<string, unknown>[] = [];

  if (Array.isArray(parsed)) {
    rawRows = parsed.filter((x) => x && typeof x === "object") as Record<
      string,
      unknown
    >[];
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    const candidate = obj.rows ?? obj.items ?? obj.data;
    if (Array.isArray(candidate)) {
      rawRows = candidate as Record<string, unknown>[];
    }
  }

  const rows = rawRows.map(normalizeRow);
  return { rows, columns: extractColumns(rows), fileName };
}

/** Parse Excel workbook (first sheet). */
export function parseExcel(buffer: ArrayBuffer, fileName: string): ParsedDataFile {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], columns: [], fileName };

  const sheet = workbook.Sheets[sheetName]!;
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });
  const rows = json.map(normalizeRow);
  return { rows, columns: extractColumns(rows), fileName };
}

/** Route file by extension to the correct parser. */
export async function parseDataFile(file: File): Promise<ParsedDataFile> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCsv(text, file.name);
  }

  if (name.endsWith(".json")) {
    const text = await file.text();
    return parseJson(text, file.name);
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer, file.name);
  }

  throw new Error("Unsupported file type. Use CSV, JSON, or Excel (.xlsx).");
}

/** Build title/subtitle from first data row for auto-fill. */
export function suggestCopyFromData(
  rows: DataRow[],
  columns: string[]
): { title: string; subtitle: string } {
  if (rows.length === 0) {
    return { title: "Data Report", subtitle: "Upload your spreadsheet" };
  }
  const first = rows[0]!;
  const titleCol =
    columns.find((c) => /title|name|product|label/i.test(c)) ?? columns[0];
  const subtitleCol =
    columns.find((c) => /desc|summary|value|stat|amount/i.test(c)) ??
    columns[1];

  return {
    title: String(first[titleCol ?? ""] ?? "Data Report").slice(0, 80),
    subtitle: subtitleCol
      ? String(first[subtitleCol] ?? `${rows.length} rows`).slice(0, 120)
      : `${rows.length} rows · ${columns.length} columns`,
  };
}
