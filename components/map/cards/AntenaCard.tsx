"use client";
import React from 'react';
import { X, Radio, MapPin, Activity, Cpu, Shield, Navigation, FileText, FileSpreadsheet } from 'lucide-react';
import { exportLayerToPDF, exportLayerToExcel } from '@/app/lib/exportLayerPDF';
import { GoogleMapsButton } from '../GoogleMapsButton';

interface AntenaCardProps {
  f: any;
  onRemove: (feature: any) => void;
}

export const AntenaCard: React.FC<AntenaCardProps> = ({ f, onRemove }) => {
  const p = f.properties || {};
  const coords = f.geometry?.coordinates;
  const layerId = (f.layer?.id || "").toLowerCase();

  // Determinar la operadora (Movilnet, Movistar, Digitel)
  let operator = "Movilnet";
  let colorTheme = "text-emerald-400";
  let borderTheme = "border-emerald-500/40";
  let bgBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let glowColor = "bg-emerald-500";
  let iconSrc = "/movilnet.png";

  const rawOp = (p.operadora || p.operator || p.OPERADORA || p.gpxx_Categ || layerId || '').toUpperCase();
  const n = Number(p.N);

  if (rawOp.includes('DIGITEL') || n >= 63) {
    operator = "Digitel";
    colorTheme = "text-purple-400";
    borderTheme = "border-purple-500/40";
    bgBadge = "bg-purple-500/20 text-purple-300 border-purple-500/40";
    glowColor = "bg-purple-500";
    iconSrc = "/digitel.png";
  } else if (rawOp.includes('MOVISTAR') || (n >= 52 && n <= 61)) {
    operator = "Movistar";
    colorTheme = "text-sky-400";
    borderTheme = "border-sky-500/40";
    bgBadge = "bg-sky-500/20 text-sky-300 border-sky-500/40";
    glowColor = "bg-sky-500";
    iconSrc = "/movistar.png";
  } else {
    operator = "Movilnet";
    colorTheme = "text-emerald-400";
    borderTheme = "border-emerald-500/40";
    bgBadge = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    glowColor = "bg-emerald-500";
    iconSrc = "/movilnet.png";
  }

  // Título del sector / estación
  const sector = p.SECTOR || p.nombre || p.NAME || "Antena Telecom";
  const direccion = p.DIRECCION || p.ubicacion || p.address;
  const coordenadasDMS = p.COORDENADAS;

  return (
    <div className={`relative w-full overflow-hidden backdrop-blur-xl bg-[#0a0a0f]/95 border ${borderTheme} rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${glowColor}`} />
      <div className={`absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 ${glowColor}`} />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${bgBadge}`}>
              <img src={iconSrc} alt={operator} className="w-4 h-4 object-contain rounded-full bg-white/10" onError={(e) => { (e.target as any).src = '/antena.png'; }} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Red {operator}
              </span>
            </div>
            {p.N && (
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                Nº {p.N}
              </span>
            )}
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
            ANTENA {sector}
          </h4>
          <p className={`text-[11px] font-mono ${colorTheme}`}>
            Estación Base Telecomunicaciones · {operator}
          </p>
        </div>

        {/* Dirección y Ubicación */}
        {direccion && (
          <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-3.5 mb-3.5 space-y-1">
            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Dirección / Emplazamiento</span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              📍 {direccion}
            </p>
          </div>
        )}

        {/* Indicadores de Comando y Estatus */}
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Jurisdicción Militar</span>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className={colorTheme} />
              <span className="text-[11px] text-slate-200 font-bold truncate">
                {p.REDI || 'REDIMAIN'} {p.ZODI ? `• ${p.ZODI}` : ''}
              </span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1">Estatus Operativo</span>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-bold">En Servicio Activo</span>
            </div>
          </div>
        </div>

        {/* Coordenadas */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-3 mb-3 space-y-1">
          {coordenadasDMS && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
              <span className="text-slate-500">Coordenadas:</span>
              <span className="text-cyan-300 font-semibold">{coordenadasDMS}</span>
            </div>
          )}
          {Array.isArray(coords) && coords.length >= 2 && (
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">GPS Decimal:</span>
              <span>{Number(coords[1]).toFixed(6)}, {Number(coords[0]).toFixed(6)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <GoogleMapsButton feature={f} className="w-full" />
          <div className="flex gap-1">
            <button
              onClick={() => exportLayerToPDF({ layerKey: 'antenas' })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[8.5px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-purple-400/30"
              title="Descargar PDF"
            >
              <FileText size={11} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportLayerToExcel({ layerKey: 'antenas' })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[8.5px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
              title="Descargar Excel"
            >
              <FileSpreadsheet size={11} />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-40">
          <span className={`text-[8px] font-mono ${colorTheme} tracking-widest uppercase italic`}>
            SOGNE • REDIMAIN • {operator.toUpperCase()}
          </span>
          <span className="text-[8px] font-mono text-slate-400">{String(p.N ? `ID_${p.N}` : p.id || '').slice(0, 12)}</span>
        </div>
      </div>
    </div>
  );
};
