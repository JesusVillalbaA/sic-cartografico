"use client";
import React from 'react';
import { X, Radio, MapPin, Activity, Shield, Cpu } from 'lucide-react';

interface AntenaCardProps {
  f: any;
  onRemove: (feature: any) => void;
}

export const AntenaCard: React.FC<AntenaCardProps> = ({ f, onRemove }) => {
  const p = f.properties || {};
  const layerId = (f.layer?.id || "").toLowerCase();

  // Determinar la operadora según la capa o las propiedades
  let operator = "Operadora Desconocida";
  let colorTheme = "text-violet-400";
  let bgTheme = "bg-violet-500/20 border-violet-500/30";
  let borderTheme = "border-violet-500/30";
  let shadowGlow = "bg-violet-500";

  if (layerId.includes('digitel') || p.operator?.toLowerCase().includes('digitel') || p.operadora?.toLowerCase().includes('digitel')) {
    operator = "Digitel";
    colorTheme = "text-purple-400";
    bgTheme = "bg-purple-500/20 border-purple-500/30";
    borderTheme = "border-purple-500/30";
    shadowGlow = "bg-purple-500";
  } else if (layerId.includes('movistar') || p.operator?.toLowerCase().includes('movistar') || p.operadora?.toLowerCase().includes('movistar')) {
    operator = "Movistar";
    colorTheme = "text-cyan-400";
    bgTheme = "bg-cyan-500/20 border-cyan-500/30";
    borderTheme = "border-cyan-500/30";
    shadowGlow = "bg-cyan-500";
  } else if (layerId.includes('movilnet') || p.operator?.toLowerCase().includes('movilnet') || p.operadora?.toLowerCase().includes('movilnet')) {
    operator = "Movilnet";
    colorTheme = "text-emerald-400";
    bgTheme = "bg-emerald-500/20 border-emerald-500/30";
    borderTheme = "border-emerald-500/30";
    shadowGlow = "bg-emerald-500";
  }

  // Nombre de la estación o antena
  const name = p.NAME || p.nombre || p.name || p.SECTOR || p.site_id || p.id || "Estación Base";

  // Dirección
  const direccion = p.DIRECCION || p.address || p.municipio || p.parroquia || 'Nueva Esparta, VE';

  // Tecnologías soportadas
  const tecnologia = p.tecnologia || p.tech || p.type || "LTE / 4G";

  // Mostrar propiedades adicionales excluyendo las genéricas
  const excludeKeys = ['NAME', 'nombre', 'name', 'SECTOR', 'DIRECCION', 'address', 'site_id', 'id', 'operator', 'operadora', 'tecnologia', 'tech', 'type'];
  const extraProps = Object.entries(p).filter(([key]) => !excludeKeys.includes(key) && typeof p[key] !== 'object');

  return (
    <div className={`relative w-full overflow-hidden backdrop-blur-xl bg-[#0a0a0f]/95 border ${borderTheme} rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${shadowGlow}`} />
      <div className={`absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 ${shadowGlow}`} />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-white/10 shadow-sm`}>
            <img src="/antena.png" alt="Antena" className="w-5 h-5 object-contain" />
            <span className={`text-[9px] font-black uppercase tracking-widest ${colorTheme}`}>
              Antena · {operator}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Título de la antena */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-1">
            {name}
          </h4>
          <div className="flex items-start gap-2">
            <MapPin size={12} className={`mt-0.5 shrink-0 ${colorTheme}`} />
            <span className="text-[10px] text-slate-400 font-mono leading-tight">
              {direccion}
            </span>
          </div>
        </div>

        {/* Tecnología y Estado */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Tecnología</span>
            <div className="flex items-center gap-1.5">
              <Cpu size={11} className={colorTheme} />
              <span className="text-[10px] text-slate-200 font-bold truncate">{tecnologia}</span>
            </div>
          </div>
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Estado de Servicio</span>
            <div className="flex items-center gap-1.5">
              <Activity size={11} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold truncate">{p.status || p.estado || 'Operativo'}</span>
            </div>
          </div>
        </div>

        {/* Propiedades Extra */}
        {extraProps.length > 0 && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-3.5 mb-4 space-y-2">
            <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">Parámetros Técnicos</span>
            <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-300 font-mono">
              {extraProps.slice(0, 6).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-500 uppercase">{key.replace(/_/g, ' ')}:</span>
                  <span className="text-slate-200 font-bold truncate max-w-[150px]">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-ANTENA-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id || '').slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
