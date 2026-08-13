"use client";
import React, { useState } from 'react';
import { X, Flame, MapPin, Building2, Factory, Info, CheckCircle2, XCircle, Phone, UserCheck, Compass, ShieldCheck, Copy, Check } from 'lucide-react';

export const EstacionGasCard = ({ f, onRemove }: any) => {
  const p = f?.properties || {};
  const coords = f?.geometry?.coordinates;
  const estatus = (p.estatus || 'Desconocido').toLowerCase();
  const isOperativa = estatus === 'operativa' || estatus === 'operativo';
  const [copied, setCopied] = useState(false);

  const coordsDisplay = p.coordenadas_dms || (coords ? `${coords[1]?.toFixed(5)}° N, ${coords[0]?.toFixed(5)}° W` : null);

  const handleCopyCoords = () => {
    if (coordsDisplay) {
      navigator.clipboard?.writeText(coordsDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0d0903]/95 border border-orange-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5 text-slate-100">
      {/* Glow Effects */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600" />
      <div className="absolute top-0 right-0 w-44 h-44 blur-[100px] opacity-25 bg-orange-500" />
      <div className="absolute bottom-0 left-10 w-32 h-32 blur-[80px] opacity-15 bg-amber-600" />

      <div className="p-5 pl-7">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/15 to-amber-500/10 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-sm">
            <img src="/gas.png" alt="Gas" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">
              Instalación Crítica · Gas / Hidrocarburos
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all"
            title="Cerrar Ficha"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nombre & Estatus */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-2 tracking-tight">
            {p.nombre || p.instalacion || 'Instalación de Gas'}
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            {/* Estatus badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border shadow-sm ${
              isOperativa 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}>
              {isOperativa ? (
                <CheckCircle2 size={12} className="text-emerald-400 animate-pulse" />
              ) : (
                <XCircle size={12} className="text-red-400" />
              )}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {p.estatus || 'Operativa'}
              </span>
            </div>

            {/* Organismo de Protección */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-300">
              <ShieldCheck size={11} className="text-orange-400" />
              <span>CEO · REDIMAIN</span>
            </div>
          </div>
        </div>

        {/* Tipo de Instalación */}
        {p.tipo && (
          <div className="bg-orange-950/30 border border-orange-500/20 p-3 rounded-2xl mb-3 shadow-inner">
            <div className="flex items-center gap-1.5 mb-1">
              <Factory size={12} className="text-orange-400" />
              <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Tipo de Instalación</span>
            </div>
            <span className="text-[11px] text-slate-100 font-bold leading-tight block">{p.tipo}</span>
          </div>
        )}

        {/* Responsable & Contacto Directo */}
        {(p.responsable || p.telefono) && (
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-3 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <UserCheck size={13} className="text-orange-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Responsable Operativo</span>
              </div>
              {p.telefono && (
                <a 
                  href={`tel:${p.telefono.replace(/[^0-9+]/g, '')}`} 
                  className="flex items-center gap-1 text-[10px] font-black text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-lg transition-all"
                >
                  <Phone size={10} />
                  <span>{p.telefono}</span>
                </a>
              )}
            </div>
            <p className="text-[12px] font-black text-white tracking-wide">
              {p.responsable || 'NO REGISTRADO'}
            </p>
          </div>
        )}

        {/* Grid de Datos: Empresa, Municipio & Parroquia */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1">Empresa / Operador</span>
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-orange-400 shrink-0" />
              <span className="text-[10px] text-slate-100 font-bold truncate">{p.empresa || 'PDVSA Gas'}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1">Municipio / Parroquia</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-orange-400 shrink-0" />
              <span className="text-[10px] text-slate-100 font-bold truncate">
                {p.municipio || 'N/A'}{p.parroquia ? ` (${p.parroquia})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Ubicación / Sector Detallado */}
        {(p.ubicacion || p.sector) && (
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl mb-3">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1 tracking-wider">
              Ubicación Geográfica & Referencia
            </span>
            <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
              {p.ubicacion || p.sector}
            </p>
          </div>
        )}

        {/* Coordenadas DMS / DD */}
        {coordsDisplay && (
          <div className="bg-orange-950/20 border border-orange-500/20 p-2.5 rounded-2xl mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Compass size={13} className="text-orange-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7px] text-orange-400 font-black uppercase tracking-widest block">Coordenadas Tácticas</span>
                <span className="text-[10px] font-mono text-slate-200 font-bold truncate block">{coordsDisplay}</span>
              </div>
            </div>
            <button
              onClick={handleCopyCoords}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-orange-500/30 text-slate-300 hover:text-white transition-all shrink-0"
              title="Copiar Coordenadas"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        )}

        {/* Descripción Técnica */}
        {p.descripcion && (
          <div className="bg-white/2 border-l-2 border-orange-500/60 pl-3 py-2 rounded-r-xl mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Info size={10} className="text-orange-400" />
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Descripción Táctica</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{p.descripcion}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2.5 flex justify-between items-center border-t border-white/10 opacity-40">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">CEO · REDIMAIN · GAS-NE</span>
          <span className="text-[7px] font-mono text-white">{String(p.id || p.nombre || '').slice(0, 16)}</span>
        </div>
      </div>
    </div>
  );
};

