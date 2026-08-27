"use client";
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Shield, Flame, Activity, Layers, Info } from 'lucide-react';

interface ModalDiagramaGasProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalDiagramaGas: React.FC<ModalDiagramaGasProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tramo' | 'general'>('tramo');

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.8));
  const handleReset = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-250 p-2 md:p-6">
      <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl max-h-[92vh] rounded-[2rem]'} bg-[#0a0502]/98 border border-orange-500/40 shadow-[0_0_50px_rgba(249,115,22,0.2)] overflow-hidden flex flex-col transition-all duration-300`}>
        
        {/* Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-orange-950/40 via-black to-slate-950 border-b border-orange-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-lg shadow-orange-500/10">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400/90">SOGNE • REDIMAIN • PDVSA GAS</span>
              </div>
              <h3 className="text-sm md:text-base font-black text-white uppercase italic tracking-wide">
                GASODUCTO NORORIENTAL GJ. JOSÉ FRANCISCO BERMÚDEZ
              </h3>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            {/* Toggle de Vistas */}
            <div className="flex items-center bg-black/60 border border-orange-500/30 rounded-xl p-1 gap-1 mr-2">
              <button
                onClick={() => { setActiveTab('tramo'); handleReset(); }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${
                  activeTab === 'tramo'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Tramo N. Esparta
              </button>
              <button
                onClick={() => { setActiveTab('general'); handleReset(); }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${
                  activeTab === 'general'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Trazado General
              </button>
            </div>

            {/* Controles de Zoom */}
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={handleZoomOut} 
                title="Alejar"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold text-orange-400 px-2">{Math.round(zoom * 100)}%</span>
              <button 
                onClick={handleZoomIn} 
                title="Acercar"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={handleReset} 
                title="Restablecer"
                className="p-1.5 text-slate-300 hover:text-orange-400 hover:bg-white/10 rounded-lg transition-all border-l border-white/10"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="p-2 text-slate-300 hover:text-orange-400 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              <Maximize2 size={16} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 rounded-xl border border-white/10 transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Resumen rápido de datos tácticos del Gasoducto */}
        <div className="bg-orange-950/25 border-b border-orange-500/20 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px]">
          <div className="flex items-center gap-4 text-slate-300 font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
              <Activity size={12} />
              Distancia desde Tierra Firme: 51,8 km
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-bold">Estaciones Válvulas N. Esparta: 03 (BM-22, BM-30, BM-50)</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">Condición Contractual: 400 PSI</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">Condición Actual Operativa: 346 PSI</span>
          </div>
          <span className="text-[9px] font-mono text-orange-400/80 uppercase tracking-widest hidden lg:inline">SOGNE · INFRAESTRUCTURA DE GAS</span>
        </div>

        {/* ÁREA DE VISUALIZACIÓN DEL DIAGRAMA */}
        <div className="relative flex-1 overflow-auto bg-[#050302] p-4 flex items-center justify-center custom-scrollbar">
          <div 
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={activeTab === 'tramo' ? "/gas/gasoducto_tramo.jpg" : "/gas/gasoducto_general.jpg"}
              alt="Diagrama del Gasoducto Nororiental GJ. José Francisco Bermúdez"
              className="max-w-full h-auto object-contain rounded-xl shadow-2xl border border-orange-500/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <span className="font-mono">
            {activeTab === 'tramo' 
              ? "Tramo Submarino y Terrestre Nueva Esparta · Válvulas EVA Araya (BM-21), Coche (BM-22), Margarita (BM-50, BM-30)"
              : "Esquema de Trazado General del Gasoducto Nororiental Sucre - Coche - Nueva Esparta"
            }
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-bold uppercase tracking-wider transition-all"
          >
            Cerrar Diagrama
          </button>
        </div>

      </div>
    </div>
  );
};
