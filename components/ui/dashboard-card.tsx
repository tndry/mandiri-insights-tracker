import * as React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className }: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md relative overflow-hidden", 
        className
      )}
    >
      <div className="h-1 w-full rounded-t-lg bg-mandiri-blue" />
      {children}
    </Card>
  );
}
