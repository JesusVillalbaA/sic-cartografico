"use client";
import React, { useMemo } from 'react';
import { ShieldAlert, Users, Target, Skull, X, Activity } from 'lucide-react';

export const InteligenciaCard = ({ 
  f, 
  onRemove, 
  allBandas = [], 
  allZonasVínculos = [] 
}: any) => {
  const pMap = f.properties || {};

  // Unificamos la data: El punto del mapa debe tener id_banda para hacer el match
  const bandaData = useMemo(() => {
    // Buscamos en la maestra de bandas por ID
    const base = allBandas.find((b: any) => b.id_banda === pMap.id_banda);
    // Buscamos si hay un vínculo específico de zona
    const zona = allZonasVínculos.find((z: any) => z.id_banda === pMap.id_banda);

    return { ...base, ...zona, ...pMap };
  }, [f, allBandas, allZonasVínculos]);

  const esAmenazaAlta = bandaData.amenaza === 'Alta' || bandaData.peligrosidad === 'ALTO';

  return (
    <div className={`
      relative w-full max-w-95 overflow-hidden 
      backdrop-blur-xl bg-slate-950/90 
      border ${esAmenazaAlta ? 'border-rose-500/30' : 'border-amber-500/30'} 
      rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5
    `}>
      {/* Glow de fondo dinámico */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 ${esAmenazaAlta ? 'bg-rose-600' : 'bg-amber-600'}`} />

      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white shadow-sm">
              <img src="/banda.png" alt="Grupo" className="w-5 h-5 object-contain" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${esAmenazaAlta ? 'text-rose-500' : 'text-amber-500'}`}>
              Inteligencia G.E.D.O
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-white/20 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* NOMBRE DE LA ORGANIZACIÓN */}
        <div className="mb-6">
          <h4 className="text-2xl font-black text-white uppercase italic leading-none mb-1">
            {bandaData.nombre_organizacion || bandaData.nombre_grupo || "ORGANIZACIÓN NN"}
          </h4>
          <div className="flex items-center gap-2 text-slate-400">
            <Target size={12} className="text-rose-500" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              Zona: {bandaData.nombre_zona || bandaData.sector || 'Sectores no delimitados'}
            </span>
          </div>
        </div>

        {/* GRID DE INTELIGENCIA */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Peligrosidad</span>
            <div className="flex items-center gap-2">
              <ShieldAlert size={12} className={esAmenazaAlta ? 'text-rose-500' : 'text-amber-500'} />
              <span className={`text-[11px] font-black uppercase ${esAmenazaAlta ? 'text-rose-500' : 'text-amber-500'}`}>
                {bandaData.amenaza || 'No evaluada'}
              </span>
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 p-3 rounded-2xl">
            <span className="text-[8px] text-slate-500 font-bold uppercase block mb-1">Integrantes Est.</span>
            <div className="flex items-center gap-2">
              <Users size={12} className="text-sky-500" />
              <span className="text-[11px] text-white font-black">
                {bandaData.miembros_est || '10 - 20'}
              </span>
            </div>
          </div>
        </div>

        {/* MODUS OPERANDI */}
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={12} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modus Operandi</span>
          </div>
          <p className="text-[11px] text-slate-200 font-medium leading-relaxed italic">
            "{bandaData.modus_operandi || 'Actividades delictivas enfocadas en control territorial y extorsión.'}"
          </p>
        </div>

        {/* ID DE INTELIGENCIA */}
        <div className="flex justify-between items-center opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-INTEL-DB</span>
          <span className="text-[8px] font-mono text-white uppercase">{bandaData.id_banda?.split('-')[0] || 'TEMP-ID'}</span>
        </div>
      </div>
    </div>
  );
};