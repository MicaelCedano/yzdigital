'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency, getTierPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Eye, Tag } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getQty = (id: string) => quantities[id] || 1;
  const setQty = (id: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-14 text-center">Foto</th>
              <th className="py-3.5 px-4">Producto & Especificaciones</th>
              <th className="py-3.5 px-3">SKU</th>
              <th className="py-3.5 px-3">Categoría</th>
              <th className="py-3.5 px-3 text-center">Stock</th>
              <th className="py-3.5 px-3 text-right bg-blue-50/50 text-blue-900 border-x border-slate-200">
                1 - 9 uds
              </th>
              <th className="py-3.5 px-3 text-right bg-blue-50/70 text-blue-900 border-r border-slate-200">
                10 - 49 uds
              </th>
              <th className="py-3.5 px-3 text-right bg-emerald-50 text-emerald-900 border-r border-slate-200">
                50+ uds (VIP)
              </th>
              <th className="py-3.5 px-4 text-center">Cotizar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const price = product.currentPrice;
              if (!price) return null;

              const qty = getQty(product.id);
              const currentTier = getTierPrice(qty, {
                tier1: price.priceTier1,
                tier2: price.priceTier2,
                tier3: price.priceTier3,
              });

              const isAvailable = product.stock > 0 && product.isActive;

              return (
                <tr
                  key={product.id}
                  className="hover:bg-blue-50/40 transition-colors group"
                >
                  {/* Foto */}
                  <td className="py-3 px-4 text-center align-middle">
                    <Link
                      href={`/lista-precios/${product.id}`}
                      className="inline-block w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden p-0.5 group-hover:border-blue-300 transition-colors"
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.model}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold">
                          N/A
                        </div>
                      )}
                    </Link>
                  </td>

                  {/* Producto & Specs */}
                  <td className="py-3 px-4 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded">
                        {product.brand}
                      </span>
                      <Link
                        href={`/lista-precios/${product.id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm"
                      >
                        {product.model}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {product.capacity}
                      </span>
                      {product.color && <span>• {product.color}</span>}
                    </div>
                    {product.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    )}
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-3 align-middle font-mono text-[11px] text-slate-500">
                    {product.sku}
                  </td>

                  {/* Categoría */}
                  <td className="py-3 px-3 align-middle text-slate-600 font-medium">
                    {product.category?.name || '-'}
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-3 align-middle text-center">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {product.stock}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Agotado
                      </span>
                    )}
                  </td>

                  {/* Tier 1: 1-9 */}
                  <td
                    className={`py-3 px-3 align-middle text-right border-x border-slate-100 font-bold ${
                      qty >= 1 && qty <= 9
                        ? 'bg-blue-100 text-blue-950 font-black'
                        : 'text-slate-800'
                    }`}
                  >
                    {formatCurrency(getTierPrice(1, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                  </td>

                  {/* Tier 2: 10-49 */}
                  <td
                    className={`py-3 px-3 align-middle text-right border-r border-slate-100 font-bold ${
                      qty >= 10 && qty <= 49
                        ? 'bg-blue-100 text-blue-950 font-black'
                        : 'text-slate-800'
                    }`}
                  >
                    {formatCurrency(getTierPrice(10, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                  </td>

                  {/* Tier 3: 50+ */}
                  <td
                    className={`py-3 px-3 align-middle text-right border-r border-slate-100 font-bold ${
                      qty >= 50
                        ? 'bg-emerald-100 text-emerald-950 font-black'
                        : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(getTierPrice(50, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                  </td>

                  {/* Quick Quote Controls */}
                  <td className="py-3 px-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                        <button
                          onClick={() => setQty(product.id, qty - 1)}
                          disabled={qty <= 1}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) => setQty(product.id, parseInt(e.target.value) || 1)}
                          className="w-9 text-center bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() => setQty(product.id, qty + 1)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => addItem(product, qty)}
                        disabled={!isAvailable}
                        title="Agregar a cotización"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/lista-precios/${product.id}`}
                        title="Ver detalle"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
