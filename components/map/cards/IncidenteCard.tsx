"use client";
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Users, MapPin, Fingerprint, Activity,
  ShieldCheck, Clock, Navigation, AlertCircle, 
  Calendar, Briefcase, Hash, Target, Eye, Car, CreditCard,
  ShieldAlert, UserX, Camera
} from 'lucide-react';

export const IncidenteCard = ({ 
  f, 
  onRemove, 
  allIncidentes = [], 
  allTrafico = [],
  allSujetos = [], 
  allUsuarios = [] 
}: any) => {
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const pMap = f.properties || {};
  
  const data = useMemo(() => {
    // 1. Identificación del origen de datos
    const idRef = pMap.id_incidencia || pMap.id_reporte || pMap.id;
    const inc = allIncidentes.find((i: any) => i.id_incidencia === idRef);
    const traf = allTrafico.find((t: any) => t.id_reporte === idRef);
    
    const base = inc ? { ...inc, _type: 'crimen' } : (traf ? { ...traf, _type: 'trafico' } : { ...pMap, _type: 'desconocido' });

    // 2. Enlace con la tabla usuarios_maestra
    const oficial = allUsuarios.find((u: any) => 
      u.id_usuario === base.id_usuario_sistema || u.cedula === base.cedula_oficial_campo
    );

    // 3. Enlace con sujetos_incidencia (Filtrado por ID de incidencia)
    const adaptedSujetos = (allSujetos || []).map((s: any) => ({
      ...s,
      nombres: s.personas_interes?.nombre_completo || s.nombres || 'Sujeto',
      apellidos: s.personas_interes?.alias ? `"${s.personas_interes.alias}"` : (s.apellidos || ''),
      cedula: s.personas_interes?.cedula || s.cedula || 'Sin Cédula'
    }));
    const implicados = adaptedSujetos.filter((s: any) => s.id_incidencia === base.id_incidencia);

    // Detección de colisiones de identidad en la cédula (ej. Cédula 31138744 asociada a diferentes nombres)
    const normalizeName = (name: string) => name?.toLowerCase().trim() || "";
    const implicadosConAlerta = implicados.map((s: any) => {
      if (!s.cedula || s.cedula === 'asasa' || s.cedula === '1') {
        return { ...s, conflictoIdentidad: false, nombresAlternos: [] };
      }
      
      const nombresMismaCedula = adaptedSujetos
        .filter((os: any) => os.cedula === s.cedula && (normalizeName(os.nombres) !== normalizeName(s.nombres) || normalizeName(os.apellidos) !== normalizeName(s.apellidos)))
        .map((os: any) => `${os.nombres} ${os.apellidos}`);

      return {
        ...s,
        conflictoIdentidad: nombresMismaCedula.length > 0,
        nombresAlternos: nombresMismaCedula
      };
    });

    return { ...base, _oficial: oficial, _sujetos: implicadosConAlerta };
  }, [f, allIncidentes, allTrafico, allSujetos, allUsuarios]);

  const esTrafico = data._type === 'trafico' || !!data.nivel_trafico;

  return (
    <div className={`
      relative w-full max-w-95 overflow-y-auto max-h-[85vh] custom-scrollbar
      backdrop-blur-xl bg-[#0a0a0c]/95 
      border border-white/10 rounded-3xl shadow-2xl
      animate-in fade-in slide-in-from-right-5 duration-300
    `}>
      {/* INDICADOR LATERAL DE TIPO */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${esTrafico ? 'bg-amber-500' : 'bg-rose-600'}`} />

      <div className="p-5">
        {/* HEADER: CATEGORÍA Y CIERRE */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-white/5">
            {esTrafico ? (
              <img src="/drogas.png" alt="Tráfico" className="w-5 h-5 object-contain" />
            ) : (
              <img src="/delitos.png" alt="Incidente" className="w-5 h-5 object-contain" />
            )}
            <span className={`text-[9px] font-black uppercase tracking-widest ${esTrafico ? 'text-amber-500' : 'text-rose-500'}`}>
              {esTrafico ? `Geo-Inteligencia: ${data.nivel_trafico}` : 'Operacion de la Incidencia'}
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-white/20 hover:text-white hover:bg-rose-500/20 p-1.5 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* TÍTULO Y DESCRIPCIÓN TÉCNICA */}
        <div className="mb-5">
          <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-2">
            {data.tipo_incidente || "REPORTE DE TRÁFICO"}
          </h4>
          <div className="bg-white/2 border-l-2 border-slate-500 p-3 rounded-r-xl">
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              {data.descripcion || 'Sin narrativa de hechos registrada.'}
            </p>
          </div>
        </div>

        {/* UBICACIÓN Y GEO-POSICIONAMIENTO */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Jurisdicción</span>
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-sky-500" />
              <span className="text-[10px] text-slate-200 font-bold uppercase truncate">{data.municipio || 'N/A'}</span>
            </div>
          </div>
          <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Sector / Zona</span>
            <div className="flex items-center gap-2">
              <Navigation size={12} className="text-emerald-500" />
              <span className="text-[10px] text-slate-200 font-bold uppercase truncate">{data.sector || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* COORDENADAS (Importante para Inteligencia) */}
        {(data.latitud && data.longitud) && (
          <div className="flex gap-4 mb-4 px-2 py-1 bg-black/20 rounded-lg border border-white/5">
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-500 font-mono">LAT:</span>
              <span className="text-[9px] text-slate-300 font-mono">{Number(data.latitud).toFixed(6)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[8px] text-slate-500 font-mono">LON:</span>
              <span className="text-[9px] text-slate-300 font-mono">{Number(data.longitud).toFixed(6)}</span>
            </div>
          </div>
        )}

        {/* LISTADO DE SUJETOS (VINCULACIÓN 4NF) */}
        {!esTrafico && data._sujetos?.length > 0 ? (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Users size={12} className="text-sky-400" />
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Víctimas e Implicados Registrados</span>
            </div>
            <div className="max-h-30 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {data._sujetos.map((s: any, i: number) => {
                const tieneConflicto = s.conflictoIdentidad;
                return (
                  <div key={i} className="group flex flex-col bg-white/3 hover:bg-white/6 p-2.5 rounded-xl border border-white/5 transition-colors relative gap-2">
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
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white font-bold uppercase">{s.nombres} {s.apellidos}</span>
                            {tieneConflicto && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title={`Conflicto de identidad: ${s.nombresAlternos.join(', ')}`} />
                            )}
                          </div>
                          <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            (s.rol_sujeto === 'VICTIMA' || (s.personas_interes?.rol_o_categoria || '').toUpperCase().includes('VÍCTIMA')) ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {(s.rol_sujeto === 'VICTIMA' || (s.personas_interes?.rol_o_categoria || '').toUpperCase().includes('VÍCTIMA')) ? (s.personas_interes?.rol_o_categoria || s.rol_sujeto || 'VÍCTIMA') : (s.rol_sujeto || 'IMPLICADO')}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-500 font-mono uppercase mb-0.5">
                          C.I. {s.cedula}
                        </span>
                        {s.personas_interes?.afiliacion_o_grupo && (
                          <span className="text-[8px] text-slate-400 font-bold uppercase">
                            G.E.D.O / Banda: <span className="text-white">{s.personas_interes.afiliacion_o_grupo}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          !esTrafico && (data.victimas || data.implicados || data.sujetos_vinculados || data.sujetos) && (
            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Users size={12} className="text-sky-400" />
                  <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Sujetos y Víctimas</span>
                </div>
                
                {data.victimas && (
                  <div className="bg-sky-500/10 border border-sky-500/20 p-2.5 rounded-xl">
                    <span className="text-[8px] text-sky-400 font-bold uppercase block mb-1">Víctimas</span>
                    <p className="text-[11px] text-slate-200">{data.victimas}</p>
                  </div>
                )}
                
                {data.implicados && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                    <span className="text-[8px] text-rose-400 font-bold uppercase block mb-1">Implicados</span>
                    <p className="text-[11px] text-slate-200">{data.implicados}</p>
                  </div>
                )}

                {(data.sujetos_vinculados || data.sujetos) && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                    <span className="text-[8px] text-emerald-400 font-bold uppercase block mb-1">Sujetos Vinculados</span>
                    <p className="text-[11px] text-slate-200">{data.sujetos_vinculados || data.sujetos}</p>
                  </div>
                )}
            </div>
          )
        )}

        {/* EVIDENCIA FOTOGRÁFICA */}
        {(() => {
          let fotos: string[] = [];
          if (Array.isArray(data.incidencia_fotos)) {
            fotos = data.incidencia_fotos.map((f: any) => typeof f === 'object' ? f.url_foto : f).filter(Boolean);
          } else {
            try {
              if (data.incidencia_fotos) {
                fotos = typeof data.incidencia_fotos === 'string' ? JSON.parse(data.incidencia_fotos) : data.incidencia_fotos;
              }
            } catch(e) {}
          }
          if (fotos.length === 0 && data.url_foto && data.url_foto !== 'N/A') {
            fotos = [data.url_foto];
          }

          return (
            <div className="mb-4 flex justify-between items-center bg-sky-500/5 p-2 rounded-xl border border-sky-500/10">
              <div className="flex items-center gap-1.5 px-1">
                <Camera size={12} className="text-sky-400" />
                <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">
                  Evidencia
                </span>
              </div>
              <button 
                onClick={() => fotos.length > 0 && setGalleryImages(fotos)}
                className={`py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-lg ${
                  fotos.length > 0
                    ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30'
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

        {/* FOOTER: RESPONSABLE Y METADATOS */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <div className="flex justify-between items-center bg-white/2 p-2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                <User size={12} className="text-sky-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-slate-500 font-black uppercase tracking-tighter">Oficial a Cargo</span>
                <span className="text-[10px] text-slate-200 font-bold leading-none">
                  {data._oficial?.nombre_completo || 'DESCONOCIDO'}
                </span>
              </div>
            </div>
            <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
              {data._oficial?.cargo || 'P/O'}
            </span>
          </div>

          <div className="flex justify-between items-center px-1 text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} />
              <span className="text-[9px] font-bold uppercase">Reportado:</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono">
              {data.fecha_registro ? new Date(data.fecha_registro).toLocaleString('es-VE') : 'FECHA N/A'}
            </span>
          </div>
        </div>

        {/* ID DE RASTREO (Trace ID) */}
        <div className="mt-4 pt-2 flex justify-between items-center border-t border-white/2">
          <div className="flex items-center gap-1 opacity-30">
            <Hash size={8} className="text-white" />
            <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-TRACE-SYSTEM</span>
          </div>
          <span className="text-[8px] font-mono text-white/20 select-all">
            {data.id_incidencia || data.id_reporte}
          </span>
        </div>


      </div>

      {galleryImages && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md cursor-pointer animate-in fade-in duration-300"
          onClick={() => setGalleryImages(null)}
        >
          <div className="w-full max-w-5xl flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <Camera size={20} className="text-sky-500" />
              <h3 className="text-white font-black tracking-widest uppercase text-sm md:text-base">Evidencia Fotográfica</h3>
              <span className="bg-sky-500/20 text-sky-400 text-[10px] px-2 py-0.5 rounded font-bold">{galleryImages.length} FOTOS</span>
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