"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface TimelineSliderProps {
  onTimeFilterChange?: (filterRange: string) => void;
  theme?: string;
}

export const TimelineSlider = ({ onTimeFilterChange, theme = 'dark' }: TimelineSliderProps) => {
  const [activeRange, setActiveRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderVal, setSliderVal] = useState(100);
  const [isMinimized, setIsMinimized] = useState(false);
  const playIntervalRef = useRef<any>(null);

  const ranges = [
    { id: '24h' as const, label: '24 Horas' },
    { id: '7d' as const, label: '7 Días' },
    { id: '30d' as const, label: '30 Días' },
    { id: 'all' as const, label: 'Histórico' },
  ];

  const handleRangeSelect = (r: '24h' | '7d' | '30d' | 'all') => {
    setActiveRange(r);
    if (onTimeFilterChange) onTimeFilterChange(r);
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setSliderVal((prev) => {
          if (prev >= 100) return 0;
          return prev + 5;
        });
      }, 400);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-950/90 backdrop-blur-2xl px-4 py-2.5 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] ring-1 ring-white/10 flex flex-col gap-2 min-w-72 md:min-w-96">
        
        {/* Header de la Línea de Tiempo */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Clock size={13} className={isPlaying ? "animate-spin" : ""} style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase italic tracking-wider text-slate-100 block leading-tight">
                Línea de Tiempo Operativa
              </span>
              <span className="text-[8px] font-mono text-cyan-400/80">
                Filtro temporal activo: {ranges.find(r => r.id === activeRange)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pausar reproducción" : "Reproducir evolución"}
              className={`p-1.5 rounded-xl transition-all border ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setSliderVal(100);
                handleRangeSelect('all');
              }}
              title="Resetear línea de tiempo"
              className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Barra de progreso / Slider si está en modo play */}
        {isPlaying && (
          <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-white/10">
            <div 
              className="bg-linear-to-r from-cyan-500 via-sky-400 to-indigo-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${sliderVal}%` }}
            />
          </div>
        )}

        {/* Botones de Rango Temporal */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
          {ranges.map((r) => {
            const isSelected = activeRange === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRangeSelect(r.id)}
                className={`flex-1 py-1 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-200 text-center ${
                  isSelected
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
