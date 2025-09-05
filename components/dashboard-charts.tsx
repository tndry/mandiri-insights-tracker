"use client"
import { DashboardCard } from "./ui/dashboard-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Users, MapPin } from "lucide-react"
import { useMerchants } from "@/contexts/merchant-context"

// Cukup deklarasikan satu kali di paling atas
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"]

export function SegmentDistribution() {
  const { stats } = useMerchants()

  const chartData = Object.entries(stats.segmentDistribution).map(([segment, count]) => ({
    segment,
    count,
  }))

  const renderCustomizedLabel = ({ percent }: { percent: number }) => {
    return `${(percent * 100).toFixed(1)}%`;
  };

  if (chartData.length === 0) {
    return (
      <DashboardCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Merchant Segments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">No segment data available</div>
        </CardContent>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Merchant Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="segment"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} merchants`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </DashboardCard>
  );
}

export function TransactionTrendChart() {
  const { stats } = useMerchants();

  return (
    <Card>
      <CardHeader>
        <CardTitle>4-Week Transaction (Trx) Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.trxTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip formatter={(value: number) => [value.toLocaleString(), "Transactions"]} />
            <Bar dataKey="trx" fill="#3b82f6" name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EDCByBranch() {
  const { stats } = useMerchants();

  const chartData = Object.entries(stats.edcByBranch)
    .map(([branch, count]) => ({ branch, count: Number(count) }))
    .filter(item => 
      typeof item.branch === 'string' && 
      item.branch.trim() !== '' && 
      item.branch !== 'Unknown' &&
      !isNaN(item.count)
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (chartData.length === 0) {
    return (
      <DashboardCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> EDC Devices by Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">No valid branch data available</div>
        </CardContent>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> EDC Devices by Branch (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="branch" 
                width={100} 
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <Tooltip formatter={(value: number) => [value, "EDC Devices"]} />
              <Bar dataKey="count" fill="#3b82f6" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </DashboardCard>
  );
}

export function SalesVolumeTrendChart() {
  const { stats } = useMerchants();
  return (
    <Card>
      <CardHeader>
        <CardTitle>4-Week Sales Volume (SV) Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.svTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis tickFormatter={(value: number) => `Rp${(value / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value: number) => `Rp${value.toLocaleString()}`} />
            <Bar dataKey="sv" fill="#10b981" name="Sales Volume" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}