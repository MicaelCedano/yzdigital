'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency, getTierPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import {
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Tag,
  Eye,
  Info,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showTiers, setShowTiers] = useState(false);

  const price = product.currentPrice;
  if (!price) return null;

  const currentTier = getTierPrice(quantity, {
    tier1: price.priceTier1,
    tier2: price.priceTier2,
    tier3: price.priceTier3,
  });

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const isAvailable = product.stock > 0 && product.isActive;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top Header info */}
      <div className="p-4 flex gap-3.5 items-start">
        {/* Product Image */}
        <Link
          href={`/lista-precios/${product.id}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 flex items-center justify-center p-1 group-hover:border-blue-200 transition-colors"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.brand} ${product.model}`}
              className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-slate-300 text-xs font-bold uppercase text-center p-2">
              Sin Imagen
            </div>
          )}
        </Link>

        {/* Product Meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 tracking-wider">
              {product.brand}
            </span>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Stock: {product.stock}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                <span>Agotado</span>
              </span>
            )}
          </div>

          <Link
            href={`/lista-precios/${product.id}`}
            className="block font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-1 leading-snug"
          >
            {product.model}
          </Link>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
              {product.capacity}
            </span>
            {product.color && (
              <span className="text-slate-500 truncate max-w-[120px]">
                {product.color}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-mono mt-1">
            SKU: {product.sku}
          </p>
        </div>
      </div>

      {/* Description Snippet */}
      {product.description && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Pricing and Volume Scale Box */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-b border-slate-100 mt-auto">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Precio Mayorista ({currentTier.tierLabel})
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 tracking-tight">
                {formatCurrency(currentTier.price, price.currency)}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {price.currency} / ud
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowTiers(!showTiers)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline underline-offset-2"
          >
            <Tag className="w-3 h-3" />
            <span>{showTiers ? 'Ocultar escalas' : 'Ver escalas'}</span>
          </button>
        </div>

        {/* Volume Tiers Breakdown dropdown / accordion */}
        {showTiers && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 grid grid-cols-3 gap-1.5 text-center text-xs animate-fade-in">
            <div
              className={`p-1.5 rounded-lg border ${
                quantity >= 1 && quantity <= 9
                  ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">1 - 9 uds</div>
              <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                {formatCurrency(price.priceTier1, price.currency)}
              </div>
            </div>

            <div
              className={`p-1.5 rounded-lg border ${
                quantity >= 10 && quantity <= 49
                  ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-500">10 - 49 uds</div>
              <div className="font-extrabold text-xs text-slate-900 mt-0.5">
                {formatCurrency(price.priceTier2, price.currency)}
              </div>
            </div>

            <div
              className={`p-1.5 rounded-lg border ${
                quantity >= 50
                  ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-900'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-emerald-700">50+ uds</div>
              <div className="font-extrabold text-xs text-emerald-800 mt-0.5">
                {formatCurrency(price.priceTier3, price.currency)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions and Quantity Selector */}
      <div className="p-4 flex items-center gap-2 bg-white">
        {/* Quantity Controls */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-11 text-center bg-transparent text-xs font-black text-slate-900 focus:outline-none"
          />
          <button
            onClick={handleIncrement}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Add to Quote Button */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Agregar</span>
        </button>

        {/* View Details Link */}
        <Link
          href={`/lista-precios/${product.id}`}
          title="Ver ficha completa"
          className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors"
        >
          <Eye className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
