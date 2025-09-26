import Papa from "papaparse";
import * as XLSX from "xlsx";

// Helper: fill empty cells with last valid value (for months row)
function fillForward(arr: string[]): string[] {
  let last = "";
  return arr.map((v) => {
    if (v && v.trim()) last = v.trim();
    return last;
  });
}

// Robust month normalization: handles Indonesian & English, casing, whitespace, abbreviations
function normalizeMonth(month: string): string {
  const m = month.trim().toLowerCase();
  if (["januari", "jan", "january"].includes(m)) return "JAN";
  if (["februari", "feb", "february"].includes(m)) return "FEB";
  if (["maret", "mar", "march"].includes(m)) return "MAR";
  if (["april", "apr"].includes(m)) return "APR";
  if (["mei", "may"].includes(m)) return "MEI";
  if (["juni", "jun", "june"].includes(m)) return "JUN";
  if (["juli", "jul", "july"].includes(m)) return "JUL";
  if (["agustus", "agu", "agust", "aug", "august"].includes(m)) return "AGU";
  if (["september", "sep", "sept", "september"].includes(m)) return "SEP";
  if (["oktober", "okt", "oct", "october"].includes(m)) return "OKT";
  if (["november", "nov"].includes(m)) return "NOV";
  if (["desember", "des", "dec", "december"].includes(m)) return "DES";
  return month.trim().toUpperCase().slice(0, 3); // fallback: first 3 letters, uppercase
}

export async function parseProductFile(file: File): Promise<any[]> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  let rows: string[][] = [];

  if (ext === "csv") {
    // Parse as array of array, no header
    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });
    rows = parsed.data as string[][];
  } else if (ext === "xlsx" || ext === "xls") {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as string[][];
  } else {
    throw new Error("Unsupported file type");
  }

  if (rows.length < 3) return [];

  // Baris 1: bulan, Baris 2: metrik
    const monthsRowRaw = fillForward(rows[0]);
    const monthsRow = monthsRowRaw.map(normalizeMonth);
  const metricsRow = rows[1].map((v) => v.trim());
  const uniqueHeaders = metricsRow.map((metric, i) => {

    if (i === 0) return "Produk";
     const month = monthsRow[i] || "";
     return month ? `${month}_${metric.toUpperCase()}` : metric.toUpperCase();
  });

  // Data mulai dari baris ke-3
  const dataRows = rows.slice(2);
  const result = dataRows.map((row) => {
    const obj: Record<string, any> = {};
    uniqueHeaders.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  return result;
}
