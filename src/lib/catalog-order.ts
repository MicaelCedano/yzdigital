import type { Product } from '@/types';

// Los valores negativos identifican posiciones elegidas por el administrador.
// Los valores existentes (cero o positivos) conservan el orden por precio.
export function compareCatalogProducts(a: Product, b: Product): number {
  const manualA = a.sortOrder < 0;
  const manualB = b.sortOrder < 0;
  if (manualA !== manualB) return manualA ? -1 : 1;
  if (manualA && a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  const priceA = a.currentPrice?.priceTier1;
  const priceB = b.currentPrice?.priceTier1;
  const hasA = typeof priceA === 'number' && priceA > 0;
  const hasB = typeof priceB === 'number' && priceB > 0;
  if (hasA !== hasB) return hasA ? -1 : 1;
  if (hasA && hasB && priceA !== priceB) return priceA - priceB;
  return a.sortOrder - b.sortOrder || a.model.localeCompare(b.model, 'es') || a.id.localeCompare(b.id);
}
