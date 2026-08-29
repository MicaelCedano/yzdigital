'use client';

import React, { useEffect, useState } from 'react';
import { Check, Palette, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/layout/Modal';
import { DEFAULT_BRAND_COLORS, PRESET_SWATCHES } from '@/lib/brand-colors';

interface BrandColorCustomizerProps {
  brands: string[];
}

export function BrandColorCustomizer({ brands }: BrandColorCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_BRAND_COLORS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/categories/colors')
      .then((res) => res.json())
      .then((data) => {
        if (data.colors && Object.keys(data.colors).length > 0) {
          setColors((previous) => ({ ...previous, ...data.colors }));
        }
      })
      .catch(console.error);
  }, []);

  const getColor = (brand: string) => {
    const key = brand.toUpperCase();
    return colors[key] || DEFAULT_BRAND_COLORS[key] || '#0071BC';
  };

  const saveColors = async () => {
    setSaving(true);
    try {
      await fetch('/api/categories/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-900 shadow-sm transition hover:bg-amber-100"
        title="Cambiar colores de las cabeceras del catálogo"
      >
        <Palette className="h-3.5 w-3.5 text-amber-700" />
        Personalizar colores
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="🎨 Personalizar Colores de las Marcas"
          subtitle="Elige el color exacto para cada cabecera con el selector o haz clic en cualquier tono sugerido."
          maxWidth="2xl"
        >
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {brands.map((brand) => {
                const currentColor = getColor(brand);
                return (
                  <div key={brand} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-900">{brand}</span>
                      <div style={{ backgroundColor: currentColor }} className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                        Vista Previa
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(event) => setColors((previous) => ({ ...previous, [brand]: event.target.value }))}
                        className="h-9 w-9 cursor-pointer rounded-lg border border-slate-300 bg-white p-0.5"
                      />
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(event) => setColors((previous) => ({ ...previous, [brand]: event.target.value }))}
                        className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-mono font-bold uppercase text-slate-800"
                      />
                      <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                        {PRESET_SWATCHES.slice(0, 6).map((swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() => setColors((previous) => ({ ...previous, [brand]: swatch }))}
                            style={{ backgroundColor: swatch }}
                            className="h-4 w-4 flex-shrink-0 rounded-full border border-black/10 transition-transform hover:scale-125"
                            title={swatch}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setColors(DEFAULT_BRAND_COLORS)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar predeterminados
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="button" onClick={saveColors} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/30 transition-all hover:bg-sky-700 disabled:opacity-50">
                  <Check className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Colores'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
