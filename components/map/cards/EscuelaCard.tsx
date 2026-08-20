"use client";
import React from 'react';
import { X, GraduationCap, MapPin, Building, Users, BookOpen, ExternalLink } from 'lucide-react';

export const EscuelaCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const nombre = p.nombre || p.name || p.NAME || "Escuela";
  const estado = p.estado || p.estado_nombre || "Nueva Esparta";
  const municipio = p.municipio || p.municipality || "";
  const parroquia = p.parroquia || p.parish || "";
  const direccion = p.direccion || p.address || "";
  const nivel = p.nivel || p.tipo || "";
  const dependencia = p.dependencia || "";
  const matricula = p.matricula || p.estudiantes || "";
  const circuito = p.circuito || p.circuito_educativo || "";
  const mapsUrl = p.maps_url || p.url || "";

  const coordinates = f.geometry?.coordinates || [];

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0a050f]/95 border border-fuchsia-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500" />
      <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-25 bg-fuchsia-500" />

      <div className="p-5 pl-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-fuchsia-500/20">
            <img src="/infraestructura.png" alt="Escuela" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-600">
              Escuela · Institución Educativa
            </span>
          </div>
          <button onClick={() => onRemove(f)} className="text-white/20 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nombre */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-1">
            {nombre}
          </h4>
          {direccion && (
            <div className="flex items-start gap-1.5 text-slate-400">
              <MapPin size={11} className="text-fuchsia-400 shrink-0 mt-0.5" />
              <span className="text-[9px] font-mono leading-tight">{direccion}</span>
            </div>
          )}
          {!direccion && Array.isArray(coordinates) && coordinates.length >= 2 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={11} className="text-fuchsia-400" />
              <span className="text-[9px] font-mono">
                {Number(coordinates[1]).toFixed(5)}, {Number(coordinates[0]).toFixed(5)}
              </span>
            </div>
          )}
        </div>

        {/* Circuito Educativo */}
        {circuito && (
          <div className="bg-fuchsia-950/40 border border-fuchsia-500/20 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
              <BookOpen size={16} className="text-fuchsia-400" />
            </div>
            <div className="min-w-0">
              <span className="text-[7px] text-fuchsia-400/80 font-black uppercase tracking-widest block">Circuito Educativo</span>
              <span className="text-[11px] text-white font-black uppercase italic leading-tight truncate block">{circuito}</span>
            </div>
          </div>
        )}

        {/* Detalles */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {estado && (
            <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Estado</span>
              <div className="flex items-center gap-1.5">
                <Building size={11} className="text-fuchsia-400" />
                <span className="text-[10px] text-slate-200 font-bold truncate">{estado}</span>
              </div>
            </div>
          )}
          {municipio && (
            <div className="bg-white/3 border border-white/5 p-2.5 rounded-2xl">
              <span className="text-[7px] text-slate-500 font-bold uppercase block mb-1">Municipio</span>
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-fuchsia-400" />
                <span className="text-[10px] text-slate-200 font-bold truncate">{municipio}</span>
              </div>
            </div>
          )}
        </div>

        {(parroquia || nivel || dependencia || matricula) && (
          <div className="bg-white/2 border border-white/5 rounded-2xl p-3 mb-4 space-y-1.5">
            <span className="text-[7px] text-fuchsia-400 font-black uppercase tracking-widest block">Información Adicional</span>
            {parroquia && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Parroquia:</span>
                <span className="text-slate-200 font-bold">{parroquia}</span>
              </div>
            )}
            {nivel && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Nivel:</span>
                <span className="text-slate-200 font-bold">{nivel}</span>
              </div>
            )}
            {dependencia && (
              <div className="flex justify-between text-[10px] border-b border-white/5 pb-1">
                <span className="text-slate-500 uppercase">Dependencia:</span>
                <span className="text-slate-200 font-bold">{dependencia}</span>
              </div>
            )}
            {matricula && (
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 uppercase">Matrícula:</span>
                <div className="flex items-center gap-1">
                  <Users size={10} className="text-fuchsia-400" />
                  <span className="text-slate-200 font-bold">{matricula}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enlace Google Maps */}
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full bg-fuchsia-600/90 hover:bg-fuchsia-500 text-white px-4 py-2.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] mb-3 group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink size={13} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-wider">Ver en Google Maps</span>
            </div>
            <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded-md font-mono">GPS</span>
          </a>
        )}

        <div className="mt-3 pt-2 flex justify-between items-center border-t border-white/5 opacity-30">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">SOGNE-ESCUELA-NE</span>
          <span className="text-[7px] font-mono text-white">{(p.id || nombre).toString().slice(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};
