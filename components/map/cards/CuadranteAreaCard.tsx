"use client";
import React from 'react';
import { MapPin, X, Shield, Phone, Activity, Truck, Navigation } from 'lucide-react';
import { GoogleMapsButton } from '../GoogleMapsButton';

export const CuadranteAreaCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};

  const nombreEntidad =
    p.nombre || p.name || p.NAME || p.comuna || 'Área Sin Etiqueta';

  const getWhatsAppLink = (phone: string, cuadrante: string) => {
    if (!phone) return "#";
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('58') ? cleanPhone : `58${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(`*SISTEMA SOGNE*\nSolicitud de reporte operativo: Área ${cuadrante}`)}`;
  };

  return (
    <div className="bg-slate-950/90 rounded-[2.5rem] border border-amber-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 ring-1 ring-amber-500/10">
      
      {/* HEADER */}
      <div className="bg-linear-to-b from-amber-500/10 to-transparent p-6 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 bg-white w-max px-3 py-1 rounded-full shadow-sm border border-amber-500/20">
              <img src="/cuadrantes.png" alt="Cuadrante" className="w-5 h-5 object-contain" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <p className="text-[9px] font-black uppercase text-amber-600 tracking-[0.2em]">Ficha de Inteligencia Área</p>
            </div>
            <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none line-clamp-2">
              {nombreEntidad}
            </h4>
            <div className="flex items-center gap-2 text-slate-400">
              <Navigation size={10} className="text-amber-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest">{p.municipio || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="p-2.5 bg-white/5 text-white/20 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all border border-white/5"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        
        {/* BLOQUE DE MANDO (RESPONSABLE) */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-5 flex items-center gap-4 group hover:bg-amber-500/5 transition-colors">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-400 transition-colors shadow-inner">
            <Shield className="text-amber-400" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Responsable Operativo</p>
            <p className="text-[13px] text-white font-black uppercase italic leading-[1.2] wrap-break-word line-clamp-2 overflow-hidden">
              {p.responsable || 'Oficial no asignado'}
            </p>
          </div>
        </div>

        {/* GRID DE DATOS TÉCNICOS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-4 rounded-[1.8rem] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} className="text-amber-500" />
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Cuadrante / Zona</p>
            </div>
            <p className="text-[10px] text-slate-200 font-bold leading-tight italic">
              {p.cuadrante ? `C-${p.cuadrante}` : 'Sin definir'}
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-[1.8rem] border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={12} className="text-amber-500" />
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Vehículos asignados</p>
            </div>
            <p className="text-[10px] text-slate-200 font-bold leading-tight italic line-clamp-2">
              {p.vehiculos || 'Sin reporte'}
            </p>
          </div>
        </div>

        {/* ÁREA DE REFERENCIA GEOGRÁFICA */}
        <div className="bg-amber-500/5 p-4 rounded-2xl border border-dashed border-amber-500/20">
          <p className="text-[7px] text-amber-500/50 font-black uppercase tracking-[0.2em] mb-2 text-center">Referencia de Ubicación</p>
          <p className="text-[10px] text-slate-400 italic text-center leading-relaxed px-2 line-clamp-3">
            {p.ubicacion_descripcion || p.comuna || 'Ubicación pendiente de verificación'}
          </p>
        </div>

        {/* ACCIÓN DE ENLACE Y MAPA */}
        <div className="pt-2 space-y-2">
          <GoogleMapsButton feature={f} className="w-full" />
          <a 
            href={getWhatsAppLink(p.telefono, p.cuadrante || nombreEntidad)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded-full transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] active:scale-95 group"
          >
            <div className="flex items-center gap-3 pl-6">
              <Phone size={14} className="group-hover:animate-bounce text-emerald-200" />
              <span className="text-[11px] font-black tracking-wider font-mono">{p.telefono || 'Sin Línea'}</span>
            </div>
            <div className="bg-white/10 px-8 py-3.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10">
              Contactar
            </div>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white/5 py-3 text-center border-t border-white/5">
        <p className="text-[7px] font-black text-white/5 uppercase tracking-[1em] ml-[1em]">
          INTELIGENCIA ESPACIAL • SOGNE
        </p>
      </div>

    </div>
  );
};