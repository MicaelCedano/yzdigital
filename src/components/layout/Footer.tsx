'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="YZ DIGITAL"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-slate-900 text-sm">YZ DIGITAL WHOLESALE</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Distribuidor mayorista de tecnología, telefonía móvil y accesorios originales para retail y revendedores en República Dominicana y el Caribe.
            </p>
          </div>

          {/* Col 2: Condiciones */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Reglas Comerciales</h4>
            <ul className="space-y-1.5 text-slate-500">
              <li>• Precios por volumen automático en cotización.</li>
              <li>• Despachos en 24h para pedidos confirmados.</li>
              <li>• Precios sujetos a vigencia de lista y disponibilidad de stock.</li>
              <li>• Facturación con comprobante fiscal.</li>
            </ul>
          </div>

          {/* Col 3: Contacto */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Mesa de Ayuda Mayorista</h4>
            <div className="space-y-1.5 text-slate-500">
              <a
                href="https://wa.me/18297726060"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>+1 (829) 772-6060 (WhatsApp)</span>
              </a>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>ventas@yzdigital.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Distrito Nacional, Santo Domingo, R.D.</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Lun - Vie: 8:30 AM - 6:00 PM</span>
              </p>
            </div>
          </div>

          {/* Col 4: Seguridad */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Seguridad y Confidencialidad</h4>
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Precios Protegidos</span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Este catálogo contiene información confidencial protegida por sesión para distribuidores autorizados.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} YZ DIGITAL CORP. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Plataforma de Cotización y Gestión Mayorista v1.0</p>
        </div>
      </div>
    </footer>
  );
}
