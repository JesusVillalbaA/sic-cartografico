"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Tag, Mic, MicOff } from 'lucide-react';

export const BuscadorGlobal = ({ map, onSelectFeature, theme, layersVisible }: any) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [allFeatures, setAllFeatures] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isZonaActive = 
    layersVisible?.zonasDeRiesgo?.delitosComunes || 
    layersVisible?.zonasDeRiesgo?.areaCibernetica || 
    layersVisible?.zonasDeRiesgo?.concentraciones || 
    layersVisible?.geocalizaciones?.drogas || 
    layersVisible?.geocalizaciones?.actorInteres || 
    layersVisible?.geocalizaciones?.puntoInteres || 
    layersVisible?.bandasDelictivas ||
    layersVisible?.conppas ||
    layersVisible?.transporte ||
    layersVisible?.escuelas ||
    layersVisible?.sistemasElectricos ||
    layersVisible?.estacionesGas ||
    layersVisible?.servicioAgua ||
    true; // Buscador táctico siempre activo

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

  // Control de atajo de teclado Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) {
          input.focus();
          setIsFocused(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cargar todas las features cuando se enfoca o usa la búsqueda
  const loadFeatures = () => {
    if (!map || typeof map.querySourceFeatures !== 'function') return;
    try {
      const style = map.getStyle();
      if (!style) return;
      
      const sourceIds = [
        'incidencias-riesgo',
        'cibernetica-incidente',
        'concentraciones-incidente',
        'drogas-trafico',
        'actores',
        'grupos-bandas',
        'puntos-interes',
        'compas-source',
        'conppas-source',
        'transporte-source',
        'escuelas-source',
        'sistemas-electricos-source',
        'estaciones-gas-source',
        'embalses-source'
      ];
      
      let featuresRaw: any[] = [];
      
      sourceIds.forEach(sourceId => {
        try {
          if (style.sources && style.sources[sourceId]) {
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

  // Manejador del comando de voz táctico
  const toggleVoiceSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("El reconocimiento de voz requiere Google Chrome o Microsoft Edge con Web Speech API.");
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-VE';

      recognition.onstart = () => {
        setIsListening(true);
        setIsFocused(true);
        loadFeatures();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript || '';
        if (transcript) {
          setQuery(transcript);
          setIsFocused(true);
          // Broadcast evento global para que AsistenteIA también responda si es un comando directo
          window.dispatchEvent(new CustomEvent('sogne_send_voice_text', { detail: { text: transcript } }));
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("[Buscador Voz] Error:", err.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn("[Buscador Voz] Error al inicializar:", err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const matched = allFeatures.filter(f => {
      const p = f.properties || {};
      return Object.values(p).some(val => {
        if (!val) return false;
        const s = String(val).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        return s.includes(q);
      });
    });
    
    setResults(matched.slice(0, 15));
  }, [query, allFeatures]);

  const handleSelect = (feature: any) => {
    setQuery('');
    setIsFocused(false);
    onSelectFeature(feature);
  };

  if (!isZonaActive) return null;

  const isLight = theme === 'light';

  return (
    <div 
      ref={wrapperRef} 
      className="absolute top-4 right-16 sm:right-44 md:right-48 z-40 w-[calc(100vw-5rem)] sm:w-72 md:w-80 max-w-[270px] sm:max-w-none flex flex-col items-end"
    >
      {/* Input */}
      <div className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-300 shadow-xl backdrop-blur-md ${
        isFocused 
          ? (isLight ? 'bg-white/95 border-[#0ea5e9] shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'bg-slate-900/95 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]')
          : (isLight ? 'bg-white/80 border-slate-300' : 'bg-slate-900/80 border-white/10')
      }`}>
        <div className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5">
          <Search size={16} className={`shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              loadFeatures();
            }}
            placeholder="Buscar o dictar... (Ctrl+K)"
            className={`flex-1 bg-transparent border-none outline-none ml-2 sm:ml-3 text-xs sm:text-[13px] font-medium tracking-wide min-w-0 ${
              isLight ? 'text-slate-800 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
            }`}
          />

          {/* Botón de Dictado por Voz */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ml-1 ${
              isListening
                ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse'
                : isLight
                ? 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
            }`}
            title={isListening ? "Detener micrófono" : "Dictar búsqueda por comando de voz"}
          >
            {isListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {!query && (
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/10 rounded border border-white/10 ml-1.5 shrink-0">
              Ctrl+K
            </kbd>
          )}

          {query && (
            <button 
              onClick={() => setQuery('')} 
              className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
              title="Borrar búsqueda"
            >
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
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-start gap-2.5 sm:gap-3 ${
                      isLight ? 'hover:bg-slate-100/80' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${isLight ? 'bg-sky-100 text-sky-600' : 'bg-white/5 text-cyan-400'}`}>
                      <MapPin size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-xs sm:text-[13px] font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {name}
                      </h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Tag size={10} className={isLight ? 'text-slate-500' : 'text-slate-400'} />
                        <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate ${isLight ? 'text-sky-600' : 'text-cyan-400'}`}>
                          {tipo}
                        </span>
                      </div>
                      {extra && (
                        <p className={`text-[9.5px] mt-0.5 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {extra}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <Search size={28} className={`mx-auto mb-2 opacity-20 ${isLight ? 'text-slate-800' : 'text-white'}`} />
              <p className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No se encontraron resultados para "{query}"
              </p>
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
