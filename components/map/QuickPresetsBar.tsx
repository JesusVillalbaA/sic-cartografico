"use client";

import React from 'react';
import { ShieldAlert, Zap, HeartPulse, Anchor, RotateCcw } from 'lucide-react';
import { playTacticalClick, playTacticalAlert } from '@/app/lib/tacticalAudio';

interface QuickPresetsBarProps {
  onApplyPreset: (presetKey: 'seguridad' | 'servicios' | 'salud' | 'pesca' | 'limpiar') => void;
  theme?: string;
}

export const QuickPresetsBar: React.FC<QuickPresetsBarProps> = ({ onApplyPreset, theme = 'dark' }) => {
  const isLight = theme === 'light';

  const handlePreset = (key: 'seguridad' | 'servicios' | 'salud' | 'pesca' | 'limpiar') => {
    if (key === 'seguridad') playTacticalAlert();
    else playTacticalClick();
    onApplyPreset(key);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 bg-slate-950/80 border-cyan-500/30 text-white">
      
      {/* Preset 1: Seguridad */}
      <button
        onClick={() => handlePreset('seguridad')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 group cursor-pointer"
        title="Escenario de Seguridad: Cuadrantes, Delitos y Bandas"
      >
        <ShieldAlert size={13} className="text-red-400 group-hover:animate-bounce" />
        <span>Seguridad</span>
      </button>

      {/* Preset 2: Servicios Críticos */}
      <button
        onClick={() => handlePreset('servicios')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 group cursor-pointer"
        title="Escenario de Servicios: Electricidad, Gas y Agua"
      >
        <Zap size={13} className="text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>Servicios</span>
      </button>

      {/* Preset 3: Salud */}
      <button
        onClick={() => handlePreset('salud')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 group cursor-pointer"
        title="Escenario Red de Salud: Hospitales, CDI, Clínicas"
      >
        <HeartPulse size={13} className="text-indigo-400 group-hover:scale-110 transition-transform" />
        <span>Salud</span>
      </button>

      {/* Preset 4: Pesca y Marítimo */}
      <button
        onClick={() => handlePreset('pesca')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 group cursor-pointer"
        title="Escenario Costero: CONPPAS y Estaciones Marítimas"
      >
        <Anchor size={13} className="text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>CONPPAS</span>
      </button>

      <div className="w-[1px] h-4 bg-white/10 mx-1" />

      {/* Limpiar */}
      <button
        onClick={() => handlePreset('limpiar')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white text-[10px] font-mono uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
        title="Limpiar todas las capas activas"
      >
        <RotateCcw size={12} />
        <span>Limpiar</span>
      </button>
    </div>
  );
};
