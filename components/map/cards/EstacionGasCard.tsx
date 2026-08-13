"use client";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Flame, MapPin, Building2, Factory, Info, CheckCircle2, XCircle, 
  Phone, UserCheck, Compass, ShieldCheck, Copy, Check, Camera, 
  ChevronLeft, ChevronRight, Maximize2, Eye 
} from 'lucide-react';

export const EstacionGasCard = ({ f, onRemove }: any) => {
  const p = f?.properties || {};
  const coords = f?.geometry?.coordinates;
  const estatus = (p.estatus || 'Desconocido').toLowerCase();
  const isOperativa = estatus === 'operativa' || estatus === 'operativo';
  const [copied, setCopied] = useState(false);

  // Estado para la galería / lightbox
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const [galleryIdx, setGalleryIdx] = useState<number>(0);

  const coordsDisplay = p.coordenadas_dms || (coords ? `${coords[1]?.toFixed(5)}° N, ${coords[0]?.toFixed(5)}° W` : null);

  const handleCopyCoords = () => {
    if (coordsDisplay) {
      navigator.clipboard?.writeText(coordsDisplay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Extracción de fotografías
  let fotos: string[] = [];
  if (Array.isArray(p.fotos)) {
    fotos = p.fotos.filter(Boolean);
  } else if (Array.isArray(p.imagenes)) {
    fotos = p.imagenes.filter(Boolean);
  } else if (Array.isArray(p.incidencia_fotos)) {
    fotos = p.incidencia_fotos.map((item: any) => typeof item === 'object' ? item.url_foto : item).filter(Boolean);
  } else {
    try {
      if (p.fotos) {
        fotos = typeof p.fotos === 'string' ? JSON.parse(p.fotos) : p.fotos;
      } else if (p.imagenes) {
        fotos = typeof p.imagenes === 'string' ? JSON.parse(p.imagenes) : p.imagenes;
      }
    } catch(e) {}
  }

  if (fotos.length === 0 && p.foto && p.foto !== 'N/A') fotos = [p.foto];
  if (fotos.length === 0 && p.imagen && p.imagen !== 'N/A') fotos = [p.imagen];
  if (fotos.length === 0 && p.foto_evidencia_url && p.foto_evidencia_url !== 'N/A') fotos = [p.foto_evidencia_url];

  // Fallback garantizado para Estaciones de Gas
  if (fotos.length === 0 && (p.id === 'emr_bm22' || String(p.nombre || p.instalacion || '').toUpperCase().includes('BM-22'))) {
    fotos = ['/gas/bm22_1.png', '/gas/bm22_2.png'];
  } else if (fotos.length === 0 && (p.id === 'emr_bm30' || String(p.nombre || p.instalacion || '').toUpperCase().includes('BM-30'))) {
    fotos = ['/gas/bm30_1.png', '/gas/bm30_2.png'];
  } else if (fotos.length === 0 && (p.id === 'emr_bm50' || String(p.nombre || p.instalacion || '').toUpperCase().includes('BM-50'))) {
    fotos = ['/gas/bm50_1.png', '/gas/bm50_2.png'];
  }

  const openLightbox = (index: number = 0) => {
    if (fotos.length > 0) {
      setGalleryImages(fotos);
      setGalleryIdx(index);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (galleryImages && galleryImages.length > 0) {
      setGalleryIdx((prev) => (prev + 1) % galleryImages.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (galleryImages && galleryImages.length > 0) {
      setGalleryIdx((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    }
  };

  return (
    <div className="relative w-full overflow-hidden backdrop-blur-xl bg-[#0d0903]/95 border border-orange-500/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-5 text-slate-100">
      {/* Glow Effects */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 via-amber-500 to-orange-600" />
      <div className="absolute top-0 right-0 w-44 h-44 blur-[100px] opacity-25 bg-orange-500 pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-32 h-32 blur-[80px] opacity-15 bg-amber-600 pointer-events-none" />

      <div className="p-5 pl-7">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/15 to-amber-500/10 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-sm">
            <img src="/gas.png" alt="Gas" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-orange-400">
              Instalación Crítica · Gas / Hidrocarburos
            </span>
          </div>
          <button 
            onClick={() => onRemove(f)} 
            className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all cursor-pointer"
            title="Cerrar Ficha"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nombre & Estatus */}
        <div className="mb-4">
          <h4 className="text-lg font-black text-white uppercase italic leading-tight mb-2 tracking-tight">
            {p.nombre || p.instalacion || 'Instalación de Gas'}
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            {/* Estatus badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border shadow-sm ${
              isOperativa 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}>
              {isOperativa ? (
                <CheckCircle2 size={12} className="text-emerald-400 animate-pulse" />
              ) : (
                <XCircle size={12} className="text-red-400" />
              )}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {p.estatus || 'Operativa'}
              </span>
            </div>

            {/* Organismo de Protección */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[9px] font-bold text-orange-300">
              <ShieldCheck size={11} className="text-orange-400" />
              <span>CEO · REDIMAIN</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            EVIDENCIA FOTOGRÁFICA / GALERÍA VISUAL
            ========================================================================= */}
        {fotos.length > 0 && (
          <div className="mb-4 bg-gradient-to-br from-orange-950/40 via-black/40 to-amber-950/20 border border-orange-500/30 p-3 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Camera size={13} className="text-orange-400" />
                <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">
                  Evidencia Fotográfica en Terreno
                </span>
              </div>
              <button
                onClick={() => openLightbox(0)}
                className="inline-flex items-center gap-1 text-[9px] font-black text-orange-300 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 px-2 py-0.5 rounded-lg transition-all cursor-pointer"
              >
                <Eye size={10} />
                <span>Ver ({fotos.length})</span>
              </button>
            </div>

            {/* Grid de Miniaturas */}
            <div className={`grid gap-2 ${fotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {fotos.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(idx)}
                  className="group relative h-28 sm:h-32 rounded-xl overflow-hidden border border-orange-500/25 hover:border-orange-400 bg-black/60 cursor-pointer transition-all duration-300 shadow-md hover:shadow-orange-500/20"
                >
                  <img
                    src={url}
                    alt={`Foto ${idx + 1} - ${p.nombre || 'Estación de Gas'}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Overlay gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Badge número de foto */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/20 text-[8px] font-mono font-bold text-white">
                    Foto #{idx + 1}
                  </div>

                  {/* Icono de ampliar en hover */}
                  <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-orange-500/80 text-white opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all shadow-lg">
                    <Maximize2 size={12} />
                  </div>

                  {/* Leyenda sutil */}
                  <div className="absolute bottom-1.5 left-2 text-[8px] font-bold text-orange-200 uppercase tracking-tighter truncate max-w-[80%] drop-shadow-md">
                    {idx === 0 ? 'Vista General' : 'Acceso / Válvulas'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tipo de Instalación */}
        {p.tipo && (
          <div className="bg-orange-950/30 border border-orange-500/20 p-3 rounded-2xl mb-3 shadow-inner">
            <div className="flex items-center gap-1.5 mb-1">
              <Factory size={12} className="text-orange-400" />
              <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">Tipo de Instalación</span>
            </div>
            <span className="text-[11px] text-slate-100 font-bold leading-tight block">{p.tipo}</span>
          </div>
        )}

        {/* Responsable & Contacto Directo */}
        {(p.responsable || p.telefono) && (
          <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl mb-3 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <UserCheck size={13} className="text-orange-400" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Responsable Operativo</span>
              </div>
              {p.telefono && (
                <a 
                  href={`tel:${p.telefono.replace(/[^0-9+]/g, '')}`} 
                  className="flex items-center gap-1 text-[10px] font-black text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 rounded-lg transition-all"
                >
                  <Phone size={10} />
                  <span>{p.telefono}</span>
                </a>
              )}
            </div>
            <p className="text-[12px] font-black text-white tracking-wide">
              {p.responsable || 'NO REGISTRADO'}
            </p>
          </div>
        )}

        {/* Grid de Datos: Empresa, Municipio & Parroquia */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1">Empresa / Operador</span>
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-orange-400 shrink-0" />
              <span className="text-[10px] text-slate-100 font-bold truncate">{p.empresa || 'PDVSA Gas'}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1">Municipio / Parroquia</span>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-orange-400 shrink-0" />
              <span className="text-[10px] text-slate-100 font-bold truncate">
                {p.municipio || 'N/A'}{p.parroquia ? ` (${p.parroquia})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Ubicación / Sector Detallado */}
        {(p.ubicacion || p.sector) && (
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl mb-3">
            <span className="text-[7px] text-slate-400 font-bold uppercase block mb-1 tracking-wider">
              Ubicación Geográfica & Referencia
            </span>
            <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
              {p.ubicacion || p.sector}
            </p>
          </div>
        )}

        {/* Coordenadas DMS / DD */}
        {coordsDisplay && (
          <div className="bg-orange-950/20 border border-orange-500/20 p-2.5 rounded-2xl mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Compass size={13} className="text-orange-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7px] text-orange-400 font-black uppercase tracking-widest block">Coordenadas Tácticas</span>
                <span className="text-[10px] font-mono text-slate-200 font-bold truncate block">{coordsDisplay}</span>
              </div>
            </div>
            <button
              onClick={handleCopyCoords}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-orange-500/30 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer"
              title="Copiar Coordenadas"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        )}

        {/* Descripción Técnica */}
        {p.descripcion && (
          <div className="bg-white/2 border-l-2 border-orange-500/60 pl-3 py-2 rounded-r-xl mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Info size={10} className="text-orange-400" />
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Descripción Táctica</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">{p.descripcion}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2.5 flex justify-between items-center border-t border-white/10 opacity-40">
          <span className="text-[7px] font-mono text-white tracking-widest uppercase italic">CEO · REDIMAIN · GAS-NE</span>
          <span className="text-[7px] font-mono text-white">{String(p.id || p.nombre || '').slice(0, 16)}</span>
        </div>
      </div>

      {/* =========================================================================
          LIGHTBOX / MODAL VISOR DE FOTOGRAFÍAS EN ALTA RESOLUCIÓN
          ========================================================================= */}
      {galleryImages && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 p-3 sm:p-6 md:p-10 backdrop-blur-xl animate-in fade-in duration-200 select-none"
          onClick={() => setGalleryImages(null)}
        >
          {/* Header del Lightbox */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between mb-3 px-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-wide uppercase text-sm sm:text-base leading-tight">
                  {p.nombre || p.instalacion || 'Instalación de Gas'}
                </h3>
                <p className="text-[11px] text-orange-400/90 font-mono">
                  {p.ubicacion || `${p.municipio || ''} · ${p.sector || ''}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs px-3 py-1 rounded-full font-bold font-mono">
                {galleryIdx + 1} / {galleryImages.length}
              </span>
              <button 
                className="text-white/60 hover:text-white bg-white/10 hover:bg-rose-600/90 p-2.5 rounded-full transition-all cursor-pointer shadow-lg"
                onClick={(e) => { e.stopPropagation(); setGalleryImages(null); }}
                title="Cerrar visor"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Área Principal de la Imagen */}
          <div 
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center min-h-0 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Anterior */}
            {galleryImages.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-orange-500 text-white border border-white/20 hover:border-orange-400 transition-all backdrop-blur-md cursor-pointer hover:scale-110 shadow-2xl"
                title="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Contenedor de la Imagen */}
            <div className="relative max-w-full max-h-full flex items-center justify-center rounded-3xl overflow-hidden border border-orange-500/30 bg-black/80 shadow-2xl shadow-orange-950/50 p-2">
              <img 
                src={galleryImages[galleryIdx]} 
                className="w-auto h-auto max-h-[70vh] sm:max-h-[75vh] max-w-full object-contain rounded-2xl transition-all duration-300"
                alt={`Evidencia ${galleryIdx + 1}`}
              />
            </div>

            {/* Botón Siguiente */}
            {galleryImages.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-orange-500 text-white border border-white/20 hover:border-orange-400 transition-all backdrop-blur-md cursor-pointer hover:scale-110 shadow-2xl"
                title="Foto siguiente"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Tira de Miniaturas Inferior */}
          {galleryImages.length > 1 && (
            <div 
              className="mt-3 flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    galleryIdx === i 
                      ? 'border-orange-400 scale-105 shadow-lg shadow-orange-500/30' 
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
