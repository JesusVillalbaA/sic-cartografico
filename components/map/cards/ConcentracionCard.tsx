"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Users, MapPin, AlertTriangle, Calendar, User, Camera } from 'lucide-react';
import { GoogleMapsButton } from '../GoogleMapsButton';

export const ConcentracionCard = ({ f, onRemove, allSujetos = [] }: any) => {
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const p = f.properties || {};
  
  const implicados = (allSujetos || []).filter((s: any) => s.id_incidencia === p.id_incidencia);

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0d0a00]/95 border border-amber-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-amber-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-amber-500/20">
            <img src="/concentracion.png" alt="Concentración" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
              Concentración · {p.categoria_incidencia || 'Orden Público'}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tipo y descripción */}
        <div className="mb-4">
          <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-2">
            {p.tipo_incidente || 'MANIFESTACIÓN'}
          </h4>
          {p.descripcion && (
            <div className="bg-white/5 border-l-2 border-amber-500/60 pl-3 py-2 rounded-r-xl">
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.descripcion}</p>
            </div>
          )}
        </div>

        {/* Datos clave de la manifestación */}
        {(p.estimacion_personas || p.presunto_lider) && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {p.estimacion_personas && (
              <div className="bg-amber-950/20 border border-amber-500/15 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Personas Est.</span>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-amber-400" />
                  <span className="text-xl font-black text-amber-400">{p.estimacion_personas}</span>
                </div>
              </div>
            )}
            {p.presunto_lider && (
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-2xl">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Líder Gremial</span>
                <span className="text-[9px] text-slate-200 font-bold leading-tight">{p.presunto_lider}</span>
              </div>
            )}
          </div>
        )}

        {/* SUJETOS VINCULADOS */}
        {implicados.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 px-1">
              <User size={12} className="text-amber-400" />
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Sujetos Registrados</span>
            </div>
            <div className="max-h-30 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {implicados.map((s: any, i: number) => {
                const nombres = s.personas_interes?.nombre_completo || s.nombres || 'Sujeto';
                const apellidos = s.personas_interes?.alias ? `"${s.personas_interes.alias}"` : (s.apellidos || '');
                const cedula = s.personas_interes?.cedula || s.cedula || 'Sin Cédula';
                
                return (
                  <div key={i} className="flex flex-col bg-white/5 p-2.5 rounded-xl border border-white/5 gap-2">
                    <div className="flex items-center gap-2.5">
                      {s.personas_interes?.url_foto ? (
                        <img src={s.personas_interes.url_foto} className="w-9 h-9 rounded-full object-cover border border-white/10" alt="Foto" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-white/10 shrink-0">
                          <User size={14} className="text-slate-500" />
                        </div>
                      )}
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-white font-bold uppercase">{nombres} {apellidos}</span>
                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            s.rol_sujeto === 'VICTIMA' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {s.rol_sujeto || 'IMPLICADO'}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono uppercase mb-0.5">
                          C.I. {cedula}
                        </span>
                        {s.personas_interes?.afiliacion_o_grupo && (
                          <span className="text-[8px] text-slate-400 font-bold uppercase">
                            Afiliación: <span className="text-white">{s.personas_interes.afiliacion_o_grupo}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vías afectadas */}
        {p.vias_afectadas && p.vias_afectadas !== 'N/A' && (
          <div className="bg-amber-950/20 border border-amber-500/10 p-3 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle size={11} className="text-amber-400" />
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Vías Afectadas</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">{p.vias_afectadas}</p>
          </div>
        )}

        {/* Consignas */}
        {p.consignas_gremio && p.consignas_gremio !== 'N/A' && (
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl mb-4">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Consignas / Motivo</span>
            <p className="text-[10px] text-slate-300 italic leading-relaxed">"{p.consignas_gremio}"</p>
          </div>
        )}

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-slate-500 mb-4">
          <MapPin size={11} className="text-amber-400" />
          <span className="text-[9px] text-slate-300 font-mono">
            {p.sector || 'N/A'} — {p.municipio || 'Nueva Esparta'}
          </span>
        </div>

        {/* Oficial a cargo */}
        {p.usuario_nombre && (
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <User size={12} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">Oficial Responsable</span>
                <span className="text-[10px] text-slate-200 font-bold leading-none">{p.usuario_nombre}</span>
              </div>
            </div>
            <span className="text-[8px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {p.usuario_cargo || 'P/O'}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-500 border-t border-white/5 pt-3">
          <div className="flex items-center gap-1.5">
            <Calendar size={10} />
            <span className="text-[8px] font-bold uppercase">Registrado:</span>
          </div>
          <span className="text-[9px] text-slate-300 font-mono">
            {p.fecha_registro ? new Date(p.fecha_registro).toLocaleString('es-VE') : 'N/A'}
          </span>
        </div>
        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-ORDEN-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id_incidencia || p.id || '').slice(0, 8)}</span>
        </div>

        {/* EVIDENCIA FOTOGRÁFICA — link compacto al final */}
        {(() => {
          let fotos: string[] = [];
          try {
            if (p.incidencia_fotos) fotos = typeof p.incidencia_fotos === 'string' ? JSON.parse(p.incidencia_fotos) : p.incidencia_fotos;
          } catch(e) {}
          
          if (fotos.length === 0 && p.foto_vistas_url && p.foto_vistas_url !== 'N/A') {
            fotos = [p.foto_vistas_url];
          }

          if (fotos.length === 0) {
            return (
              <div className="mt-3 w-full py-2 bg-white/5 text-slate-500 rounded-xl flex justify-center items-center gap-1.5 border border-white/5 opacity-50 cursor-not-allowed">
                <Camera size={12} />
                <span className="text-[8px] font-bold uppercase tracking-wider">Sin Evidencia Fotográfica</span>
              </div>
            );
          }

          return (
            <button 
              onClick={() => setGalleryImages(fotos)}
              className="mt-3 w-full py-2 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 rounded-xl flex justify-center items-center gap-1.5 transition-all group border border-amber-500/10 hover:border-amber-500/30"
            >
              <Camera size={12} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold uppercase tracking-wider">📷 Ver fotos ({fotos.length})</span>
            </button>
          );
        })()}

        <GoogleMapsButton feature={f} className="w-full mt-3" />
      </div>

      {galleryImages && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
          onClick={() => setGalleryImages(null)}
        >
          <div className="w-full max-w-5xl flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-amber-500" />
              <h3 className="text-white font-black tracking-widest uppercase text-sm md:text-base">Evidencia Fotográfica</h3>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">{galleryImages.length} FOTOS</span>
            </div>
            <button 
              className="text-white/50 hover:text-white bg-white/5 hover:bg-rose-500 p-2.5 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); setGalleryImages(null); }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center gap-6 pb-10" onClick={(e) => e.stopPropagation()}>
            {galleryImages.map((url, idx) => (
              <div key={idx} className="relative group w-full max-w-4xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden p-2">
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-[10px] font-bold border border-white/10 z-10">
                  {idx + 1} / {galleryImages.length}
                </div>
                <img 
                  src={url} 
                  className="w-full h-auto object-contain rounded-2xl max-h-[80vh]"
                  alt={`Evidencia ${idx + 1}`}
                />
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
