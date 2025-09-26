"use client";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ProductKPICard } from "@/components/product-kpi-card";

interface ProductPerformanceSectionProps {
  processedData: any[];
  selectedMonth: string;
}

export default function ProductPerformanceSection({ processedData, selectedMonth }: ProductPerformanceSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {processedData.map((product) => (
        <ProductKPICard key={product.productName} product={product} selectedMonth={selectedMonth} />
      ))}
    </div>
  );
}
