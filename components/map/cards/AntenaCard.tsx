"use client";
import React from 'react';
import { X, Radio, MapPin, Activity, Cpu } from 'lucide-react';

interface AntenaCardProps {
  f: any;
  onRemove: (feature: any) => void;
}

export const AntenaCard: React.FC<AntenaCardProps> = ({ f, onRemove }) => {
  const p = f.properties || {};
  const coords = f.geometry?.coordinates;
  const layerId = (f.layer?.id || "").toLowerCase();

  // Determinar la operadora (Movilnet, Movistar, Digitel)
  let operator = "Movilnet / CANTV";
  let colorTheme = "text-emerald-400";
  let borderTheme = "border-emerald-500/40";
  let bgBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let glowColor = "bg-emerald-500";
  let iconSrc = "/movilnet.png";

  const rawOp = (p.operadora || p.operator || p.OPERADORA || p.gpxx_Categ || layerId || '').toUpperCase();

  if (rawOp.includes('DIGITEL')) {
    operator = "Digitel";
    colorTheme = "text-purple-400";
    borderTheme = "border-purple-500/40";
    bgBadge = "bg-purple-500/20 text-purple-300 border-purple-500/40";
    glowColor = "bg-purple-500";
    iconSrc = "/digitel.png";
  } else if (rawOp.includes('MOVISTAR')) {
    operator = "Movistar";
    colorTheme = "text-sky-400";
    borderTheme = "border-sky-500/40";
    bgBadge = "bg-sky-500/20 text-sky-300 border-sky-500/40";
    glowColor = "bg-sky-500";
    iconSrc = "/movistar.png";
  } else if (rawOp.includes('MOVILNET') || rawOp.includes('CANTV')) {
    operator = "Movilnet";
    colorTheme = "text-emerald-400";
    borderTheme = "border-emerald-500/40";
    bgBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    glowColor = "bg-emerald-500";
    iconSrc = "/movilnet.png";
  }

  // Nombre de la antena
  const name = p.NAME || p.nombre || p.name || "Antena Telecom";
  const capaWaypoint = p.LAYER || p.sym || "Radiobase 4G/LTE";

  // Parámetros técnicos del GeoJSON
  const excludeKeys = ['NAME', 'nombre', 'name', 'id', 'link', 'time', 'cmt', 'fix', 'gpxx_Categ', 'wptx1_Cate', 'operadora', 'operator'];
  const extraProps = Object.entries(p).filter(([key, val]) => !excludeKeys.includes(key) && val !== '' && typeof val !== 'object');

  return (
    <div className={`relative w-full overflow-hidden backdrop-blur-xl bg-[#0a0a0f]/95 border ${borderTheme} rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${glowColor}`} />
      <div className={`absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 ${glowColor}`} />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${bgBadge}`}>
            <img src={iconSrc} alt={operator} className="w-4 h-4 object-contain rounded-full bg-white/10" onError={(e) => { (e.target as any).src = '/antena.png'; }} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Red {operator}
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all cursor-pointer"
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Título de la antena */}
        <div className="mb-4">
          <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-1">
            {name}
          </h4>
          <p className={`text-[11px] font-mono ${colorTheme}`}>
            Estación de Telecomunicaciones · {operator}
          </p>
        </div>

        {/* Coordenadas GPS y Tipo */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Tipo de Celda</span>
            <div className="flex items-center gap-1.5">
              <Cpu size={12} className={colorTheme} />
              <span className="text-[11px] text-slate-200 font-bold truncate">{capaWaypoint}</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Estatus Operativo</span>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-bold">En Servicio</span>
            </div>
          </div>
        </div>

        {coords && (
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-3 mb-4 flex items-center gap-2">
            <MapPin size={14} className={`${colorTheme} shrink-0`} />
            <div className="text-[10px] font-mono text-slate-300">
              <span className="text-slate-500">GPS: </span>
              {coords[1].toFixed(6)}, {coords[0].toFixed(6)}
            </div>
          </div>
        )}

        {/* Metadatos del GeoJSON */}
        {extraProps.length > 0 && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-3.5 mb-2 space-y-2">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block mb-1">Parámetros del GeoJSON</span>
            <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono">
              {extraProps.map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500 uppercase">{key}:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[180px]">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-40">
          <span className={`text-[8px] font-mono ${colorTheme} tracking-widest uppercase italic`}>
            SOGNE • RED {operator.toUpperCase()}
          </span>
          <span className="text-[8px] font-mono text-slate-400">{String(p.id || '').slice(0, 12)}</span>
        </div>
      </div>
    </div>
  );
};
