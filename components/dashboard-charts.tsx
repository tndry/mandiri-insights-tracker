
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
  Pie,
  Bar,
} from "recharts";
import { Users, MapPin } from "lucide-react";
import { useMerchants } from "@/contexts/merchant-context";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];
const moneyFormatter = (number: number) => `Rp ${new Intl.NumberFormat('id').format(number)}`;

// PERBAIKAN: Seluruh logika dan JSX harus berada di dalam fungsi komponen
export function SegmentDistribution() {
  const { stats } = useMerchants();
  const chartData = Object.entries(stats.segmentDistribution).map(([segment, count]) => ({
    name: segment,
    value: count,
  }));
  if (chartData.length === 0) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Merchant Segments</CardTitle>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center text-muted-foreground">
          No segment data available
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Merchant Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`}>
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
    </Card>
  );
}

export function EDCByBranch() {
  const { stats } = useMerchants();
  const chartData = Object.entries(stats.edcByBranch)
    .map(([branch, count]) => ({ branch, count: Number(count) }))
    .filter(item => item.branch && item.branch !== 'Unknown' && !isNaN(item.count))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  if (chartData.length === 0) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> EDC Devices by Branch (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-muted-foreground">No valid branch data available</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> EDC Devices by Branch (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="branch" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [value, "EDC Devices"]} />
              <Bar dataKey="count" fill="#3b82f6" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionTrendChart() {
  const { stats } = useMerchants();
  const chartData = (stats.trxTrend || []).map(item => ({
    week: item.week,
    trx: item.trx,
  }));
  if (chartData.length === 0) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle>4-Week Transaction (Trx) Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-muted-foreground">No transaction data available</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      <CardHeader>
        <CardTitle>4-Week Transaction (Trx) Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value: number) => [value, "Transactions"]} />
              <Bar dataKey="trx" fill="#8b5cf6" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesVolumeTrendChart() {
  const { stats } = useMerchants();
  const chartData = (stats.svTrend || []).map(item => ({
    week: item.week,
    sv: item.sv,
  }));
  if (chartData.length === 0) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle>4-Week Sales Volume (SV) Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-muted-foreground">No sales volume data available</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      <CardHeader>
        <CardTitle>4-Week Sales Volume (SV) Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis tickFormatter={(value: number) => `Rp${(value / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value: number) => `Rp${value.toLocaleString()}`} />
              <Bar dataKey="sv" fill="#10b981" name="Sales Volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}