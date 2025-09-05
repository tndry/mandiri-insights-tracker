import React from "react";
import { formatLargeNumber } from "@/lib/utils";
import { DashboardCard } from "./ui/dashboard-card";

interface KPICardProps {
  title: string;
  value: number;
  comparisonText: string;
  growth: number;
}

const getColor = (growth: number) => {
  if (growth > 0) return "text-green-600";
  if (growth < 0) return "text-red-600";
  return "text-gray-600";
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, comparisonText, growth }) => {
  // Format value
  let formattedValue = formatLargeNumber(value);
  if (title.toLowerCase().includes("volume")) {
    formattedValue = `Rp ${formattedValue}`;
  }
  return (
    <DashboardCard>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-sm text-gray-500 font-medium">{title}</div>
        <div className="font-bold text-xl md:text-2xl lg:text-3xl break-words">{formattedValue}</div>
        <div className={`text-sm font-semibold ${getColor(growth)}`}>
          {growth > 0 ? "▲" : growth < 0 ? "▼" : ""} {growth.toFixed(1)}% YoY
        </div>
        <div className="text-xs text-gray-400">{comparisonText}</div>
      </div>
    </DashboardCard>
  );
};
