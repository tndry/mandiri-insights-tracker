// Untuk hasil parsing CSV merchant
export type ParseResult =
  | { success: true; data: MerchantData[]; rowCount: number }
  | { success: false; error: string };
// Untuk context ProductData
export type ProductDataContextType = {
  productFiles: UploadedProductFile[];
  addProductFileSlot: () => void;
  removeProductFile: (id: number) => void;
  updateProductFileName: (id: number, name: string) => void;
  updateProductFileObject: (id: number, file: File) => void;
  processedData: ProcessedProduct[];
  processFiles: () => Promise<void>;
  isProcessing: boolean;
};
// Untuk hasil parsing produk
export interface ProcessedProduct {
  productName: string;
  data: any[];
}
// Untuk fitur Product Performance Dashboard
export interface UploadedProductFile {
  id: number;
  productName: string;
  file: File | null;
}
  export interface MerchantData {
    mid_new: string;
    merchantofficialname: string;
    commonname: string;
    alamat: string;
    telephone: string;
    contactperson: string;
    mcc: string;
    segmen: string;
    norekening: string;
    cifno: string;
    "CIF NEW": string;
    lobdesc: string;
    LOB: string;
    "open date": string;
    "tgl pasang edc": string;
    "jml edc": number;
    cd_cbg: string;
    cbg: string;
    area: string;
    "kd cb rek": string;
    "nama cabang rek": string;
    "area rek": string;
    "kwl rek": string;
    // Index signature for dynamic columns
    [key: string]: string | number;
  }

export interface MerchantStats {
  totalMerchants: number;
  withEDC: number;
  withoutEDC: number;
  totalTrxThisMonth: number;
  totalSVThisMonth: number;
  // KPI comparison objects for YoY
  comparison: {
    merchants: {
      value: number;
      prevValue: number;
      growth: number;
    };
    trx: {
      value: number;
      prevValue: number;
      growth: number;
    };
    sv: {
      value: number;
      prevValue: number;
      growth: number;
    };
    edc: {
      value: number;
      prevValue: number;
      growth: number;
    };
    mdfg: {
      value: number;
      prevValue: number;
      growth: number;
    };
  };
  trxTrend: Array<{ week: string; trx: number }>;
  svTrend: Array<{ week: string; sv: number }>;
  segmentDistribution: Record<string, number>;
  edcByBranch: Record<string, number>;
  // Leaderboard
  topMerchantsBySV: Array<{ name: string; sv: number }>;
  topBranchesByTrx: Array<{ branch: string; trx: number }>;
  // New Leaderboard for MDFG and SV by Merchant/LOB
  topMerchantsByMDFG: Array<{ name: string; mdfg: number }>;
  topLOBsByMDFG: Array<{ name: string; value: number }>;
  topLOBsBySV: Array<{ name: string; value: number }>;
  // Raw YtD values for 2024 and 2025
  ytd: {
    merchants: { [year: string]: number };
    trx: { [year: string]: number };
    sv: { [year: string]: number };
    mdfg?: { [year: string]: number };
    edc?: { [year: string]: number };
  };
  // 4-week MDFG trend
  mdfgTrend: Array<{ week: string; mdfg: number }>;
}
