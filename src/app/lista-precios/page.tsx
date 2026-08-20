'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Category, Product } from '@/types';
import { Modal } from '@/components/layout/Modal';
import {
  Search,
  MessageCircle,
  ArrowUpRight,
  Palette,
  Check,
  RotateCcw,
} from 'lucide-react';

const DEFAULT_BRAND_COLORS: Record<string, string> = {
  SAMSUNG: '#0080FF',
  MOTOROLA: '#C80084',
  OUKITEL: '#00A896',
  VORTEX: '#E50914',
  BLU: '#0044CC',
  ZTE: '#0055FF',
  'M-HORSE': '#5840FF',
  COOLPAD: '#8000FF',
  ITEL: '#FF0077',
  TECNO: '#FF8800',
  TCL: '#0099FF',
  TELEVISION: '#0048E6',
  TABLETAS: '#0080FF',
  BICICLETAS: '#0B132B',
  SUNELAN: '#00B050',
  XIAOMI: '#FF4500',
  ALCATEL: '#374151',
  KARGAMAX: '#FF6600',
};

const PRESET_SWATCHES = [
  '#0080FF', // Azul Eléctrico
  '#00D2FF', // Cyan Neón
  '#C80084', // Magenta
  '#FF0077', // Rosa Fucsia
  '#E50914', // Rojo Carmesí
  '#FF5500', // Naranja Vivo
  '#FF8800', // Ámbar / Oro
  '#00B050', // Verde Esmeralda
  '#00A896', // Turquesa Teal
  '#5840FF', // Índigo
  '#8000FF', // Violeta Púrpura
  '#0B132B', // Negro Noche
];

export default function ListaPreciosPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Redirigir al Login si no ha iniciado sesión
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Modal para ver foto y detalles al hacer click en cualquier producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Modal de Personalización de Colores
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [customColors, setCustomColors] = useState<Record<string, string>>(DEFAULT_BRAND_COLORS);
  const [savingColors, setSavingColors] = useState(false);

  useEffect(() => {
    // 1. Cargar productos
    fetch('/api/products?onlyActiveList=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
        if (data.products) setProducts(data.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // 2. Cargar colores personalizados guardados
    fetch('/api/categories/colors')
      .then((res) => res.json())
      .then((data) => {
        if (data.colors && Object.keys(data.colors).length > 0) {
          setCustomColors((prev) => ({
            ...prev,
            ...data.colors,
          }));
        }
      })
      .catch(console.error);
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setPhotoModalOpen(true);
  };

  // Guardar colores personalizados
  const handleSaveColors = async () => {
    setSavingColors(true);
    try {
      await fetch('/api/categories/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: customColors }),
      });
      setColorModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingColors(false);
    }
  };

  const handleResetColors = () => {
    setCustomColors(DEFAULT_BRAND_COLORS);
  };

  // Filtrado de productos por búsqueda
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.model.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.capacity.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  // Agrupar productos activos por Marca
  const brandGroups = useMemo(() => {
    const map = new Map<string, Product[]>();

    filteredProducts.forEach((p) => {
      const b = p.brand.toUpperCase();
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(p);
    });

    map.forEach((list) => {
      list.sort((a, b) => {
        const priceA = a.currentPrice?.priceTier1;
        const priceB = b.currentPrice?.priceTier1;
        const hasPriceA = typeof priceA === 'number' && priceA > 0;
        const hasPriceB = typeof priceB === 'number' && priceB > 0;

        // Los productos sin precio se mantienen al final de su marca.
        if (hasPriceA !== hasPriceB) return hasPriceA ? -1 : 1;
        if (hasPriceA && hasPriceB && priceA !== priceB) {
          return priceA - priceB;
        }

        // Desempate estable para productos con el mismo precio.
        const sortOrderDifference = (a.sortOrder || 0) - (b.sortOrder || 0);
        if (sortOrderDifference !== 0) return sortOrderDifference;
        return a.model.localeCompare(b.model, 'es');
      });
    });

    return map;
  }, [filteredProducts]);

  // Orden equilibrado de marcas
  const brandOrder = [
    'BLU',
    'OUKITEL',
    'ZTE',
    'TELEVISION',
    'MOTOROLA',
    'VORTEX',
    'M-HORSE',
    'TABLETAS',
    'SAMSUNG',
    'ITEL',
    'TECNO',
    'SUNELAN',
    'TCL',
    'COOLPAD',
    'BICICLETAS',
    'XIAOMI',
    'ALCATEL',
    'KARGAMAX',
  ];

  const activeBrandList = useMemo(() => {
    const list: string[] = [];
    brandOrder.forEach((b) => {
      if (brandGroups.has(b)) list.push(b);
    });
    brandGroups.forEach((_, key) => {
      if (!list.includes(key)) list.push(key);
    });
    return list;
  }, [brandGroups]);

  // Obtener color de la marca (personalizado o predeterminado)
  const getBrandHexColor = (brand: string) => {
    const b = brand.toUpperCase();
    return customColors[b] || DEFAULT_BRAND_COLORS[b] || '#0071BC';
  };

  const formatPrice = (val: number) => {
    if (!val || val === 0) return 'Consultar';
    return `RD$ ${val.toLocaleString('en-US')}`;
  };

  const renderBrandCard = (brandName: string) => {
    const prods = brandGroups.get(brandName.toUpperCase()) || [];
    if (prods.length === 0) return null;

    const hexColor = getBrandHexColor(brandName);

    return (
      <div
        key={brandName}
        className="break-inside-avoid mb-3 sm:mb-4 rounded-xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-sky-300 transition-all duration-200 overflow-hidden"
      >
        {/* Cabecera Compacta y Adaptable */}
        <div
          style={{ backgroundColor: hexColor }}
          className="text-white px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between shadow-inner transition-colors duration-200"
        >
          <h3 className="text-xs sm:text-[13px] md:text-sm font-black tracking-wider uppercase drop-shadow-sm truncate">
            {brandName}
          </h3>
        </div>

        {/* Lista de Modelos Compacta y Fluida */}
        <div className="divide-y divide-slate-100">
          {prods.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => handleProductClick(p)}
              className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs cursor-pointer transition-all duration-150 ease-out hover:bg-sky-50/90 hover:translate-x-1 group select-none ${
                idx % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
              }`}
            >
              {/* Modelo y Capacidad en la misma línea */}
              <div className="min-w-0 flex-1 pr-2 flex items-center gap-1.5 transition-transform duration-150 group-hover:translate-x-0.5">
                <span className="text-[12.5px] sm:text-[13.5px] font-black text-slate-900 group-hover:text-sky-700 transition-colors tracking-tight truncate">
                  {p.model}
                </span>
                {p.capacity && p.capacity !== 'N/A' && (
                  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-mono font-bold text-slate-600 bg-slate-100 group-hover:bg-white group-hover:text-sky-900 px-1.5 py-0.2 rounded border border-slate-200/80 group-hover:border-sky-300 transition-colors flex-shrink-0">
                    {p.capacity}
                  </span>
                )}
              </div>

              {/* Precio RD$ */}
              <div className="text-right flex-shrink-0 flex items-center gap-1 transition-transform duration-150 group-hover:scale-105">
                <span className="text-[13px] sm:text-[14px] font-black text-slate-950 tabular-nums group-hover:text-sky-700 transition-colors whitespace-nowrap">
                  {formatPrice(p.currentPrice?.priceTier1 || 0)}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-600 transition-all duration-150 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 hidden sm:inline" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Lista de todas las marcas presentes para el modal de colores
  const allBrandsInList = Array.from(new Set(products.map((p) => p.brand.toUpperCase()))).sort();

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-900 font-sans pb-12">
      {/* Contenedor Principal Adaptable */}
      <div className="w-full max-w-[1360px] mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-5 space-y-3 sm:space-y-4">

        {/* Banner Superior Compacto */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-sky-200/80 p-3 sm:p-4 shadow-sm space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Catálogo de Precios
                </h1>
                {isAdmin && (
                  <button
                    onClick={() => setColorModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition-all shadow-sm group"
                    title="Panel de Administrador: Cambiar colores de las marcas"
                  >
                    <Palette className="w-3 h-3 text-amber-700 group-hover:rotate-12 transition-transform" />
                    <span>Personalizar Colores</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                Precios oficiales en Pesos Dominicanos (RD$) para tiendas y mayoristas.
              </p>
            </div>

            {/* Contacto WhatsApp */}
            <a
              href="https://wa.me/18294636244"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors self-start sm:self-auto flex-shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp: +1 (829) 463-6244</span>
            </a>
          </div>

          {/* Input de Búsqueda */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar modelo o marca..."
              className="w-full pl-9 pr-7 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Cuadrícula de 3 Columnas Estricta */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/70 rounded-xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="columns-3 gap-1.5 sm:gap-4 space-y-2 sm:space-y-4">
            {activeBrandList.map((brandName) => renderBrandCard(brandName))}
          </div>
        )}
      </div>

      {/* Modal Personalizador de Colores de Marcas (Solo Administrador) */}
      {isAdmin && colorModalOpen && (
        <Modal
          isOpen={colorModalOpen}
          onClose={() => setColorModalOpen(false)}
          title="🎨 Personalizar Colores de las Marcas"
          subtitle="Elige el color exacto para cada cabecera con el selector o haz clic en cualquier tono sugerido."
          maxWidth="2xl"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Cuadrícula de Marcas con Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allBrandsInList.map((brand) => {
                const currentColor = getBrandHexColor(brand);
                return (
                  <div
                    key={brand}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    {/* Header y Preview */}
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 uppercase">
                        {brand}
                      </span>
                      <div
                        style={{ backgroundColor: currentColor }}
                        className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-black uppercase shadow-sm"
                      >
                        Vista Previa
                      </div>
                    </div>

                    {/* Selector de Color y Paleta Rápida */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center">
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) =>
                            setCustomColors((prev) => ({
                              ...prev,
                              [brand]: e.target.value,
                            }))
                          }
                          className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={currentColor}
                        onChange={(e) =>
                          setCustomColors((prev) => ({
                            ...prev,
                            [brand]: e.target.value,
                          }))
                        }
                        className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 uppercase"
                      />

                      {/* Muestras rápidas */}
                      <div className="flex items-center gap-1 overflow-x-auto flex-1">
                        {PRESET_SWATCHES.slice(0, 6).map((swatch) => (
                          <button
                            key={swatch}
                            onClick={() =>
                              setCustomColors((prev) => ({
                                ...prev,
                                [brand]: swatch,
                              }))
                            }
                            style={{ backgroundColor: swatch }}
                            className="w-4 h-4 rounded-full border border-black/10 flex-shrink-0 hover:scale-125 transition-transform"
                            title={swatch}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={handleResetColors}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Predeterminados</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setColorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveColors}
                  disabled={savingColors}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingColors ? 'Guardando...' : 'Guardar Colores'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Ficha y Foto Extra Grande del Producto */}
      {selectedProduct && (
        <Modal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          title={`${selectedProduct.brand} ${selectedProduct.model}`}
          subtitle={`Código SKU: ${selectedProduct.sku}`}
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-1 sm:p-2">
            {/* Foto del Equipo en Tamaño Extra Grande (7 Columnas) */}
            <div
              onClick={() => setLightboxOpen(true)}
              className="lg:col-span-7 w-full h-[320px] sm:h-[420px] lg:h-[500px] bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-4 sm:p-6 shadow-inner relative group cursor-zoom-in"
              title="Haz clic para ver en pantalla completa"
            >
              {selectedProduct.imageUrl ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.model}
                  className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-slate-400 text-sm font-medium">Sin imagen registrada</div>
              )}

              {/* Badge indicativo de Zoom */}
              <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span>🔍 Clic para pantalla completa</span>
              </div>
            </div>

            {/* Ficha Técnica, Precio y Acción (5 Columnas) */}
            <div className="lg:col-span-5 space-y-3.5">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                  {selectedProduct.brand}
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight leading-tight mt-0.5">
                  {selectedProduct.model}
                </h2>
                {selectedProduct.capacity && selectedProduct.capacity !== 'N/A' && (
                  <div className="mt-1.5">
                    <span className="inline-block text-xs sm:text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      Capacidad: {selectedProduct.capacity}
                    </span>
                  </div>
                )}
              </div>

              {/* Bloque de Precio */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Precio Mayorista Oficial:
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tabular-nums">
                  {formatPrice(selectedProduct.currentPrice?.priceTier1 || 0)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-0.5">
                  <span>✓</span>
                  <span>En Almacén Central • Despacho Rápido</span>
                </div>
              </div>

              {/* Botón WhatsApp */}
              <a
                href={`https://wa.me/18294636244?text=${encodeURIComponent(
                  `Hola, deseo consultar disponibilidad del modelo ${selectedProduct.brand} ${selectedProduct.model} (${selectedProduct.capacity}) por ${formatPrice(
                    selectedProduct.currentPrice?.priceTier1 || 0
                  )}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Pedir este modelo por WhatsApp</span>
              </a>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Lightbox Pantalla Completa HD */}
      {lightboxOpen && selectedProduct && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            {selectedProduct.imageUrl && (
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.model}
                className="max-h-[82vh] max-w-full object-contain rounded-2xl drop-shadow-2xl"
              />
            )}
            <div className="mt-3 text-center text-white text-sm font-bold">
              {selectedProduct.brand} {selectedProduct.model} ({selectedProduct.capacity}) • {formatPrice(selectedProduct.currentPrice?.priceTier1 || 0)}
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white font-bold text-sm bg-white/10 px-3 py-1 rounded-full"
            >
              ✕ Cerrar Pantalla Completa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
