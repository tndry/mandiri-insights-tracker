"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LogOut } from "lucide-react"
import { Upload } from "lucide-react"
import { FileDown } from "lucide-react"
import React, { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { parseCSV } from "@/lib/csv-parser"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import { CSVUpload } from "@/components/csv-upload"
// import { MerchantMap } from "@/components/merchant-map"
import dynamic from 'next/dynamic'
import { SegmentDistribution, EDCByBranch, TransactionTrendChart, SalesVolumeTrendChart } from "@/components/dashboard-charts"
import { BarChart, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { TopMerchantsMDFGChart } from "@/components/top-merchants-mdfg-chart"
import { TopLOBByMDFGChart, TopLOBBySVChart } from "@/components/top-lob-charts"
import { ExportReports } from "@/components/export-reports"
import { useMerchants } from "@/contexts/merchant-context"
import { useMemo, useState, useEffect } from "react" // keep only this import for hooks
import { KPICard } from "@/components/kpi-card"
import { UserNav } from "@/components/user-nav"
import { TopMerchantsTable } from "@/components/top-merchants-table"
import { TopBranchesTable } from "@/components/top-branches-table"
import { MobileNav } from "@/components/mobile-nav"
import { FilterSheet } from "@/components/filter-sheet"
import { ThemedReactSelect } from "@/components/ui/themed-react-select"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { DynamicUploader } from "@/components/dynamic-uploader"
import { ProductKPICard } from "@/components/product-kpi-card"
import { useProductData } from "@/contexts/product-data-context"
import ProductPerformanceSection from "@/components/product-performance-section"

export default function DashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const merchantReportRef = useRef<HTMLDivElement | null>(null);
  const handleGenerateReport = async () => {
    const elementToCapture = merchantReportRef.current;
    if (!elementToCapture) return;
    setIsGenerating(true);
    elementToCapture.classList.add('pdf-export-mode');
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(elementToCapture, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('merchant_report.pdf');
      } catch (error) {
        console.error("Gagal membuat PDF:", error);
      } finally {
        elementToCapture.classList.remove('pdf-export-mode');
        setIsGenerating(false);
      }
    }, 50);
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { setMerchants } = useMerchants();

  const handleFileUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await parseCSV(file);
    if (result.success && result.data) {
      setMerchants(result.data);
      setFilters({ cbg: 'all', segmen: 'all' });
    } else {
      alert(result.error || 'Gagal memproses file.');
    }
    event.target.value = "";
  };
  const { user, logout, checkPermission } = useAuth()
  const { stats, merchants, filters, setFilters, filteredMerchants } = useMerchants();
  const { processedData } = useProductData();

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const availableMonths = useMemo(() => {
    const monthOrder = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
    const months = new Set<string>();
    if (processedData.length > 0 && processedData[0].data.length > 0) {
      const sampleData = processedData[0].data[0];
      for (const key in sampleData) {
        const month = key.split('_')[0];
        if (monthOrder.includes(month.toUpperCase())) {
          months.add(month.toUpperCase());
        }
      }
    }
    const sortedMonths = Array.from(months).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    const options = [{ value: 'all', label: 'Semua Bulan' }, ...sortedMonths.map(m => ({ value: m, label: m }))];
    return options;
  }, [processedData]);

  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0].value);
    }
  }, [availableMonths]);
  // Helper for KPI comparison text
  const formatComparisonText = (current: number, prev: number, label: string) => {
    return `${label} ${prev.toLocaleString()} → ${current.toLocaleString()} (YoY)`;
  };

  const MerchantMap = dynamic(
    () => import('@/components/merchant-map').then((mod) => mod.MerchantMap),
    { 
      ssr: false, // Ini bagian terpenting: menonaktifkan Server-Side Rendering
      loading: () => (
        <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )
    }
  )

  const cbgOptions = useMemo(() => {
    // Buat array objek { value: cd_cbg, label: cbg }, pastikan unik dan terurut, abaikan value kosong/0
    const allCabang = merchants.map(m => {
      const cbg = typeof m.cbg === 'string' ? m.cbg.trim() : '';
      let cd_cbg = typeof m.cd_cbg === 'string' ? m.cd_cbg.trim() : '';
      if (cd_cbg === '' || cd_cbg === '0') return null;
      if (cbg && cd_cbg) return { value: cd_cbg, label: cbg };
      return { value: cd_cbg, label: cd_cbg };
    }).filter((v): v is { value: string; label: string } => v !== null && v.value.length > 0);
    // Unik berdasarkan value
    const uniqueMap = new Map();
    allCabang.forEach(item => {
      if (!uniqueMap.has(item.value)) uniqueMap.set(item.value, item.label);
    });
    const uniqueSorted = Array.from(uniqueMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    return [{ value: 'all', label: 'Semua Cabang' }, ...uniqueSorted.map(([value, label]) => ({ value, label }))];
  }, [merchants]);

  const segmenOptions = useMemo(() => {
    const allSegmen = merchants.map(m => typeof m.segmen === 'string' ? m.segmen.trim() : '').filter(Boolean);
    const uniqueSorted = Array.from(new Set(allSegmen)).sort((a, b) => a.localeCompare(b));
    return ['all', ...uniqueSorted];
  }, [merchants]);

  const handleFilterChange = (key: 'cbg' | 'segmen', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const [activeTab, setActiveTab] = useState("merchant-tracker");

  return (
    <AuthGuard>
  <div className="min-h-screen">
        {/* Header */}
  <header className="sticky top-0 z-20 bg-card shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <MobileNav className="md:hidden" setActiveTab={setActiveTab} />
          <Image
            src="/logo-mandiri.png"
            alt="Bank Mandiri Logo"
            height={24}
            width={80}
            className="h-6 w-auto"
            priority
          />
          <div className="h-6 w-px bg-slate-400 mx-2"></div>
          <Image
            src="/logo-mit.png"
            alt="m.it Logo"
            width={180}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </div>
    </div>
  </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ...existing code... */}
          {/* Tabs & Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden md:grid w-full grid-cols-2">
              <TabsTrigger value="merchant-tracker">Merchant Tracker</TabsTrigger>
              <TabsTrigger value="mandirian-pocket">Mandirian Pocket</TabsTrigger>
            </TabsList>

            <TabsContent value="mandirian-pocket" className="space-y-6">
              <DynamicUploader />
              {processedData.length > 0 && (
                <div className="mt-8">
                  {/* Filter Bulan & Generate Report Button */}
                  <div className="flex items-end justify-between mb-4">
                    <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm border mb-0">
                      <label className="text-sm font-medium whitespace-nowrap">Pilih Bulan untuk KPI</label>
                      <div className="max-w-[160px] min-w-0 w-full">
                        <ThemedReactSelect
                          options={availableMonths}
                          value={availableMonths.find(opt => opt.value === selectedMonth) || null}
                          onChange={opt => setSelectedMonth(opt?.value || 'all')}
                          isSearchable
                          placeholder="Pilih Bulan"
                          classNamePrefix="react-select"
                          className="w-full min-w-[120px] max-w-[160px]"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleGenerateReport}
                    >
                      <FileDown className="w-4 h-4" />
                      Generate Report
                    </Button>
                  </div>

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {processedData.map((product) => (
                      <ProductKPICard 
                        key={product.productName}
                        product={product} 
                        selectedMonth={selectedMonth || availableMonths[0]?.value || "all"} // Pastikan string
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="merchant-tracker" className="space-y-6">
              {merchants.length === 0 ? (
                <>
                  {/* Hero Section */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Selamat Datang di Merchant Tracker</h2>
                    <p className="text-base text-muted-foreground mb-6 max-w-lg mx-auto">Platform analitik merchant Bank Mandiri. Unggah data merchant Anda untuk mulai menganalisis, memantau performa, dan mengekspor laporan.</p>
                  </div>
                  {/* Upload Area */}
                  <div className="max-w-2xl mx-auto">
                    <div className="border-2 border-dashed rounded-xl p-10 bg-card flex flex-col items-center justify-center">
                      <CSVUpload />
                    </div>
                    {/* Accordion for Required Columns */}
                    <div className="mt-6">
                      {/* Accordion will be rendered inside CSVUpload */}
                    </div>
                  </div>
                </>
              ) : (
                <div ref={merchantReportRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* Kolom Kiri: Konten Utama */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Filter */}
                    <div className="md:hidden mb-4">
                      <FilterSheet
                        filters={filters}
                        setFilters={setFilters}
                        cbgOptions={cbgOptions}
                        segmenOptions={segmenOptions}
                      />
                    </div>
                    <div className="w-full flex items-end justify-between gap-4 mb-2 p-4 bg-card rounded-lg shadow-sm border hidden md:flex">
                      {/* Filter Group */}
                      <div className="flex items-center gap-4">
                        {/* Filter Cabang */}
                        <div className="flex flex-col w-[150px]">
                            <label className="text-sm font-medium text-foreground mb-1">Cabang</label>
                            <ThemedReactSelect
                              options={cbgOptions}
                              value={cbgOptions.find(opt => opt.value === filters.cbg)}
                              onChange={opt => handleFilterChange('cbg', opt?.value ?? 'all')}
                              isSearchable
                              placeholder="Pilih Cabang"
                            />
                        </div>
                        {/* Filter Segmen */}
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-foreground mb-1">Segmen</label>
                          <Select value={filters.segmen} onValueChange={(value: string) => handleFilterChange('segmen', value)}>
                              <SelectTrigger className="w-[150px]">
                              <SelectValue>
                                {filters.segmen === 'all' ? 'Semua Segmen' : filters.segmen || 'Pilih Segmen'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent side="bottom">
                              {segmenOptions.map(segmen => (
                                <SelectItem key={segmen ?? ''} value={segmen ?? ''}>{segmen === 'all' ? 'Semua Segmen' : segmen || '-'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {(filters.cbg !== 'all' || filters.segmen !== 'all') && (
                          <Button variant="outline" className="h-10 mt-6 sm:mt-0" onClick={() => setFilters({ cbg: 'all', segmen: 'all' })}>
                            Reset Filter
                          </Button>
                        )}
                      </div>
                      {/* Button Group */}
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          className="hidden"
                          onChange={handleFileUpdate}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 mt-6 sm:mt-0 flex items-center gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4" />
                          Update Data
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 mt-6 sm:mt-0 flex items-center gap-2"
                          onClick={handleGenerateReport}
                          disabled={isGenerating}
                        >
                          <FileDown className="w-4 h-4" />
                          {isGenerating ? 'Generating...' : 'Generate Report'}
                        </Button>
                      </div>
                    </div>
                    {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KPICard
                      title="Total Merchants"
                      value={stats.comparison?.merchants?.value ?? 0}
                      comparisonText={formatComparisonText(stats.comparison?.merchants?.value ?? 0, stats.comparison?.merchants?.prevValue ?? 0, "Prev")}
                      growth={stats.comparison?.merchants?.growth ?? 0}
                    />
                    <KPICard
                      title="Total Transactions (YtD)"
                      value={stats.comparison?.trx?.value ?? 0}
                      comparisonText={formatComparisonText(stats.comparison?.trx?.value ?? 0, stats.comparison?.trx?.prevValue ?? 0, "Prev")}
                      growth={stats.comparison?.trx?.growth ?? 0}
                    />
                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Volume & MDFG (YtD)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">Total Sales Volume (YtD)</div>
                        <div className="text-lg font-bold text-foreground">
                          Rp {stats.comparison?.sv?.value?.toLocaleString() ?? 0}
                        </div>
                        <div className={`text-xs font-semibold ${(stats.comparison?.sv?.growth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(stats.comparison?.sv?.growth ?? 0).toFixed(1)}% YoY
                        </div>
                        <div className="text-xs text-muted-foreground">{formatComparisonText(stats.comparison?.sv?.value ?? 0, stats.comparison?.sv?.prevValue ?? 0, "Prev")}</div>
                        <hr className="my-2 border-slate-700" />
                        <div className="text-xs text-muted-foreground">Total MDFG (YtD)</div>
                        <div className="text-lg font-bold text-foreground">
                          {stats.comparison?.mdfg?.value?.toLocaleString() ?? 0}
                        </div>
                        <div className={`text-xs font-semibold ${(stats.comparison?.mdfg?.growth ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(stats.comparison?.mdfg?.growth ?? 0).toFixed(1)}% YoY
                        </div>
                      </CardContent>
                    </Card>
                    <KPICard
                      title="Total EDC Devices"
                      value={stats.comparison?.edc?.value ?? 0}
                      comparisonText={formatComparisonText(stats.comparison?.edc?.value ?? 0, stats.comparison?.edc?.prevValue ?? 0, "Prev")}
                      growth={stats.comparison?.edc?.growth ?? 0}
                    />
                  </div>
                  {/* Chart Tren */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>4-Week Transaction (Trx) Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.trxTrend || []} className="w-full h-full" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <XAxis dataKey="week" stroke="#334155" fontSize={12} />
                              <YAxis stroke="#334155" fontSize={12} />
                              <Tooltip />
                              <Bar dataKey="trx" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>4-Week Sales Volume (SV) Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.svTrend || []} className="w-full h-full" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <XAxis dataKey="week" stroke="#334155" fontSize={12} />
                              <YAxis stroke="#334155" fontSize={12} />
                              <Tooltip />
                              <Bar dataKey="sv" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    {/* 4-Week MDFG Trend Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle>4-Week MDFG Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.mdfgTrend || []} className="w-full h-full" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <XAxis dataKey="week" stroke="#334155" fontSize={12} />
                              <YAxis stroke="#334155" fontSize={12} />
                              <Tooltip />
                              <Bar dataKey="mdfg" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Tabel Peringkat */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <TopMerchantsTable data={filteredMerchants} />
                    <TopBranchesTable data={filteredMerchants} />
                  </div>
                  {/* Chart Leaderboard Baru */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <TopLOBByMDFGChart />
                    <TopLOBBySVChart />
                  </div>
                  <div className="mt-6">
                    <TopMerchantsMDFGChart />
                  </div>
                  {/* Chart Distribusi */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <SegmentDistribution />
                    <EDCByBranch />
                  </div>
                </div>
                {/* Kolom Kanan: Peta Merchant */}
                <div className="lg:col-span-1 sticky top-24">
                  <Card className="h-[70vh] flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Merchant Map
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <MerchantMap />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          </Tabs>
        </main>
      </div>

    </AuthGuard>
  )
}

