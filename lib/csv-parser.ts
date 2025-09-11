import Papa from "papaparse"
import type { MerchantData, MerchantStats, ParseResult } from "./types" // Pastikan ParseResult juga diimpor dari types

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
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
          if (results.errors.length > 0) {
            resolve({
              success: false,
              error: `CSV parsing errors: ${results.errors.map((e) => e.message).join(", ")}`,
            })
            return
          }

          const data = results.data as MerchantData[]

          // Perbarui daftar kolom yang wajib ada
          const requiredColumns = [
            "mid_new",
            "alamat",
            "segmen",
            "tgl pasang edc",
            "jml edc",
            "area",
            "trx w33 '25", 
            "sv w33 '25",  
          ]

          if (data.length > 0) {
            const firstRow = data[0]
            const missingColumns = requiredColumns.filter((col) => !(col in firstRow) || firstRow[col as keyof MerchantData] === null)

            if (missingColumns.length > 0) {
              resolve({
                success: false,
                error: `Missing required columns: ${missingColumns.join(", ")}`,
              })
              return
            }
          }

          resolve({
            success: true,
            data,
            rowCount: data.length,
          })
        } catch (error) {
          resolve({
            success: false,
            error: `Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
          })
        }
      },
      error: (error) => {
        resolve({
          success: false,
          error: `Failed to read CSV file: ${error.message}`,
        })
      },
    })
  })
}

export const calculateStats = (data: MerchantData[]): MerchantStats => {
  if (!data || data.length === 0) {
    return {
      totalMerchants: 0,
      withEDC: 0,
      withoutEDC: 0,
      totalTrxThisMonth: 0,
      totalSVThisMonth: 0,
      comparison: {
        merchants: { value: 0, prevValue: 0, growth: 0 },
        trx: { value: 0, prevValue: 0, growth: 0 },
        sv: { value: 0, prevValue: 0, growth: 0 },
        edc: { value: 0, prevValue: 0, growth: 0 },
      },
      trxTrend: [],
      svTrend: [],
      segmentDistribution: {},
      edcByBranch: {},
      topMerchantsBySV: [],
      topBranchesByTrx: [],
      topMerchantsByMDFG: [],
      topLOBsByMDFG: [],
      topLOBsBySV: [],
      ytd: {
        merchants: { '2024': 0, '2025': 0 },
        trx: { '2024': 0, '2025': 0 },
        sv: { '2024': 0, '2025': 0 },
        edc: { '2024': 0, '2025': 0 },
      },
    };
  }
  // Deteksi semua nama kolom dari baris data pertama
  const allKeys = Object.keys(data[0]);

  // --- Leaderboard MDFG & SV ---
  // Siapkan sortedSvWeekKeys lebih awal
  const svWeekRegex = /^sv w(\d+)/;
  const sortedSvWeekKeys = allKeys
    .filter(key => svWeekRegex.test(key))
    .sort((a, b) => {
      const weekA = parseInt(a.match(svWeekRegex)![1], 10);
      const weekB = parseInt(b.match(svWeekRegex)![1], 10);
      return weekA - weekB;
    });

  // 1. Top 5 Merchant by total MDFG (akumulasi semua kolom mdfg w...)
  const mdfgWeekRegex = /^mdfg w(\d+)/;
  const sortedMdfgWeekKeys = allKeys
    .filter(key => mdfgWeekRegex.test(key))
    .sort((a, b) => {
      const weekA = parseInt(a.match(mdfgWeekRegex)![1], 10);
      const weekB = parseInt(b.match(mdfgWeekRegex)![1], 10);
      return weekA - weekB;
    });
  const merchantMDFGs = data.map(m => {
    const mdfgTotal = sortedMdfgWeekKeys.reduce((sum, key) => sum + (m[key as keyof MerchantData] as number || 0), 0);
    return { name: m.merchantofficialname || m.commonname || '-', mdfg: mdfgTotal };
  });
  const topMerchantsByMDFG = merchantMDFGs.sort((a, b) => b.mdfg - a.mdfg).slice(0, 5);

  // 2. Top 5 LOB by total MDFG
  const lobMDFGMap: Record<string, number> = {};
  data.forEach(m => {
    const lob = m.lobdesc || m.LOB || '-';
    const mdfgTotal = sortedMdfgWeekKeys.reduce((sum, key) => sum + (m[key as keyof MerchantData] as number || 0), 0);
    lobMDFGMap[lob] = (lobMDFGMap[lob] || 0) + mdfgTotal;
  });
  const topLOBsByMDFG = Object.entries(lobMDFGMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 3. Top 5 LOB by total SV (4 minggu terakhir)
  const lobSVMap: Record<string, number> = {};
  data.forEach(m => {
    const lob = m.lobdesc || m.LOB || '-';
    const svTotal = sortedSvWeekKeys.slice(-4).reduce((sum, key) => sum + (m[key as keyof MerchantData] as number || 0), 0);
    lobSVMap[lob] = (lobSVMap[lob] || 0) + svTotal;
  });
  const topLOBsBySV = Object.entries(lobSVMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Filter dan urutkan kolom-kolom transaksi mingguan
  const trxWeekRegex = /^trx w(\d+)/;
  const sortedTrxWeekKeys = allKeys
    .filter(key => trxWeekRegex.test(key))
    .sort((a, b) =>{
      const weekA = parseInt(a.match(trxWeekRegex)![1], 10);
      const weekB = parseInt(b.match(trxWeekRegex)![1], 10);
      return weekA - weekB;
    });
  // svWeekRegex & sortedSvWeekKeys sudah dideklarasikan di atas

  const ytdYearRegex = /ytd (?:trx|sv) w\d+ (\d+)/;
  const yearsInData = new Set<string>();
  allKeys.forEach(key => {
    const match = key.match(ytdYearRegex);
    if (match && match[1]) {
      yearsInData.add(match[1]); // Menambahkan '24', '25', dll.
    }
  });

  const sortedYears = Array.from(yearsInData).sort((a, b) => b.localeCompare(a));
  const currentYearSuffix = sortedYears[0] || null; // ex: '25'
  const prevYearSuffix = sortedYears[1] || null;    // ex: '24'

  // Cari nama kolom YtD yang lengkap berdasarkan tahun yang terdeteksi
  const trxKeyCurrent = currentYearSuffix ? allKeys.find(k => k.startsWith("ytd trx") && k.endsWith(currentYearSuffix)) : null;
  const trxKeyPrev = prevYearSuffix ? allKeys.find(k => k.startsWith("ytd trx") && k.endsWith(prevYearSuffix)) : null;
  const svKeyCurrent = currentYearSuffix ? allKeys.find(k => k.startsWith("ytd sv") && k.endsWith(currentYearSuffix)) : null;
  const svKeyPrev = prevYearSuffix ? allKeys.find(k => k.startsWith("ytd sv") && k.endsWith(prevYearSuffix)) : null;

  let withEDC = 0;
  const segmentDistribution: Record<string, number> = {};
  const edcByBranch: Record<string, number> = {};
  let totalTrxThisPeriod = 0;
  let totalSVThisPeriod = 0;

  let merchantsCurrentYear = 0, merchantsPrevYear = 0;
  let trxCurrentYear = 0, trxPrevYear = 0;
  let svCurrentYear = 0, svPrevYear = 0;
  let edcTotal = 0;

  data.forEach((merchant) => {
    // Cek EDC
    if (merchant["tgl pasang edc"] && String(merchant["tgl pasang edc"]).trim() !== "") {
      withEDC++;
    }

    // Distribusi Segmen
    const segment = merchant.segmen || "Unknown";
    segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1;

    // EDC per Cabang (menggunakan kolom "nama cabang rek" atau fallback ke kode cabang)
    const branchName = (typeof merchant["nama cabang rek"] === 'string' && merchant["nama cabang rek"].trim().length > 0)
      ? merchant["nama cabang rek"].trim()
      : (merchant["kd cb rek"] || "Unknown");
    edcByBranch[branchName] = (edcByBranch[branchName] || 0) + (merchant["jml edc"] || 0);

    const currentEDC = merchant["jml edc"] || 0;
    edcTotal += currentEDC;

    sortedTrxWeekKeys.forEach(key => {
      totalTrxThisPeriod += (merchant[key as keyof MerchantData] as number || 0);
    });
    sortedSvWeekKeys.forEach(key => {
      totalSVThisPeriod += (merchant[key as keyof MerchantData] as number || 0);
    });

    // Kalkulasi YtD menggunakan key yang sudah ditemukan secara dinamis
    const trxYtdCurrent = trxKeyCurrent ? (merchant[trxKeyCurrent as keyof MerchantData] as number || 0) : 0;
    const trxYtdPrev = trxKeyPrev ? (merchant[trxKeyPrev as keyof MerchantData] as number || 0) : 0;
    const svYtdCurrent = svKeyCurrent ? (merchant[svKeyCurrent as keyof MerchantData] as number || 0) : 0;
    const svYtdPrev = svKeyPrev ? (merchant[svKeyPrev as keyof MerchantData] as number || 0) : 0;

    trxCurrentYear += trxYtdCurrent;
    trxPrevYear += trxYtdPrev;
    svCurrentYear += svYtdCurrent;
    svPrevYear += svYtdPrev;
    
    if (trxYtdPrev > 0) merchantsPrevYear++;
    if (trxYtdCurrent > 0) merchantsCurrentYear++;
  });

  const trxTrend = sortedTrxWeekKeys.map(key => {
    const weekNum = key.match(trxWeekRegex)![1];
    return {
      week: `W${weekNum}`,
      trx: data.reduce((sum, m) => sum + (m[key as keyof MerchantData] as number || 0), 0)
    };
  });

  const svTrend = sortedSvWeekKeys.map(key => {
    const weekNum = key.match(svWeekRegex)![1];
    return {
      week: `W${weekNum}`,
      sv: data.reduce((sum, m) => sum + (m[key as keyof MerchantData] as number || 0), 0)
    };
  });

  // fungsi bantu untuk kalkulasi pertumbuhan
  const calcGrowth = (current: number, prev: number) => {
    if (prev === 0) return current === 0 ? 0 : 100;
    return ((current - prev) / prev) * 100;
  };

  // Leaderboard: Top 10 Merchant by SV (4 minggu terakhir)
  const merchantSVs = data.map(m => {
    // Total SV 4 minggu terakhir
    const svTotal = sortedSvWeekKeys.slice(-4).reduce((sum, key) => sum + (m[key as keyof MerchantData] as number || 0), 0);
    return { mid_new: m.mid_new, name: m.merchantofficialname || m.commonname || '-', sv: svTotal };
  });
  const topMerchantsBySV = merchantSVs
    .sort((a, b) => b.sv - a.sv)
    .slice(0, 10);

  // Leaderboard: Top 10 Cabang by Trx (4 minggu terakhir)
  const branchTrxMap: Record<string, number> = {};
  data.forEach(m => {
    const branch = typeof m.cbg === 'string' ? m.cbg.trim() : '-';
    const trxTotal = sortedTrxWeekKeys.slice(-4).reduce((sum, key) => sum + (m[key as keyof MerchantData] as number || 0), 0);
    branchTrxMap[branch] = (branchTrxMap[branch] || 0) + trxTotal;
  });
  const topBranchesByTrx = Object.entries(branchTrxMap)
    .map(([branch, trx]) => ({ branch, trx }))
    .sort((a, b) => b.trx - a.trx)
    .slice(0, 10);

  return {
    totalMerchants: data.length,
    withEDC,
    withoutEDC: data.length - withEDC,
    totalTrxThisMonth: totalTrxThisPeriod,
    totalSVThisMonth: totalSVThisPeriod,
    comparison: {
      merchants: {
        value: merchantsCurrentYear,
        prevValue: merchantsPrevYear,
        growth: calcGrowth(merchantsCurrentYear, merchantsPrevYear),
      },
      trx: {
        value: trxCurrentYear,
        prevValue: trxPrevYear,
        growth: calcGrowth(trxCurrentYear, trxPrevYear),
      },
      sv: {
        value: svCurrentYear,
        prevValue: svPrevYear,
        growth: calcGrowth(svCurrentYear, svPrevYear),
      },
      edc: {
        value: edcTotal,
        prevValue: edcTotal,
        growth: 0,
      },
    },
    trxTrend,
    svTrend,
    segmentDistribution,
    edcByBranch,
    topMerchantsBySV,
    topBranchesByTrx,
    // --- Leaderboard MDFG & SV ---
    topMerchantsByMDFG,
    topLOBsByMDFG,
    topLOBsBySV,
    ytd: {
      merchants: { '2024': 0, '2025': 0 },
      trx: { '2024': 0, '2025': 0 },
      sv: { '2024': 0, '2025': 0 },
      edc: { '2024': 0, '2025': 0 },
    },
  };
};