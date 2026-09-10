"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Compass, Maximize, Minimize } from 'lucide-react';
import { playTacticalClick } from '@/app/lib/tacticalAudio';
import { setMap3DMode } from './mapUtils';

interface ZoomControlsProps {
  map: any;
  theme?: string;
}

export const ZoomControls = ({ map, theme = 'dark' }: ZoomControlsProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handle3DEvent = (e: any) => {
      setIs3DActive(!!e.detail?.active);
    };
    window.addEventListener('sigdi_3d_mode', handle3DEvent);
    return () => window.removeEventListener('sigdi_3d_mode', handle3DEvent);
  }, []);

  const handleZoomIn = () => {
    playTacticalClick();
    if (!map) return;
    map.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    playTacticalClick();
    if (!map) return;
    map.zoomOut({ duration: 300 });
  };

  const handleResetNorth = () => {
    playTacticalClick();
    if (!map) return;
    map.resetNorthPitch({ duration: 500 });
    setMap3DMode(map, false);
  };

  const toggleFullscreen = () => {
    playTacticalClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
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



      <div className="w-full h-[1px] bg-white/10 my-0.5" />

      {/* Botón 3D */}
      <button
        onClick={() => {
          playTacticalClick();
          if (!map) return;
          setMap3DMode(map, !is3DActive);
        }}
        title="Alternar Perspectiva 3D"
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-200 border cursor-pointer ${
          is3DActive
            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-black'
            : 'text-cyan-400 hover:text-white hover:bg-cyan-500/20 border-transparent hover:border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        }`}
      >
        3D
      </button>

      {/* Modo Pantalla Completa Táctico */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Salir de Pantalla Completa" : "Modo Pantalla Completa Táctico"}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all duration-200 border border-transparent hover:border-emerald-500/30 group cursor-pointer"
      >
        {isFullscreen ? (
          <Minimize size={16} className="group-hover:scale-110 transition-transform text-emerald-400" />
        ) : (
          <Maximize size={16} className="group-hover:scale-110 transition-transform text-emerald-400" />
        )}
      </button>
    </div>
  );
};
