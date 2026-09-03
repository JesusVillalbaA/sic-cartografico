"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Tag } from 'lucide-react';

export const BuscadorGlobal = ({ map, onSelectFeature, theme, layersVisible }: any) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allFeatures, setAllFeatures] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isZonaActive = 
    layersVisible?.zonasDeRiesgo?.delitosComunes || 
    layersVisible?.zonasDeRiesgo?.areaCibernetica || 
    layersVisible?.zonasDeRiesgo?.concentraciones || 
    layersVisible?.geocalizaciones?.drogas || 
    layersVisible?.geocalizaciones?.actorInteres || 
    layersVisible?.geocalizaciones?.puntoInteres || 
    layersVisible?.bandasDelictivas ||
    layersVisible?.conppas;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar todas las features de ZONAS cuando se enfoca el input
  const loadFeatures = () => {
    if (!map || typeof map.querySourceFeatures !== 'function') return;
    try {
      const style = map.getStyle();
      if (!style) return;
      
      const zoneSourceIds = [
        'incidencias-riesgo',
        'cibernetica-incidente',
        'concentraciones-incidente',
        'drogas-trafico',
        'actores',
        'grupos-bandas',
        'puntos-interes',
        'conppas-source'
      ];
      
      let featuresRaw: any[] = [];
      
      zoneSourceIds.forEach(sourceId => {
        try {
          if (style.sources[sourceId]) {
            const features = map.querySourceFeatures(sourceId);
            featuresRaw = [...featuresRaw, ...features];
          }
        } catch(e) {}
      });
      
      // Evitar duplicados
      const unique = new Map();
      featuresRaw.forEach(f => {
        const p = f.properties || {};
        const id = f.id || p.id || p.id_incidencia || p.id_punto || p.id_persona_interes || p.cuadrante || p.nombre || p.NAME || p.adm2_name;
        if (id && !unique.has(id)) {
          unique.set(id, f);
        }
      });
      setAllFeatures(Array.from(unique.values()));
    } catch (e) {
      console.warn("[Buscador] Error consultando fuentes:", e);
    }
  };

  useEffect(() => {
    if (isFocused && isZonaActive) {
      loadFeatures();
    }
  }, [isFocused, map, isZonaActive]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matched = allFeatures.filter(f => {
      const p = f.properties || {};
      // Buscar en TODAS las propiedades (sea de BD o de GeoJSON)
      return Object.values(p).some(val => 
        val && String(val).toLowerCase().includes(q)
      );
    });
    
    setResults(matched.slice(0, 15)); // max 15 resultados
  }, [query, allFeatures]);

  const handleSelect = (feature: any) => {
    setQuery('');
    setIsFocused(false);
    onSelectFeature(feature);
  };

  if (!isZonaActive) return null;

  const isLight = theme === 'light';

  return (
    <div ref={wrapperRef} className="absolute top-4 right-6 z-50 w-80 md:w-96 flex flex-col items-end">
      {/* Input */}
      <div className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
        isFocused 
          ? (isLight ? 'bg-white/95 border-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-slate-900/95 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]')
          : (isLight ? 'bg-white/80 border-slate-300' : 'bg-slate-900/80 border-white/10')
      }`}>
        <div className="flex items-center px-4 py-3">
          <Search size={18} className={`${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Buscar incidencia, oficial, banda... (Ctrl+K)"
            className={`flex-1 bg-transparent border-none outline-none ml-3 text-[13px] font-medium tracking-wide ${
              isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
            }`}
          />
          {!query && (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/10 rounded border border-white/10 ml-2">
              Ctrl+K
            </kbd>
          )}
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {isFocused && query.trim() && (
        <div className={`mt-2 w-full max-h-[60vh] overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-2xl custom-scrollbar animate-in slide-in-from-top-2 duration-300 ${
          isLight ? 'bg-white/95 border-slate-300' : 'bg-[#0a0c0a]/95 border-white/10'
        }`}>
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              {results.map((f, i) => {
                const p = f.properties || {};
                const name = p.nombre || p.NAME || p.adm2_name || p.alias || p.nombre_banda || (p.cuadrante ? `Cuadrante ${p.cuadrante}` : (p.cedula_oficial_campo ? `Registro de Ofic. ${p.cedula_oficial_campo}` : 'Registro de Zona'));
                const tipo = p.tipo_incidente || p.CATEGORIA || p.tipo || f.source || 'Punto de Interés';
                const extra = p.municipio || p.sector || p.ADDRESS || p.descripcion || '';

                return (
                  <button
                    key={`${i}-${name}`}
                    onClick={() => handleSelect(f)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                      isLight ? 'hover:bg-slate-100/80' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${isLight ? 'bg-sky-100 text-sky-600' : 'bg-white/5 text-cyan-400'}`}>
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-[13px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {name}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Tag size={10} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${isLight ? 'text-sky-600' : 'text-cyan-400'}`}>
                          {tipo}
                        </span>
                      </div>
                      {extra && (
                        <p className={`text-[10px] mt-1 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {extra}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search size={32} className={`mx-auto mb-3 opacity-20 ${isLight ? 'text-slate-800' : 'text-white'}`} />
              <p className={`text-[12px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No se encontraron resultados para "{query}"</p>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};
