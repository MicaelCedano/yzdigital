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

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    capacity: '',
    imageUrl: '',
    price: '',
    inActiveList: true,
    categoryId: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        brand: productToEdit.brand || '',
        model: productToEdit.model || '',
        capacity: productToEdit.capacity || '',
        imageUrl: productToEdit.imageUrl || '',
        price: productToEdit.currentPrice?.priceTier1 ? String(productToEdit.currentPrice.priceTier1) : '',
        inActiveList: productToEdit.inActiveList !== undefined ? productToEdit.inActiveList : true,
        categoryId: productToEdit.categoryId || '',
      });
    } else {
      setFormData({
        brand: '',
        model: '',
        capacity: '4+128GB',
        imageUrl: '',
        price: '',
        inActiveList: true,
        categoryId: categories[0]?.id || '',
      });
    }
  }, [categories, productToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = productToEdit ? `/api/products/${productToEdit.id}` : '/api/products';
      const method = productToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
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
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-[#B71C1C] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* 5. Foto (URL) */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">
            5. Foto del Producto (URL de Imagen)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
