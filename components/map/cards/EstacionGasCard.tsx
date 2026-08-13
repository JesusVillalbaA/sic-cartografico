"use client";
import React from 'react';
import { X, Flame, MapPin, Building2, Factory, Info, CheckCircle2, XCircle } from 'lucide-react';

export const EstacionGasCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const estatus = (p.estatus || 'Desconocido').toLowerCase();
  const isOperativa = estatus === 'operativa';

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0f0a00]/95 border border-orange-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 bg-orange-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-orange-500/20">
            <img src="/gas.png" alt="Gas" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-600">
              Servicios Básicos · Gas
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nombre */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-2">
            {p.nombre || 'Estación de Gas'}
          </h4>

          {/* Estatus badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            isOperativa 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : 'bg-red-500/10 border-red-500/20'
          }`}>
            {isOperativa ? (
              <CheckCircle2 size={12} className="text-emerald-400" />
            ) : (
              <XCircle size={12} className="text-red-400" />
            )}
            <span className={`text-[10px] font-black uppercase tracking-wider ${
              isOperativa ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {p.estatus || 'Desconocido'}
            </span>
          </div>
        </div>

        {/* Tipo de instalación */}
        {p.tipo && (
          <div className="bg-orange-950/20 border border-orange-500/10 p-3 rounded-2xl mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Factory size={11} className="text-orange-400" />
              <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Tipo de Instalación</span>
            </div>
            <span className="text-[11px] text-slate-200 font-bold leading-tight">{p.tipo}</span>
          </div>
        )}

        {/* Detalles Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Empresa</span>
            <div className="flex items-center gap-1.5">
              <Building2 size={11} className="text-orange-400" />
              <span className="text-[10px] text-slate-200 font-bold truncate">{p.empresa || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Municipio</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={11} className="text-orange-400" />
              <span className="text-[10px] text-slate-200 font-bold truncate">{p.municipio || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Sector / Dirección */}
        {p.sector && (
          <div className="bg-white/3 border border-white/5 p-3 rounded-2xl mb-4">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Dirección / Sector</span>
            <p className="text-[10px] text-slate-200 font-bold leading-relaxed">{p.sector}</p>
          </div>
        )}

        {/* Descripción */}
        {p.descripcion && (
          <div className="bg-white/2 border-l-2 border-orange-500/50 pl-3 py-2 rounded-r-xl mb-4">
            <div className="flex items-center gap-1 mb-1">
              <Info size={10} className="text-orange-400" />
              <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Descripción</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{p.descripcion}</p>
          </div>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-GAS-NE</span>
          <span className="text-[7px] font-mono text-white">{String(p.id || p.nombre || '').slice(0, 12)}</span>
        </div>
      </div>
    </div>
  );
};
