"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Server, Shield, Calendar, User, Wifi, ShieldAlert, UserX, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

export const CiberneticaCard = ({ f, onRemove, allSujetos = [] }: any) => {
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const p = f.properties || {};
  
  const adaptedSujetos = (allSujetos || []).map((s: any) => ({
    ...s,
    nombres: s.personas_interes?.nombre_completo || s.nombres || 'Sujeto',
    apellidos: s.personas_interes?.alias ? `"${s.personas_interes.alias}"` : (s.apellidos || ''),
    cedula: s.personas_interes?.cedula || s.cedula || 'Sin Cédula'
  }));
  const linked = adaptedSujetos.filter((s: any) => s.id_incidencia === p.id_incidencia);
  const fallback = p.autor_full && Object.keys(p.autor_full).length > 0 ? [
    {
      id_sujeto: p.autor_full.id_sujeto_incidencia || 'fallback',
      nombres: p.autor_nombre,
      apellidos: '',
      cedula: p.autor_cedula,
      rol_sujeto: 'IMPLICADO',
      personas_interes: p.autor_full
    }
  ] : [];

  const finalSujetos = linked.length > 0 ? linked : fallback;

  const renderSujeto = (s: any, i: number) => {
    const nombres = (s.nombres || '').toUpperCase();
    const cedula = s.cedula || 'N/A';
    const alias = s.personas_interes?.alias ? ` ("${s.personas_interes.alias}")` : '';

    const isVictima = s.rol_sujeto === 'VICTIMA' || (s.personas_interes?.rol_o_categoria || '').toUpperCase().includes('VÍCTIMA');
    const rolLabel = isVictima ? (s.personas_interes?.rol_o_categoria || s.rol_sujeto || 'VÍCTIMA') : (s.rol_sujeto || 'IMPLICADO');
    const colorBg = isVictima ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20' : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20';
    const colorBadge = isVictima ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

    return (
      <div key={i} className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-colors ${colorBg}`}>
        {s.personas_interes?.url_foto ? (
          <img src={s.personas_interes.url_foto} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" alt="Foto" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/10 shrink-0">
            {isVictima ? <User size={16} className="text-sky-500" /> : <UserX size={16} className="text-rose-500" />}
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] text-white font-bold uppercase truncate">{nombres}{alias}</span>
            <span className={`text-[6px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${colorBadge}`}>
              {rolLabel}
            </span>
          </div>
          <span className="text-[8px] text-slate-500 font-mono uppercase">C.I. {cedula}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-y-auto max-h-[85vh] custom-scrollbar backdrop-blur-xl bg-[#07060f]/95 border border-violet-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-violet-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-violet-600" />

      <div className="p-5 pl-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-violet-500/20">
            <img src="/hacker.png" alt="Cibernética" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-violet-600">
              Área Cibernética · {p.tipo_incidente || 'Incidente'}
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="mb-5">
          <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-2">
            {p.tipo_incidente || 'DELITO INFORMÁTICO'}
          </h4>
          {p.descripcion && (
            <div className="bg-white/2 border-l-2 border-violet-500/60 pl-3 py-2 rounded-r-xl">
              <p className="text-[11px] text-slate-300 leading-relaxed">{p.descripcion}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Plataforma</span>
            <div className="flex items-center gap-1.5">
              <Globe size={11} className="text-sky-400" />
              <span className="text-[10px] text-slate-200 font-bold truncate">{p.plataforma || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">IP Origen</span>
            <div className="flex items-center gap-1.5">
              <Server size={11} className="text-emerald-400" />
              <span className="text-[9px] text-slate-200 font-mono font-bold truncate">{p.ip_origen || 'N/A'}</span>
            </div>
          </div>
        </div>

        {p.url_afectada && p.url_afectada !== 'N/A' && (
          <div className="bg-black/30 border border-white/5 p-3 rounded-2xl mb-4">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">URL / Enlace Afectado</span>
            <span className="text-[9px] text-violet-300 font-mono break-all select-all">{p.url_afectada}</span>
          </div>
        )}

        {finalSujetos.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 px-1">
              <ShieldAlert size={12} className="text-violet-400" />
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
                Víctimas e Implicados Registrados
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {finalSujetos.map((s: any, i: number) => renderSujeto(s, i))}
            </div>
          </div>
        )}

        {(p.victimas || p.implicados || p.sujetos_vinculados || p.sujetos) && (
          <div className="mb-4 space-y-2">
            {finalSujetos.length === 0 && (
              <div className="flex items-center gap-2 px-1">
                <ShieldAlert size={12} className="text-violet-400" />
                <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
                  Sujetos y Víctimas (Texto)
                </span>
              </div>
            )}
            {p.victimas && (
              <div className="bg-sky-500/10 border border-sky-500/20 p-2.5 rounded-xl">
                <span className="text-[8px] text-sky-400 font-bold uppercase block mb-1">Víctimas</span>
                <p className="text-[11px] text-slate-200">{p.victimas}</p>
              </div>
            )}
            {p.implicados && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                <span className="text-[8px] text-rose-400 font-bold uppercase block mb-1">Implicados</span>
                <p className="text-[11px] text-slate-200">{p.implicados}</p>
              </div>
            )}
            {(p.sujetos_vinculados || p.sujetos) && (
              <div className="bg-violet-500/10 border border-violet-500/20 p-2.5 rounded-xl">
                <span className="text-[8px] text-violet-400 font-bold uppercase block mb-1">Sujetos Vinculados</span>
                <p className="text-[11px] text-slate-200">{p.sujetos_vinculados || p.sujetos}</p>
              </div>
            )}
          </div>
        )}

        {/* Fallback: autor viejo si no hay sujetos_incidencia ni autor_full */}
        {finalSujetos.length === 0 && p.autor_nombre && p.autor_nombre !== 'Desconocido' && (
          <div className="bg-violet-950/20 border border-violet-500/10 p-3 rounded-2xl mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <User size={11} className="text-violet-400" />
              <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest">Autor (Registro Anterior)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-slate-200 font-bold uppercase">
                {p.autor_nombre} {p.autor_alias && p.autor_alias !== 'N/A' ? `("${p.autor_alias}")` : ''}
              </span>
              <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                C.I. {p.autor_cedula}
              </span>
            </div>
          </div>
        )}

        {/* EVIDENCIA FOTOGRÁFICA */}
        {(() => {
          let fotos: string[] = [];
          if (Array.isArray(p.incidencia_fotos)) {
            fotos = p.incidencia_fotos.map((f: any) => typeof f === 'object' ? f.url_foto : f).filter(Boolean);
          } else {
            try {
              if (p.incidencia_fotos) {
                fotos = typeof p.incidencia_fotos === 'string' ? JSON.parse(p.incidencia_fotos) : p.incidencia_fotos;
              }
            } catch(e) {}
          }
          
          if (fotos.length === 0 && p.foto_evidencia_url && p.foto_evidencia_url !== 'N/A') {
            fotos = [p.foto_evidencia_url];
          }

          return (
            <div className="mb-4 flex justify-between items-center bg-violet-500/5 p-2 rounded-xl border border-violet-500/10">
              <div className="flex items-center gap-1.5 px-1">
                <Camera size={12} className="text-violet-400" />
                <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">
                  Evidencia
                </span>
              </div>
              <button 
                onClick={() => { if(fotos.length > 0) { setGalleryImages(fotos); setGalleryIdx(0); } }}
                className={`py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-lg ${
                  fotos.length > 0
                    ? 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed opacity-50'
                }`}
              >
                <Camera size={10} />
                <span className="text-[7px] font-bold uppercase tracking-wider">
                  {fotos.length > 0 ? `Ver (${fotos.length})` : 'Sin Evidencia'}
                </span>
              </button>
            </div>
          );
        })()}

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
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-CIBER-GEO</span>
          <span className="text-[7px] font-mono text-white">{String(p.id_incidencia || p.id || '').slice(0, 8)}</span>
        </div>


      </div>

      {galleryImages && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
          onClick={() => setGalleryImages(null)}
        >
          <div className="w-full max-w-5xl flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-violet-500" />
              <h3 className="text-white font-black tracking-widest uppercase text-sm md:text-base">Evidencia Fotográfica</h3>
              <span className="bg-violet-500/20 text-violet-400 text-[10px] px-2 py-0.5 rounded font-bold">{galleryIdx + 1} / {galleryImages.length}</span>
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
