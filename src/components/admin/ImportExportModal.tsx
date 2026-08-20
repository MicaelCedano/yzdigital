'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/layout/Modal';
import { PriceList } from '@/types';
import { useToast } from '@/context/ToastContext';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  priceLists: PriceList[];
  activePriceListId: string;
}

export function ImportExportModal({
  isOpen,
  onClose,
  onSuccess,
  priceLists,
  activePriceListId,
}: ImportExportModalProps) {
  const { success, error, warning } = useToast();
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [selectedListId, setSelectedListId] = useState(activePriceListId || priceLists[0]?.id || '');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Estado de Importación
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importReason, setImportReason] = useState<string>('Actualización masiva de lista de precios');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          warning('El archivo seleccionado no contiene filas con datos válidos.');
          return;
        }

        setParsedRows(json);
        success(`Se detectaron ${json.length} filas listas para importar.`);
      } catch (err: any) {
        error('Error al procesar el archivo Excel/CSV. Verifique el formato.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      error('Seleccione un archivo con filas para importar.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/prices/import-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: parsedRows,
          priceListId: selectedListId,
          reason: importReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al importar');
      }

      success(data.message);
      if (data.errors && data.errors.length > 0) {
        warning(`Algunas filas tuvieron observaciones: ${data.errors.slice(0, 3).join(', ')}`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const downloadUrl = `/api/prices/import-export?priceListId=${selectedListId}&format=${exportFormat}`;
    window.open(downloadUrl, '_blank');
    success('Descarga iniciada.');
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        SKU: 'APL-IP16PM-256-NAT',
        Marca: 'Apple',
        Modelo: 'iPhone 16 Pro Max',
        Capacidad: '256GB',
        Color: 'Titanio Natural',
        Categoria: 'iPhone 16 Series',
        Stock: 50,
        Moneda: 'USD',
        'Precio_1_a_9_uds': 1199.00,
        'Precio_10_a_49_uds': 1165.00,
        'Precio_50_mas_uds': 1135.00,
        Descripcion: 'Pantalla 6.9", Chip A18 Pro.',
      },
      {
        SKU: 'SAM-S24U-256-GRY',
        Marca: 'Samsung',
        Modelo: 'Galaxy S24 Ultra',
        Capacidad: '256GB',
        Color: 'Titanium Gray',
        Categoria: 'Samsung Galaxy S Series',
        Stock: 40,
        Moneda: 'USD',
        'Precio_1_a_9_uds': 970.00,
        'Precio_10_a_49_uds': 940.00,
        'Precio_50_mas_uds': 915.00,
        Descripcion: 'Galaxy AI, S-Pen integrado, 200MP.',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla_Mayorista');
    XLSX.writeFile(wb, 'Plantilla_Importacion_Precios_Mayoristas.xlsx');
    success('Plantilla descargada.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar y Exportar Catálogo"
      subtitle="Gestión masiva de listas de precios y productos en Excel / CSV"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Selector de Pestañas */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exportar Lista Actual</span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold border-b-2 transition-all ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar Archivo Excel / CSV</span>
          </button>
        </div>

        {/* TAB 1: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-slate-800 tracking-wider">
                Configuración de Exportación
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Lista de Precios a Exportar
                  </label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priceLists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name} ({pl.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Formato</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExportFormat('xlsx')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        exportFormat === 'xlsx'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        exportFormat === 'csv'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>CSV (.csv)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleDownloadTemplate}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 underline underline-offset-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Plantilla Base Vacía</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Archivo</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT */}
        {activeTab === 'import' && (
          <div className="space-y-4 pt-2">
            {/* Destino y Motivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Lista de Precios Destino *
                </label>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {priceLists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name} ({pl.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo de Auditoría *
                </label>
                <input
                  type="text"
                  value={importReason}
                  onChange={(e) => setImportReason(e.target.value)}
                  placeholder="Ej: Carga mensual de lista de precios mayorista"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-blue-50/30 transition-all">
              <input
                type="file"
                id="fileUploadInput"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="fileUploadInput"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {fileName ? (
                    <span className="text-blue-700 font-extrabold">{fileName}</span>
                  ) : (
                    'Haga clic para seleccionar archivo Excel (.xlsx, .xls) o CSV'
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  El sistema detectará automáticamente SKU, Marca, Modelo, Stock y Precios por Volumen
                </p>
              </label>
            </div>

            {/* Previsualización de filas */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Previsualización ({parsedRows.length} registros detectados)</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Estructura válida
                  </span>
                </div>

                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Marca / Modelo</th>
                        <th className="p-2">Stock</th>
                        <th className="p-2 text-right">1-9 uds</th>
                        <th className="p-2 text-right">10-49 uds</th>
                        <th className="p-2 text-right">50+ uds</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedRows.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{row.SKU || row.sku || '-'}</td>
                          <td className="p-2">{row.Marca || row.marca} {row.Modelo || row.modelo}</td>
                          <td className="p-2">{row.Stock || row.stock || 0}</td>
                          <td className="p-2 text-right font-bold">${row.Precio_1_a_9_uds || row.tier1 || row.Precio || 0}</td>
                          <td className="p-2 text-right">${row.Precio_10_a_49_uds || row.tier2 || '-'}</td>
                          <td className="p-2 text-right text-emerald-700 font-bold">${row.Precio_50_mas_uds || row.tier3 || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedRows.length > 10 && (
                  <p className="text-[10px] text-slate-400 text-center">
                    ... y {parsedRows.length - 10} filas más preparadas para procesar.
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={parsedRows.length === 0 || isProcessing}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {isProcessing ? 'Importando...' : `Confirmar e Importar (${parsedRows.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
