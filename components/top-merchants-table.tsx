"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel, // Tambahkan ini
  useReactTable,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import type { MerchantData } from "@/lib/types";
import { useMerchants } from "@/contexts/merchant-context";

interface TopMerchantsTableProps {
  data: MerchantData[];
}

// Fungsi helper untuk menghitung total SV
function getTotalSV(merchant: MerchantData): number {
  return Object.keys(merchant)
    .filter((k) => k.startsWith("sv w"))
    .reduce((sum, k) => sum + (Number(merchant[k as keyof MerchantData]) || 0), 0);
}

export function TopMerchantsTable({ data }: TopMerchantsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const { setSelectedMerchant } = useMerchants();

  // Proses data mentah menjadi data yang siap ditampilkan di tabel
  const tableData = useMemo(() =>
    data.map((m) => ({
      mid_new: m.mid_new,
      name: m.merchantofficialname || m.commonname || "N/A",
      sv: getTotalSV(m),
      originalMerchant: m, // Simpan data merchant asli untuk onClick handler
    })),
    [data]
  );

  // Definisikan kolom untuk tabel
  const columns = useMemo<ColumnDef<typeof tableData[0]>[]>(() => [
    {
      header: "Peringkat",
      cell: ({ row }) => row.index + 1, // Peringkat akan otomatis menyesuaikan dengan filter & sort
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Nama Merchant",
    },
    {
      accessorKey: "sv",
      header: "Total SV (4 Minggu)",
      cell: info => (info.getValue() as number).toLocaleString('id-ID'), // Format angka Indonesia
    },
  ], []);

  // Inisialisasi table instance
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
    getFilteredRowModel: getFilteredRowModel(), // Aktifkan model filter
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle>Papan Peringkat Merchant (SV 4 Minggu)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Cari Nama Merchant..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <div className="rounded-md border">
          <table className="min-w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
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
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedMerchant(row.original.originalMerchant)}
                  >
                    {row.getVisibleCells().map(cell => (
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