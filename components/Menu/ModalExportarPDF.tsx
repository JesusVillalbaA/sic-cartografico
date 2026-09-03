"use client";
import React, { useState } from 'react';
import { X, FileText, Download, Loader2, ShieldCheck, Layers, Presentation, FileSpreadsheet, Sparkles } from 'lucide-react';
import { exportLayerToPDF, exportLayerToExcel } from '@/app/lib/exportLayerPDF';
import { exportCompletePresentationPDF, ProgressCallbackData } from '@/app/lib/exportPresentationPDF';

interface ModalExportarPDFProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateGeneralPDF?: () => void;
  mapRef?: React.RefObject<HTMLDivElement | null> | any;
  onToggle?: (layerKey: string) => void;
}

const CATEGORIES = [
  { key: 'conppas', label: 'CONPPAS y Puertos Pesqueros', icon: '/conppa.png', count: '52 registros', color: '#0284c7' },
  { key: 'hospitales', label: 'Red Hospitalaria (Tipo I-IV)', icon: '/hospital.png', count: '9 registros', color: '#ef4444' },
  { key: 'clinicas', label: 'Clínicas y Centros Privados', icon: '/clinica.png', count: '10 registros', color: '#3b82f6' },
  { key: 'ambulatorios', label: 'Ambulatorios y CPT', icon: '/ambulatorio.png', count: '33 registros', color: '#ec4899' },
  { key: 'cdi', label: 'Centros CDI y SRI', icon: '/centrosalud.png', count: '10 registros', color: '#a855f7' },
  { key: 'escuelas', label: 'Escuelas & Circuitos Educativos', icon: '/social.png', count: '251 registros', color: '#d946ef' },
  { key: 'estaciongas', label: 'Estaciones de Gas y Gasoductos', icon: '/gasolinera.png', count: '9 registros', color: '#f97316' },
  { key: 'electricidad', label: 'Subestaciones Eléctricas', icon: '/electricidad.png', count: '15 registros', color: '#eab308' },
  { key: 'agua', label: 'Servicios de Agua e Hidrología', icon: '/agua.png', count: '120 registros', color: '#06b6d4' },
  { key: 'antenas', label: 'Radiobases y Antenas Telecom', icon: '/antena.png', count: '67 registros', color: '#8b5cf6' },
  { key: 'estaciones_combustible', label: 'Estaciones de Servicio (Combustible)', icon: '/bombagasolina.png', count: '45 registros', color: '#10b981' },
];

const MAP_LAYER_KEYS: Record<string, string[]> = {
  hospitales: ['hospitales'],
  cdi: ['cdi'],
  clinicas: ['clinicas'],
  ambulatorios: ['ambulatorios'],
  escuelas: ['escuelas'],
  estaciones_combustible: ['estaciones'],
  estaciongas: ['estacionesGas'],
  electricidad: ['sistemasElectricos'],
  agua: ['servicioAgua.bombeoPotable', 'servicioAgua.tratamiento'],
  antenas: ['antenasDigitel', 'antenasMovistar', 'antenasMovilnet'],
  conppas: ['conppas'],
};

export const ModalExportarPDF: React.FC<ModalExportarPDFProps> = ({
  isOpen,
  onClose,
  onGenerateGeneralPDF,
  mapRef,
  onToggle,
}) => {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [isGeneratingPresentation, setIsGeneratingPresentation] = useState<boolean>(false);
  const [presentationProgress, setPresentationProgress] = useState<ProgressCallbackData | null>(null);

  if (!isOpen) return null;

  const handleExportPDF = async (layerKey: string) => {
    try {
      setDownloadingKey(`pdf-${layerKey}`);
      await exportLayerToPDF({ layerKey });
    } catch (err: any) {
      console.error('Error al exportar capa a PDF:', err);
      alert(err.message || 'Error al descargar PDF');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleExportExcel = async (layerKey: string) => {
    try {
      setDownloadingKey(`excel-${layerKey}`);
      await exportLayerToExcel({ layerKey });
    } catch (err: any) {
      console.error('Error al exportar capa a Excel:', err);
      alert(err.message || 'Error al descargar Excel');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleGeneratePresentation = async () => {
    try {
      setIsGeneratingPresentation(true);
      setPresentationProgress({
        currentStep: 0,
        totalSteps: 11,
        categoryTitle: 'Iniciando recopilación de capas y capturas de mapa...',
      });

      const mapElement = document.getElementById('map-export-container') || (mapRef?.current as HTMLElement | null);

      await exportCompletePresentationPDF({
        mapElement,
        onToggleCategory: async (catKey: string) => {
          if (onToggle && MAP_LAYER_KEYS[catKey]) {
            const keys = MAP_LAYER_KEYS[catKey];
            for (const k of keys) {
              onToggle(k);
            }
          }
        },
        onProgress: (progress) => {
          setPresentationProgress(progress);
        },
      });
    } catch (err: any) {
      console.error('Error al generar presentación por capas:', err);
      alert(err.message || 'Error al generar la presentación PDF');
    } finally {
      setIsGeneratingPresentation(false);
      setPresentationProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950/95 border border-cyan-500/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-white text-lg font-black uppercase tracking-wider">
                GENERADOR DE REPORTES OFICIALES & DOSSIER (PDF / EXCEL)
              </h3>
              <p className="text-slate-400 text-xs font-mono">
                Descarga de datos tabulados y presentaciones completas por partes / diapositivas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-legend-scrollbar space-y-4">
          
          {/* BANNER DESTACADO: DOSSIER PRESENTACIÓN COMPLETA POR CAPAS */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/40 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
              <Presentation size={140} className="text-cyan-400" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-cyan-400 animate-pulse" /> FORMATO DIAPOSITIVAS TIPO PRESENTACIÓN
                  </span>
                </div>
                <h4 className="text-white text-base font-black uppercase tracking-wide">
                  DOSSIER COMPLETO POR CAPAS CON MAPA & INFORMACIÓN
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Genera automáticamente un documento PDF horizontal (A4 / 16:9) con portada oficial y **una diapositiva por cada capa** (Hospitales, CDI, Escuelas, Gas, Electricidad, Agua, Antenas, CONPPAs), incluyendo la **captura del mapa con sus puntos cargados y la tabla analítica**.
                </p>
              </div>

              <button
                onClick={handleGeneratePresentation}
                disabled={isGeneratingPresentation || downloadingKey !== null}
                className="w-full md:w-auto shrink-0 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isGeneratingPresentation ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>GENERANDO DOSSIER...</span>
                  </>
                ) : (
                  <>
                    <Layers size={18} />
                    <span>DESCARGAR PRESENTACIÓN COMPLETA (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* Barra de Progreso en Tiempo Real */}
            {isGeneratingPresentation && presentationProgress && (
              <div className="mt-4 pt-3 border-t border-cyan-500/20 space-y-2 animate-in fade-in duration-300">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-cyan-300 font-bold">{presentationProgress.categoryTitle}</span>
                  <span className="text-cyan-400 font-black">
                    {Math.round((presentationProgress.currentStep / presentationProgress.totalSteps) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-cyan-500/30">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    style={{
                      width: `${(presentationProgress.currentStep / presentationProgress.totalSteps) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
            <span className="text-xs text-cyan-200 font-medium">
              O descarga reportes individuales en formato PDF o Excel por capa específica:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-cyan-500/40 transition-all text-left"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-white/90 shrink-0 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <img src={cat.icon} alt="" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 block truncate transition-colors">
                      {cat.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {cat.count}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleExportPDF(cat.key)}
                    disabled={downloadingKey !== null || isGeneratingPresentation}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                    title="Descargar en PDF"
                  >
                    {downloadingKey === `pdf-${cat.key}` ? (
                      <Loader2 size={13} className="animate-spin text-cyan-400" />
                    ) : (
                      <FileText size={13} className="text-cyan-400" />
                    )}
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleExportExcel(cat.key)}
                    disabled={downloadingKey !== null || isGeneratingPresentation}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 hover:text-white text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                    title="Descargar en Excel"
                  >
                    {downloadingKey === `excel-${cat.key}` ? (
                      <Loader2 size={13} className="animate-spin text-emerald-400" />
                    ) : (
                      <FileSpreadsheet size={13} className="text-emerald-400" />
                    )}
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-slate-400">
            Formato Estándar: A4 Landscape · SOGNE REDIMAIN 2026
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onGenerateGeneralPDF && (
              <button
                onClick={() => {
                  onClose();
                  onGenerateGeneralPDF();
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-white/10 cursor-pointer"
              >
                Reporte de Capas Activas
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
