"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, PieLabelRenderProps } from "recharts";
// ...existing code...
import { useMerchants } from "@/contexts/merchant-context";

const COLORS = ["#005b9f", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function TopLOBByMDFGChart() {
  const { stats } = useMerchants();
  const chartData = stats.topLOBsByMDFG || [];

  if (!chartData.length) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle>Top 5 LOB by MDFG</CardTitle>
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
        <CardTitle>Top 5 LOB by MDFG</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72" style={{ marginRight: 30 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={65}
                labelLine={false}
                label={(props: any) => {
                  const cx = typeof props.cx === 'number' ? props.cx : 0;
                  const cy = typeof props.cy === 'number' ? props.cy : 0;
                  const midAngle = typeof props.midAngle === 'number' ? props.midAngle : 0;
                  const outerRadius = typeof props.outerRadius === 'number' ? props.outerRadius : 0;
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  const radius = outerRadius + 10;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="var(--pie-label-color)"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={14}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-mdfg-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopLOBBySVChart() {
  const { stats } = useMerchants();
  const chartData = stats.topLOBsBySV || [];

  if (!chartData.length) {
    return (
      <Card className="transition-shadow hover:shadow-md">
        <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
        <CardHeader>
          <CardTitle>Top 5 LOB by Sales Volume</CardTitle>
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
        <CardTitle>Top 5 LOB by Sales Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72" style={{ marginRight: 30 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={65}
                labelLine={false}
                label={(props: any) => {
                  const cx = typeof props.cx === 'number' ? props.cx : 0;
                  const cy = typeof props.cy === 'number' ? props.cy : 0;
                  const midAngle = typeof props.midAngle === 'number' ? props.midAngle : 0;
                  const outerRadius = typeof props.outerRadius === 'number' ? props.outerRadius : 0;
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  const radius = outerRadius + 10;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="var(--pie-label-color)"
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={14}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-sv-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
