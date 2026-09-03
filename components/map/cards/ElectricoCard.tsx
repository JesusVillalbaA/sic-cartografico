"use client";
import React from 'react';
import { X, Zap, Shield, MapPin, Activity, Settings, Users, FileText, FileSpreadsheet } from 'lucide-react';
import { exportLayerToPDF, exportLayerToExcel } from '@/app/lib/exportLayerPDF';
import { GoogleMapsButton } from '../GoogleMapsButton';

interface ElectricoCardProps {
  f: any;
  onRemove: (feature: any) => void;
  onOpenDiagrama?: () => void;
}

export const ElectricoCard: React.FC<ElectricoCardProps> = ({ f, onRemove, onOpenDiagrama }) => {
  const p = f.properties || {};
  const rawName = p.NAME || p.nombre || p.name || "Planta Eléctrica";
  const name = rawName
    .replace(/^SUB\s*ESTACI[OÓ]N\s*/i, '')
    .replace(/^SUBESTACI[OÓ]N\s*/i, '')
    .replace(/^SUBESTAC\s*/i, '')
    .replace(/^S\/E\s*/i, '')
    .trim();

  const cat = (p.gpxx_Categ || p.wptx1_Cate || p.categoria || "Infraestructura Eléctrica")
    .replace(/ELECTRICAS/g, '')
    .replace(/SUBESTACIONES/g, '')
    .replace(/SUB ESTACIONES/g, '')
    .replace(/S\/E/g, '')
    .trim() || 'Eléctrico';
  const cmt = p.cmt || p.comentario || "";

  // Determinar nivel de voltaje o tipo por nombre/categoría
  let voltage = p.TENSION_ASOCIADA || "N/A";
  if (voltage === "N/A") {
    if (name.includes("115") || cat.includes("115")) {
      voltage = "Alta Tensión (115 KV)";
    } else if (name.includes("34,5") || cat.includes("34,5") || name.includes("34.5") || cat.includes("34.5")) {
      voltage = "Media Tensión (34.5 KV)";
    } else if (cat.includes("PGD") || cat.includes("PGT") || cat.includes("PG")) {
      voltage = "Generación / Distribución";
    }
  }

  const operador = p.OPERADOR || "CORPOELEC";
  const capacidad = p.CAPACIDAD_MW ? `${p.CAPACIDAD_MW} MW` : "No especificada";
  const descripcion = p.DESCRIPCION || cmt;
  const municipio = p.MUNICIPIO || "Nueva Esparta, VE";
  const custodia = p.CUSTODIA;

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-2xl bg-[#0a0a05]/95 border border-yellow-500/40 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5 group">
      {/* Indicador lateral neon animado */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-600 group-hover:via-yellow-400 transition-all duration-500" />
      <div className="absolute top-0 right-0 w-48 h-48 blur-[100px] opacity-20 bg-yellow-400 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-32 h-32 blur-[80px] opacity-20 bg-orange-500 mix-blend-screen pointer-events-none" />

      <div className="p-5 pl-7 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-yellow-500/30 shadow-md">
            <img src="/electricidad.png" alt="Eléctrico" className="w-5 h-5 object-contain drop-shadow-md" />
            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-700">
              Sistema Eléctrico · NE
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all duration-300 hover:rotate-90">
            <X size={16} />
          </button>
        </div>

        {/* Título de la Subestación */}
        <div className="mb-4">
          <h4 className="text-[1.15rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-yellow-200 uppercase italic leading-tight mb-1 drop-shadow-sm">
            {name}
          </h4>
          <div className="flex items-center gap-1.5 text-yellow-400/80">
            <MapPin size={11} className="drop-shadow-sm" />
            <span className="text-[10px] font-mono font-medium tracking-wide text-white/70">
              {municipio}
            </span>
          </div>
        </div>

        {/* Botón Ver Diagrama Unifilar */}
        <button
          onClick={onOpenDiagrama}
          className="w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/10 hover:from-yellow-500/30 hover:to-yellow-500/20 border border-yellow-500/40 hover:border-yellow-400 rounded-2xl flex items-center justify-center gap-2 text-yellow-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-lg shadow-yellow-500/5 group/btn cursor-pointer"
        >
          <Zap size={13} className="text-yellow-400 group-hover/btn:scale-110 transition-transform animate-pulse" />
          <span>Ver Diagrama Unifilar (CEOFANB)</span>
        </button>

        {/* Detalles Técnicos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-3 rounded-2xl hover:border-yellow-500/30 transition-colors">
            <span className="text-[8px] text-yellow-500/80 font-black uppercase tracking-wider block mb-1">Categoría</span>
            <div className="flex items-center gap-1.5">
              <Settings size={12} className="text-yellow-400" />
              <span className="text-[10px] text-white font-bold truncate max-w-[100px]">{cat}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-3 rounded-2xl hover:border-emerald-500/30 transition-colors">
            <span className="text-[8px] text-emerald-500/80 font-black uppercase tracking-wider block mb-1">Clase Voltaje</span>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" />
              <span className="text-[10px] text-white font-bold truncate">{voltage}</span>
            </div>
          </div>
        </div>

        {/* Custodia */}
        {custodia && (
          <div className="bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/20 p-3 rounded-2xl mb-4 backdrop-blur-sm">
            <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest block mb-1.5 flex items-center gap-1">
              <Shield size={10} />
              Custodiada por
            </span>
            <p className="text-[10px] text-blue-100/90 font-medium leading-relaxed">{custodia}</p>
          </div>
        )}

        {/* Detalles Adicionales */}
        {!custodia && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Operador</span>
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-blue-400" />
                <span className="text-[10px] text-slate-200 font-bold truncate">{operador}</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Capacidad</span>
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-orange-400" />
                <span className="text-[10px] text-slate-200 font-bold truncate">{capacidad}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comentario o Nota */}
        {descripcion && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-yellow-500 pl-3 py-2.5 rounded-r-xl mb-3">
            <span className="text-[8px] text-yellow-500/70 font-black uppercase tracking-widest block mb-1">Ubicación / Descripción</span>
            <p className="text-[10px] text-slate-300 font-medium leading-relaxed italic">{descripcion}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <GoogleMapsButton feature={f} className="w-full" />
          <div className="flex gap-1">
            <button
              onClick={() => exportLayerToPDF({ layerKey: 'electricidad' })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-linear-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold text-[8.5px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-yellow-400/30"
              title="Descargar PDF"
            >
              <FileText size={11} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportLayerToExcel({ layerKey: 'electricidad' })}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[8.5px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
              title="Descargar Excel"
            >
              <FileSpreadsheet size={11} />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 flex justify-between items-center border-t border-white/10">
          <span className="text-[8px] font-mono text-yellow-500/50 tracking-widest uppercase italic font-bold">SOGNE-ELECTRICO-NE</span>
          <span className="text-[8px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">{(p.id || name).slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
