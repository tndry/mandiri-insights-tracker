"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useMerchants } from "@/contexts/merchant-context";

export function TopMerchantsMDFGChart() {
  const { stats } = useMerchants();
  const chartData = stats.topMerchantsByMDFG || [];

  if (!chartData.length) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle>Top 5 Merchants by MDFG</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      <CardHeader>
        <CardTitle>Top 5 Merchants by MDFG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fontSize: 12 }}
                tickFormatter={(name: string) => name.length > 18 ? name.slice(0, 17) + '…' : name}
              />
              <Tooltip formatter={(value: number) => [value, "MDFG"]} />
              <Bar dataKey="mdfg" fill="#3b82f6" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
