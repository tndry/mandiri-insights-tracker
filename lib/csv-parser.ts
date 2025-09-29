import Papa, { ParseResult as PapaParseResult, ParseError } from "papaparse";
import type { MerchantData, MerchantStats, ParseResult } from "./types";

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<MerchantData>(file, {
      header: true,
      skipEmptyLines: true,
      // dynamicTyping: true, 
      transformHeader: (header: string) => {
        return header.replace(/\s+/g, ' ').toLowerCase().trim();
      },

      transform: (value: string, header: string) => {
        // Daftar kata kunci untuk kolom yang seharusnya berisi angka
        const numericKeywords = ["jml edc", "trx", "sv", "mdfg", "fy", "ytd", "yoy"];
        const lowerCaseHeader = String(header).toLowerCase();

        // Cek apakah header adalah kolom numerik
        if (numericKeywords.some(key => lowerCaseHeader.includes(key))) {
          // 1. Hapus semua karakter yang BUKAN angka (seperti koma, spasi, dll)
          const cleanedValue = value.replace(/[^0-9.-]/g, '');

          // 2. Jika hasilnya string kosong, kembalikan 0
          if (cleanedValue === '' || cleanedValue === '-') return 0;

          // 3. Ubah menjadi angka (float) secara paksa
          return parseFloat(cleanedValue);
        }

        // Jika bukan kolom numerik, kembalikan nilai aslinya
        return value;
      },
      complete: (results) => {
        try {
          const typedResults = results as PapaParseResult<MerchantData>;
          if (typedResults.errors.length > 0) {
            resolve({
              success: false,
              error: `CSV parsing errors: ${typedResults.errors.map((e: ParseError) => e.message).join(", ")}`,
            });
            return;
          }
          const data = typedResults.data;
          // Perbarui daftar kolom yang wajib ada
          const requiredColumns = [
            "mid_new",
            "alamat",
            "segmen",
            "tgl pasang edc",
            "jml edc",
            "area",
            // Kolom mingguan tidak wajib, hanya contoh
          ];
          if (data.length > 0) {
            const firstRow = data[0];
            const missingColumns = requiredColumns.filter((col) => !(col in firstRow) || firstRow[col as keyof MerchantData] === null);
            if (missingColumns.length > 0) {
              resolve({
                success: false,
                error: `Missing required columns: ${missingColumns.join(", ")}`,
              });
              return;
            }
          }
          resolve({
            success: true,
            data,
            rowCount: data.length,
          });
        } catch (error: unknown) {
          resolve({
            success: false,
            error: `Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
      },
      error: (error: Error) => {
        resolve({
          success: false,
          error: `Failed to read CSV file: ${error.message}`,
        });
      },
    })
  })
}

export const calculateStats = (data: MerchantData[]): MerchantStats => {
  if (!data || data.length === 0) {
    // Return a default structure if there's no data
    return {
      totalMerchants: 0,
      withEDC: 0,
      withoutEDC: 0,
      comparison: {
        merchants: { value: 0, prevValue: 0, growth: 0 },
        trx: { value: 0, prevValue: 0, growth: 0 },
        sv: { value: 0, prevValue: 0, growth: 0 },
        edc: { value: 0, prevValue: 0, growth: 0 },
        mdfg: { value: 0, prevValue: 0, growth: 0 },
      },
      trxTrend: [],
      svTrend: [],
      mdfgTrend: [],
      segmentDistribution: {},
      edcByBranch: {},
      topMerchantsBySV: [],
      topBranchesByTrx: [],
      topMerchantsByMDFG: [],
      topLOBsByMDFG: [],
      topLOBsBySV: [],
    };
  }

  const allKeys = Object.keys(data[0]);

  // --- PERBAIKAN FINAL UNTUK DETEKSI TAHUN ---
  // 1. Regex ini mencari tahun dari kolom YtD (TANPA kutip)
  const ytdYearRegex = /ytd (?:trx|sv|mdfg) w\d+ (\d+)/;
  const yearsInData = new Set<string>();
  allKeys.forEach(key => {
    const match = key.match(ytdYearRegex);
    if (match && match[1]) {
      yearsInData.add(match[1]); // Menambahkan '24', '25', dll.
    }
  });

  const sortedYears = Array.from(yearsInData).sort((a, b) => b.localeCompare(a));
  
  // 2. Kita simpan tahunnya dalam format BERSIH (tanpa kutip)
  const currentYear = sortedYears[0] || null; // ex: "25"
  const prevYear = sortedYears[1] || null;   // ex: "24"

  // 3. Logika pencarian KPI YoY menggunakan tahun BERSIH
  const trxKeyCurrent = currentYear ? allKeys.find(k => k.startsWith("ytd trx") && k.endsWith(currentYear)) : null;
  const trxKeyPrev = prevYear ? allKeys.find(k => k.startsWith("ytd trx") && k.endsWith(prevYear)) : null;
  const svKeyCurrent = currentYear ? allKeys.find(k => k.startsWith("ytd sv") && k.endsWith(currentYear)) : null;
  const svKeyPrev = prevYear ? allKeys.find(k => k.startsWith("ytd sv") && k.endsWith(prevYear)) : null;
  const mdfgKeyCurrent = currentYear ? allKeys.find(k => k.startsWith("ytd mdfg") && k.endsWith(currentYear)) : null;
  const mdfgKeyPrev = prevYear ? allKeys.find(k => k.startsWith("ytd mdfg") && k.endsWith(prevYear)) : null;
  
  // --- Inisialisasi Variabel Kalkulasi ---
  let withEDC = 0;
  const segmentDistribution: Record<string, number> = {};
  const edcByBranch: Record<string, number> = {};
  let trxCurrentYear = 0, trxPrevYear = 0;
  let svCurrentYear = 0, svPrevYear = 0;
  let mdfgCurrentYear = 0, mdfgPrevYear = 0;
  let edcTotal = 0;

  data.forEach((merchant) => {
    if (merchant["tgl pasang edc"] && String(merchant["tgl pasang edc"]).trim() !== "") {
      withEDC++;
    }
    const segment = merchant.segmen || "Unknown";
    segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1;
    const branchName = (merchant["nama cabang rek"] || merchant["kd cb rek"] || "Unknown").toString().trim();
    edcByBranch[branchName] = (edcByBranch[branchName] || 0) + (merchant["jml edc"] || 0);
    edcTotal += merchant["jml edc"] || 0;

    trxCurrentYear += trxKeyCurrent ? (merchant[trxKeyCurrent] as number || 0) : 0;
    trxPrevYear += trxKeyPrev ? (merchant[trxKeyPrev] as number || 0) : 0;
    svCurrentYear += svKeyCurrent ? (merchant[svKeyCurrent] as number || 0) : 0;
    svPrevYear += svKeyPrev ? (merchant[svKeyPrev] as number || 0) : 0;
    mdfgCurrentYear += mdfgKeyCurrent ? (merchant[mdfgKeyCurrent] as number || 0) : 0;
    mdfgPrevYear += mdfgKeyPrev ? (merchant[mdfgKeyPrev] as number || 0) : 0;
  });
  
  const calcGrowth = (current: number, prev: number) => {
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  };

  const getLatest4Weeks = (metric: 'trx' | 'sv' | 'mdfg') => {
    if (!currentYear) return [];
    // 4. Regex ini DIBUAT DENGAN TANDA KUTIP (') agar cocok dengan kolom tren mingguan
    const regex = new RegExp(`^${metric} w(\\d+) '${currentYear}$`);
    const weekCols = allKeys
      .map(key => {
        const match = key.match(regex);
        return match ? { key, week: parseInt(match[1], 10) } : null;
      })
      .filter((v): v is { key: string; week: number } => v !== null)
      .sort((a, b) => b.week - a.week)
      .slice(0, 4);

    return weekCols.map(({ key, week }) => ({
      week: `W${week}`,
      value: data.reduce((sum, m) => sum + (m[key] as number || 0), 0)
    })).reverse();
  };
  
  const trxTrend = getLatest4Weeks('trx').map(item => ({ week: item.week, trx: item.value }));
  const svTrend = getLatest4Weeks('sv').map(item => ({ week: item.week, sv: item.value }));
  const mdfgTrend = getLatest4Weeks('mdfg').map(item => ({ week: item.week, mdfg: item.value }));

  // Helper untuk Leaderboard
  const getTop5 = (metric: 'sv' | 'mdfg' | 'trx', groupBy: 'merchant' | 'lob' | 'branch') => {
      const latest4Weeks = getLatest4Weeks(metric);
      if (latest4Weeks.length === 0) return [];

      const totals: Record<string, number> = {};
      data.forEach(m => {
          let key: string;
          if (groupBy === 'merchant') key = m.merchantofficialname || m.commonname || '-';
          else if (groupBy === 'lob') key = m.lobdesc || m.LOB || '-';
          else key = m.cbg || '-';

          const total = latest4Weeks.reduce((sum, week) => {
              const colName = `${metric} w${week.week.replace('W', '')} '${currentYear}`;
              return sum + (m[colName] as number || 0);
          }, 0);

          totals[key] = (totals[key] || 0) + total;
      });

      return Object.entries(totals)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
  };
  
  const topMerchantsBySV = getTop5('sv', 'merchant').map(m => ({ name: m.name, sv: m.value }));
  const topMerchantsByMDFG = getTop5('mdfg', 'merchant').map(m => ({ name: m.name, mdfg: m.value }));
  const topLOBsBySV = getTop5('sv', 'lob');
  const topLOBsByMDFG = getTop5('mdfg', 'lob');
  const topBranchesByTrx = getTop5('trx', 'branch').map(b => ({ branch: b.name, trx: b.value }));

  return {
    totalMerchants: data.length,
    withEDC,
    withoutEDC: data.length - withEDC,
    comparison: {
      merchants: { value: data.length, prevValue: 0, growth: 100 },
      trx: { value: trxCurrentYear, prevValue: trxPrevYear, growth: calcGrowth(trxCurrentYear, trxPrevYear) },
      sv: { value: svCurrentYear, prevValue: svPrevYear, growth: calcGrowth(svCurrentYear, svPrevYear) },
      edc: { value: edcTotal, prevValue: edcTotal, growth: 0 },
      mdfg: { value: mdfgCurrentYear, prevValue: mdfgPrevYear, growth: calcGrowth(mdfgCurrentYear, mdfgPrevYear) },
    },
    trxTrend,
    svTrend,
    mdfgTrend,
    segmentDistribution,
    edcByBranch,
    topMerchantsBySV,
    topMerchantsByMDFG,
    topLOBsByMDFG,
    topLOBsBySV,
    topBranchesByTrx,
  };
};