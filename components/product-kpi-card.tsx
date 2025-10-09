"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
// Tooltip dihapus, tidak digunakan lagi

interface ProductKPICardProps {
  product: {
    productName: string;
    data: any[];
  };
  selectedMonth: string;
}

export function ProductKPICard({ product, selectedMonth }: ProductKPICardProps) {
  
  // Gabungkan semua kalkulasi data ke dalam satu useMemo
  const { kpiData, chartData } = useMemo(() => {
    if (product.data.length === 0) {
      return { 
        kpiData: { target: 0, posisi: 0, pencapaian: 0, gapSurplus: null, ytd: null },
        chartData: [] 
      };
    }

    const rawData = product.data[0] || {};
    const monthOrder = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    
    // Deteksi bulan yang tersedia dalam data
    const availableMonths = new Set<string>();
    Object.keys(rawData).forEach(key => {
      const monthKey = key.split('_')[0];
      if (monthOrder.includes(monthKey)) availableMonths.add(monthKey);
    });

    let kpiResult;

    // --- Kalkulasi KPI berdasarkan filter bulan ---
    if (!selectedMonth || selectedMonth === "Semua Bulan" || selectedMonth === "all") {
      // Jika "Semua Bulan" dipilih, akumulasi total dari semua bulan yang tersedia
      const totalTarget = Array.from(availableMonths).reduce((sum, month) => {
        return sum + (rawData[`${month}_TARGET`] || 0);
      }, 0);
      
      const totalPosisi = Array.from(availableMonths).reduce((sum, month) => {
        return sum + (rawData[`${month}_POSISI`] || 0);
      }, 0);
      
      const pencapaian = totalTarget > 0 ? (totalPosisi / totalTarget) * 100 : 0;
      
      kpiResult = { 
        target: totalTarget, 
        posisi: totalPosisi, 
        pencapaian, 
        gapSurplus: null, // GAP/SURPLUS tidak applicable untuk total semua bulan
        ytd: totalPosisi // YTD sama dengan total posisi untuk "Semua Bulan"
      };
    } else {
      // Logika untuk bulan tertentu
      const month = selectedMonth.toUpperCase();
      const target = rawData[`${month}_TARGET`] || 0;
      const posisi = rawData[`${month}_POSISI`] || 0;
      const pencapaian = target > 0 ? (posisi / target) * 100 : 0;
      const gapSurplus = rawData[`${month}_GAP/SURPLUS`] ?? rawData[`${month}_GAP`] ?? null;
      const ytd = rawData[`${month}_YTD`] ?? null;

      kpiResult = { target, posisi, pencapaian, gapSurplus, ytd };
    }

    // --- Kalkulasi data untuk chart (semua bulan) ---
    const chartResult = Array.from(availableMonths)
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map(m => ({
        name: m,
        Target: rawData[`${m}_TARGET`] || 0,
        Posisi: rawData[`${m}_POSISI`] || 0,
      }));

    return { kpiData: kpiResult, chartData: chartResult };

  }, [product.data, selectedMonth]);

  // Format angka dengan notasi ringkas (1.3M, 500K, dll)
  const compactFormatter = new Intl.NumberFormat('id', { 
    notation: 'compact', 
    maximumFractionDigits: 1 
  });

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>{product.productName}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bagian KPI dengan sub-metrik */}
        <div className="grid grid-cols-3 text-center mb-4 border-b pb-4">
          {/* KPI Target */}
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-2xl font-bold">{compactFormatter.format(kpiData.target)}</p>
          </div>
          {/* KPI Posisi */}
          <div>
            <p className="text-sm text-muted-foreground">Posisi</p>
            <p className="text-2xl font-bold">{compactFormatter.format(kpiData.posisi)}</p>
          </div>
          {/* KPI Pencapaian & Blok GAP/YTD rata kiri */}
          <div className="flex flex-col items-start">
            <p className="text-sm text-muted-foreground">Pencapaian</p>
            <p className="text-2xl font-bold text-green-600">{kpiData.pencapaian.toFixed(1)}%</p>
            {/* Blok GAP & YTD rata kiri, satu blok, padding bawah agar tidak sesak */}
            <div className="mt-2 mb-3">
              {(() => {
                const gap = kpiData.posisi - kpiData.target;
                const gapColor = gap < 0 ? "text-red-600" : "text-green-600";
                const gapSign = gap > 0 ? "+" : "";
                return (
                  <p className={`text-xs font-medium ${gapColor}`}>GAP: {gapSign}{compactFormatter.format(gap)}</p>
                );
              })()}
              {kpiData.ytd !== null && (
                <p className="text-xs font-medium text-muted-foreground mt-1">YTD: {compactFormatter.format(kpiData.ytd)}</p>
              )}
            </div>
          </div>
        </div>
        {/* Bagian Chart */}
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('id', { notation: 'compact' }).format(value)} />
              <ChartTooltip />
              <Line type="monotone" dataKey="Target" stroke="#8884d8" />
              <Line type="monotone" dataKey="Posisi" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}