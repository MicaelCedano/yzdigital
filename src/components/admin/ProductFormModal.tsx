'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/layout/Modal';
import { Category, Product } from '@/types';
import { useToast } from '@/context/ToastContext';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
  categories,
}: ProductFormModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [automaticTiers, setAutomaticTiers] = useState({ tier2: true, tier3: true });

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    capacity: '',
    imageUrl: '',
    price: '',
    priceTier2: '',
    priceTier3: '',
    inActiveList: true,
    categoryId: '',
  });

  useEffect(() => {
    if (productToEdit) {
      const priceTier1 = productToEdit.currentPrice?.priceTier1 || 0;
      const priceTier2 = productToEdit.currentPrice?.priceTier2 ?? Math.max(0, priceTier1 - 100);
      const priceTier3 = productToEdit.currentPrice?.priceTier3 ?? Math.max(0, priceTier1 - 200);
      const tier2IsAutomatic = priceTier2 === 0 || priceTier2 === priceTier1 || priceTier2 === Math.max(0, priceTier1 - 100);
      const tier3IsAutomatic = priceTier3 === 0 || priceTier3 === priceTier1 || priceTier3 === Math.max(0, priceTier1 - 200);
      setFormData({
        brand: productToEdit.brand || '',
        model: productToEdit.model || '',
        capacity: productToEdit.capacity || '',
        imageUrl: productToEdit.imageUrl || '',
        price: priceTier1 ? String(priceTier1) : '',
        priceTier2: String(tier2IsAutomatic ? Math.max(0, priceTier1 - 100) : priceTier2),
        priceTier3: String(tier3IsAutomatic ? Math.max(0, priceTier1 - 200) : priceTier3),
        inActiveList: productToEdit.inActiveList !== undefined ? productToEdit.inActiveList : true,
        categoryId: productToEdit.categoryId || '',
      });
      setAutomaticTiers({
        tier2: tier2IsAutomatic,
        tier3: tier3IsAutomatic,
      });
    } else {
      setFormData({
        brand: '',
        model: '',
        capacity: '4+128GB',
        imageUrl: '',
        price: '',
        priceTier2: '',
        priceTier3: '',
        inActiveList: true,
        categoryId: categories[0]?.id || '',
      });
      setAutomaticTiers({ tier2: true, tier3: true });
    }
  }, [categories, productToEdit, isOpen]);

  const handleImageUrlChange = (value: string) => {
    setFormData((current) => ({ ...current, imageUrl: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const canonicalOrigin =
        typeof window !== 'undefined' && window.location.hostname === 'yzdigital.com.do'
          ? 'https://www.yzdigital.com.do'
          : '';
      const url = productToEdit
        ? `${canonicalOrigin}/api/products/${productToEdit.id}`
        : `${canonicalOrigin}/api/products`;
      const method = productToEdit ? 'PUT' : 'POST';
      const priceTier1 = Number(formData.price) || 0;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: priceTier1,
          priceTier2: automaticTiers.tier2 ? null : Number(formData.priceTier2) || 0,
          priceTier3: automaticTiers.tier3 ? null : Number(formData.priceTier3) || 0,
        }),
      });

      const responseText = await res.text();
      let data: { error?: string } = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `El servidor devolvió una respuesta no válida (HTTP ${res.status}). Verifica que la API esté publicada.`
        );
      }
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el producto');
      }

      success(productToEdit ? 'Producto actualizado' : 'Producto creado exitosamente');
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
      title={productToEdit ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        subtitle="Completa los datos del producto y el grupo donde aparecerá"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Marca */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            1. Marca *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: BLU, MOTOROLA, SAMSUNG, OUKITEL, ZTE..."
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Grupo de catálogo */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            Grupo del catálogo *
          </label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="">Selecciona un grupo</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            La marca seguirá guardada en el producto; esto solo define cómo se agrupa en el catálogo.
          </p>
        </div>

        {/* 2. Modelo */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            2. Modelo *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: G06, A16, C5L PLUS, WP53 PRO, CARGO..."
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* 3. RAM y GB (Capacidad) */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            3. RAM y GB (Capacidad) *
          </label>
          <input
            type="text"
            required
            placeholder="Ej: 4+128GB, 8+256GB, 2+16GB, 60K/H, 32 pulgadas..."
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* 4. Precio RD$ */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            4. Precio (RD$) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Ej: 7200, 8800, 35500..."
            value={formData.price}
            onChange={(e) => {
              const price = e.target.value;
              const priceNum = Number(price) || 0;
              setFormData((current) => ({
                ...current,
                price,
                priceTier2: automaticTiers.tier2 ? String(Math.max(0, priceNum - 100)) : current.priceTier2,
                priceTier3: automaticTiers.tier3 ? String(Math.max(0, priceNum - 200)) : current.priceTier3,
              }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-[#B71C1C] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Precios por volumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-black uppercase text-slate-700">Precio 2 (10–49)</label>
              <button type="button" onClick={() => setAutomaticTiers((current) => ({ ...current, tier2: !current.tier2 }))} className="text-[10px] font-bold text-blue-700 hover:underline">{automaticTiers.tier2 ? 'Automático' : 'Manual'}</button>
            </div>
            <input type="number" step="0.01" min="0" value={formData.priceTier2} disabled={automaticTiers.tier2} onChange={(e) => setFormData({ ...formData, priceTier2: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 disabled:bg-slate-100" />
            <span className="text-[10px] text-slate-500">{automaticTiers.tier2 ? 'Precio 1 − RD$100' : 'Escribe el precio manual'}</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-black uppercase text-emerald-800">Precio 3 (50+)</label>
              <button type="button" onClick={() => setAutomaticTiers((current) => ({ ...current, tier3: !current.tier3 }))} className="text-[10px] font-bold text-emerald-700 hover:underline">{automaticTiers.tier3 ? 'Automático' : 'Manual'}</button>
            </div>
            <input type="number" step="0.01" min="0" value={formData.priceTier3} disabled={automaticTiers.tier3} onChange={(e) => setFormData({ ...formData, priceTier3: e.target.value })} className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-black text-emerald-950 disabled:bg-slate-100" />
            <span className="text-[10px] text-emerald-700">{automaticTiers.tier3 ? 'Precio 1 − RD$200' : 'Escribe el precio manual'}</span>
          </div>
        </div>

        {/* 5. Foto por URL */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            5. URL de la foto del producto
          </label>
          <input
            type="text"
            inputMode="url"
            placeholder="https://ejemplo.com/producto.webp"
            value={formData.imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {formData.imageUrl && (
            <div className="mt-2 w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-white p-1">
              <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        {/* 6. En Lista Activa Toggle */}
        <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
          <div>
            <span className="block text-xs font-black text-slate-900 uppercase">
              Mostrar en la Lista Activa
            </span>
            <span className="text-[11px] text-slate-500">
              Si está activado, los clientes verán este modelo inmediatamente en la lista de precios.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
            <input
              type="checkbox"
              checked={formData.inActiveList}
              onChange={(e) => setFormData({ ...formData, inActiveList: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Botones */}
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
            className="px-5 py-2 bg-[#B71C1C] hover:bg-red-800 active:bg-red-900 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all"
          >
            {loading ? 'Guardando...' : productToEdit ? 'Guardar Cambios' : 'Añadir Producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
