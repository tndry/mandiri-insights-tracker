"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { MerchantData } from "@/lib/types";

interface TopBranchesTableProps {
  data: MerchantData[];
}

function getTotalTrx(merchants: MerchantData[]): number {
  let totalTrx = 0;
  merchants.forEach(m => {
    const trxKeys = Object.keys(m).filter((k) => k.startsWith("trx w")); // Lebih spesifik ke 'trx w'
    trxKeys.forEach(key => {
        totalTrx += Number(m[key as keyof MerchantData]) || 0;
    });
  });
  return totalTrx;
}

export function TopBranchesTable({ data }: TopBranchesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const tableData = useMemo(() => {
    const branchMap = new Map<string, MerchantData[]>();
    data.forEach((m) => {
      const branch = (m["nama cabang rek"] || "Unknown").trim();
      if (!branchMap.has(branch)) branchMap.set(branch, []);
      branchMap.get(branch)!.push(m);
    });

    return Array.from(branchMap.entries()).map(([branch, merchants]) => ({
      branch,
      trx: getTotalTrx(merchants),
    }));
  }, [data]);

  const columns = useMemo<ColumnDef<{ branch: string; trx: number }>[]>(
    () => [
      {
        header: "Peringkat",
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return row.index + 1 + pageIndex * pageSize;
        },
        enableSorting: false,
        size: 70, // Sedikit lebih lebar
        minSize: 60,
        maxSize: 80,
      },
      {
        accessorKey: "branch",
        header: "Nama Cabang",
        cell: (info) => info.getValue(),
        enableSorting: true,
        minSize: 150, // Minimal lebar untuk nama cabang
        size: 200,
      },
      {
        accessorKey: "trx",
        header: "Total Trx (4 Minggu)",
        cell: (info) => (
          <div className="text-right whitespace-nowrap"> {/* Tambahkan text-right dan whitespace-nowrap */}
            {(info.getValue() as number).toLocaleString('id-ID')}
          </div>
        ),
        enableSorting: true,
        size: 150, // Sesuaikan lebar agar muat
        minSize: 120, // Minimal lebar
        maxSize: 180, // Maksimal lebar
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>Papan Peringkat Cabang (Trx 4 Minggu)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Cari Nama Cabang..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      // Hapus style={{ width: header.getSize() }} dari sini jika sudah di handle oleh flexRender
                      className="px-4 py-2 text-left font-medium cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Tidak ada hasil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginasi */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}