"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Search, Check, Layers, SlidersHorizontal, School, 
  MapPin, EyeOff, RotateCcw, CheckCheck, Sparkles 
} from 'lucide-react';

export interface MunicipioEscuelaInfo {
  id: string;
  nombre: string;
  cabecera: string;
  escuelas: number;
  center: [number, number];
  bbox: [number, number, number, number];
  isIsland?: boolean;
}

export const MUNICIPIOS_ESCUELAS: MunicipioEscuelaInfo[] = [
  { id: 'MP. ARISMENDI', nombre: 'Arismendi', cabecera: 'La Asunción', escuelas: 42, center: [-63.856965, 11.032194], bbox: [-63.88047, 10.96175, -63.821, 11.0495] },
  { id: 'MP. MARIÑO', nombre: 'Mariño', cabecera: 'Porlamar', escuelas: 41, center: [-63.854415, 10.959658], bbox: [-63.88893, 10.94333, -63.83019, 10.97964] },
  { id: 'MP. DIAZ', nombre: 'Díaz', cabecera: 'San Juan Bautista', escuelas: 31, center: [-63.983623, 10.981426], bbox: [-64.02938, 10.89844, -63.93193, 11.03225] },
  { id: 'MP. GARCIA', nombre: 'García', cabecera: 'El Valle', escuelas: 25, center: [-63.917378, 10.955469], bbox: [-63.94983, 10.89438, -63.86273, 10.98936] },
  { id: 'MP. TUBORES', nombre: 'Tubores', cabecera: 'Punta de Piedras', escuelas: 23, center: [-64.078807, 10.925366], bbox: [-64.15217, 10.87745, -64.02779, 11.00451] },
  { id: 'MP. GOMEZ', nombre: 'Gómez', cabecera: 'Santa Ana', escuelas: 19, center: [-63.932245, 11.083338], bbox: [-63.95865, 11.04734, -63.90248, 11.13616] },
  { id: 'MP. MARCANO', nombre: 'Marcano', cabecera: 'Juan Griego', escuelas: 19, center: [-63.965586, 11.070929], bbox: [-63.97918, 11.05171, -63.95347, 11.08877] },
  { id: 'MP. MANEIRO', nombre: 'Maneiro', cabecera: 'Pampatar', escuelas: 17, center: [-63.816815, 11.000615], bbox: [-63.83854, 10.98331, -63.79263, 11.02503] },
  { id: 'MP.ANTOLIN DEL CAMPO', nombre: 'Antolín del Campo', cabecera: 'Paraguachí', escuelas: 14, center: [-63.860024, 11.105576], bbox: [-63.8846, 11.07277, -63.82998, 11.15356] },
  { id: 'MP.PENIN. DE MACANAO', nombre: 'Península de Macanao', cabecera: 'Boca de Río', escuelas: 14, center: [-64.295923, 10.990526], bbox: [-64.39923, 10.93834, -64.17921, 11.05761] },
  { id: 'MP.VILLALBA(I.COCHE)', nombre: 'Villalba (Isla de Coche)', cabecera: 'San Pedro de Coche', escuelas: 6, center: [-63.96065, 10.766548], bbox: [-63.99545, 10.74062, -63.90043, 10.78548], isIsland: true }
];

export const TOTAL_ESCUELAS_ESTADO = MUNICIPIOS_ESCUELAS.reduce((acc, m) => acc + m.escuelas, 0);

interface ModalFiltroEscuelasProps {
  isOpen: boolean;
  onClose: () => void;
  isLayerActive: boolean;
  currentFilter: string[] | null | undefined;
  onApplyFilter: (municipios: string[] | null) => void;
  onDeactivate: () => void;
  theme?: string;
}

export const ModalFiltroEscuelas: React.FC<ModalFiltroEscuelasProps> = ({
  isOpen,
  onClose,
  isLayerActive,
  currentFilter,
  onApplyFilter,
  onDeactivate,
  theme = 'dark'
}) => {
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Sincronizar selección inicial cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (!currentFilter || currentFilter.length === 0 || currentFilter.includes('TODOS')) {
        setSelectedMunicipios(MUNICIPIOS_ESCUELAS.map(m => m.id));
      } else {
        setSelectedMunicipios(currentFilter);
      }
      setSearchTerm('');
    }
  }, [isOpen, currentFilter]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredMunicipios = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return MUNICIPIOS_ESCUELAS;
    return MUNICIPIOS_ESCUELAS.filter(m => 
      m.nombre.toLowerCase().includes(query) || 
      m.cabecera.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query)
    );
  }, [searchTerm]);

  const totalSelectedEscuelas = useMemo(() => {
    return MUNICIPIOS_ESCUELAS
      .filter(m => selectedMunicipios.includes(m.id))
      .reduce((acc, m) => acc + m.escuelas, 0);
  }, [selectedMunicipios]);

  const areAllSelected = selectedMunicipios.length === MUNICIPIOS_ESCUELAS.length;

  const toggleMunicipio = (id: string) => {
    setSelectedMunicipios(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMunicipios(MUNICIPIOS_ESCUELAS.map(m => m.id));
  };

  const clearAll = () => {
    setSelectedMunicipios([]);
  };

  const handleShowAllAndActivate = () => {
    selectAll();
    onApplyFilter(null);
    onClose();
  };

  const handleApplySelected = () => {
    if (selectedMunicipios.length === 0) {
      onDeactivate();
    } else if (selectedMunicipios.length === MUNICIPIOS_ESCUELAS.length) {
      onApplyFilter(null);
    } else {
      onApplyFilter(selectedMunicipios);
    }
    onClose();
  };

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-[95%] sm:w-[90%] md:w-[85%] max-w-xl max-h-[88dvh] flex flex-col rounded-3xl border shadow-[0_0_60px_rgba(217,70,239,0.25)] overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isLight ? 'bg-slate-50 border-fuchsia-300 text-slate-800' : 'bg-slate-950/95 border-fuchsia-500/40 text-slate-100'
        }`}
      >
        {/* Glow decorativo de fondo */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER RESPONSIVO ── */}
        <div className="relative p-4 sm:p-6 border-b border-white/10 shrink-0">
          <button 
            onClick={onClose}
            className={`absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full transition-colors z-10 ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Cerrar modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 sm:gap-4 pr-8">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,70,239,0.3)]">
              <School className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase text-fuchsia-400">
                  INFRAESTRUCTURA • CIRCUITO EDUCATIVO
                </span>
                {isLayerActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
                    Activa
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase text-white truncate">
                PLANTELES EDUCATIVOS Y ESCUELAS
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                {TOTAL_ESCUELAS_ESTADO} instituciones registradas • 11 Municipios
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENIDO SCROLLABLE CON SCROLLBAR DISCRETO ── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
          
          {/* Tarjeta Hero: Mostrar TODAS */}
          <button
            onClick={handleShowAllAndActivate}
            className={`w-full group p-3 sm:p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
              areAllSelected 
                ? 'bg-gradient-to-r from-fuchsia-500/20 via-purple-500/15 to-transparent border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-500/30' 
                : (isLight ? 'bg-white border-slate-200 hover:border-fuchsia-400' : 'bg-slate-900/60 border-white/10 hover:border-fuchsia-500/40 hover:bg-slate-900/90')
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                areAllSelected ? 'bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.6)]' : 'bg-fuchsia-500/20 text-fuchsia-400'
              }`}>
                {areAllSelected ? <CheckCheck size={20} strokeWidth={2.5} /> : <Layers size={19} />}
              </div>
              <div className="truncate">
                <span className="text-xs sm:text-sm font-black uppercase text-white block tracking-wide truncate">
                  MOSTRAR TODAS LAS ESCUELAS
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-mono truncate">
                  Activar los 251 planteles de toda la entidad insular
                </span>
              </div>
            </div>
            <div className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-fuchsia-500 text-white font-mono text-[10px] sm:text-xs font-bold shadow-md shrink-0">
              {TOTAL_ESCUELAS_ESTADO} Total
            </div>
          </button>

          {/* Separador táctico */}
          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-white/10" />
            <span className="text-[9px] sm:text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
              O seleccionar por municipio
            </span>
            <hr className="flex-1 border-white/10" />
          </div>

          {/* Barra de búsqueda y selectores rápidos */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Buscar municipio (ej: Arismendi, Mariño, Díaz)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-fuchsia-500/60 font-mono transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono px-1">
              <span className="text-slate-400">
                Seleccionados: <strong className="text-fuchsia-400">{selectedMunicipios.length}</strong> de 11 ({totalSelectedEscuelas} escuelas)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors cursor-pointer"
                >
                  Seleccionar Todos
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={clearAll}
                  className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Grid Responsivo de Municipios (1 columna en móvil, 2 columnas equilibradas en tablet/desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredMunicipios.map((m, idx) => {
              const isSelected = selectedMunicipios.includes(m.id);
              // Si es el último elemento en lista impar (Villalba), lo estilizamos para que abarque ambas columnas de forma elegante
              const isLastOdd = filteredMunicipios.length % 2 !== 0 && idx === filteredMunicipios.length - 1;
              
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMunicipio(m.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isLastOdd ? 'sm:col-span-2' : ''
                  } ${
                    isSelected
                      ? 'bg-fuchsia-500/15 border-fuchsia-500/50 shadow-sm'
                      : (isLight ? 'bg-white border-slate-200 hover:bg-slate-50' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900 hover:border-white/10')
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-fuchsia-500 border-fuchsia-400 text-white shadow-[0_0_8px_rgba(217,70,239,0.5)]' 
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div className="truncate">
                      <span className={`text-xs font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {m.nombre}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block truncate">
                        {m.cabecera}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shrink-0 ${
                    isSelected ? 'bg-fuchsia-500/30 text-fuchsia-300' : 'bg-white/5 text-slate-400'
                  }`}>
                    {m.escuelas} planteles
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── FOOTER TOTALMENTE RESPONSIVO (SIN TEXTO SOBRANTE) ── */}
        <div className="p-3.5 sm:p-4 md:p-5 border-t border-white/10 bg-slate-950/90 shrink-0 flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          
          {isLayerActive && (
            <button
              onClick={() => {
                onDeactivate();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Desactivar visualización de escuelas en el mapa"
            >
              <EyeOff size={14} />
              <span>Desactivar Capa</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleApplySelected}
            disabled={selectedMunicipios.length === 0}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              selectedMunicipios.length > 0
                ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <Check size={14} strokeWidth={3} />
            <span>
              {isLayerActive 
                ? `Aplicar Filtro (${totalSelectedEscuelas})` 
                : `Activar en el Mapa (${totalSelectedEscuelas})`}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
