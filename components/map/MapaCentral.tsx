"use client";
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { Zap, Flame } from 'lucide-react';
import { AnalysisPanel } from './AnalysisPanel';
import { useMapbox } from './useMapbox';
import { BuscadorGlobal } from './BuscadorGlobal';
import { TacticalToolbar } from './TacticalToolbar';
import { ZoomControls } from './ZoomControls';
import { TacticalMapLoader } from './TacticalMapLoader';
import { exportPDF as exportPDFUtil, toggleState, clearAndReset } from './mapUtils';
import { supabase } from './supabaseClient';


export const MapaCentral = forwardRef(({ layersVisible, onToggle, fetchZonasDeRiesgo: externalFetch, isZonasLoading, theme }: any, ref) => {
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
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
      } else if (e.key === 'Escape') {      }
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
      {/* AnimaciÃ³n TÃ¡ctica de Carga Inicial con Progreso Real en Vivo */}
      <TacticalMapLoader 
        isLoading={!mapReady} 
        theme={theme} 
        progress={loadingStage?.progress}
        statusMessage={loadingStage?.message}
      />

      <div ref={mapContainer} className="w-full h-full" />
      
      

      <TacticalToolbar map={map.current} theme={theme} selectedFeatures={selectedFeatures} />
      <BuscadorGlobal map={map.current} onSelectFeature={handleSearchSelect} theme={theme} layersVisible={layersVisible} />      <ZoomControls map={map.current} theme={theme} />
      {selectedFeatures.length > 0 && (
        <AnalysisPanel 
          features={selectedFeatures} 
          onRemove={handleRemove} 
          onClear={handleClear} 
          theme={theme}
        />
      )}    </div>
  );
});

MapaCentral.displayName = 'MapaCentral';