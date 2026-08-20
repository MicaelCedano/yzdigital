'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { formatCurrency, getTierPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
  Truck,
  Building2,
  DollarSign,
  Package,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/products/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Producto no encontrado');
          return res.json();
        })
        .then((data) => setProduct(data.product))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 animate-pulse h-96" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">No se pudo cargar el producto</h2>
        <p className="text-xs text-slate-500">{error || 'El producto no existe o fue deshabilitado.'}</p>
        <Link
          href="/lista-precios"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>
    );
  }

  const price = product.currentPrice;
  const isAvailable = product.stock > 0 && product.isActive;

  const currentTier = price
    ? getTierPrice(quantity, {
        tier1: price.priceTier1,
        tier2: price.priceTier2,
        tier3: price.priceTier3,
      })
    : { price: 0, tierLabel: 'N/A' };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Botón Volver */}
      <Link
        href="/lista-precios"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Lista de Precios</span>
      </Link>

      {/* Tarjeta Principal de Detalle */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Imagen del Producto */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-white p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
          <div className="relative w-full max-w-sm aspect-square bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={`${product.brand} ${product.model}`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-slate-300 text-sm font-bold uppercase">Sin Imagen</div>
            )}
          </div>
        </div>

        {/* Información y Compra */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* Meta Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {product.category?.name}
              </span>
              {isAvailable ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Disponible ({product.stock} un.)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Agotado</span>
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {product.model}
            </h1>

            {/* Atributos Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacidad</span>
                <span className="text-xs font-bold text-slate-800">{product.capacity}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Color</span>
                <span className="text-xs font-bold text-slate-800">{product.color || 'Estándar'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Código SKU</span>
                <span className="text-xs font-mono font-bold text-slate-800">{product.sku}</span>
              </div>
            </div>

            {/* Descripción */}
            {product.description && (
              <div className="space-y-1 mt-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                  Especificaciones Técnicas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>

          {/* Caja de Precios por Volumen */}
          {price && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Escala Mayorista Aplicada ({price.currency})</span>
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Nivel Activo: {currentTier.tierLabel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`p-3 rounded-xl border text-center transition-all ${
                      quantity >= 1 && quantity <= 9
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-80">1 - 9 unidades</span>
                    <span className="text-sm font-black block mt-0.5">
                      {formatCurrency(getTierPrice(1, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center transition-all ${
                      quantity >= 10 && quantity <= 49
                        ? 'bg-blue-600 text-white shadow-md font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-80">10 - 49 unidades</span>
                    <span className="text-sm font-black block mt-0.5">
                      {formatCurrency(getTierPrice(10, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center transition-all ${
                      quantity >= 50
                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-80">50+ unidades (VIP)</span>
                    <span className="text-sm font-black block mt-0.5">
                      {formatCurrency(getTierPrice(50, { tier1: price.priceTier1, tier2: price.priceTier2, tier3: price.priceTier3 }).price, price.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de Cantidades y Botón de Cotización */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Subtotal Estimado:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(currentTier.price * quantity, price.currency)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ({quantity} uds x {formatCurrency(currentTier.price, price.currency)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Selector de Cantidad */}
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center bg-transparent text-sm font-black text-slate-900 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botón Agregar */}
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Agregar a Cotización</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Garantías Mayoristas */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Garantía oficial directa</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Despacho prioritario 24h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
