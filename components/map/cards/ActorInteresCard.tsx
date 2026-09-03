"use client";
import React from 'react';
import { X, User, Shield, Users, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { GoogleMapsButton } from '../GoogleMapsButton';

export const ActorInteresCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0a080f]/95 border border-fuchsia-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-fuchsia-600" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-rose-500/20">
            <img src="/actor.png" alt="Actor de Interés" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-rose-600">
              Actor de Interés · {p.rol_o_categoria || 'Monitoreo'}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nombre principal */}
        <div className="mb-5">
          <h4 className="text-2xl font-black text-white uppercase italic leading-none mb-1">
            {p.nombre_completo || 'Persona de Interés'}
          </h4>
          {p.alias && (
            <p className="text-sm font-bold text-fuchsia-400 uppercase tracking-wide mb-2 italic">
              Alias: "{p.alias}"
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              C.I. {p.cedula || 'N/A'}
            </span>
            {p.estado_actual && (
              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                p.estado_actual === 'ACTIVO' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {p.estado_actual}
              </span>
            )}
          </div>
        </div>

        {/* Grid de datos */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Afiliación / Grupo</span>
            <div className="flex items-center gap-1.5">
              <Users size={11} className="text-fuchsia-400 shrink-0" />
              <span className="text-[9px] text-slate-200 font-bold leading-tight">{p.afiliacion_o_grupo || 'No registrada'}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Ubicación</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-fuchsia-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-200 font-bold truncate">{p.sector || p.municipio || 'N/A'}</span>
                {Array.isArray(f.geometry?.coordinates) && f.geometry.coordinates.length >= 2 && (
                  <span className="text-[7px] font-mono text-slate-400 leading-none">
                    {Number(f.geometry.coordinates[1]).toFixed(5)}, {Number(f.geometry.coordinates[0]).toFixed(5)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Imagen / Evidencia */}
        {p.url_foto && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 aspect-[4/3] bg-black/40 relative">
            <img src={p.url_foto} alt="Foto de Persona de Interés" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Descripción de actividad */}
        {p.descripcion_actividad && (
          <div className="bg-fuchsia-950/20 border border-fuchsia-500/10 p-3.5 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={11} className="text-fuchsia-400" />
              <span className="text-[8px] font-black text-fuchsia-400 uppercase tracking-widest">Actividad Registrada</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed italic">
              "{p.descripcion_actividad}"
            </p>
          </div>
        )}

        {/* Oficial a cargo */}
        {p.usuario_nombre && (
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                <User size={12} className="text-fuchsia-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">Oficial a Cargo</span>
                <span className="text-[10px] text-slate-200 font-bold leading-none">{p.usuario_nombre}</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {p.usuario_cargo || 'P/O'}
            </span>
          </div>
        )}

        {/* Fecha */}
        <div className="flex justify-between items-center text-slate-500 border-t border-white/5 pt-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} />
            <span className="text-[8px] font-bold uppercase">Registrado:</span>
          </div>
          <span className="text-[9px] text-slate-300 font-mono">
            {p.fecha_registro ? new Date(p.fecha_registro).toLocaleString('es-VE') : 'N/A'}
          </span>
        </div>

        <GoogleMapsButton feature={f} className="w-full" />

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-ACTOR-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id_persona_interes || p.id || '').slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
