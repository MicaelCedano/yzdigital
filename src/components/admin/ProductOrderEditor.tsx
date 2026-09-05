'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import type { Category, Product } from '@/types';
import { compareCatalogProducts } from '@/lib/catalog-order';
import { useToast } from '@/context/ToastContext';

export function ProductOrderEditor({ products, categories, onSaved }: {
  products: Product[]; categories: Category[]; onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [draft, setDraft] = useState<Product[] | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const original = useMemo(() => products.filter(p => p.categoryId === categoryId).sort(compareCatalogProducts), [products, categoryId]);
  const rows = draft ?? original;

  function move(from: number, to: number) {
    if (saving || from < 0 || to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDraft(next);
  }

  async function save(automatic: boolean) {
    if (saving || !rows.length) return;
    setSaving(true);
    try {
      const response = await fetch('/api/products/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, productIds: rows.map(p => p.id), automatic }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'No se pudo guardar el orden.');
      }
      success(automatic ? 'Orden por precio restaurado' : 'Orden de modelos guardado');
      setDraft(null);
      onSaved();
    } catch (err) {
      error(err instanceof Error ? err.message : 'No se pudo guardar el orden.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-black text-slate-900">Orden de modelos</h2>
        <p className="text-xs text-slate-500 mt-1">Elige una marca / grupo y acomoda los modelos con las flechas o arrastrándolos. Este orden se mostrará en la lista de precios.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-bold text-slate-700">Marca / grupo
          <select value={categoryId} disabled={saving || draft !== null} onChange={e => setCategoryId(e.target.value)} className="ml-2 max-w-full rounded-lg border border-slate-300 p-2 bg-white">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <span className="text-xs text-slate-500">{draft ? 'Cambios sin guardar' : original.some(p => p.sortOrder < 0) ? 'Orden personalizado' : 'Orden por precio'}</span>
      </div>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {rows.length === 0 && <p className="text-sm text-slate-500">Este grupo todavía no tiene productos.</p>}
        {rows.map((p, index) => (
          <div key={p.id} draggable={!saving} onDragStart={() => setDragged(p.id)} onDragEnd={() => setDragged(null)} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); move(rows.findIndex(row => row.id === dragged), index); setDragged(null); }} className={`flex items-center gap-2 rounded-xl border p-2 ${dragged === p.id ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-200'}`}>
            <GripVertical aria-hidden="true" className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="text-xs text-slate-500 w-6 shrink-0">{index + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 break-words">{p.brand} {p.model} · {p.capacity}{p.color ? ` · ${p.color}` : ''}</p>
              <p className="text-[11px] text-slate-500">{p.sku}{!p.inActiveList ? ' · Fuera de la lista activa' : ''}</p>
            </div>
            <button type="button" aria-label={`Subir ${p.model} ${p.capacity}`} disabled={saving || index === 0} onClick={() => move(index, index - 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
            <button type="button" aria-label={`Bajar ${p.model} ${p.capacity}`} disabled={saving || index === rows.length - 1} onClick={() => move(index, index + 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={saving || !draft} onClick={() => save(false)} className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{saving ? 'Guardando...' : 'Guardar orden de modelos'}</button>
        <button type="button" disabled={saving || !draft} onClick={() => setDraft(null)} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-40">Cancelar cambios</button>
        <button type="button" disabled={saving || !rows.length || (!draft && !original.some(p => p.sortOrder < 0))} onClick={() => save(true)} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-40">Volver al orden por precio</button>
      </div>
    </section>
  );
}
