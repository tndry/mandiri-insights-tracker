"use client";
import type { UploadedProductFile, ProcessedProduct, ProductDataContextType } from "@/lib/types";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { parseProductFile } from "@/lib/product-parser";

const ProductDataContext = createContext<ProductDataContextType | undefined>(undefined);

let idCounter = 1;

export function ProductDataProvider({ children }: { children: ReactNode }) {
  const [productFiles, setProductFiles] = useState<UploadedProductFile[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async () => {
    console.log("Memulai proses file...");
    setIsProcessing(true);
    setProcessedData([]); 

    try {
      const results: ProcessedProduct[] = [];
      for (const pf of productFiles) {
        if (pf.file && pf.productName) {
          console.log(`Memproses: ${pf.productName}`);
          const data = await parseProductFile(pf.file);
          results.push({ productName: pf.productName, data });
          console.log(`Selesai memproses: ${pf.productName}`);
        }
      }
      setProcessedData(results);
      console.log("Semua file berhasil diproses:", results);
      alert(`Berhasil memproses ${results.length} dataset!`);

    } catch (e) {
      // PERBAIKAN: Tangani dan tampilkan error
      console.error("Gagal memproses file:", e);
      alert(`Terjadi error saat memproses file. Silakan periksa format file dan lihat konsol (F12) untuk detail.`);
      
    } finally {
      // Pastikan ini selalu berjalan
      setIsProcessing(false);
      console.log("Proses selesai.");
    }
  };

  const addProductFileSlot = () => {
    setProductFiles((prev) => [
      ...prev,
      // PERBAIKAN: Gunakan Date.now() untuk ID unik yang lebih andal
      { id: Date.now(), productName: "", file: null },
    ]);
  };

  // Implementasi fungsi update dan remove
  const removeProductFile = (id: number) => {
    setProductFiles((prev) => prev.filter((pf) => pf.id !== id));
  };
  const updateProductFileName = (id: number, name: string) => {
    setProductFiles((prev) =>
      prev.map((pf) =>
        pf.id === id ? { ...pf, productName: name } : pf
      )
    );
  };
  const updateProductFileObject = (id: number, file: File) => {
    setProductFiles((prev) =>
      prev.map((pf) =>
        pf.id === id ? { ...pf, file } : pf
      )
    );
  };

  return (
    <ProductDataContext.Provider
      value={{
        productFiles,
        addProductFileSlot,
        removeProductFile,
        updateProductFileName,
        updateProductFileObject,
        processedData,
        processFiles,
        isProcessing,
      }}
    >
      {children}
    </ProductDataContext.Provider>
  );
}

export function useProductData() {
  const ctx = useContext(ProductDataContext);
  if (!ctx) throw new Error("useProductData must be used within ProductDataProvider");
  return ctx;
}
