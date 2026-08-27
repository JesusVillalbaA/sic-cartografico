"use client";
import React, { useState } from 'react';
import { X, Anchor, MapPin, User, Phone, IdCard, Compass, ShieldCheck, Check, Copy } from 'lucide-react';

export const ConppaCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const [copied, setCopied] = useState(false);

  const nro = p.nro || "";
  const nombreSitio = p.nombre || p.nombre_sitio || "Puerto Pesquero";
  const nombreConppa = p.nombre_conppa || p.nombre || "CONPPA";
  const vocero = p.vocero || "No asignado";
  const cedula = p.cedula || "No registrada";
  const telefono = p.telefono || "";
  const comunidad = p.comunidad || "";
  const parroquia = p.parroquia || "";
  const municipio = p.municipio || "";
  const estado = p.estado || "NUEVA ESPARTA";
  const dms = p.coordenadas_dms || "";
  const lat = p.latitud !== undefined ? Number(p.latitud).toFixed(6) : "";
  const lng = p.longitud !== undefined ? Number(p.longitud).toFixed(6) : "";

  // Formatear enlace directo a WhatsApp (código +58 Venezuela)
  const getWhatsAppUrl = (phoneStr: string, voceroName: string, conppaName: string) => {
    if (!phoneStr) return '';
    let digits = phoneStr.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('0')) {
      digits = '58' + digits.substring(1);
    } else if (digits.length === 10 && (digits.startsWith('412') || digits.startsWith('414') || digits.startsWith('424') || digits.startsWith('416') || digits.startsWith('426'))) {
      digits = '58' + digits;
    } else if (!digits.startsWith('58') && digits.length >= 10) {
      digits = '58' + digits;
    }
    const text = encodeURIComponent(`Hola ${voceroName ? voceroName : ''}, te contacto referente al CONPPA ${conppaName ? conppaName : ''} (SOGNE REDIMAIN).`);
    return `https://wa.me/${digits}?text=${text}`;
  };

  const wsUrl = getWhatsAppUrl(telefono, vocero, nombreConppa);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!telefono) return;
    navigator.clipboard.writeText(telefono);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-2xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-in slide-in-from-right-5 duration-300">
      {/* Barra de acento lateral y glow */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-teal-400 to-sky-600" />
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="p-3.5 sm:p-4 pl-4 sm:pl-5">
        {/* Header Táctico Compacto */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 bg-cyan-500/15 px-2.5 py-1 rounded-full border border-cyan-400/30">
            <Anchor size={12} className="text-cyan-400 animate-pulse shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-cyan-300 truncate">
              CONPPA #{nro} • MINPESCA / INSOPESCA
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all cursor-pointer"
            title="Cerrar"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nombres del Sitio y del CONPPA */}
        <div className="mb-2.5">
          <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold block leading-tight">
            SITIO / PUNTO DE DESEMBARQUE
          </span>
          <h4 className="text-base sm:text-lg font-black text-white uppercase italic leading-tight drop-shadow-md truncate">
            {nombreSitio}
          </h4>
          {nombreConppa && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[8px] text-slate-400 font-mono">CONPPA:</span>
              <span className="text-[9.5px] font-black text-cyan-200 uppercase bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 truncate">
                {nombreConppa}
              </span>
            </div>
          )}
        </div>

        {/* Bloque 1: Ubicación Territorial Compacta */}
        <div className="space-y-2">
          <div className="bg-slate-900/80 border border-white/5 p-2.5 rounded-xl text-[9px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin size={11} className="text-teal-400 shrink-0" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-300">
                Ubicación Territorial
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>
                <span className="text-[7px] font-mono text-slate-400 block leading-tight">Municipio:</span>
                <span className="font-bold text-white uppercase truncate block">{municipio || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[7px] font-mono text-slate-400 block leading-tight">Parroquia:</span>
                <span className="font-bold text-white uppercase truncate block">{parroquia || 'N/A'}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-white/5 flex items-center justify-between">
                <span className="text-[7px] font-mono text-slate-400">Comunidad:</span>
                <span className="font-bold text-cyan-300 uppercase truncate">{comunidad || nombreSitio}</span>
              </div>
            </div>
          </div>

          {/* Bloque 2: Vocero + Integración Directa WhatsApp en Una Sola Fila */}
          <div className="bg-slate-900/80 border border-cyan-500/20 p-2.5 rounded-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <User size={11} className="text-cyan-400 shrink-0" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-300">
                  Vocero(a)
                </span>
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-300">C.I: {cedula}</span>
            </div>

            <div className="mb-2">
              <span className="text-[11px] font-black text-white uppercase tracking-wide truncate block">
                {vocero}
              </span>
            </div>

            {/* Fila Unificada: Teléfono + Botón WhatsApp + Copia */}
            {telefono ? (
              <div className="flex items-center justify-between gap-1.5 bg-black/50 p-1.5 rounded-lg border border-white/5">
                <div className="flex items-center gap-1.5 pl-1 min-w-0">
                  <Phone size={11} className="text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold text-slate-200 text-[10px] truncate">{telefono}</span>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {wsUrl && (
                    <a 
                      href={wsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-bold text-[9px] uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                      title="Abrir chat de WhatsApp con el vocero"
                    >
                      <svg className="w-3 h-3 fill-current text-white shrink-0" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    onClick={handleCopyPhone}
                    className="p-1 text-slate-400 hover:text-white rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copiar teléfono"
                  >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[8px] text-slate-500 italic">Sin teléfono registrado</div>
            )}
          </div>

          {/* Bloque 3: Coordenadas */}
          <div className="bg-black/40 border border-white/5 p-2 rounded-xl flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1.5">
              <Compass size={12} className="text-sky-400 shrink-0" />
              <div>
                <span className="text-[7px] font-mono text-slate-400 block leading-none">Coordenadas:</span>
                <span className="font-mono text-sky-200 text-[8.5px] font-semibold">{dms || `${lat}, ${lng}`}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              <ShieldCheck size={10} className="text-emerald-400" />
              <span className="text-[7.5px] font-black text-emerald-300 uppercase">Verificado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
