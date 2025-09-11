"use client";
import * as React from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Filter } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

interface Option {
  value: string;
  label: string;
}

interface FilterSheetProps {
  filters: { cbg: string; segmen: string };
  setFilters: (filters: { cbg: string; segmen: string }) => void;
  cbgOptions: Option[];
  segmenOptions: string[];
}

export function FilterSheet({ filters, setFilters, cbgOptions, segmenOptions }: FilterSheetProps) {
  const handleChange = (key: "cbg" | "segmen", value: string) => {
    setFilters({ ...filters, [key]: value });
  };
  const handleReset = () => {
    setFilters({ cbg: "all", segmen: "all" });
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter
        </Button>
      </SheetTrigger>
  <SheetContent side="left" className="p-6">
        <SheetHeader>
          <SheetTitle>Filter Data</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cabang</label>
            <Select value={filters.cbg} onValueChange={(v) => handleChange("cbg", v)} modal={false}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-auto">
                {cbgOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Segmen</label>
            <Select value={filters.segmen} onValueChange={(v) => handleChange("segmen", v)} modal={false}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Segmen" />
              </SelectTrigger>
              <SelectContent>
                {segmenOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt === "all" ? "Semua Segmen" : opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={handleReset} className="w-full mt-2">Reset Filter</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
