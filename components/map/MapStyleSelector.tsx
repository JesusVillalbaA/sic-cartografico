"use client";
import React, { useState } from 'react';
import { Layers, Mountain, Globe, Moon } from 'lucide-react';

interface MapStyleSelectorProps {
  map: any;
  theme?: string;
}

export const MapStyleSelector = ({ map, theme = 'dark' }: MapStyleSelectorProps) => {
  const [currentStyle, setCurrentStyle] = useState<'satellite' | 'dark' | 'outdoors'>('satellite');
  const [is3DActive, setIs3DActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const styles = [
    {
      id: 'satellite' as const,
      label: 'Satelital HD',
      icon: Globe,
      styleUrl: 'mapbox://styles/mapbox/satellite-streets-v12'
    },
    {
      id: 'dark' as const,
      label: 'Cyber Dark',
      icon: Moon,
      styleUrl: 'mapbox://styles/mapbox/dark-v11'
    },
    {
      id: 'outdoors' as const,
      label: 'Topográfico',
      icon: Mountain,
      styleUrl: 'mapbox://styles/mapbox/outdoors-v12'
    }
  ];

  const handleStyleChange = (styleId: 'satellite' | 'dark' | 'outdoors', url: string) => {
    if (!map) return;
    setCurrentStyle(styleId);
    try {
      map.setStyle(url);
    } catch (e) {
      console.warn("Error changing map style:", e);
    }
  };

  const toggle3DMode = () => {
    if (!map) return;
    const nextState = !is3DActive;
    setIs3DActive(nextState);
    if (nextState) {
      const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : 11;
      const targetZoom = Math.max(currentZoom, 15.5);
      map.easeTo({
        pitch: 65,
        bearing: -25,
        zoom: targetZoom,
        duration: 1200
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
  };

  return (
    <div className="absolute right-6 bottom-64 z-20 select-none animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-slate-950/85 backdrop-blur-2xl p-1.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-white/10 flex flex-col gap-1.5">
        
        {/* Toggle Expandir selector */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title="Selector de Capas Base / Estilos"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all duration-200 border border-transparent hover:border-cyan-500/30 group cursor-pointer"
        >
          <Layers size={17} className="text-cyan-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Botón 3D Terreno Rápido */}
        <button
          onClick={toggle3DMode}
          title={is3DActive ? "Desactivar Perspectiva 3D" : "Activar Perspectiva 3D"}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-200 border cursor-pointer ${
            is3DActive
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
              : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/20 border-transparent'
          }`}
        >
          3D
        </button>

        {/* Panel Expandido de Estilos */}
        {isExpanded && (
          <div className="absolute right-12 bottom-0 flex flex-col gap-1 bg-slate-950/95 backdrop-blur-2xl p-2 rounded-2xl border border-cyan-500/40 shadow-2xl ring-1 ring-white/10 min-w-36 animate-in fade-in slide-in-from-right-2 duration-200">
            <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400/80 px-2 py-0.5">
              Estilo Base
            </span>
            {styles.map((st) => {
              const Icon = st.icon;
              const isActive = currentStyle === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleStyleChange(st.id, st.styleUrl)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
