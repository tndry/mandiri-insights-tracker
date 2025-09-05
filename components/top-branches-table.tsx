"use client";

import { DashboardCard } from "./ui/dashboard-card";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMerchants } from "@/contexts/merchant-context";

export function TopBranchesTable() {
  const { stats } = useMerchants();
  const data = stats.topBranchesByTrx || [];

  return (
    // Tag pembuka sudah benar
    <DashboardCard>
      <CardHeader>
        <CardTitle>Papan Peringkat Cabang (Trx 4 Minggu)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Tidak ada data cabang untuk ditampilkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left font-semibold">Peringkat</th>
                  <th className="px-2 py-2 text-left font-semibold">Nama Cabang</th>
                  <th className="px-2 py-2 text-right font-semibold">Total Trx (4 Minggu)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row.branch} className="border-b last:border-b-0">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">{row.branch}</td>
                    <td className="px-2 py-2 text-right">{row.trx.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </DashboardCard>
  );
}