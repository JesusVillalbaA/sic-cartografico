"use client";
import React, { useMemo } from 'react';
import { Shield, Target, Users, AlertTriangle, Crosshair, MapPin } from 'lucide-react';

export const SectorCard = ({ f, incidenciasDB = [], bandasDB = [], bandasOrganizadas = [], puntosDB = [], personasDB = [], onRemove }: any) => {
  const p = f.properties;
  
  // 1. Identificación del sector desde la API de Mapbox
  const sectorMapbox = (p.nombre || p.sector || p.name || "").toUpperCase().trim();

  const stats = useMemo(() => {
    const normalize = (t: string) => t?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() || "";
    const sectorKey = normalize(sectorMapbox);

    // 2. INCIDENCIAS: Cantidad, Tipo y Descripción
    const incidenciasLocal = incidenciasDB.filter((i: any) => 
      normalize(i.sector) === sectorKey || normalize(i.municipio) === sectorKey
    );

    // 3. BANDAS: Cruce por id_banda para Nombre y Modus Operandi
    const zonasVinculadas = bandasDB.filter((z: any) => 
      normalize(z.nombre_zona) === sectorKey || normalize(z.municipio) === sectorKey
    );
    const idsBandasUnicas = Array.from(new Set(zonasVinculadas.map((z: any) => z.id_banda)));
    const detalleBandas = bandasOrganizadas.filter((b: any) => 
      idsBandasUnicas.includes(b.id_banda)
    );

    // 4. PUNTOS DE INTERÉS: (Drogas, Tráfico, etc)
    const puntosLocal = puntosDB.filter((pt: any) =>
      normalize(pt.sector) === sectorKey || normalize(pt.municipio) === sectorKey
    );

    // 5. PERSONAS DE INTERÉS: Sujetos ubicados en el sector
    const personasLocal = personasDB.filter((pe: any) =>
      normalize(pe.sector) === sectorKey || normalize(pe.municipio) === sectorKey
    );

    return {
      incidencias: incidenciasLocal,
      totalIncidencias: incidenciasLocal.length,
      bandas: detalleBandas,
      totalBandas: detalleBandas.length,
      puntos: puntosLocal,
      totalPuntos: puntosLocal.length,
      personas: personasLocal,
      totalPersonas: personasLocal.length,
      nivelAlerta: detalleBandas.length > 0 || incidenciasLocal.length > 3 || puntosLocal.length > 0
    };
  }, [sectorMapbox, incidenciasDB, bandasDB, bandasOrganizadas, puntosDB, personasDB]);

  return (
    <div className="bg-slate-950/90 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500 max-h-[85vh] flex flex-col">
      
      {/* CABECERA TÁCTICA */}
      <div className="bg-linear-to-r from-slate-900 to-slate-800 p-6 pb-4 relative border-b border-white/5 shrink-0">
        <button onClick={() => onRemove(f)} className="absolute top-6 right-6 text-white/20 hover:text-rose-500 transition-colors">
          <XIcon />
        </button>
        <div className="flex items-center gap-2 mb-2 bg-white w-max px-3 py-1 rounded-full shadow-sm border border-cyan-500/20">
          <img src="/Sectores.png" alt="Sector" className="w-5 h-5 object-contain" />
          <span className={`w-1.5 h-1.5 rounded-full ${stats.nivelAlerta ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-cyan-500'}`} />
          <p className="text-[9px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-0">Ficha de Inteligencia Territorial</p>
        </div>
        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">{sectorMapbox}</h4>
        
        {/* Fecha y Hora de Consulta */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 font-mono">
            📅 {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 font-mono">
            🕐 {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
        
        {/* SECCIÓN 1: INCIDENCIAS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-rose-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-rose-500" />
              <div>
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Incidentes Registrados</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white leading-none">{stats.totalIncidencias}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {stats.incidencias.slice(0, 5).map((inc: any, idx: number) => (
              <div key={idx} className="bg-white/5 border-l-2 border-rose-500 p-2.5 rounded-r-xl hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-tight">{inc.tipo_incidente}</p>
                  <span className="text-[8px] text-slate-500 font-mono">{new Date(inc.fecha_registro).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed italic line-clamp-2">"{inc.descripcion}"</p>
              </div>
            ))}
            {stats.incidencias.length > 5 && (
              <p className="text-[9px] text-center text-slate-500 italic">+ {stats.incidencias.length - 5} incidentes adicionales</p>
            )}
            {stats.incidencias.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">Sin incidencias registradas en este sector.</p>
            )}
          </div>
        </section>

        {/* SECCIÓN 2: PUNTOS DE INTERÉS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-500" />
              <div>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Puntos de Interés / Tráfico</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white leading-none">{stats.totalPuntos}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {stats.puntos.map((pt: any, idx: number) => (
              <div key={idx} className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl flex items-start gap-2">
                <Target size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h6 className="text-[10px] font-black text-amber-400 uppercase">{pt.tipo_punto} ({pt.nivel_trafico || 'N/A'})</h6>
                  <p className="text-[9px] text-slate-300 line-clamp-1">{pt.descripcion || pt.fuente_informacion || 'Sin detalles'}</p>
                </div>
              </div>
            ))}
            {stats.puntos.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">Sin puntos de interés mapeados.</p>
            )}
          </div>
        </section>

        {/* SECCIÓN 3: PERSONAS DE INTERÉS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-sky-500" />
              <div>
                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest leading-none">Sujetos Vinculados al Sector</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white leading-none">{stats.totalPersonas}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {stats.personas.map((pe: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-sky-500/5 border border-sky-500/10 p-2 rounded-xl">
                <div className="flex items-center gap-2">
                  {pe.url_foto ? (
                    <img src={pe.url_foto} alt="Foto" className="w-6 h-6 rounded-full object-cover border border-sky-500/30" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                      <Users size={10} className="text-slate-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-white uppercase leading-none mb-0.5">{pe.nombre_completo}</p>
                    <p className="text-[8px] font-mono text-slate-400">C.I. {pe.cedula}</p>
                  </div>
                </div>
                <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 uppercase">
                  {pe.rol_o_categoria || 'SUJETO'}
                </span>
              </div>
            ))}
            {stats.personas.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">No hay sujetos de interés identificados.</p>
            )}
          </div>
        </section>

        {/* SECCIÓN 4: GRUPOS DELICTIVOS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-cyan-500" />
              <div>
                <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest leading-none">Grupos Delictivos</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white leading-none">{stats.totalBandas}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats.bandas.map((banda: any, idx: number) => (
              <div key={idx} className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <h6 className="text-cyan-400 font-black text-xs uppercase italic tracking-tighter">
                    {banda.nombre_organizacion || banda.nombre_banda}
                  </h6>
                  <span className="text-[7px] font-black bg-rose-500/20 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded-full uppercase">
                    Amenaza: {banda.amenaza || 'Media'}
                  </span>
                </div>
                
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <p className="text-[7px] font-black text-slate-500 uppercase mb-1 tracking-[0.2em]">Modus Operandi:</p>
                  <p className="text-[9px] text-slate-300 leading-relaxed italic line-clamp-2">
                    {banda.modus_operandi || "En proceso de análisis por el departamento de inteligencia."}
                  </p>
                </div>
              </div>
            ))}
            {stats.bandas.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">No se detecta presencia de bandas organizadas.</p>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER TÉCNICO */}
      <div className="bg-slate-900/80 p-3 text-center border-t border-white/5 shrink-0">
        <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.6em]">
          INTELIGENCIA ESPACIAL • SOGNE
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);