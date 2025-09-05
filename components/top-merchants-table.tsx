"use client";
import { DashboardCard } from "./ui/dashboard-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useMerchants } from "@/contexts/merchant-context";

export function TopMerchantsTable() {
  const { stats, setHoveredMerchantId } = useMerchants();
  const data = (stats.topMerchantsBySV || []).map((row, idx) => ({
    mid_new: (row as any).mid_new ?? String(idx),
    name: row.name,
    sv: row.sv,
  }));

  return (
    <DashboardCard>
      <CardHeader>
        <CardTitle>Papan Peringkat Merchant (SV 4 Minggu)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Tidak ada data merchant untuk ditampilkan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-2 text-left">Peringkat</th>
                  <th className="px-2 py-2 text-left">Nama Merchant</th>
                  <th className="px-2 py-2 text-right">Total SV (4 Minggu)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr
                    key={row.name + '-' + idx}
                    className="border-b cursor-pointer"
                    onMouseEnter={() => setHoveredMerchantId(row.mid_new)}
                    onMouseLeave={() => setHoveredMerchantId(null)}
                  >
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">{row.name}</td>
                    <td className="px-2 py-2 text-right">{row.sv.toLocaleString()}</td>
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
