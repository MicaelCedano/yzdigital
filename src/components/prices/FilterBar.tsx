'use client';

import React from 'react';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  Printer,
  Sparkles,
  Check,
} from 'lucide-react';
import { Category } from '@/types';

interface FilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  selectedAvailability: string;
  setSelectedAvailability: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
  categories: Category[];
  brands: string[];
  totalResults: number;
  onPrint?: () => void;
}

export function FilterBar({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedAvailability,
  setSelectedAvailability,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  categories,
  brands,
  totalResults,
  onPrint,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 space-y-3.5">
      {/* Top row: Search and primary controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo, capacidad, color o SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/80 px-1.5 py-0.5 rounded"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* View Mode & Print */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Print button */}
          {onPrint && (
            <button
              onClick={onPrint}
              title="Imprimir lista de precios"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tarjetas</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Second row: Selects and filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100">
        {/* Category filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Categoría
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="all">Todas las categorías ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Marca
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="all">Todas las marcas ({brands.length})</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Availability filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Disponibilidad
          </label>
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="in-stock">En Stock / Disponible</option>
            <option value="out-of-stock">Agotados</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Ordenar Por
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          >
            <option value="name">Nombre (A - Z)</option>
            <option value="priceAsc">Precio: Menor a Mayor</option>
            <option value="priceDesc">Precio: Mayor a Menor</option>
            <option value="updatedAt">Última Actualización</option>
          </select>
        </div>
      </div>

      {/* Brand pills for quick filtering */}
      {brands.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Marca rápida:</span>
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              selectedBrand === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBrand(selectedBrand === b ? 'all' : b)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedBrand === b
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}

          <span className="ml-auto text-[11px] text-slate-400 font-semibold">
            {totalResults} {totalResults === 1 ? 'producto encontrado' : 'productos encontrados'}
          </span>
        </div>
      )}
    </div>
  );
}
