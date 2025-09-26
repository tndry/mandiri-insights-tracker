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
    "trx w33 '25": number;
    "trx w32 '25": number;
    "trx w31 '25": number;
    "trx w30 '25": number;
    "fy trx 24": number;
    "ytd trx w33 24": number;
    "ytd trx w33 25": number;
    "growth yoy trx": string;
    "%yoy trx": string;
    "sv w33 '25": number;
    "sv w32 '25": number;
    "sv w31 '25": number;
    "sv w30 '25": number;
    "fy sv 24": number;
    "ytd sv w33 24": number;
    "ytd sv w33 25": number;
    "growth yoy sv": string;
    "%yoy sv": string;
    "mdfg w33 '25": number;
    "mdfg w32 '25": number;
    "mdfg w31 '25": number;
    "mdfg w30 '25": number;
    "fy mdfg 24": number;
    "ytd mdfg w33 24": number;
    "ytd mdfg w33 25": number;
    "growth yoy mdfg": string;
    "%yoy mdfg": string;
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
    merchants: { '2024': number; '2025': number };
    trx: { '2024': number; '2025': number };
    sv: { '2024': number; '2025': number };
    edc: { '2024': number; '2025': number };
  };
}
