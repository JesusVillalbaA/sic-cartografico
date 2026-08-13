"use client";
import React from 'react';
import { Plus, Minus, Compass } from 'lucide-react';

interface ZoomControlsProps {
  map: any;
  theme?: string;
}

export const ZoomControls = ({ map, theme = 'dark' }: ZoomControlsProps) => {
  const handleZoomIn = () => {
    if (!map) return;
    map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (!map) return;
    map.zoomOut({ duration: 300 });
  };

  const handleResetNorth = () => {
    if (!map) return;
    map.resetNorthPitch({ duration: 500 });
  };

  return (
    <div className="absolute right-6 bottom-8 z-20 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-2xl p-1.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-white/10 select-none animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Zoom In (+) */}
      <button
        onClick={handleZoomIn}
        title="Acercar mapa (+)"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all duration-200 border border-transparent hover:border-cyan-500/30 group cursor-pointer"
      >
        <Plus size={18} className="group-hover:scale-110 transition-transform text-cyan-400" />
      </button>

      <div className="w-full h-[1px] bg-white/10 my-0.5" />

      {/* Zoom Out (-) */}
      <button
        onClick={handleZoomOut}
        title="Alejar mapa (-)"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all duration-200 border border-transparent hover:border-cyan-500/30 group cursor-pointer"
      >
        <Minus size={18} className="group-hover:scale-110 transition-transform text-cyan-400" />
      </button>

      <div className="w-full h-[1px] bg-white/10 my-0.5" />

      {/* Reset Norte */}
      <button
        onClick={handleResetNorth}
        title="Orientar al Norte / Resetear inclinación"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all duration-200 border border-transparent hover:border-amber-500/30 group cursor-pointer"
      >
        <Compass size={16} className="group-hover:rotate-45 transition-transform text-amber-400" />
      </button>
    </div>
  );
};
