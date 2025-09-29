import * as React from "react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Overview & Map" },
  { href: "/dashboard/upload", label: "Upload Data" },
  { href: "/dashboard/reports", label: "Reports" },
];


interface MobileNavProps {
  className?: string;
  setActiveTab?: (tab: string) => void;
}

export function MobileNav({ className, setActiveTab }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  // Mobile tab options to match desktop
  const mobileTabs = [
    { value: "merchant-tracker", label: "Merchant Tracker" },
    { value: "mandirian-pocket", label: "Mandirian Pocket" },
  ];
  const handleNav = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    setOpen(false);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Navigasi Utama</SheetTitle>
          <SheetDescription>Pilih halaman tujuan Anda.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-6 pt-2">
          {mobileTabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              className="justify-start text-base font-medium py-2 px-3 rounded hover:bg-muted transition-colors"
              onClick={() => handleNav(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
