'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/layout/Modal';
import { Product, PriceList, ProductPrice } from '@/types';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShieldAlert, History } from 'lucide-react';

interface PriceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
  priceList: PriceList | null;
  existingPrice?: ProductPrice | null;
}

export function PriceEditModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  priceList,
  existingPrice,
}: PriceEditModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    priceTier1: 0,
    priceTier2: 0,
    priceTier3: 0,
    currency: 'USD',
    validFrom: '',
    validUntil: '',
    isActive: true,
    reason: '',
  });

  useEffect(() => {
    if (existingPrice) {
      setFormData({
        priceTier1: existingPrice.priceTier1,
        priceTier2: existingPrice.priceTier2 ?? 0,
        priceTier3: existingPrice.priceTier3 ?? 0,
        currency: existingPrice.currency || 'USD',
        validFrom: existingPrice.validFrom ? existingPrice.validFrom.split('T')[0] : '',
        validUntil: existingPrice.validUntil ? existingPrice.validUntil.split('T')[0] : '',
        isActive: existingPrice.isActive,
        reason: '',
      });
    } else if (product) {
      setFormData({
        priceTier1: product.currentPrice?.priceTier1 || 0,
        priceTier2: product.currentPrice?.priceTier2 || 0,
        priceTier3: product.currentPrice?.priceTier3 || 0,
        currency: priceList?.currency || 'USD',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        isActive: true,
        reason: '',
      });
    }
  }, [existingPrice, product, priceList, isOpen]);

  if (!product || !priceList) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      error('Debe ingresar un motivo para el registro de auditoría');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          priceListId: priceList.id,
          priceTier1: formData.priceTier1,
          priceTier2: formData.priceTier2,
          priceTier3: formData.priceTier3,
          currency: formData.currency,
          validFrom: formData.validFrom || null,
          validUntil: formData.validUntil || null,
          isActive: formData.isActive,
          reason: formData.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar precios');
      }

      success('Precios mayoristas actualizados y registrados en la auditoría');
      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajuste de Precios Mayoristas"
      subtitle={`${product.brand} ${product.model} (${product.capacity}) • ${priceList.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Producto info box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-900">{product.brand} {product.model}</p>
            <p className="text-slate-500 font-mono">SKU: {product.sku} • Stock: {product.stock}</p>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-bold uppercase text-[10px]">
            {priceList.name}
          </span>
        </div>

        {/* Moneda y Vigencia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Moneda *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="DOP">DOP (RD$)</option>
              <option value="EUR">EUR (€)</option>
              <option value="MXN">MXN ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vigencia Desde
            </label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vigencia Hasta (Opcional)
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Escala de Precios por Volumen */}
        <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>Escala de Precios por Volumen ({formData.currency})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                1 a 9 unidades *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.priceTier1}
                onChange={(e) => setFormData({ ...formData, priceTier1: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Precio unitario base</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                10 a 49 unidades
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.priceTier2}
                onChange={(e) => setFormData({ ...formData, priceTier2: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Descuento intermedio</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">
                50+ unidades (VIP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.priceTier3}
                onChange={(e) => setFormData({ ...formData, priceTier3: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Mejor precio por lote</span>
            </div>
          </div>
        </div>

        {/* Motivo de Auditoría */}
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Motivo del Cambio (Requerido para Auditoría) *</span>
          </div>
          <input
            type="text"
            required
            placeholder="Ej: Actualización por cambio de aranceles / Promoción trimestral / Ajuste de costos"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        {/* Estado del Precio */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isPriceActiveCheck"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <label htmlFor="isPriceActiveCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
            Precio Vigente y Activo en esta Lista
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Registrando...' : 'Guardar y Auditar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
