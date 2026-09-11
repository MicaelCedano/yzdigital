'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, Save } from 'lucide-react';
import type { Product, Category } from '@/types';
import { useToast } from '@/context/ToastContext';
import { ProductOrderEditor } from '@/components/admin/ProductOrderEditor';
import { BrandColorCustomizer } from '@/components/admin/BrandColorCustomizer';

export default function OrganizarCatalogoPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingCategoryOrder, setSavingCategoryOrder] = useState(false);
  const [categoryOrderDirty, setCategoryOrderDirty] = useState(false);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  async function fetchProducts() {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch('/api/products?onlyActiveList=true');
      if (!res.ok) throw new Error('No se pudo cargar el catálogo');
      const data = await res.json();
      setProducts(data.products);
      setCategories(data.categories);
    } catch {
      setLoadError(true);
      error('No se pudo cargar el catálogo. Intenta nuevamente.');
    } finally { setLoading(false); }
  }
  useEffect(() => { fetchProducts(); }, []);
  const orderedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const brandsInCatalog = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand.toUpperCase()))).sort(),
    [products]
  );

  const moveCategory = (categoryId: string, direction: -1 | 1) => {
    const currentIndex = orderedCategories.findIndex((category) => category.id === categoryId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= orderedCategories.length || savingCategoryOrder) return;

    const nextCategories = [...orderedCategories];
    [nextCategories[currentIndex], nextCategories[nextIndex]] = [
      nextCategories[nextIndex],
      nextCategories[currentIndex],
    ];
    const visibleIds = new Set(nextCategories.map(c => c.id));
    let position = 0;
    setCategories([...categories].sort((a, b) => a.sortOrder - b.sortOrder).map(c => visibleIds.has(c.id) ? nextCategories[position++] : c).map((c, index) => ({ ...c, sortOrder: (index + 1) * 10 })));
    setCategoryOrderDirty(true);
  };

  const handleCategoryDrop = (targetCategoryId: string) => {
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId || savingCategoryOrder) return;

    const sourceIndex = orderedCategories.findIndex((category) => category.id === draggedCategoryId);
    const targetIndex = orderedCategories.findIndex((category) => category.id === targetCategoryId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const nextCategories = [...orderedCategories];
    const [draggedCategory] = nextCategories.splice(sourceIndex, 1);
    nextCategories.splice(targetIndex, 0, draggedCategory);
    const visibleIds = new Set(nextCategories.map(c => c.id));
    let position = 0;
    setCategories([...categories].sort((a, b) => a.sortOrder - b.sortOrder).map(c => visibleIds.has(c.id) ? nextCategories[position++] : c).map((c, index) => ({ ...c, sortOrder: (index + 1) * 10 })));
    setCategoryOrderDirty(true);
    setDraggedCategoryId(null);
  };

  const saveCategoryOrder = async () => {
    if (!categoryOrderDirty || savingCategoryOrder) return;
    setSavingCategoryOrder(true);

    try {
      const res = await fetch('/api/categories/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: [...categories].sort((a, b) => a.sortOrder - b.sortOrder).map((category) => category.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'No se pudo guardar el orden');
      }
      success('Orden de grupos guardado');
      setCategoryOrderDirty(false);
    } catch (err: any) {
      error(err.message);
    } finally {
      setSavingCategoryOrder(false);
    }
  };

  const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newCategoryName.trim();
    if (!name || creatingCategory) return;

    setCreatingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'No se pudo crear el grupo.');

      setCategories((current) => [...current, data.category]);
      setNewCategoryName('');
      success(`Grupo ${data.category.name} creado. Ya puedes asignarle productos.`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo crear el grupo.');
    } finally {
      setCreatingCategory(false);
    }
  };


  return <div className="mx-auto max-w-5xl space-y-4 pb-12">
    <Link href="/admin/productos" className="inline-flex rounded-xl border bg-white px-4 py-2 text-sm font-bold text-sky-700">← Volver a productos y precios</Link>
    <div>
      <h1 className="text-2xl font-black text-slate-900">Organizar catálogo</h1>
      <p className="text-sm text-slate-500 mt-1">Aquí puedes crear los grupos y acomodar los modelos de la lista activa como quieres que los vean tus clientes.</p>
    </div>
    {loading ? <p role="status">Cargando catálogo...</p> : loadError ? <button onClick={fetchProducts} className="rounded-xl bg-sky-600 px-4 py-2 text-white">Reintentar</button> : <>
      <form onSubmit={createCategory} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-black text-slate-900">Crear grupo de catálogo</h2>
          <p className="mt-1 text-xs text-slate-500">Ejemplo: iPhone. Después podrás elegir este grupo al crear o editar un producto.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="new-category-name" className="sr-only">Nombre del grupo</label>
          <input
            id="new-category-name"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            disabled={creatingCategory}
            maxLength={60}
            placeholder="Nombre del grupo, por ejemplo iPhone"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={!newCategoryName.trim() || creatingCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Plus className="h-4 w-4" />
            {creatingCategory ? 'Creando...' : 'Crear grupo'}
          </button>
        </div>
      </form>

      {/* Orden de grupos */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-sky-600" /> Orden de marcas / grupos del catálogo
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Arrastra los grupos, acomódalos todos y guarda al final.</p>
          </div>
          <div className="flex items-center gap-2">
            <BrandColorCustomizer brands={brandsInCatalog} />
            <button
              type="button"
              onClick={saveCategoryOrder}
              disabled={!categoryOrderDirty || savingCategoryOrder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Save className="w-3.5 h-3.5" />
              {savingCategoryOrder ? 'Guardando...' : 'Guardar orden'}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {orderedCategories.map((category, index) => (
            <div
              key={category.id}
              draggable={!savingCategoryOrder}
              onDragStart={() => setDraggedCategoryId(category.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleCategoryDrop(category.id)}
              onDragEnd={() => setDraggedCategoryId(null)}
              className={`inline-flex cursor-grab items-center gap-1 rounded-xl border bg-slate-50 pl-3 pr-1 py-1.5 active:cursor-grabbing ${
                draggedCategoryId === category.id ? 'border-sky-400 bg-sky-50 opacity-60' : 'border-slate-200'
              }`}
              title="Arrastra este grupo para moverlo"
            >
              <span className="text-xs font-black uppercase text-slate-800">{category.name}</span>
              <button
                type="button"
                onClick={() => moveCategory(category.id, -1)}
                disabled={index === 0 || savingCategoryOrder}
                className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-sky-700 disabled:opacity-30"
                aria-label={`Subir ${category.name}`}
                title="Subir"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveCategory(category.id, 1)}
                disabled={index === orderedCategories.length - 1 || savingCategoryOrder}
                className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-sky-700 disabled:opacity-30"
                aria-label={`Bajar ${category.name}`}
                title="Bajar"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {categoryOrderDirty ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Guarda el orden de marcas antes de acomodar sus modelos.</p> : !loading && <ProductOrderEditor products={products} categories={orderedCategories} onSaved={fetchProducts} />}


    </>}
  </div>;
}
