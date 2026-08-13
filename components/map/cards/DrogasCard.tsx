"use client";
import React from 'react';
import { X, Beaker, TrendingUp, MapPin, Radio, Shield, User, Calendar, Activity } from 'lucide-react';

const TRAFICO_COLOR: Record<string, string> = {
  ALTO: 'text-red-400',
  MEDIO: 'text-amber-400',
  BAJO: 'text-lime-400',
};

const TRAFICO_BG: Record<string, string> = {
  ALTO: 'bg-red-500/20 border-red-500/30',
  MEDIO: 'bg-amber-500/20 border-amber-500/30',
  BAJO: 'bg-lime-500/20 border-lime-500/30',
};

export const DrogasCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const nivel = (p.nivel_trafico || 'MEDIO').toUpperCase();
  const colorText = TRAFICO_COLOR[nivel] ?? 'text-lime-400';
  const colorBg = TRAFICO_BG[nivel] ?? 'bg-lime-500/20 border-lime-500/30';

  // Obtener sustancias individuales de la lista de manera ultra-robusta (Mapbox puede serializar arrays a strings)
  let sustancias: string[] = [];
  try {
    if (Array.isArray(p.sustancias_list)) {
      sustancias = p.sustancias_list;
    } else if (typeof p.sustancias_list === 'string') {
      try {
        const parsed = JSON.parse(p.sustancias_list);
        if (Array.isArray(parsed)) {
          sustancias = parsed;
        } else {
          sustancias = p.sustancias_list.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } catch (e) {
        sustancias = p.sustancias_list.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    if (sustancias.length === 0 && p.tipo_sustancia) {
      if (typeof p.tipo_sustancia === 'string') {
        sustancias = p.tipo_sustancia.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (Array.isArray(p.tipo_sustancia)) {
        sustancias = p.tipo_sustancia;
      }
    }
  } catch (err) {
    console.error("Error parsing sustancias:", err);
    sustancias = [];
  }

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0a0c0a]/95 border border-lime-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-lime-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 bg-lime-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-lime-500/20">
            <img src="/drogas.png" alt="Drogas" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-lime-600">Geocalizacion · Drogas</span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nivel de tráfico e indicación de Estado */}
        <div className="flex gap-2 items-center mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colorBg}`}>
            <TrendingUp size={12} className={colorText} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${colorText}`}>Tráfico {nivel}</span>
          </div>
          {p.estado_actual && (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white/3 border-white/5`}>
              <Activity size={12} className={p.estado_actual === 'ACTIVO' ? 'text-lime-400' : 'text-slate-400'} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${p.estado_actual === 'ACTIVO' ? 'text-lime-400' : 'text-slate-400'}`}>
                {p.estado_actual}
              </span>
            </div>
          )}
        </div>

        {/* Sustancia y Badges */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-2">
            {p.tipo_sustancia || 'Sustancia No Identificada'}
          </h4>
          {sustancias.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {sustancias.map((s, idx) => (
                <span key={idx} className="bg-lime-500/10 border border-lime-500/20 text-lime-400 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide">
                  {s}
                </span>
              ))}
            </div>
          )}
          {p.descripcion && (
            <div className="bg-white/3 border-l-2 border-lime-500/50 pl-3 py-2 rounded-r-xl">
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.descripcion}</p>
            </div>
          )}
        </div>

        {/* Imagen / Evidencia */}
        {p.url_foto && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 aspect-video bg-black/40 relative">
            <img src={p.url_foto} alt="Evidencia de punto de tráfico" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Detalles Geográficos */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Municipio</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-lime-400" />
              <span className="text-[10px] text-slate-200 font-bold truncate">{p.municipio || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Sector</span>
            <div className="flex items-center gap-1.5">
              <Radio size={11} className="text-lime-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-200 font-bold truncate">{p.sector || 'N/A'}</span>
                {f.geometry?.coordinates && (
                  <span className="text-[7px] font-mono text-slate-400 leading-none">
                    {f.geometry.coordinates[1].toFixed(5)}, {f.geometry.coordinates[0].toFixed(5)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Oficial a cargo / Operador del sistema */}
        {p.usuario_nombre && (
          <div className="bg-white/2 border border-white/5 p-3 rounded-2xl mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center">
                <User size={12} className="text-lime-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">Oficial de Inteligencia</span>
                <span className="text-[10px] text-slate-200 font-bold leading-none">{p.usuario_nombre}</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {p.usuario_cargo || 'P/O'}
            </span>
          </div>
        )}

        {/* Fuente y Fecha */}
        <div className="flex justify-between items-center text-slate-500 border-t border-white/5 pt-3">
          {p.fuente_informacion && (
            <div className="flex gap-1 items-center">
              <span className="text-[8px] font-bold uppercase tracking-wider">Fuente:</span>
              <span className="text-[9px] text-slate-300 font-mono">{p.fuente_informacion}</span>
            </div>
          )}
          {p.fecha_reporte && (
            <div className="flex gap-1 items-center ml-auto">
              <Calendar size={10} className="text-slate-500" />
              <span className="text-[9px] text-slate-300 font-mono">{new Date(p.fecha_reporte).toLocaleDateString('es-VE')}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-DROGAS-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id_punto || p.id || '').slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
