'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Quote } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User as UserIcon,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Layers,
} from 'lucide-react';

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotes')
      .then((res) => res.json())
      .then((data) => {
        if (data.quotes) setQuotes(data.quotes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pendiente de Revisión</span>
          </span>
        );
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Revisada por Ventas</span>
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Aprobada / Despachando</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rechazada</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-600" />
            <span>Perfil de Cuenta Mayorista</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Información comercial y registro histórico de solicitudes
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Datos del Usuario */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-slate-900 text-sm truncate">{user.name}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {user.role === 'ADMIN' ? 'Administrador' : 'Mayorista Autorizado'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Usuario</span>
                <span className="font-bold text-slate-800">@{user.username}</span>
              </div>

              {user.companyName && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Empresa / Razón Social</span>
                  <span className="font-bold text-slate-800">{user.companyName}</span>
                </div>
              )}

              {user.taxId && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Identificación Fiscal (RNC/RUT)</span>
                  <span className="font-mono text-slate-800">{user.taxId}</span>
                </div>
              )}

              {user.phone && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono Registrado</span>
                  <span className="text-slate-800">{user.phone}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lista de Precios Asignada</span>
                <div className="mt-1 flex items-center gap-1.5 p-2 bg-blue-50 rounded-xl text-blue-900 font-bold text-xs">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>{user.priceList?.name || 'Lista General Mayorista'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Cotizaciones */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Historial de Cotizaciones Realizadas ({quotes.length})</span>
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold animate-pulse">
                Cargando historial...
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                Aún no ha generado cotizaciones en la plataforma.
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:bg-white hover:border-blue-200 transition-all space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-blue-700 text-sm">
                          {q.quoteNumber}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">{formatDate(q.createdAt)}</span>
                      </div>
                      {getStatusBadge(q.status)}
                    </div>

                    {/* Resumen de items */}
                    <div className="text-[11px] text-slate-600">
                      <strong>{q.totalUnits} unidades</strong> en total • {q.items?.length || 0} modelos
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80">
                      <span className="text-[11px] text-slate-500 font-medium">Monto Total Estimado:</span>
                      <span className="text-sm font-black text-slate-900">
                        {formatCurrency(q.totalAmount, q.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
