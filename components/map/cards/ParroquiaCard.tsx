"use client";

import React, { useMemo } from 'react';
import { X, Shield, MapPin, Users, Crosshair, Target, Map } from 'lucide-react';

interface ParroquiaCardProps {
  feature: any;
  onClose: () => void;
  incidenciasDB?: any[];
  puntosDB?: any[];
  personasDB?: any[];
  bandasDB?: any[];
  bandasOrganizadas?: any[];
}

export const ParroquiaCard = ({ feature, onClose, incidenciasDB = [], puntosDB = [], personasDB = [], bandasDB = [], bandasOrganizadas = [] }: ParroquiaCardProps) => {
  const props = feature.properties || {};
  const nombre = props.adm3_name || props.adm3_ref_name || "Parroquia sin nombre";
  const municipio = props.adm2_name || "No especificado";
  const estado = props.adm1_name || "Nueva Esparta";
  const codigo = props.adm3_pcode || "";
  const area = props.area_sqkm ? `${props.area_sqkm.toFixed(2)} km²` : "No disponible";
  const centroLat = props.center_lat?.toFixed(4) || "";
  const centroLon = props.center_lon?.toFixed(4) || "";

  const stats = useMemo(() => {
    const normalize = (t: string) => t?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim() || "";
    const parroquiaKey = normalize(nombre);
    const municipioKey = normalize(municipio);

    // Incidencias que coincidan con el municipio de la parroquia
    const incidenciasLocal = incidenciasDB.filter((i: any) => {
      const sec = normalize(i.sector || "");
      const mun = normalize(i.municipio || "");
      return sec.includes(parroquiaKey) || parroquiaKey.includes(sec) || mun === municipioKey;
    });

    // Puntos de interés en la zona
    const puntosLocal = puntosDB.filter((pt: any) => {
      const sec = normalize(pt.sector || "");
      const mun = normalize(pt.municipio || "");
      return sec.includes(parroquiaKey) || parroquiaKey.includes(sec) || mun === municipioKey;
    });

    // Personas de interés en la zona
    const personasLocal = personasDB.filter((pe: any) => {
      const sec = normalize(pe.sector || "");
      const mun = normalize(pe.municipio || "");
      return sec.includes(parroquiaKey) || parroquiaKey.includes(sec) || mun === municipioKey;
    });

    // Bandas vinculadas
    const zonasVinculadas = bandasDB.filter((z: any) => {
      const zona = normalize(z.nombre_zona || "");
      return zona.includes(parroquiaKey) || parroquiaKey.includes(zona);
    });
    const idsBandas = Array.from(new Set(zonasVinculadas.map((z: any) => z.id_banda)));
    const detalleBandas = bandasOrganizadas.filter((b: any) => idsBandas.includes(b.id_banda));

    return {
      incidencias: incidenciasLocal,
      puntos: puntosLocal,
      personas: personasLocal,
      bandas: detalleBandas,
      nivelAlerta: incidenciasLocal.length > 3 || detalleBandas.length > 0 || puntosLocal.length > 0,
    };
  }, [nombre, municipio, incidenciasDB, puntosDB, personasDB, bandasDB, bandasOrganizadas]);

  return (
    <div className="bg-slate-950/90 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500 max-h-[85vh] flex flex-col ring-1 ring-emerald-500/10">
      
      {/* CABECERA */}
      <div className="bg-linear-to-b from-emerald-500/10 to-transparent p-6 pb-4 relative border-b border-white/5 shrink-0">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 text-white/20 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-2xl transition-all border border-white/5">
          <X size={18} strokeWidth={3} />
        </button>
        <div className="flex items-center gap-2 mb-2 bg-white w-max px-3 py-1 rounded-full shadow-sm border border-emerald-500/20">
          <img src="/parroquia.png" alt="Parroquia" className="w-5 h-5 object-contain" />
          <span className={`w-1.5 h-1.5 rounded-full ${stats.nivelAlerta ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`} />
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0">Ficha de Inteligencia Parroquial</p>
        </div>
        <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{nombre}</h4>
        
        {/* Fecha y Hora */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 font-mono">
            📅 {new Date().toLocaleDateString('es-VE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="text-[9px] bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-slate-300 font-mono">
            🕐 {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">

        {/* DATOS GEOGRÁFICOS */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Map size={12} className="text-emerald-400" />
            <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Datos Geográficos</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-0.5">Municipio</span>
              <span className="text-[10px] text-white font-bold uppercase">{municipio}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-0.5">Estado</span>
              <span className="text-[10px] text-white font-bold uppercase">{estado}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-0.5">Código</span>
              <span className="text-[10px] text-white font-mono">{codigo || "—"}</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-0.5">Área</span>
              <span className="text-[10px] text-white font-bold">{area}</span>
            </div>
            {centroLat && centroLon && (
              <div className="col-span-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
                <span className="text-[7px] text-slate-500 font-bold uppercase block mb-0.5">Centroide</span>
                <span className="text-[10px] text-white font-mono">{centroLat}, {centroLon}</span>
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN: INCIDENCIAS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-rose-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-rose-500" />
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">Incidentes Registrados</p>
            </div>
            <span className="text-xl font-black text-white leading-none">{stats.incidencias.length}</span>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
            {stats.incidencias.slice(0, 8).map((inc: any, idx: number) => (
              <div key={idx} className="bg-white/5 border-l-2 border-rose-500 p-2.5 rounded-r-xl hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] font-black text-rose-400 uppercase tracking-tight">{inc.tipo_incidente}</p>
                  <span className="text-[8px] text-slate-500 font-mono">{new Date(inc.fecha_registro).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed italic line-clamp-2">"{inc.descripcion}"</p>
                {inc.sector && (
                  <span className="text-[8px] text-slate-500 font-mono mt-1 block">Sector: {inc.sector}</span>
                )}
              </div>
            ))}
            {stats.incidencias.length > 8 && (
              <p className="text-[9px] text-center text-slate-500 italic">+ {stats.incidencias.length - 8} incidentes adicionales</p>
            )}
            {stats.incidencias.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">Sin incidencias registradas en esta parroquia.</p>
            )}
          </div>
        </section>

        {/* SECCIÓN: PUNTOS DE INTERÉS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-500" />
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none">Puntos de Interés / Tráfico</p>
            </div>
            <span className="text-xl font-black text-white leading-none">{stats.puntos.length}</span>
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

        {/* SECCIÓN: PERSONAS DE INTERÉS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-sky-500" />
              <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest leading-none">Sujetos Vinculados</p>
            </div>
            <span className="text-xl font-black text-white leading-none">{stats.personas.length}</span>
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

        {/* SECCIÓN: BANDAS */}
        <section className="space-y-3">
          <div className="flex justify-between items-end border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Crosshair size={14} className="text-cyan-500" />
              <p className="text-[9px] font-black text-cyan-500 uppercase tracking-widest leading-none">Grupos Delictivos</p>
            </div>
            <span className="text-xl font-black text-white leading-none">{stats.bandas.length}</span>
          </div>
          
          <div className="space-y-3">
            {stats.bandas.map((banda: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px]">🛡️</span>
                  <h6 className="text-cyan-400 font-black text-[10px] uppercase tracking-wider">
                    {banda.nombre_organizacion || banda.nombre_banda}
                  </h6>
                </div>
                <span className="text-[7px] font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full uppercase">
                  Amenaza: {banda.amenaza || 'Media'}
                </span>
              </div>
            ))}
            {stats.bandas.length === 0 && (
              <p className="text-[9px] text-slate-600 italic text-center py-2">No se detecta presencia de bandas organizadas.</p>
            )}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div className="bg-emerald-900/20 p-3 text-center border-t border-emerald-500/10 shrink-0">
        <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.6em]">
          INTELIGENCIA PARROQUIAL • SOGNE
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.3); }
      `}</style>
    </div>
  );
};