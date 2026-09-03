"use client";
import React from 'react';
import { X, Bus, MapPin, Tag, Route, Navigation, Users } from 'lucide-react';

export const TransporteCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const nombre = p.nombre || p.NOMBRE_ENTIDAD || p.NAME || "Estación de Transporte";
  const tipo = p.tipo || p.CATEGORIA || p.type || "Parada / Terminal";
  const ubicacion = p.ubicacion || p.direccion || p.ADDRESS || p.municipio || "Ubicación no especificada";
  const linea = p.linea || p.ruta || p.LINEA || "";
  const descripcion = p.descripcion || p.notas || null;

  // Determinar color base según tipo
  const tipoLower = tipo.toLowerCase();
  const isTerminal = tipoLower.includes('terminal');
  const isPrivado = tipoLower.includes('privado');
  const isMototaxi = tipoLower.includes('moto');
  
  let colorTheme = "sky";
  if (isTerminal) colorTheme = "indigo";
  if (isPrivado) colorTheme = "rose";
  if (isMototaxi) colorTheme = "amber";
  
  return (
    <div className={`relative w-full overflow-hidden backdrop-blur-xl bg-[#0a0c0a]/95 border border-${colorTheme}-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${colorTheme}-500`} />
      <div className={`absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 bg-${colorTheme}-500`} />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-sky-500/30 shadow-md">
            <img src="/transporte.png" alt="Transporte" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-sky-700">
              Gestión de Transporte
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nombre y Tipo */}
        <div className="mb-5">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-2">
            {nombre}
          </h4>
          <div className="flex flex-wrap gap-2 mt-1">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-${colorTheme}-500/20 border border-${colorTheme}-500/30`}>
              <Tag size={10} className="text-white" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                {tipo}
              </span>
            </div>
            {linea && (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">
                <Route size={10} className="text-white" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                  Ruta: {linea}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detalles */}
        <div className="space-y-3 mb-4">
          {/* Ubicación */}
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full bg-${colorTheme}-500/10 flex items-center justify-center shrink-0 border border-${colorTheme}-500/20`}>
              <MapPin size={14} className="text-white" />
            </div>
            <div>
              <span className="text-[8px] text-white/60 font-bold uppercase tracking-wider block mb-0.5">Dirección / Sector</span>
              <span className="text-[11px] text-white font-medium leading-snug block">{ubicacion}</span>
            </div>
          </div>

          {/* Opcional: Descripción */}
          {descripcion && (
            <div className="bg-black/30 border border-white/5 p-3 rounded-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-white/10">
                <Navigation size={14} className="text-white" />
              </div>
              <div>
                <span className="text-[8px] text-white/60 font-bold uppercase tracking-wider block mb-0.5">Observaciones</span>
                <p className="text-[10px] text-white leading-relaxed">
                  {descripcion}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
