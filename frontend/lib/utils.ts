import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} Miliar`
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace('.', ',')} Juta`
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Ribu`
  }
  return `Rp ${value.toLocaleString('id-ID')}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('id-ID')
}
