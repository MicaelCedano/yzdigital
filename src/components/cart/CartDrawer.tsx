'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const WHATSAPP_NUMBER = '18294636244';

export function CartDrawer() {
  const pathname = usePathname();
  const { items, totalUnits, totalAmount, currency, updateQuantity, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);

  const whatsappMessage = useMemo(() => {
    const lines = items.map((item) => {
      const name = `${item.product.brand} ${item.product.model} (${item.product.capacity})`;
      const subtotal = item.unitPrice * item.quantity;
      return `• ${name}\n  ${item.quantity} x ${formatCurrency(item.unitPrice, item.currency)} = ${formatCurrency(subtotal, item.currency)} [${item.tierLabel}]`;
    });

    return [
      'Hola, quiero realizar este pedido a YZ DIGITAL:',
      '',
      ...lines,
      '',
      `Total de equipos: ${totalUnits}`,
      `Total estimado: ${formatCurrency(totalAmount, currency)}`,
      '',
      'Por favor confirmar disponibilidad y despacho.',
    ].join('\n');
  }, [currency, items, totalAmount, totalUnits]);

  if (pathname === '/login') return null;

  const sendToWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-white shadow-xl shadow-sky-900/25 transition hover:bg-sky-700"
          aria-label={`Abrir pedido con ${totalUnits} equipos`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-black">Carrito ({totalUnits})</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/35" onClick={() => setOpen(false)}>
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-black">Mi pedido</h2>
                <p className="text-xs text-slate-300">{totalUnits} equipos seleccionados</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Cerrar pedido">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <ShoppingCart className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 text-sm font-bold text-slate-700">Tu carrito está vacío</p>
                  <p className="mt-1 text-xs text-slate-500">Usa el botón Agregar en cualquier producto.</p>
                </div>
              ) : items.map((item) => (
                <div key={item.product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase text-sky-700">{item.product.brand}</p>
                      <p className="truncate text-sm font-bold text-slate-900">{item.product.model}</p>
                      <p className="text-[11px] text-slate-500">{item.product.capacity} · {item.tierLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Eliminar ${item.product.model}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-slate-500 hover:bg-slate-100" aria-label="Reducir cantidad">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-slate-500 hover:bg-slate-100" aria-label="Aumentar cantidad">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{formatCurrency(item.unitPrice, item.currency)} / ud</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(item.unitPrice * item.quantity, item.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-200 bg-white p-5">
              <div className="rounded-xl bg-emerald-50 p-3 text-[11px] font-semibold leading-relaxed text-emerald-800">
                Descuento automático: RD$100 menos por unidad desde 10 equipos y RD$200 menos por unidad desde 50 equipos.
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total estimado</p>
                  <p className="text-xl font-black text-slate-950">{formatCurrency(totalAmount, currency)}</p>
                </div>
                <button type="button" onClick={clearCart} className="text-xs font-bold text-slate-500 hover:text-rose-600">Vaciar pedido</button>
              </div>
              <button
                type="button"
                onClick={sendToWhatsApp}
                disabled={items.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar pedido por WhatsApp
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
