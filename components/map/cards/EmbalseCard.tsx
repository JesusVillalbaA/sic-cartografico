"use client";
import React from 'react';
import { X, Droplets, MapPin, Building2, Activity, Waves } from 'lucide-react';

interface EmbalseCardProps {
  f: any;
  onRemove: (feature: any) => void;
}

export const EmbalseCard: React.FC<EmbalseCardProps> = ({ f, onRemove }) => {
  const p = f.properties || {};

  // New format fields
  const name = p.name || p.NAME || p.nombre || p.Embalse || "Estación de Agua";
  const institution = p.institution || p.organismo || "";
  const status = p.status || p.estado || "";
  const tipo = p.type || p.tipo || "";
  const municipality = p.municipality || p.municipio || "";
  const parish = p.parish || p.parroquia || "";
  const address = p.address || p.direccion || "";
  const cat = p.gpxx_Categ || "";

  // Legacy format fields
  const afluencia = p.Afluencia || p.afluencia || "";
  const capacidad = p["Capacidad del embalse"] || p.capacidad || p["Capacidad útil/normal"] || "";
  const superficie = p["Superficie del embalse"] || p.superficie || "";
  const poblacion = p["Población beneficiada"] || p.poblacion_beneficiada || "";
  const circuito = p.circuito || "";
  const aporte = p.aporte || "";

  const isNewFormat = !!(p.name || p.institution || p.status);

  const statusColor = status.toLowerCase().includes('operativo') ? 'text-emerald-400' :
                       status.toLowerCase().includes('inoperativo') ? 'text-rose-400' : 'text-amber-400';
  const statusBg = status.toLowerCase().includes('operativo') ? 'bg-emerald-500/20 border-emerald-500/30' :
                    status.toLowerCase().includes('inoperativo') ? 'bg-rose-500/20 border-rose-500/30' : 'bg-amber-500/20 border-amber-500/30';

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#030808]/95 border border-teal-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-400" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-teal-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-teal-500/20 shadow-sm">
            <img src="/agua.png" alt="Agua" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-teal-600">
              Servicio de Agua · {p.subcategoria || cat || tipo || 'Embalse'}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Título */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-1">
            {name}
          </h4>
          {address && (
            <div className="flex items-start gap-1.5 text-slate-400">
              <MapPin size={11} className="text-teal-400 shrink-0 mt-0.5" />
              <span className="text-[9px] font-mono leading-tight">{address}</span>
            </div>
          )}
        </div>

        {/* Estado y Tipo (nuevo formato) */}
        {isNewFormat && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {status && (
              <div className={`${statusBg} border p-2.5 rounded-2xl`}>
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Estado</span>
                <div className="flex items-center gap-1.5">
                  <Activity size={11} className={statusColor} />
                  <span className={`text-[10px] font-bold ${statusColor}`}>{status}</span>
                </div>
              </div>
            )}
            {institution && (
              <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Institución</span>
                <div className="flex items-center gap-1.5">
                  <Building2 size={11} className="text-teal-400" />
                  <span className="text-[9px] text-slate-200 font-bold truncate">{institution}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ubicación */}
        {(municipality || parish) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {municipality && (
              <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Municipio</span>
                <span className="text-[10px] text-slate-200 font-bold">{municipality}</span>
              </div>
            )}
            {parish && (
              <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Parroquia</span>
                <span className="text-[10px] text-slate-200 font-bold">{parish}</span>
              </div>
            )}
          </div>
        )}

        {/* Legacy: Capacidad y Superficie */}
        {(capacidad || superficie) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {capacidad && (
              <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Capacidad</span>
                <span className="text-[10px] text-slate-200 font-bold">{capacidad}</span>
              </div>
            )}
            {superficie && (
              <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Superficie</span>
                <span className="text-[10px] text-slate-200 font-bold">{superficie}</span>
              </div>
            )}
          </div>
        )}

        {/* Ficha Técnica / Datos de Operación */}
        {(afluencia || poblacion || circuito || aporte) && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-3 mb-4 space-y-1.5">
            <span className="text-[7px] text-teal-400 font-black uppercase tracking-widest block">Ficha Técnica & Operativa</span>
            {circuito && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Circuito CORPOELEC:</span>
                <span className="text-yellow-400 font-bold truncate max-w-[160px]">{circuito}</span>
              </div>
            )}
            {aporte && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Aporte:</span>
                <span className="text-slate-200 font-bold truncate max-w-[160px]">{aporte}</span>
              </div>
            )}
            {afluencia && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Afluencia:</span>
                <span className="text-slate-200 font-bold truncate max-w-[170px]">{afluencia}</span>
              </div>
            )}
            {poblacion && (
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 uppercase">Beneficiados:</span>
                <span className="text-slate-200 font-bold truncate max-w-[150px]">{poblacion}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-AGUA-NE</span>
          <span className="text-[7px] font-mono text-white">{(p.id_fuente || p.OBJECTID || name).toString().slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
