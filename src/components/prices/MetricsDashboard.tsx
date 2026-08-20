'use client';

import React from 'react';
import { PackageCheck, RefreshCw, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { DashboardMetrics } from '@/types';

interface MetricsDashboardProps {
  metrics: DashboardMetrics | null;
  loading?: boolean;
}

export function MetricsDashboard({ metrics, loading }: MetricsDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: 'Productos Disponibles',
      value: metrics.totalProductsAvailable,
      icon: PackageCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      description: 'Con stock y precio activo',
    },
    {
      title: 'Precios Actualizados',
      value: metrics.totalPriceUpdatesRecent,
      icon: RefreshCw,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      description: 'Últimos 7 días',
    },
    {
      title: 'Productos Agotados',
      value: metrics.totalOutOfStock,
      icon: AlertCircle,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      description: 'Sin inventario disponible',
    },
    {
      title: 'Cotizaciones Pendientes',
      value: metrics.totalPendingQuotes,
      icon: FileSpreadsheet,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      description: 'En proceso de revisión',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {card.value}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.description}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
