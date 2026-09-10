"use client";

import React, { useState, useMemo } from 'react';
import { 
  Layers, ChevronDown, ChevronUp, Search, 
  Sparkles, Minimize2, Maximize2, X, ShieldAlert,
  Radio, Zap, HeartPulse, Bus, Eye, Anchor, Download, Loader2, Filter, Check
} from 'lucide-react';
import { exportLayerToPDF } from '@/app/lib/exportLayerPDF';

interface LegendProps {
  theme?: string;
  layersVisible?: any;
  onToggle?: (layerKey: string) => void;
}

interface LegendItem {
  id: string;
  label: string;
  iconSrc?: string;
  colorDot?: string;
  glowColor?: string;
  desc?: string;
  toggleKey?: string;
  activeKey?: string | ((lv: any) => boolean);
}

interface LegendCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  items: LegendItem[];
}

export const Legend = ({ theme = 'dark', layersVisible = {}, onToggle }: LegendProps) => {
  const [minimized, setMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyActiveFilter, setOnlyActiveFilter] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [userToggledSections, setUserToggledSections] = useState<Record<string, boolean>>({});
  const listContainerRef = React.useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const handleDownloadLayerPDF = async (itemId: string, label: string) => {
    try {
      setDownloadingId(itemId);
      let layerKey = itemId;
      if (itemId === 'conppas_item') layerKey = 'conppas';
      if (itemId === 'gas') layerKey = 'estaciongas';
      if (itemId === 'electricidad') layerKey = 'electricidad';
      if (itemId.startsWith('agua_')) layerKey = 'agua';
      if (itemId === 'estaciones_combustible') layerKey = 'estaciones_combustible';
      
      await exportLayerToPDF({ layerKey });
    } catch (err: any) {
      console.error('Error al exportar PDF de capa:', err);
      alert(err.message || 'Error al descargar PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleSection = (sectionId: string, currentlyOpen: boolean) => {
    setUserToggledSections(prev => ({ ...prev, [sectionId]: !currentlyOpen }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    categories.forEach(c => { all[c.id] = true; });
    setUserToggledSections(all);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    categories.forEach(c => { all[c.id] = false; });
    setUserToggledSections(all);
  };

  const categories: LegendCategory[] = useMemo(() => [
    {
      id: 'base',
      name: 'Capas Base',
      icon: Layers,
      color: '#38bdf8',
      items: [
        { id: 'municipios', label: 'Municipios', iconSrc: '/Municipios.png', colorDot: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', desc: 'Límites municipales', toggleKey: 'municipios' },
        { id: 'parroquias', label: 'Parroquias', iconSrc: '/parroquia.png', colorDot: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.4)', desc: 'Límites parroquiales', toggleKey: 'parroquias' },
        { id: 'sectores', label: 'Sectores', iconSrc: '/Sectores.png', colorDot: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)', desc: 'Comunidades y sectores', toggleKey: 'sectores' },
        { id: 'cuadrantes', label: 'Cuadrantes de Paz', iconSrc: '/Cuadrantes.png', colorDot: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)', desc: 'Polígonos de patrullaje', toggleKey: 'cuadrantesPoligonos', activeKey: (lv) => !!(lv.cuadrantes || lv.cuadrantesPoligonos || lv.compas) },
      ]
    },
    {
      id: 'riesgo',
      name: 'Zonas de Riesgo e Incidencias',
      icon: ShieldAlert,
      color: '#f43f5e',
      items: [
        { id: 'delitos', label: 'Delitos Comunes', iconSrc: '/delitos.png', colorDot: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', desc: 'Robos, hurtos e incidentes', toggleKey: 'zonasDeRiesgo.delitosComunes' },
        { id: 'cibernetica', label: 'Área Cibernética', iconSrc: '/hacker.png', colorDot: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)', desc: 'Amenazas y delitos digitales', toggleKey: 'zonasDeRiesgo.areaCibernetica' },
        { id: 'concentracion', label: 'Concentraciones Públicas', iconSrc: '/concentracion.png', colorDot: '#eab308', glowColor: 'rgba(234, 179, 8, 0.5)', desc: 'Eventos y aglomeraciones', toggleKey: 'zonasDeRiesgo.concentraciones' },
      ]
    },
    {
      id: 'inteligencia',
      name: 'Geolocalizaciones & Inteligencia',
      icon: Eye,
      color: '#8b5cf6',
      items: [
        { id: 'drogas', label: 'Tráfico de Drogas', iconSrc: '/drogas.png', colorDot: '#84cc16', glowColor: 'rgba(132, 204, 22, 0.5)', desc: 'Incidencias de microtráfico', toggleKey: 'geocalizaciones.drogas' },
        { id: 'actores', label: 'Actores de Interés', iconSrc: '/actor.png', colorDot: '#f43f5e', glowColor: 'rgba(244, 63, 94, 0.5)', desc: 'Sujetos y objetivos clave', toggleKey: 'geocalizaciones.actorInteres' },
        { id: 'bandas', label: 'Grupos Delictivos', iconSrc: '/banda.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Bandas estructuradas y GEDO', toggleKey: 'bandasDelictivas' },
        { id: 'puntos', label: 'Puntos de Interés', iconSrc: '/punto.png', colorDot: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.5)', desc: 'Instalaciones y puntos estratégicos', toggleKey: 'geocalizaciones.puntoInteres' },
      ]
    },
    {
      id: 'servicios',
      name: 'Servicios Básicos & Energía',
      icon: Zap,
      color: '#eab308',
      items: [
        { id: 'electricidad', label: 'Sub-Estaciones Eléctricas', iconSrc: '/electricidad.png', colorDot: '#facc15', glowColor: 'rgba(250, 204, 21, 0.5)', desc: 'Subestaciones y líneas', toggleKey: 'sistemasElectricos' },
        { id: 'gas', label: 'Estaciones de Gas', iconSrc: '/gasolinera.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Plantas y distribución de GLP', toggleKey: 'estacionesGas' },
        { id: 'agua_desalinizadoras', label: 'Plantas Desalinizadoras', iconSrc: '/agua.png', colorDot: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.5)', desc: 'Desalinización de agua de mar', toggleKey: 'servicioAgua.desalinizadoras' },
        { id: 'agua_tratamiento', label: 'Plantas de Tratamiento', iconSrc: '/agua.png', colorDot: '#14b8a6', glowColor: 'rgba(20, 184, 166, 0.5)', desc: 'Potabilización y tratamiento', toggleKey: 'servicioAgua.tratamiento' },
        { id: 'agua_bombeo_servidas', label: 'E/B Aguas Servidas', iconSrc: '/agua.png', colorDot: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)', desc: 'Estaciones de bombeo servidas', toggleKey: 'servicioAgua.bombeoServidas' },
        { id: 'agua_bombeo_potable', label: 'E/B Agua Potable', iconSrc: '/agua.png', colorDot: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.5)', desc: 'Estaciones de bombeo potable', toggleKey: 'servicioAgua.bombeoPotable' },
        { id: 'agua_tanques', label: 'Tanques de Almacenamiento', iconSrc: '/agua.png', colorDot: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)', desc: 'Estanques y depósitos hídricos', toggleKey: 'servicioAgua.tanques' },
        { id: 'agua_diques', label: 'Diques y Tomas', iconSrc: '/agua.png', colorDot: '#10b981', glowColor: 'rgba(16, 185, 129, 0.5)', desc: 'Captación y diques de agua', toggleKey: 'servicioAgua.diques' },
        { id: 'agua_pozos', label: 'Pozos Profundos', iconSrc: '/agua.png', colorDot: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.5)', desc: 'Pozos y pozas profundas', toggleKey: 'servicioAgua.pozos' },
        { id: 'agua_clorado', label: 'Plantas de Clorado', iconSrc: '/agua.png', colorDot: '#eab308', glowColor: 'rgba(234, 179, 8, 0.5)', desc: 'Sistemas de cloración', toggleKey: 'servicioAgua.clorado' },
        { id: 'agua_parales', label: 'Llenaderos (Parales)', iconSrc: '/agua.png', colorDot: '#00bcd4', glowColor: 'rgba(0, 188, 212, 0.6)', desc: 'Llenaderos para cisternas', toggleKey: 'servicioAgua.parales' },
        { id: 'agua_embalses', label: 'Embalses y Represas', iconSrc: '/agua.png', colorDot: '#00838f', glowColor: 'rgba(0, 131, 143, 0.6)', desc: 'Fuentes hídricas principales', toggleKey: 'servicioAgua.embalses' },
      ]
    },
    {
      id: 'telecom',
      name: 'Telecomunicaciones & Antenas',
      icon: Radio,
      color: '#a855f7',
      items: [
        { id: 'digitel', label: 'Red Digitel 4G/LTE', iconSrc: '/digitel.png', colorDot: '#9400d3', glowColor: 'rgba(148, 0, 211, 0.6)', desc: 'Radiobases y celdas', toggleKey: 'antenasDigitel' },
        { id: 'movistar', label: 'Red Movistar 4G', iconSrc: '/movistar.png', colorDot: '#00bfff', glowColor: 'rgba(0, 191, 255, 0.6)', desc: 'Radiobases y celdas', toggleKey: 'antenasMovistar' },
        { id: 'movilnet', label: 'Red Movilnet', iconSrc: '/movilnet.png', colorDot: '#00ff7f', glowColor: 'rgba(0, 255, 127, 0.6)', desc: 'Radiobases y celdas', toggleKey: 'antenasMovilnet' },
      ]
    },
    {
      id: 'salud',
      name: 'Salud & Infraestructura Social',
      icon: HeartPulse,
      color: '#10b981',
      items: [
        { id: 'hospitales', label: 'Hospitales Tipo I-IV', iconSrc: '/hospital.png', colorDot: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', desc: 'Red hospitalaria central', toggleKey: 'hospitales' },
        { id: 'clinicas', label: 'Clínicas y Centros Privados', iconSrc: '/clinica.png', colorDot: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)', desc: 'Atención especializada', toggleKey: 'clinicas' },
        { id: 'ambulatorios', label: 'Ambulatorios y CPT', iconSrc: '/ambulatorio.png', colorDot: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.5)', desc: 'Consultorios populares', toggleKey: 'ambulatorios' },
        { id: 'cdi', label: 'CDI y Salas de Rehabilitación', iconSrc: '/dispensario.png', colorDot: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)', desc: 'Diagnóstico integral', toggleKey: 'cdi' },
        { id: 'estaciones_combustible', label: 'Estaciones de Combustible', iconSrc: '/bombagasolina.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Gasolina y diésel', toggleKey: 'estaciones' },
        { id: 'escuelas', label: 'Escuelas & Circuitos', iconSrc: '/social.png', colorDot: '#d946ef', glowColor: 'rgba(217, 70, 239, 0.5)', desc: 'Instituciones educativas', toggleKey: 'escuelas' },
      ]
    },
    {
      id: 'transporte',
      name: 'Transporte & Movilidad',
      icon: Bus,
      color: '#06b6d4',
      items: [
        { id: 'trans_publico', label: 'Terminales y Paradas', iconSrc: '/transporte_publico.png', colorDot: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.5)', desc: 'Rutas urbanas y suburbanas', toggleKey: 'transporteGeneral' },
      ]
    },
    {
      id: 'pesca',
      name: 'Sector Pesquero & CONPPAS',
      icon: Anchor,
      color: '#0ea5e9',
      items: [
        { id: 'conppas_item', label: 'CONPPAS y Puertos Pesqueros (52)', iconSrc: '/conppa.png', colorDot: '#0284c7', glowColor: 'rgba(2, 132, 199, 0.5)', desc: 'Consejos de pescadores y acuicultores', toggleKey: 'conppas' }
      ]
    }
  ], []);

  const isLayerActive = (item: LegendItem): boolean => {
    if (typeof item.activeKey === 'function') return item.activeKey(layersVisible);
    if (item.toggleKey) {
      if (item.toggleKey.includes('.')) {
        const [parent, child] = item.toggleKey.split('.');
        return !!layersVisible?.[parent]?.[child];
      }
      return !!layersVisible?.[item.toggleKey];
    }
    if (item.activeKey && layersVisible?.[item.activeKey]) return true;
    return false;
  };

  // Calcular número total de capas activas
  const activeLayersCount = useMemo(() => {
    let count = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (isLayerActive(item)) count++;
      });
    });
    return count;
  }, [categories, layersVisible]);

  // Auto-scroll al tope cuando se activa una nueva capa para que el usuario la vea de inmediato
  const prevCountRef = React.useRef(activeLayersCount);
  React.useEffect(() => {
    if (activeLayersCount > prevCountRef.current && listContainerRef.current) {
      listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevCountRef.current = activeLayersCount;
  }, [activeLayersCount]);

  // Filtrar y PRIORIZAR: Las capas y categorías activas suben automáticamente al inicio
  const filteredCategories = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    
    return categories
      .map(cat => {
        const items = cat.items.filter(item => {
          const matchesSearch = !cleanSearch || 
            item.label.toLowerCase().includes(cleanSearch) || 
            (item.desc && item.desc.toLowerCase().includes(cleanSearch));
          const matchesActive = !onlyActiveFilter || isLayerActive(item);
          return matchesSearch && matchesActive;
        });

        // Ordenar ítems: Las capas activas se posicionan primero dentro de la categoría
        const sortedItems = [...items].sort((a, b) => {
          const aActive = isLayerActive(a) ? 1 : 0;
          const bActive = isLayerActive(b) ? 1 : 0;
          return bActive - aActive;
        });

        const activeCount = sortedItems.filter(it => isLayerActive(it)).length;

        return {
          ...cat,
          items: sortedItems,
          activeCount
        };
      })
      .filter(cat => cat.items.length > 0)
      .sort((a, b) => {
        // Las categorías con capas activas van primero (arriba)
        const aHasActive = a.activeCount > 0 ? 1 : 0;
        const bHasActive = b.activeCount > 0 ? 1 : 0;
        if (bHasActive !== aHasActive) {
          return bHasActive - aHasActive;
        }
        // Si ambas tienen capas activas, ordenar por mayor número de capas activas
        if (aHasActive && bHasActive && b.activeCount !== a.activeCount) {
          return b.activeCount - a.activeCount;
        }
        return 0; // mantener orden relativo original
      });
  }, [categories, searchTerm, onlyActiveFilter, layersVisible]);

  const handleToggleItem = (item: LegendItem) => {
    if (onToggle && item.toggleKey) {
      onToggle(item.toggleKey);
    }
  };

  return (
    <div 
      className={`hidden md:block absolute bottom-5 left-5 z-20 transition-all duration-500 ease-out select-none ${
        minimized ? 'w-auto' : 'w-80 max-w-[calc(100vw-2.5rem)]'
      }`}
    >
      {/* Botón Flotante Minimizada */}
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className={`group flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            isLight
              ? 'bg-white/95 text-slate-900 border border-sky-400/50 shadow-[0_4px_25px_rgba(14,165,233,0.25)] hover:border-sky-500'
              : 'bg-slate-950/90 text-white border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:border-cyan-400'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              isLight
                ? 'bg-sky-500/10 border border-sky-500/30 text-sky-600'
                : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
            }`}>
              <Layers size={16} />
            </div>
            {activeLayersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-black text-black">
                  {activeLayersCount}
                </span>
              </span>
            )}
          </div>
          <div className="text-left">
            <span className={`text-[11px] font-black tracking-wider uppercase block ${
              isLight
                ? 'bg-linear-to-r from-sky-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent'
                : 'bg-linear-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent'
            }`}>
              Leyenda Táctica
            </span>
            <span className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {activeLayersCount} {activeLayersCount === 1 ? 'capa activa' : 'capas activas'}
            </span>
          </div>
          <Maximize2 size={13} className={`${isLight ? 'text-slate-400 group-hover:text-sky-600' : 'text-slate-400 group-hover:text-cyan-300'} transition-colors ml-1`} />
        </button>
      ) : (
        /* Contenedor Principal Expandido */
        <div className={`relative rounded-3xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 duration-300 ${
          isLight 
            ? 'bg-white/95 backdrop-blur-2xl border border-sky-300 shadow-[0_10px_35px_rgba(14,165,233,0.18)] ring-1 ring-black/5' 
            : 'bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] ring-1 ring-white/10'
        }`}>
          
          {/* Luz / Glow Ambiental Superior */}
          <div className={`absolute top-0 left-1/4 right-1/4 h-[1px] ${
            isLight 
              ? 'bg-linear-to-r from-transparent via-sky-500 to-transparent opacity-80' 
              : 'bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-70'
          }`} />
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 blur-2xl pointer-events-none ${
            isLight ? 'bg-sky-400/20' : 'bg-cyan-500/20'
          }`} />

          {/* HEADER */}
          <div className={`p-4 pb-3 border-b ${
            isLight 
              ? 'bg-linear-to-b from-sky-50 to-white border-slate-200' 
              : 'bg-linear-to-b from-white/5 to-transparent border-white/10'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-inner ${
                  isLight
                    ? 'bg-sky-500/15 border border-sky-500/40 text-sky-600'
                    : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400'
                }`}>
                  <Layers size={14} className="animate-pulse" />
                </div>
                <div>
                  <h3 className={`text-xs font-black uppercase italic tracking-widest ${
                    isLight
                      ? 'bg-linear-to-r from-slate-900 via-sky-900 to-blue-800 bg-clip-text text-transparent'
                      : 'bg-linear-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent'
                  }`}>
                    Simbología Táctica
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeLayersCount > 0 ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeLayersCount > 0 ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    </span>
                    <span className={`text-[9px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {activeLayersCount} {activeLayersCount === 1 ? 'activa' : 'activas'} en mapa
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Control Superior */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMinimized(true)}
                  title="Minimizar leyenda"
                  className={`p-1.5 rounded-xl transition-all border ${
                    isLight 
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent hover:border-slate-300' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10'
                  }`}
                >
                  <Minimize2 size={13} />
                </button>
              </div>
            </div>

            {/* BUSCADOR INTEGRADO Y FILTROS */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar capas y símbolos..."
                  className={`w-full text-[11px] rounded-xl pl-8 pr-7 py-1.5 border transition-all font-mono ${
                    isLight
                      ? 'bg-slate-100 text-slate-900 placeholder-slate-400 border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30'
                      : 'bg-slate-900/90 text-white placeholder-slate-500 border-white/10 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30'
                  }`}
                />
                <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 ${isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Botones de acción rápida */}
              <div className="flex items-center justify-between gap-1 text-[8px] font-mono uppercase">
                <button
                  onClick={() => setOnlyActiveFilter(prev => !prev)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    onlyActiveFilter
                      ? (isLight ? 'bg-sky-600 text-white border-sky-600 font-bold' : 'bg-cyan-500 text-black border-cyan-400 font-black')
                      : (isLight ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10')
                  }`}
                >
                  <Filter size={10} />
                  <span>Solo Activas</span>
                </button>

                {!searchTerm && (
                  <div className={`flex items-center gap-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <button 
                      onClick={expandAll}
                      className="hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      [Expandir]
                    </button>
                    <button 
                      onClick={collapseAll}
                      className="hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      [Colapsar]
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LISTA DE CATEGORÍAS Y SÍMBOLOS */}
          <div ref={listContainerRef} className="p-3 space-y-2.5 overflow-y-auto max-h-[52vh] custom-legend-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className={`text-center py-6 text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No se encontraron capas para {onlyActiveFilter ? 'activas' : ''} "{searchTerm}"
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const IconComponent = cat.icon;
                const activeInCat = cat.activeCount;
                const isCatOpen = searchTerm || onlyActiveFilter 
                  ? true 
                  : userToggledSections[cat.id] !== undefined 
                    ? userToggledSections[cat.id] 
                    : (activeInCat > 0 || cat.id === 'base');

                return (
                  <div 
                    key={cat.id} 
                    className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                      activeInCat > 0
                        ? (isLight 
                            ? 'bg-sky-50/90 border-sky-400/60 shadow-[0_4px_16px_rgba(14,165,233,0.15)] ring-1 ring-sky-400/30' 
                            : 'bg-cyan-950/25 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30')
                        : (isLight 
                            ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300' 
                            : 'bg-white/5 border-white/5 hover:border-white/10')
                    }`}
                  >
                    {/* Header de Categoría */}
                    <button
                      onClick={() => !searchTerm && !onlyActiveFilter && toggleSection(cat.id, isCatOpen)}
                      className={`w-full flex items-center justify-between p-2.5 text-left transition-colors cursor-pointer ${
                        isCatOpen 
                          ? (isLight ? 'bg-slate-100/80' : 'bg-white/5') 
                          : (isLight ? 'hover:bg-slate-100/50' : 'hover:bg-white/5')
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ 
                            backgroundColor: `${cat.color}15`, 
                            borderColor: `${cat.color}40`,
                            color: cat.color 
                          }}
                        >
                          <IconComponent size={11} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider truncate ${
                          isLight ? 'text-slate-800' : 'text-slate-200'
                        }`}>
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {activeInCat > 0 && (
                          <span 
                            className="px-2 py-0.5 rounded-full text-[8px] font-black font-mono animate-pulse flex items-center gap-1"
                            style={{ 
                              backgroundColor: `${cat.color}25`, 
                              color: cat.color,
                              border: `1px solid ${cat.color}60`
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            {activeInCat} {activeInCat === 1 ? 'ACTIVA' : 'ACTIVAS'}
                          </span>
                        )}
                        {!searchTerm && !onlyActiveFilter && (
                          <span className={`${isLight ? 'text-slate-400' : 'text-slate-500'} transition-transform duration-300`}>
                            {isCatOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Elementos de la Categoría */}
                    {isCatOpen && (
                      <div className={`p-2 pt-1.5 space-y-1 border-t animate-in fade-in slide-in-from-top-1 duration-200 ${
                        isLight ? 'border-slate-200 bg-white/60' : 'border-white/5 bg-slate-950/40'
                      }`}>
                        {cat.items.map((item) => {
                          const active = isLayerActive(item);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleItem(item)}
                              title={onToggle && item.toggleKey ? `Haz clic para ${active ? 'desactivar' : 'activar'} ${item.label}` : item.label}
                              className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                                active 
                                  ? (isLight 
                                      ? 'bg-sky-50 border border-sky-400/60 shadow-[0_0_12px_rgba(14,165,233,0.15)]' 
                                      : 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]')
                                  : (isLight 
                                      ? 'hover:bg-slate-100 border border-transparent' 
                                      : 'hover:bg-white/5 border border-transparent')
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Contenedor del Ícono / Dot */}
                                <div 
                                  className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-md transition-transform duration-200 group-hover:scale-110"
                                  style={{
                                    boxShadow: item.glowColor ? `0 0 10px ${item.glowColor}` : 'none'
                                  }}
                                >
                                  {item.iconSrc ? (
                                    <img 
                                      src={item.iconSrc} 
                                      alt="" 
                                      className="w-3.5 h-3.5 object-contain" 
                                    />
                                  ) : (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-white"
                                      style={{ backgroundColor: item.colorDot || '#38bdf8' }}
                                    />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <span className={`text-[10px] font-bold tracking-tight block leading-tight truncate ${
                                    active 
                                      ? (isLight ? 'text-sky-700 font-extrabold' : 'text-cyan-300 font-black') 
                                      : (isLight ? 'text-slate-700 group-hover:text-slate-900' : 'text-slate-200 group-hover:text-white')
                                  }`}>
                                    {item.label}
                                  </span>
                                  {item.desc && (
                                    <span className={`text-[8px] font-mono block leading-none mt-0.5 truncate ${
                                      isLight ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                      {item.desc}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Acciones e Indicador de Estado */}
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadLayerPDF(item.id, item.label);
                                  }}
                                  disabled={downloadingId === item.id}
                                  title={`Descargar PDF de ${item.label}`}
                                  className={`p-1 rounded-md transition-all cursor-pointer opacity-70 group-hover:opacity-100 disabled:opacity-50 ${
                                    isLight 
                                      ? 'text-slate-400 hover:text-sky-600 hover:bg-sky-100' 
                                      : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20'
                                  }`}
                                >
                                  {downloadingId === item.id ? (
                                    <Loader2 size={12} className={`animate-spin ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
                                  ) : (
                                    <Download size={12} />
                                  )}
                                </button>
                                {active ? (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                  </span>
                                ) : (
                                  <span className={`w-1.5 h-1.5 rounded-full block transition-colors ${
                                    isLight ? 'bg-slate-300 group-hover:bg-slate-400' : 'bg-white/10 group-hover:bg-white/20'
                                  }`} />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER TÁCTICO */}
          <div className={`p-2.5 px-4 border-t flex items-center justify-between text-[8px] font-mono ${
            isLight 
              ? 'bg-slate-100/90 border-slate-200 text-slate-500' 
              : 'bg-slate-900/60 border-white/5 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} className={`${isLight ? 'text-sky-600' : 'text-cyan-400'} animate-spin`} style={{ animationDuration: '6s' }} />
              <span className={`uppercase tracking-widest font-black ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>SOGNE SISTEMA GEOGRÁFICO</span>
            </div>
            <span className={isLight ? 'text-sky-700 font-bold' : 'text-cyan-400/80'}>INTERACTIVO</span>
          </div>

        </div>
      )}

      {/* Estilos para el scrollbar táctico */}
      <style jsx>{`
        .custom-legend-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-legend-scrollbar::-webkit-scrollbar-track {
          background: ${isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 10px;
        }
        .custom-legend-scrollbar::-webkit-scrollbar-thumb { 
          background: ${isLight ? 'rgba(14, 165, 233, 0.4)' : 'rgba(6, 182, 212, 0.3)'}; 
          border-radius: 10px; 
        }
        .custom-legend-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: ${isLight ? 'rgba(14, 165, 233, 0.7)' : 'rgba(6, 182, 212, 0.6)'}; 
        }
      `}</style>
    </div>
  );
};