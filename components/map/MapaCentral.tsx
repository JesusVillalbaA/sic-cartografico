"use client";
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { Zap, Flame } from 'lucide-react';
import { AnalysisPanel } from './AnalysisPanel';
import { useMapbox } from './useMapbox';
import { Legend } from './Legend';
import { BuscadorGlobal } from './BuscadorGlobal';
import { ModalDiagramaElectrico } from './ModalDiagramaElectrico';
import { ModalDiagramaGas } from './ModalDiagramaGas';
import { TacticalToolbar } from './TacticalToolbar';
import { ZoomControls } from './ZoomControls';
import { TacticalMapLoader } from './TacticalMapLoader';
import { exportPDF as exportPDFUtil, toggleState, clearAndReset } from './mapUtils';
import { supabase } from './supabaseClient';

import { AsistenteIA } from './AsistenteIA';

export const MapaCentral = forwardRef(({ layersVisible, onToggle, fetchZonasDeRiesgo: externalFetch, isZonasLoading, theme }: any, ref) => {
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiagramaOpen, setIsDiagramaOpen] = useState(false);
  const [isDiagramaGasOpen, setIsDiagramaGasOpen] = useState(false);

  // Atajos de teclado globales (Ctrl+K para buscar, Escape para cerrar modales)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key.toLowerCase() === 'k') || 
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape') {
        setIsDiagramaOpen(false);
        setIsDiagramaGasOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Asegurar que layersVisible tenga la propiedad 'estaciones' (si el padre no la pasa, se inicializa)
  const safeLayersVisible = {
    ...layersVisible,
    estaciones: layersVisible?.estaciones ?? false,
  };

  const fetchZonasDeRiesgo = async () => {
    if (isZonasLoading) return;
    try {
      const response = await fetch('/api/map/incidencias');
      if (!response.ok) throw new Error('Network response was not ok');
      const geojson = await response.json();

      if (map.current) {
        const source = map.current.getSource('incidentes-source') as mapboxgl.GeoJSONSource;
        if (source) source.setData(geojson);
      }
      if (typeof externalFetch === 'function') externalFetch();
    } catch (error) {
      console.warn("Cargando datos locales de incidencias...");
    }
  };

  const { mapContainer, map, mapReady, loadingStage } = useMapbox(safeLayersVisible, fetchZonasDeRiesgo, setSelectedFeatures, selectedFeatures, theme);

  useEffect(() => {
    if (map.current && typeof window !== 'undefined') {
      (window as any)._mapboxMapInstance = map.current;
    }
  }, [mapReady]);

  const exportPDF = () => exportPDFUtil(isExporting, setIsExporting);
  useImperativeHandle(ref, () => ({
    exportToPDF: exportPDF,
    getMap: () => map.current,
  }));

  const handleRemove = (feature: any) => {
    const m = map.current;
    if (m) toggleState(m, feature, false);
    const idToRemove = feature.properties?.id || feature.properties?.cuadrante || feature.properties?.nombre || feature.properties?.adm2_name || feature.properties?.NAME;
    const updated = selectedFeatures.filter(p => (p.properties?.id || p.properties?.cuadrante || p.properties?.nombre || p.properties?.adm2_name || p.properties?.NAME) !== idToRemove);
    setSelectedFeatures(updated);
    if (updated.length === 0 && m) clearAndReset(m, updated, setSelectedFeatures);
  };

  const handleClear = () => {
    const m = map.current;
    if (m) {
      selectedFeatures.forEach(f => toggleState(m, f, false));
      setSelectedFeatures([]);
      clearAndReset(m, [], setSelectedFeatures);
    }
  };

  const handleSearchSelect = React.useCallback((feature: any) => {
    const m = map.current;
    if (!m) return;
    
    // Fly to feature
    if (feature.geometry) {
      try {
        if (feature.geometry.type === 'Point') {
          m.flyTo({ center: feature.geometry.coordinates as [number, number], zoom: 14, pitch: 45, duration: 1500 });
        } else {
          const bbox = turf.bbox(feature);
          m.fitBounds(bbox as [number, number, number, number], { padding: 90, maxZoom: 15, duration: 1500 });
        }
      } catch(_) {
        m.flyTo({ zoom: 12, duration: 1200 });
      }
    }
    
    // Select feature
    const id = feature.properties?.id || feature.properties?.id_punto || feature.properties?.id_incidencia || feature.properties?.id_persona_interes || feature.properties?.cuadrante || feature.properties?.nombre || feature.properties?.adm2_name || feature.properties?.NAME;
    
    setSelectedFeatures(prev => {
      toggleState(m, feature, true);
      const filtered = prev.filter(sf => (sf.properties?.id || sf.properties?.id_punto || sf.properties?.id_incidencia || sf.properties?.id_persona_interes || sf.properties?.cuadrante || sf.properties?.nombre || sf.properties?.adm2_name || sf.properties?.NAME) !== id);
      return [feature, ...filtered];
    });
  }, [map]);

  useEffect(() => {
    const handleVoiceOpenFeature = (e: any) => {
      const targetName = e.detail?.name;
      const m = map.current;
      if (!m || !targetName) return;

      try {
        const cleanTarget = targetName.toLowerCase().trim();

        // 1. Buscar en queryRenderedFeatures
        const allRendered = m.queryRenderedFeatures();
        let matched = allRendered.find((f: any) => {
          const p = f.properties || {};
          const vals = Object.values(p).join(' ').toLowerCase();
          return vals.includes(cleanTarget);
        });

        // 2. Si no se encuentra en pantalla, buscar en fuentes GeoJSON de Mapbox
        if (!matched && m.getStyle()?.sources) {
          const sourceIds = Object.keys(m.getStyle().sources);
          for (const sId of sourceIds) {
            try {
              const feats = m.querySourceFeatures(sId);
              const found = feats.find((f: any) => {
                const p = f.properties || {};
                const vals = Object.values(p).join(' ').toLowerCase();
                return vals.includes(cleanTarget);
              });
              if (found) {
                matched = found;
                break;
              }
            } catch (_) {}
          }
        }

        if (matched) {
          handleSearchSelect(matched);
        }
      } catch (err) {
        console.warn("Error al abrir panel por voz:", err);
      }
    };

    window.addEventListener('sogne_voice_open_feature', handleVoiceOpenFeature);
    return () => window.removeEventListener('sogne_voice_open_feature', handleVoiceOpenFeature);
  }, [map, handleSearchSelect]);

  const hasElectricalSelected = selectedFeatures.some(f => (f.layer?.id || "").includes('electric') || f.properties?.categoria?.includes('ELECTRICA') || f.properties?.gpxx_Categ?.includes('ELECTRICAS'));
  const isElectricoActive = safeLayersVisible.sistemasElectricos || hasElectricalSelected;

  const hasGasSelected = selectedFeatures.some(f => (f.layer?.id || "").includes('gas') || f.properties?.categoria?.includes('GAS') || (f.properties?.estatus || '').length > 0 || f.properties?.id === 'emr_bm21');
  const isGasActive = safeLayersVisible.estacionesGas || safeLayersVisible.estacionGas || hasGasSelected;

  return (
    <div id="map-export-container" className="relative w-full h-full overflow-hidden">
      {/* Animación Táctica de Carga Inicial con Progreso Real en Vivo */}
      <TacticalMapLoader 
        isLoading={!mapReady} 
        theme={theme} 
        progress={loadingStage?.progress}
        statusMessage={loadingStage?.message}
      />

      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Botones de Acceso Flotante Condicionados a la Activación de la Capa en el Menú */}
      <div className="absolute top-24 left-6 z-30 flex flex-col gap-2">
        {/* Diagrama Eléctrico - Solo visible si está activo el servicio eléctrico */}
        {isElectricoActive && (
          <button
            onClick={() => setIsDiagramaOpen(true)}
            className="flex items-center gap-2 bg-[#0a0a05]/95 hover:bg-yellow-950/95 text-yellow-400 hover:text-white px-4 py-2.5 rounded-2xl border border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.3)] backdrop-blur-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 animate-in fade-in slide-in-from-left-4 hover:scale-105 group cursor-pointer"
            title="Ver Diagrama Unifilar del Sistema Eléctrico"
          >
            <Zap size={14} className="text-yellow-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span>Ver Diagrama Unifilar</span>
          </button>
        )}

        {/* Esquema del Gasoducto - Solo visible si está activo el servicio de gas */}
        {isGasActive && (
          <button
            onClick={() => setIsDiagramaGasOpen(true)}
            className="flex items-center gap-2 bg-[#0c0602]/95 hover:bg-orange-950/95 text-orange-400 hover:text-white px-4 py-2.5 rounded-2xl border border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.3)] backdrop-blur-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 animate-in fade-in slide-in-from-left-4 hover:scale-105 group cursor-pointer"
            title="Ver Esquema del Gasoducto Nororiental"
          >
            <Flame size={14} className="text-orange-400 animate-pulse group-hover:scale-110 transition-transform" />
            <span>Ver Esquema Gasoducto</span>
          </button>
        )}
      </div>

      <TacticalToolbar map={map.current} theme={theme} selectedFeatures={selectedFeatures} />
      <BuscadorGlobal map={map.current} onSelectFeature={handleSearchSelect} theme={theme} layersVisible={layersVisible} />
      <AsistenteIA layersVisible={layersVisible} selectedFeatures={selectedFeatures} onToggle={onToggle} theme={theme} />
      <Legend theme={theme} layersVisible={layersVisible} onToggle={onToggle} />
      <ZoomControls map={map.current} theme={theme} />
      {selectedFeatures.length > 0 && (
        <AnalysisPanel 
          features={selectedFeatures} 
          onRemove={handleRemove} 
          onClear={handleClear} 
          theme={theme}
          onOpenDiagrama={() => setIsDiagramaOpen(true)}
          onOpenDiagramaGas={() => setIsDiagramaGasOpen(true)}
        />
      )}

      <ModalDiagramaElectrico isOpen={isDiagramaOpen} onClose={() => setIsDiagramaOpen(false)} />
      <ModalDiagramaGas isOpen={isDiagramaGasOpen} onClose={() => setIsDiagramaGasOpen(false)} />
    </div>
  );
});

MapaCentral.displayName = 'MapaCentral';