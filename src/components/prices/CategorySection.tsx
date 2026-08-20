'use client';

import React, { useState } from 'react';
import { Product, Category } from '@/types';
import { ProductCard } from './ProductCard';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface CategorySectionProps {
  category: Category;
  products: Product[];
}

export function CategorySection({ category, products }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (products.length === 0) return null;

  return (
    <div className="mb-8 bg-white/50 rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
      {/* Category Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {products.length} {products.length === 1 ? 'modelo' : 'modelos'}
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
