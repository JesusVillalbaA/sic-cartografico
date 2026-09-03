"use client";
import React, { useState } from 'react';
import { X, MapPin, User, Phone, Compass, ShieldCheck, Check, Copy, ExternalLink, Building2, FileText, FileSpreadsheet } from 'lucide-react';
import { exportLayerToPDF, exportLayerToExcel } from '@/app/lib/exportLayerPDF';

export const ConppaCard = ({ f, onRemove }: any) => {
  const p = f.properties || {};
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

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
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyCoords = (e: React.MouseEvent) => {
    e.stopPropagation();
    const coordStr = lat && lng ? `${lat}, ${lng}` : dms;
    if (!coordStr) return;
    navigator.clipboard.writeText(coordStr);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const gmapsUrl = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-2xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.25)] animate-in slide-in-from-right-5 duration-300">
      {/* Barra de acento lateral y resplandor neón */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 via-teal-400 to-sky-600" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 pl-5 sm:pl-6 space-y-3.5">
        {/* Header Táctico con Fondo Blanco en el Icono */}
        <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-cyan-500/30 shadow-md">
            <img src="/conppa.png" className="w-5 h-5 object-contain" alt="CONPPA" />
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-800">
              CONPPA #{nro || 'S/N'} • MINPESCA / INSOPESCA
            </span>
          </div>

          <button 
            onClick={() => onRemove(f)} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all cursor-pointer shrink-0"
            title="Cerrar Panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Banner de Sitio & CONPPA */}
        <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 p-3 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[7.5px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold block">
              PUERTO PESQUERO Y ACUÍCOLA
            </span>
            <span className="text-[7.5px] font-mono text-cyan-300/70 font-semibold uppercase">
              PESCA Y ACUICULTURA
            </span>
          </div>
          
          <h4 className="text-base sm:text-xl font-black text-white uppercase italic leading-tight drop-shadow-md truncate">
            {nombreSitio}
          </h4>

          {nombreConppa && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[8px] text-slate-400 font-mono uppercase font-bold shrink-0">ORGANIZACIÓN:</span>
              <span className="text-[10px] font-black text-cyan-200 uppercase bg-cyan-950/90 px-2 py-0.5 rounded-lg border border-cyan-400/40 shadow-sm truncate">
                {nombreConppa}
              </span>
            </div>
          )}
        </div>

        {/* Tarjeta de Ubicación Territorial */}
        <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-teal-400 shrink-0" />
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-200">
                Ubicación Territorial
              </span>
            </div>
            <span className="text-[7.5px] font-mono font-bold text-teal-300 uppercase bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-500/30">
              {estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase">Municipio</span>
              <span className="font-bold text-white uppercase truncate block mt-0.5">{municipio || 'N/A'}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
              <span className="text-[7.5px] font-mono text-slate-400 block uppercase">Parroquia</span>
              <span className="font-bold text-white uppercase truncate block mt-0.5">{parroquia || 'N/A'}</span>
            </div>
            <div className="col-span-2 bg-slate-950/60 p-2 rounded-xl border border-white/5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[7.5px] font-mono text-slate-400 block uppercase">Comunidad / Sector</span>
                <span className="font-bold text-cyan-300 uppercase truncate block mt-0.5">{comunidad || nombreSitio}</span>
              </div>
              <Building2 size={14} className="text-cyan-500/50 shrink-0" />
            </div>
          </div>
        </div>

        {/* Tarjeta de Vocero Popular & Contacto Directo WhatsApp */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/25 p-3 rounded-2xl space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1.5">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-cyan-400 shrink-0" />
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-cyan-300">
                Vocero(a) Popular Representante
              </span>
            </div>
            <span className="text-[8px] font-mono font-bold text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              C.I: {cedula}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-600/30 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-200 text-xs shrink-0 shadow-md">
              {vocero ? vocero.charAt(0).toUpperCase() : 'V'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[12px] font-black text-white uppercase tracking-wide truncate block">
                {vocero}
              </span>
              <span className="text-[8px] font-mono text-slate-400 block">
                Responsable del CONPPA
              </span>
            </div>
          </div>

          {/* Fila Unificada: Teléfono + Botón WhatsApp + Copia */}
          {telefono ? (
            <div className="flex items-center justify-between gap-1.5 bg-black/60 p-2 rounded-xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-2 pl-1 min-w-0">
                <Phone size={12} className="text-emerald-400 shrink-0" />
                <span className="font-mono font-bold text-slate-100 text-[11px] truncate">{telefono}</span>
              </div>
              
              <div className="flex items-center gap-1.5 shrink-0">
                {wsUrl && (
                  <a 
                    href={wsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-black text-[9.5px] uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
                    title="Enviar mensaje por WhatsApp al vocero"
                  >
                    <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  onClick={handleCopyPhone}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  title="Copiar número de teléfono"
                >
                  {copiedPhone ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-[8.5px] text-slate-500 italic bg-black/30 p-2 rounded-xl text-center border border-white/5">
              Sin número telefónico registrado
            </div>
          )}
        </div>

        {/* Tarjeta de Coordenadas & Navegación GPS */}
        <div className="bg-slate-900/90 border border-white/10 p-3 rounded-2xl space-y-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Compass size={13} className="text-sky-400 shrink-0" />
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-slate-200">
                Coordenadas Geográficas
              </span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span className="text-[7.5px] font-black text-emerald-300 uppercase">Verificado</span>
            </div>
          </div>

          <div className="bg-black/60 p-2 rounded-xl border border-white/5 flex items-center justify-between gap-2">
            <div>
              <span className="text-[7px] font-mono text-slate-400 uppercase block">DMS / Grados:</span>
              <span className="font-mono text-sky-200 text-[9.5px] font-semibold block">{dms || `${lat}, ${lng}`}</span>
            </div>
            {lat && lng && (
              <span className="text-[8px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                {lat}, {lng}
              </span>
            )}
          </div>

          {/* Botones de Acción de Mapa */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyCoords}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl font-bold text-[9px] uppercase tracking-wider border border-white/10 transition-all cursor-pointer active:scale-95"
            >
              {copiedCoords ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedCoords ? '¡Copiado!' : 'Copiar Coords'}</span>
            </button>

            {gmapsUrl ? (
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 hover:text-white rounded-xl font-bold text-[9px] uppercase tracking-wider border border-cyan-500/30 transition-all cursor-pointer hover:border-cyan-400 active:scale-95"
              >
                <ExternalLink size={12} className="text-cyan-400" />
                <span>Google Maps</span>
              </a>
            ) : (
              <div className="flex items-center justify-center py-1.5 px-2 bg-slate-900 text-slate-600 rounded-xl font-bold text-[9px] uppercase border border-white/5">
                N/A
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => exportLayerToPDF({ layerKey: 'conppas' })}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-linear-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-cyan-400/30"
            >
              <FileText size={12} />
              <span>Reporte PDF</span>
            </button>
            <button
              onClick={() => exportLayerToExcel({ layerKey: 'conppas' })}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 border border-emerald-400/30"
            >
              <FileSpreadsheet size={12} />
              <span>Reporte Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

