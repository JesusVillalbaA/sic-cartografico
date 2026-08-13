"use client";
import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Shield, Zap, Activity } from 'lucide-react';

interface ModalDiagramaElectricoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalDiagramaElectrico: React.FC<ModalDiagramaElectricoProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.8));
  const handleReset = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-250 p-2 md:p-6">
      <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl max-h-[92vh] rounded-[2rem]'} bg-[#080802]/98 border border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden flex flex-col transition-all duration-300`}>
        
        {/* Header */}
        <div className="p-4 px-6 bg-gradient-to-r from-yellow-950/40 via-black to-slate-950 border-b border-yellow-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-lg shadow-yellow-500/10">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-500/90">FUERZA CHOQUE DEL CEOFANB</span>
              </div>
              <h3 className="text-sm md:text-base font-black text-white uppercase italic tracking-wide">
                DIAGRAMA UNIFILAR & ESQUEMA ELÉCTRICO DE NUEVA ESPARTA
              </h3>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button 
                onClick={handleZoomOut} 
                title="Alejar"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[11px] font-mono font-bold text-yellow-400 px-2">{Math.round(zoom * 100)}%</span>
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
                className="p-1.5 text-slate-300 hover:text-yellow-400 hover:bg-white/10 rounded-lg transition-all border-l border-white/10"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              className="p-2 text-slate-300 hover:text-yellow-400 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
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

        {/* Resumen rápido de datos */}
        <div className="bg-yellow-950/20 border-b border-yellow-500/10 px-6 py-2 flex flex-wrap items-center justify-between gap-4 text-[10px]">
          <div className="flex items-center gap-4 text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <Activity size={12} />
              T.E. Luisa Cáceres: 110.3 MW
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-bold">T.E. Juan Bautista: 128.5 MW</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">Cable Submarino: 155.0 MW</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">Demanda Total: 360-390 MW</span>
          </div>
          <span className="text-[9px] font-mono text-yellow-500/60 uppercase tracking-widest">SOGNE · SISTEMA ELÉCTRICO NACIONAL</span>
        </div>

        {/* ÁREA DE VISUALIZACIÓN DEL DIAGRAMA */}
        <div className="relative flex-1 overflow-auto bg-[#040402] p-4 flex items-center justify-center custom-scrollbar">
          <div 
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src="/electrecidad.png"
              alt="Diagrama Unifilar del Sistema Eléctrico de Nueva Esparta"
              className="max-w-full h-auto object-contain rounded-xl shadow-2xl border border-yellow-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <span className="font-mono">Diagrama Unifilar General 115 Kv & 34.5 Kv · Estado Nueva Esparta</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold uppercase tracking-wider transition-all"
          >
            Cerrar Diagrama
          </button>
        </div>

      </div>
    </div>
  );
};
