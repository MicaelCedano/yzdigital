'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Product, Category } from '@/types';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  Filter,
  Package,
} from 'lucide-react';

export default function AdminProductosPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal de Crear / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products?includeAll=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle rápido de 1 clic para poner o quitar de la lista activa
  const handleToggleActiveList = async (product: Product) => {
    const nextState = !product.inActiveList;
    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inActiveList: nextState } : p))
      );

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inActiveList: nextState }),
      });

      if (!res.ok) {
        throw new Error('No se pudo actualizar el estado.');
      }

      success(
        nextState
          ? `${product.brand} ${product.model} añadido a la lista activa`
          : `${product.brand} ${product.model} removido de la lista activa`
      );
    } catch (err: any) {
      error(err.message);
      fetchProducts(); // revert
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      success('Producto eliminado correctamente');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleOpenNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  // Filtrado
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro por pestaña
      if (activeTab === 'ACTIVE' && !p.inActiveList) return false;
      if (activeTab === 'INACTIVE' && p.inActiveList) return false;

      // Filtro por marca
      if (selectedBrand !== 'ALL' && p.brand.toUpperCase() !== selectedBrand.toUpperCase()) {
        return false;
      }

      // Filtro por texto
      if (search) {
        const term = search.toLowerCase();
        const match =
          p.model.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.capacity.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term);
        if (!match) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedBrand, search]);

  const activeCount = products.filter((p) => p.inActiveList).length;
  const inactiveCount = products.filter((p) => !p.inActiveList).length;

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand.toUpperCase()));
    return Array.from(set).sort();
  }, [products]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0071BC]" />
            <span>Gestión de Modelos & Lista Activa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controla qué modelos aparecen en la lista de precios que ven los clientes con solo un clic en el interruptor.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#B71C1C] hover:bg-red-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* Tabs y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Pestañas Rápidas */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>En Lista Activa ({activeCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('INACTIVE')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'INACTIVE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Fuera de Lista ({inactiveCount})</span>
            </button>
          </div>

          {/* Buscador y Filtro por Marca */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas las Marcas ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar modelo o marca..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Cargando productos...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No se encontraron productos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4">Modelo</th>
                  <th className="py-3 px-4">RAM y GB</th>
                  <th className="py-3 px-4">Precio (RD$)</th>
                  <th className="py-3 px-4 text-center">¿En Lista Activa?</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-sky-50/40 transition-colors ${
                      !p.inActiveList ? 'opacity-60 bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    {/* Foto */}
                    <td className="py-2.5 px-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-0.5">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.model} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[9px] text-slate-400">Sin foto</span>
                        )}
                      </div>
                    </td>

                    {/* Marca */}
                    <td className="py-2.5 px-4 font-black text-slate-900 uppercase">
                      {p.brand}
                    </td>

                    {/* Modelo */}
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {p.model}
                    </td>

                    {/* RAM y GB */}
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                        {p.capacity}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-2.5 px-4 font-black text-base text-[#B71C1C]">
                      RD$ {(p.currentPrice?.priceTier1 || 0).toLocaleString('en-US')}
                    </td>

                    {/* Toggle En Lista Activa */}
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActiveList(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                          p.inActiveList
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 border border-slate-300 hover:bg-slate-300'
                        }`}
                        title="Haz clic para activar o desactivar este producto de la lista que ve el cliente"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.inActiveList ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span>{p.inActiveList ? 'Visible en Lista' : 'Oculto'}</span>
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, `${p.brand} ${p.model}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        productToEdit={editingProduct}
      />
    </div>
  );
}
