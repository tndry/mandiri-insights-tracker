"use client";

import { useProductData } from "@/contexts/product-data-context";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import React from "react";

export function DynamicUploader() {
  const { 
    productFiles, 
    addProductFileSlot, 
    removeProductFile, 
    updateProductFileName, 
    updateProductFileObject,
    processFiles,
    isProcessing,
  } = useProductData();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    if (e.target.files && e.target.files[0]) {
      updateProductFileObject(id, e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={addProductFileSlot}>
        <Plus className="w-4 h-4 mr-2" />
        Tambah Dataset
      </Button>

      <div className="space-y-6">
        {productFiles.map((productFile) => (
          <Card key={productFile.id}>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nama Produk</label>
                <Input
                  placeholder="Contoh: KSM"
                  value={productFile.productName}
                  // PERBAIKAN UTAMA DI SINI: Tambahkan onChange
                  onChange={(e) => updateProductFileName(productFile.id, e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">File Dataset</label>
                <Input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => handleFileChange(e, productFile.id)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-foreground file:text-primary hover:file:bg-primary-foreground/80"
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => removeProductFile(productFile.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {productFiles.length > 0 && (
        <Button
          className="w-full text-lg py-6"
          onClick={processFiles}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Sedang Memproses...</span>
            </>
          ) : (
            "Proses & Analisis Data"
          )}
        </Button>
      )}
    </div>
  );
}