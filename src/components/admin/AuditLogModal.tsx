'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/layout/Modal';
import { PriceAuditLog } from '@/types';
import { formatDate } from '@/lib/utils';
import { History, UserCheck, ShieldAlert, FileText, ArrowRight } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

export function AuditLogModal({
  isOpen,
  onClose,
  productId,
  productName,
}: AuditLogModalProps) {
  const [logs, setLogs] = useState<PriceAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const url = productId ? `/api/prices/audit?productId=${productId}` : '/api/prices/audit';
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.logs) setLogs(data.logs);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId]);

  const parseJsonData = (jsonStr?: string | null) => {
    if (!jsonStr) return null;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">CREACIÓN</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">ACTUALIZACIÓN</span>;
      case 'DEACTIVATE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-[10px]">DESACTIVACIÓN</span>;
      case 'IMPORT':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold text-[10px]">IMPORTACIÓN</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-extrabold text-[10px]">{action}</span>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Auditoría de Precios"
      subtitle={productName ? `Historial de cambios para: ${productName}` : 'Historial general de modificaciones de precios mayoristas'}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold animate-pulse">
            Consultando registros de auditoría...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
            No se han registrado modificaciones de precios para este criterio aún.
          </div>
        ) : (
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {logs.map((log) => {
              const oldD = parseJsonData(log.oldData);
              const newD = parseJsonData(log.newData);

              return (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 hover:bg-white hover:border-blue-200 transition-all text-xs"
                >
                  {/* Top Bar: Action, Date & User */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      {log.product && (
                        <span className="font-bold text-slate-900">
                          {log.product.brand} {log.product.model} ({log.product.capacity})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        {log.user ? `${log.user.name} (@${log.user.username})` : 'Sistema'}
                      </span>
                      <span>•</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {log.reason && (
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-700">Motivo:</span>
                      <span>{log.reason}</span>
                    </div>
                  )}

                  {/* Comparison old vs new */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {/* Old Price */}
                    <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                        Valores Anteriores
                      </span>
                      {oldD ? (
                        <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                          <div>1-9u: <span className="font-bold">${oldD.priceTier1 ?? oldD.tier1 ?? '-'}</span></div>
                          <div>10-49u: <span className="font-bold">${oldD.priceTier2 ?? oldD.tier2 ?? '-'}</span></div>
                          <div>50+u: <span className="font-bold">${oldD.priceTier3 ?? oldD.tier3 ?? '-'}</span></div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Sin registro previo</span>
                      )}
                    </div>

                    {/* New Price */}
                    <div className="p-2.5 bg-emerald-50/40 border border-emerald-100 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                        Nuevos Valores Aplicados
                      </span>
                      {newD ? (
                        <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-emerald-950">
                          <div>1-9u: <span className="font-extrabold text-emerald-700">${newD.priceTier1 ?? newD.tier1 ?? '-'}</span></div>
                          <div>10-49u: <span className="font-extrabold text-emerald-700">${newD.priceTier2 ?? newD.tier2 ?? '-'}</span></div>
                          <div>50+u: <span className="font-extrabold text-emerald-700">${newD.priceTier3 ?? newD.tier3 ?? '-'}</span></div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No disponible</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
