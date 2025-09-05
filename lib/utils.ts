// Format angka besar menjadi string yang mudah dibaca
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(1).replace('.', ',') + ' Triliun';
  }
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace('.', ',') + ' Miliar';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace('.', ',') + ' Juta';
  }
  if (num >= 1_000) {
    return num.toLocaleString('id-ID');
  }
  return num.toString();
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
