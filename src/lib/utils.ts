import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  const normalizedAmount = amount ?? 0;
  if (currency === 'DOP' || currency === 'RD$') {
    return `RD$ ${normalizedAmount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$ ${normalizedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getTierPrice(
  quantity: number,
  tiers: { tier1: number | null | undefined; tier2: number | null | undefined; tier3: number | null | undefined }
): { price: number; tierLabel: string } {
  if (quantity >= 50) {
    return { price: tiers.tier3 ?? tiers.tier2 ?? tiers.tier1 ?? 0, tierLabel: '50+ uds' };
  }
  if (quantity >= 10) {
    return { price: tiers.tier2 ?? tiers.tier1 ?? 0, tierLabel: '10-49 uds' };
  }
  return { price: tiers.tier1 ?? 0, tierLabel: '1-9 uds' };
}
