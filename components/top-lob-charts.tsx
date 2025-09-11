"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, PieLabelRenderProps } from "recharts";
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
                label={(props: any) => {
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  return (
                    <text
                      x={props.cx}
                      y={props.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#333"
                      fontSize={14}
                    >
                      {`${Math.round(percent * 100)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-mdfg-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
              <Legend align="center" verticalAlign="bottom" />
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
                label={(props: any) => {
                  const percent = typeof props.percent === 'number' ? props.percent : 0;
                  return (
                    <text
                      x={props.cx}
                      y={props.cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#333"
                      fontSize={14}
                    >
                      {`${Math.round(percent * 100)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-sv-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
              <Legend align="center" verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
