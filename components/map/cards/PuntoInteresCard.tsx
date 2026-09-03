"use client";
import React from 'react';
import { X, MapPin, Info, Crosshair, Calendar, User } from 'lucide-react';

const TIPO_LABELS: Record<string, string> = {
  traff_droga: 'Tráfico',
  vulnerabilidad_costera: 'Vulnerabilidad Costera',
  asistencia_control: 'Asistencia y Control',
  cuadrante_paz: 'Cuadrante de Paz',
  zona_critica: 'Zona Crítica',
  punto_control: 'Punto de Control',
};

export const PuntoInteresCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const tipoLabel = TIPO_LABELS[p.tipo_punto] || p.tipo_punto || 'General';

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#050d0d]/95 border border-teal-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-400" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-teal-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-teal-500/20">
            <img src="/punto.png" alt="Punto de Interés" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">
              Punto de Interés · {tipoLabel}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Título */}
        <div className="mb-4">
          <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-1">
            {tipoLabel}
          </h4>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-teal-400" />
              <span className="text-[10px] text-slate-400 font-mono">
                {p.sector || 'N/A'} — {p.municipio || 'Nueva Esparta'}
              </span>
            </div>
            {Array.isArray(f.geometry?.coordinates) && f.geometry.coordinates.length >= 2 && (
              <span className="text-[8px] font-mono text-slate-500 pl-5">
                Lat: {Number(f.geometry.coordinates[1]).toFixed(5)} | Lng: {Number(f.geometry.coordinates[0]).toFixed(5)}
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        {p.descripcion && (
          <div className="bg-teal-950/20 border border-teal-500/10 p-3.5 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Info size={11} className="text-teal-400" />
              <span className="text-[8px] font-black text-teal-400 uppercase tracking-widest">Descripción Táctica</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{p.descripcion}</p>
          </div>
        )}

        {/* Fuente y estado */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {p.fuente_informacion && (
            <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Fuente</span>
              <span className="text-[9px] text-slate-200 font-bold leading-tight">{p.fuente_informacion}</span>
            </div>
          )}
          {p.estado_actual && (
            <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Estado</span>
              <span className={`text-[9px] font-black uppercase ${p.estado_actual === 'ACTIVO' ? 'text-teal-400' : 'text-slate-400'}`}>
                {p.estado_actual}
              </span>
            </div>
          )}
        </div>

        {/* Imagen / Evidencia */}
        {p.url_foto && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 aspect-video bg-black/40 relative">
            <img src={p.url_foto} alt="Evidencia de punto de interés" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Oficial a cargo */}
        {p.usuario_nombre && (
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <User size={12} className="text-teal-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">Oficial de Campo</span>
                <span className="text-[10px] text-slate-200 font-bold leading-none">{p.usuario_nombre}</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {p.usuario_cargo || 'P/O'}
            </span>
          </div>
        )}

        {p.fecha_reporte && (
          <div className="flex justify-between items-center text-slate-500 border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={10} />
              <span className="text-[8px] font-bold uppercase">Reporte:</span>
            </div>
            <span className="text-[9px] text-slate-300 font-mono">
              {new Date(p.fecha_reporte).toLocaleString('es-VE')}
            </span>
          </div>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-PUNTO-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id_punto || p.id || '').slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
