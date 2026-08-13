"use client";

import React, { useState, useMemo } from 'react';
import { 
  Layers, ChevronDown, ChevronUp, Search, 
  Sparkles, Minimize2, Maximize2, X, ShieldAlert,
  Radio, Zap, HeartPulse, Bus, MapPin, Eye
} from 'lucide-react';

interface LegendProps {
  theme?: string;
  layersVisible?: any;
}

interface LegendCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  items: {
    id: string;
    label: string;
    iconSrc?: string;
    colorDot?: string;
    glowColor?: string;
    desc?: string;
    activeKey?: string | ((lv: any) => boolean);
  }[];
}

export const Legend = ({ theme = 'dark', layersVisible = {} }: LegendProps) => {
  const [minimized, setMinimized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    base: true,
    riesgo: true,
    inteligencia: false,
    servicios: false,
    telecom: false,
    salud: false,
    transporte: false
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const expandAll = () => {
    setOpenSections({
      base: true,
      riesgo: true,
      inteligencia: true,
      servicios: true,
      telecom: true,
      salud: true,
      transporte: true
    });
  };

  const collapseAll = () => {
    setOpenSections({
      base: false,
      riesgo: false,
      inteligencia: false,
      servicios: false,
      telecom: false,
      salud: false,
      transporte: false
    });
  };

  const categories: LegendCategory[] = useMemo(() => [
    {
      id: 'base',
      name: 'Capas Base',
      icon: Layers,
      color: '#38bdf8',
      items: [
        { id: 'municipios', label: 'Municipios', iconSrc: '/Municipios.png', colorDot: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', desc: 'Límites municipales', activeKey: 'municipios' },
        { id: 'parroquias', label: 'Parroquias', iconSrc: '/parroquia.png', colorDot: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.4)', desc: 'Límites parroquiales', activeKey: 'parroquias' },
        { id: 'sectores', label: 'Sectores', iconSrc: '/Sectores.png', colorDot: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)', desc: 'Comunidades y sectores', activeKey: 'sectores' },
        { id: 'cuadrantes', label: 'Cuadrantes de Paz (COMPAS)', iconSrc: '/Cuadrantes.png', colorDot: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)', desc: 'Polígonos de cuadrantes', activeKey: (lv) => !!(lv.cuadrantes || lv.cuadrantesPoligonos || lv.compas) },
      ]
    },
    {
      id: 'riesgo',
      name: 'Zonas de Riesgo e Incidencias',
      icon: ShieldAlert,
      color: '#f43f5e',
      items: [
        { id: 'delitos', label: 'Delitos Comunes', iconSrc: '/delitos.png', colorDot: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', desc: 'Robos, hurtos e incidentes', activeKey: (lv) => !!lv.zonasDeRiesgo?.delitosComunes },
        { id: 'cibernetica', label: 'Área Cibernética', iconSrc: '/hacker.png', colorDot: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)', desc: 'Amenazas y delitos digitales', activeKey: (lv) => !!lv.zonasDeRiesgo?.areaCibernetica },
        { id: 'concentracion', label: 'Concentraciones Públicas', iconSrc: '/concentracion.png', colorDot: '#eab308', glowColor: 'rgba(234, 179, 8, 0.5)', desc: 'Eventos y aglomeraciones', activeKey: (lv) => !!lv.zonasDeRiesgo?.concentraciones },
      ]
    },
    {
      id: 'inteligencia',
      name: 'Geolocalizaciones & Inteligencia',
      icon: Eye,
      color: '#8b5cf6',
      items: [
        { id: 'drogas', label: 'Tráfico de Drogas', iconSrc: '/drogas.png', colorDot: '#84cc16', glowColor: 'rgba(132, 204, 22, 0.5)', desc: 'Incidencias de microtráfico', activeKey: (lv) => !!lv.geocalizaciones?.traficoDrogas },
        { id: 'actores', label: 'Actores de Interés', iconSrc: '/actor.png', colorDot: '#f43f5e', glowColor: 'rgba(244, 63, 94, 0.5)', desc: 'Sujetos y objetivos clave', activeKey: (lv) => !!lv.geocalizaciones?.actoresInteres },
        { id: 'bandas', label: 'Grupos Delictivos', iconSrc: '/banda.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Bandas estructuradas y GEDO', activeKey: (lv) => !!lv.geocalizaciones?.gruposDelictivos },
        { id: 'puntos', label: 'Puntos de Interés', iconSrc: '/punto.png', colorDot: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.5)', desc: 'Instalaciones y puntos estratégicos', activeKey: (lv) => !!lv.geocalizaciones?.puntosInteres },
      ]
    },
    {
      id: 'servicios',
      name: 'Servicios Básicos & Energía',
      icon: Zap,
      color: '#eab308',
      items: [
        { id: 'electricidad', label: 'Sistemas Eléctricos', iconSrc: '/electricidad.png', colorDot: '#eab308', glowColor: 'rgba(234, 179, 8, 0.5)', desc: 'Subestaciones y líneas', activeKey: (lv) => !!lv.serviciosBasicos?.sistemasElectricos },
        { id: 'gas', label: 'Estaciones de Gas', iconSrc: '/gasolinera.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Plantas y distribución de GLP', activeKey: (lv) => !!lv.serviciosBasicos?.estacionesGas },
        { id: 'agua_embalses', label: 'Embalses y Represas', colorDot: '#00838f', glowColor: 'rgba(0, 131, 143, 0.6)', desc: 'Fuentes hídricas principales', activeKey: (lv) => !!lv.serviciosBasicos?.servicioAgua?.embalses },
        { id: 'agua_parales', label: 'Parales y Pozos', colorDot: '#00bcd4', glowColor: 'rgba(0, 188, 212, 0.6)', desc: 'Llenaderos de cisternas y pozos', activeKey: (lv) => !!(lv.serviciosBasicos?.servicioAgua?.parales || lv.serviciosBasicos?.servicioAgua?.pozos) },
        { id: 'agua_diques', label: 'Diques y Plantas Clorado', colorDot: '#004d40', glowColor: 'rgba(0, 77, 64, 0.6)', desc: 'Tratamiento y almacenamiento', activeKey: (lv) => !!(lv.serviciosBasicos?.servicioAgua?.diques || lv.serviciosBasicos?.servicioAgua?.clorado) },
      ]
    },
    {
      id: 'telecom',
      name: 'Telecomunicaciones & Antenas',
      icon: Radio,
      color: '#a855f7',
      items: [
        { id: 'digitel', label: 'Red Digitel 4G/LTE', colorDot: '#9400d3', glowColor: 'rgba(148, 0, 211, 0.6)', desc: 'Radiobases y celdas', activeKey: (lv) => !!lv.antenas?.digitel },
        { id: 'movilnet', label: 'Red Movilnet', colorDot: '#00ff7f', glowColor: 'rgba(0, 255, 127, 0.6)', desc: 'Radiobases y celdas', activeKey: (lv) => !!lv.antenas?.movilnet },
        { id: 'movistar', label: 'Red Movistar 4G', colorDot: '#00bfff', glowColor: 'rgba(0, 191, 255, 0.6)', desc: 'Radiobases y celdas', activeKey: (lv) => !!lv.antenas?.movistar },
      ]
    },
    {
      id: 'salud',
      name: 'Salud & Infraestructura Social',
      icon: HeartPulse,
      color: '#10b981',
      items: [
        { id: 'hospitales', label: 'Hospitales Tipo I-IV', iconSrc: '/hospital.png', colorDot: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)', desc: 'Red hospitalaria central', activeKey: (lv) => !!lv.infraestructura?.hospitales },
        { id: 'clinicas', label: 'Clínicas y Centros Privados', iconSrc: '/clinica.png', colorDot: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)', desc: 'Atención especializada', activeKey: (lv) => !!lv.infraestructura?.clinicas },
        { id: 'ambulatorios', label: 'Ambulatorios y CPT', iconSrc: '/ambulatorio.png', colorDot: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.5)', desc: 'Consultorios populares', activeKey: (lv) => !!lv.infraestructura?.ambulatorios },
        { id: 'cdi', label: 'CDI y Salas de Rehabilitación', iconSrc: '/centrosalud.png', colorDot: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)', desc: 'Diagnóstico integral', activeKey: (lv) => !!lv.infraestructura?.cdi },
        { id: 'estaciones_combustible', label: 'Estaciones de Combustible', iconSrc: '/bombagasolina.png', colorDot: '#f97316', glowColor: 'rgba(249, 115, 22, 0.5)', desc: 'Gasolina y diésel', activeKey: (lv) => !!lv.infraestructura?.estaciones },
        { id: 'escuelas', label: 'Escuelas & Circuitos', iconSrc: '/social.png', colorDot: '#d946ef', glowColor: 'rgba(217, 70, 239, 0.5)', desc: 'Instituciones educativas', activeKey: (lv) => !!lv.infraestructura?.escuelas },
      ]
    },
    {
      id: 'transporte',
      name: 'Transporte & Movilidad',
      icon: Bus,
      color: '#06b6d4',
      items: [
        { id: 'trans_publico', label: 'Transporte Público', iconSrc: '/bus.png', colorDot: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.5)', desc: 'Rutas urbanas y suburbanas', activeKey: (lv) => !!lv.transporte?.transportePublico },
        { id: 'trans_privado', label: 'Transporte Privado', iconSrc: '/carro.png', colorDot: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)', desc: 'Líneas y taxis registrados', activeKey: (lv) => !!lv.transporte?.transportePrivado },
      ]
    }
  ], []);

  // Calcular número de capas activas
  const activeLayersCount = useMemo(() => {
    let count = 0;
    categories.forEach(cat => {
      cat.items.forEach(item => {
        if (typeof item.activeKey === 'function') {
          if (item.activeKey(layersVisible)) count++;
        } else if (item.activeKey && layersVisible[item.activeKey]) {
          count++;
        }
      });
    });
    return count;
  }, [categories, layersVisible]);

  // Filtrar según búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const cleanSearch = searchTerm.toLowerCase().trim();
    return categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.label.toLowerCase().includes(cleanSearch) || 
          (item.desc && item.desc.toLowerCase().includes(cleanSearch))
        )
      }))
      .filter(cat => cat.items.length > 0);
  }, [categories, searchTerm]);

  const isLayerActive = (item: any) => {
    if (typeof item.activeKey === 'function') return item.activeKey(layersVisible);
    if (item.activeKey && layersVisible[item.activeKey]) return true;
    return false;
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
          className="group flex items-center gap-3 px-4 py-3 bg-slate-950/90 hover:bg-slate-900/95 text-white rounded-2xl border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-cyan-400 active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
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
            <span className="text-[11px] font-black tracking-wider uppercase bg-linear-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent block">
              Leyenda Táctica
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              {activeLayersCount} {activeLayersCount === 1 ? 'capa activa' : 'capas activas'}
            </span>
          </div>
          <Maximize2 size={13} className="text-slate-400 group-hover:text-cyan-300 transition-colors ml-1" />
        </button>
      ) : (
        /* Contenedor Principal Expandido */
        <div className="relative bg-slate-950/85 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-300 ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Luz / Glow Ambiental Superior */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-70" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-cyan-500/20 blur-2xl pointer-events-none" />

          {/* HEADER */}
          <div className="p-4 pb-3 bg-linear-to-b from-white/5 to-transparent border-b border-white/10">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Layers size={14} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase italic tracking-widest bg-linear-to-r from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                    Simbología Táctica
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeLayersCount > 0 ? 'bg-emerald-400' : 'bg-slate-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeLayersCount > 0 ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
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
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                >
                  <Minimize2 size={13} />
                </button>
              </div>
            </div>

            {/* BUSCADOR INTEGRADO */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar símbolos..."
                className="w-full bg-slate-900/90 text-[11px] text-white placeholder-slate-500 rounded-xl pl-8 pr-7 py-1.5 border border-white/10 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Actions (Expandir / Colapsar) */}
            {!searchTerm && (
              <div className="flex justify-between items-center mt-2 px-1 text-[8px] font-mono text-slate-500 uppercase">
                <button 
                  onClick={expandAll}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  [Expandir todo]
                </button>
                <button 
                  onClick={collapseAll}
                  className="hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  [Colapsar todo]
                </button>
              </div>
            )}
          </div>

          {/* LISTA DE CATEGORÍAS Y SÍMBOLOS */}
          <div className="p-3 space-y-2.5 overflow-y-auto max-h-[52vh] custom-legend-scrollbar">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-[11px] font-mono">
                No se encontraron símbolos para "{searchTerm}"
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const IconComponent = cat.icon;
                const isOpen = searchTerm ? true : !!openSections[cat.id];
                const activeInCat = cat.items.filter(it => isLayerActive(it)).length;

                return (
                  <div 
                    key={cat.id} 
                    className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    {/* Header de Categoría */}
                    <button
                      onClick={() => !searchTerm && toggleSection(cat.id)}
                      className={`w-full flex items-center justify-between p-2.5 text-left transition-colors cursor-pointer ${
                        isOpen ? 'bg-white/5' : 'hover:bg-white/3'
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
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {activeInCat > 0 && (
                          <span 
                            className="px-1.5 py-0.5 rounded-full text-[8px] font-black font-mono"
                            style={{ 
                              backgroundColor: `${cat.color}25`, 
                              color: cat.color,
                              border: `1px solid ${cat.color}40`
                            }}
                          >
                            {activeInCat} ON
                          </span>
                        )}
                        {!searchTerm && (
                          <span className="text-slate-500 transition-transform duration-300">
                            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Elementos de la Categoría */}
                    {isOpen && (
                      <div className="p-2 pt-1.5 space-y-1 border-t border-white/5 bg-slate-950/40 animate-in fade-in slide-in-from-top-1 duration-200">
                        {cat.items.map((item) => {
                          const active = isLayerActive(item);

                          return (
                            <div
                              key={item.id}
                              className={`group flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${
                                active 
                                  ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                  : 'hover:bg-white/5 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Contenedor del Ícono / Dot */}
                                <div 
                                  className="w-6 h-6 rounded-xl flex items-center justify-center shrink-0 bg-white/90 shadow-md transition-transform duration-200 group-hover:scale-110"
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
                                    active ? 'text-cyan-300' : 'text-slate-200 group-hover:text-white'
                                  }`}>
                                    {item.label}
                                  </span>
                                  {item.desc && (
                                    <span className="text-[8px] text-slate-400 font-mono block leading-none mt-0.5 truncate">
                                      {item.desc}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Indicador de Estado Activo en Mapa */}
                              <div className="shrink-0 ml-2">
                                {active ? (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                  </span>
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white/10 block group-hover:bg-white/20 transition-colors" />
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
          <div className="p-2.5 px-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="uppercase tracking-widest text-slate-300 font-black">SOGNE SISTEMA GEOGRÁFICO</span>
            </div>
            <span className="text-cyan-400/80">INTERACTIVO</span>
          </div>

        </div>
      )}

      {/* Estilos para el scrollbar táctico */}
      <style jsx>{`
        .custom-legend-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-legend-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-legend-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(6, 182, 212, 0.3); 
          border-radius: 10px; 
        }
        .custom-legend-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(6, 182, 212, 0.6); 
        }
      `}</style>
    </div>
  );
};