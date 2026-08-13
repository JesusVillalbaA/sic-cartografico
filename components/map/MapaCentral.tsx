"use client";
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Zap } from 'lucide-react';
import { AnalysisPanel } from './AnalysisPanel';
import { useMapbox } from './useMapbox';
import { Legend } from './Legend';
import { BuscadorGlobal } from './BuscadorGlobal';
import { ModalDiagramaElectrico } from './ModalDiagramaElectrico';
import { TacticalToolbar } from './TacticalToolbar';
import { ZoomControls } from './ZoomControls';
import { TacticalMapLoader } from './TacticalMapLoader';
import { exportPDF as exportPDFUtil, toggleState, clearAndReset } from './mapUtils';
import { supabase } from './supabaseClient';

export const MapaCentral = forwardRef(({ layersVisible, fetchZonasDeRiesgo: externalFetch, isZonasLoading, theme }: any, ref) => {
  const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDiagramaOpen, setIsDiagramaOpen] = useState(false);

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

  const exportPDF = () => exportPDFUtil(isExporting, setIsExporting);
  useImperativeHandle(ref, () => ({ exportToPDF: exportPDF }));

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

  const handleSearchSelect = (feature: any) => {
    const m = map.current;
    if (!m) return;
    
    // Fly to feature
    if (feature.geometry && feature.geometry.coordinates) {
      if (feature.geometry.type === 'Point') {
        m.flyTo({ center: feature.geometry.coordinates as [number, number], zoom: 14, pitch: 45, duration: 1500 });
      } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const coords = feature.geometry.type === 'Polygon' ? feature.geometry.coordinates[0][0] : feature.geometry.coordinates[0][0][0];
        m.flyTo({ center: coords as [number, number], zoom: 12, pitch: 0, duration: 1500 });
      }
    }
    
    // Select feature
    const id = feature.properties?.id || feature.properties?.id_punto || feature.properties?.id_incidencia || feature.properties?.id_persona_interes || feature.properties?.cuadrante || feature.properties?.nombre || feature.properties?.adm2_name || feature.properties?.NAME;
    
    setSelectedFeatures(prev => {
      toggleState(m, feature, true);
      const filtered = prev.filter(sf => (sf.properties?.id || sf.properties?.id_punto || sf.properties?.id_incidencia || sf.properties?.id_persona_interes || sf.properties?.cuadrante || sf.properties?.nombre || sf.properties?.adm2_name || sf.properties?.NAME) !== id);
      return [feature, ...filtered];
    });
  };

  const hasElectricalSelected = selectedFeatures.some(f => (f.layer?.id || "").includes('electric') || f.properties?.categoria?.includes('ELECTRICA') || f.properties?.gpxx_Categ?.includes('ELECTRICAS'));
  const isElectricoActive = hasElectricalSelected || safeLayersVisible.sistemasElectricos;

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
      
      {/* Opción flotante pequeña al tocar/activar electricidad */}
      {isElectricoActive && (
        <button
          onClick={() => setIsDiagramaOpen(true)}
          className="absolute top-24 left-6 z-30 flex items-center gap-2 bg-[#0a0a05]/95 hover:bg-yellow-950/95 text-yellow-400 hover:text-white px-4 py-2.5 rounded-2xl border border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.3)] backdrop-blur-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 animate-in fade-in slide-in-from-left-4 hover:scale-105 group cursor-pointer"
        >
          <Zap size={14} className="text-yellow-400 animate-pulse group-hover:scale-110 transition-transform" />
          <span>Ver Diagrama Unifilar</span>
        </button>
      )}

      <TacticalToolbar map={map.current} theme={theme} selectedFeatures={selectedFeatures} />
      <BuscadorGlobal map={map.current} onSelectFeature={handleSearchSelect} theme={theme} layersVisible={layersVisible} />
      <Legend theme={theme} layersVisible={layersVisible} />
      <ZoomControls map={map.current} theme={theme} />
      {selectedFeatures.length > 0 && (
        <AnalysisPanel 
          features={selectedFeatures} 
          onRemove={handleRemove} 
          onClear={handleClear} 
          theme={theme}
          onOpenDiagrama={() => setIsDiagramaOpen(true)} 
        />
      )}

      <ModalDiagramaElectrico isOpen={isDiagramaOpen} onClose={() => setIsDiagramaOpen(false)} />
    </div>
  );
});

MapaCentral.displayName = 'MapaCentral';