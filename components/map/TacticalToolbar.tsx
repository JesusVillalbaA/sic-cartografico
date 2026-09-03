"use client";

import React, { useState, useEffect } from 'react';
import { Ruler, CircleDot, Flame, Trash2, X, Box, Shapes, Download, FileJson, FileText } from 'lucide-react';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import { exportPDF as exportPDFUtil } from './mapUtils';

interface TacticalToolbarProps {
  map: mapboxgl.Map | null;
  theme?: string;
  selectedFeatures?: any[];
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({ map, theme = 'dark', selectedFeatures = [] }) => {
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'buffer' | 'polygon'>('none');
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [isPolygonFinished, setIsPolygonFinished] = useState(false);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [bufferRadius, setBufferRadius] = useState<number>(1); // km

  const polygonPointsRef = React.useRef<[number, number][]>([]);
  const isPolygonFinishedRef = React.useRef(false);
  const activeToolRef = React.useRef(activeTool);

  // Sincronizar estado táctico global para evitar reseteos en useMapbox
  useEffect(() => {
    activeToolRef.current = activeTool;
    if (typeof window !== 'undefined') {
      (window as any)._activeTacticalTool = activeTool;
    }
  }, [activeTool]);

  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints]);

  useEffect(() => {
    isPolygonFinishedRef.current = isPolygonFinished;
  }, [isPolygonFinished]);

  // Función para mover capas neón tácticas al frente absoluto sobre edificaciones y terreno 3D
  const bringTacticalLayersToFront = React.useCallback(() => {
    if (!map) return;
    const layers = [
      'focus-mask-layer',
      'tactical-buffer-fill', 'tactical-buffer-line', 
      'tactical-polygon-fill', 'tactical-polygon-line-glow', 'tactical-polygon-line', 'tactical-polygon-points',
      'tactical-measure-line', 'tactical-measure-points'
    ];
    layers.forEach(id => {
      if (map.getLayer(id)) {
        try { map.moveLayer(id); } catch(e){}
      }
    });
  }, [map]);

  // Inicializar o limpiar fuentes de herramientas tácticas en el mapa
  useEffect(() => {
    if (!map) return;

    const setupSources = () => {
      // 1. Fuente de medición
      if (!map.getSource('tactical-measure-source')) {
        map.addSource('tactical-measure-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-measure-line',
          type: 'line',
          source: 'tactical-measure-source',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 4.5
          }
        });
        map.addLayer({
          id: 'tactical-measure-points',
          type: 'circle',
          source: 'tactical-measure-source',
          paint: {
            'circle-radius': 6,
            'circle-color': '#38bdf8',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff'
          }
        });
      }

      // 2. Fuente de buffer
      if (!map.getSource('tactical-buffer-source')) {
        map.addSource('tactical-buffer-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-buffer-fill',
          type: 'fill',
          source: 'tactical-buffer-source',
          paint: {
            'fill-color': '#a855f7',
            'fill-opacity': 0.25
          }
        });
        map.addLayer({
          id: 'tactical-buffer-line',
          type: 'line',
          source: 'tactical-buffer-source',
          paint: {
            'line-color': '#c084fc',
            'line-width': 3,
            'line-dasharray': [3, 2]
          }
        });
      }

      // 3. Fuente de polígono / área personalizada
      if (!map.getSource('tactical-polygon-source')) {
        map.addSource('tactical-polygon-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-polygon-fill',
          type: 'fill',
          source: 'tactical-polygon-source',
          paint: {
            'fill-color': '#06b6d4',
            'fill-opacity': 0 // SIN RELLENO INTERIOR - Solo líneas neón limpias
          }
        });
        map.addLayer({
          id: 'tactical-polygon-line-glow',
          type: 'line',
          source: 'tactical-polygon-source',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#00ffff',
            'line-width': 12,
            'line-opacity': 0.8,
            'line-blur': 3
          }
        });
        map.addLayer({
          id: 'tactical-polygon-line',
          type: 'line',
          source: 'tactical-polygon-source',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 4.5,
            'line-opacity': 1.0
          }
        });
        map.addLayer({
          id: 'tactical-polygon-points',
          type: 'circle',
          source: 'tactical-polygon-source',
          paint: {
            'circle-radius': 8,
            'circle-color': '#00ffff',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });
      }

      bringTacticalLayersToFront();
    };

    if (map.isStyleLoaded()) {
      setupSources();
    } else {
      map.once('load', setupSources);
    }
  }, [map, bringTacticalLayersToFront]);

  // Manejo de Heatmap
  const toggleHeatmap = () => {
    if (!map) return;
    const nextState = !isHeatmapActive;
    setIsHeatmapActive(nextState);
    if (map.getLayer('incidentes-heatmap')) {
      map.setLayoutProperty('incidentes-heatmap', 'visibility', nextState ? 'visible' : 'none');
    }
  };

  // Manejo de Vista 3D Táctica
  const toggle3D = () => {
    if (!map) return;
    const nextState = !is3DActive;
    setIs3DActive(nextState);
    if (nextState) {
      const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : 11;
      const targetZoom = Math.max(currentZoom, 15.5);
      map.easeTo({
        pitch: 65,
        bearing: -25,
        zoom: targetZoom,
        duration: 1200
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
    setTimeout(bringTacticalLayersToFront, 1300);
  };

  // Manejar mousemove y clics en el mapa según la herramienta activa
  useEffect(() => {
    if (!map || activeTool === 'none') return;

    if (activeTool === 'polygon' && map.doubleClickZoom) {
      map.doubleClickZoom.disable();
    }

    bringTacticalLayersToFront();

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const currentTool = activeToolRef.current;
      const currentPoints = polygonPointsRef.current;
      const finished = isPolygonFinishedRef.current;

      const mouseCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (currentTool === 'polygon' && currentPoints.length > 0 && !finished) {
        const livePoints = [...currentPoints, mouseCoords];
        const pointFeatures = currentPoints.map(p => turf.point(p));
        pointFeatures.push(turf.point(mouseCoords));
        const features: any[] = [...pointFeatures];

        // SIEMPRE añadir la línea neón que une todos los puntos con el cursor del ratón
        if (livePoints.length >= 2) {
          const line = turf.lineString(livePoints);
          features.push(line);
        }

        // Si hay 3 o más puntos, calcular área sin dibujar relleno
        if (livePoints.length >= 3) {
          try {
            const closedRing = [...livePoints, livePoints[0]];
            const poly = turf.polygon([closedRing]);
            const sqMeters = turf.area(poly);
            setTotalArea(sqMeters);
          } catch (err) { }
        }

        const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });

      } else if (currentTool === 'measure' && measurePoints.length > 0) {
        const livePoints = [...measurePoints, mouseCoords];
        const pointFeatures = measurePoints.map(p => turf.point(p));
        pointFeatures.push(turf.point(mouseCoords));
        const features: any[] = [...pointFeatures];

        const line = turf.lineString(livePoints);
        features.push(line);
        const dist = turf.length(line, { units: 'kilometers' });
        setTotalDistance(dist);

        const src = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });
      }
    };

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentTool = activeToolRef.current;
      const finished = isPolygonFinishedRef.current;

      if (currentTool === 'measure') {
        const newPoints = [...measurePoints, coords];
        setMeasurePoints(newPoints);

        const pointsFeatures = newPoints.map(p => turf.point(p));
        const features: any[] = [...pointsFeatures];

        if (newPoints.length > 1) {
          const line = turf.lineString(newPoints);
          features.push(line);
          const dist = turf.length(line, { units: 'kilometers' });
          setTotalDistance(dist);
        } else {
          setTotalDistance(0);
        }

        const src = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });
        bringTacticalLayersToFront();

      } else if (currentTool === 'buffer') {
        const point = turf.point(coords);
        const buffered = turf.buffer(point, bufferRadius, { units: 'kilometers' });
        const src = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
        if (src && buffered) {
          src.setData({ type: 'FeatureCollection', features: [buffered] });
        }
        bringTacticalLayersToFront();

      } else if (currentTool === 'polygon') {
        if (finished) {
          setPolygonPoints([coords]);
          polygonPointsRef.current = [coords];
          setIsPolygonFinished(false);
          isPolygonFinishedRef.current = false;
          setTotalArea(0);

          const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
          if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });

          const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features: [turf.point(coords)] });
        } else {
          const newPoints = [...polygonPointsRef.current, coords];
          setPolygonPoints(newPoints);
          polygonPointsRef.current = newPoints;

          const pointFeatures = newPoints.map(p => turf.point(p));
          const features: any[] = [...pointFeatures];

          if (newPoints.length >= 2) {
            features.push(turf.lineString(newPoints));
          }
          if (newPoints.length >= 3) {
            try {
              const closedRing = [...newPoints, newPoints[0]];
              const poly = turf.polygon([closedRing]);
              setTotalArea(turf.area(poly));
            } catch (e) {}
          }

          const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features });
        }
        bringTacticalLayersToFront();
      }
    };

    const finishPolygon = () => {
      const currentPoints = polygonPointsRef.current;
      if (currentPoints.length < 3) return;
      setIsPolygonFinished(true);
      isPolygonFinishedRef.current = true;

      const closedRing = [...currentPoints, currentPoints[0]];
      const poly = turf.polygon([closedRing]);
      const line = turf.lineString(closedRing); // Perímetro neón cerrado
      const pointFeatures = currentPoints.map(p => turf.point(p));
      const features: any[] = [...pointFeatures, line]; // SOLO LÍNEAS Y PUNTOS - SIN RELLENO INTERIOR

      const sqMeters = turf.area(poly);
      setTotalArea(sqMeters);

      const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
      if (src) src.setData({ type: 'FeatureCollection', features });

      try {
        const maskData = turf.mask(poly);
        const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
        if (maskSrc) maskSrc.setData(maskData);
      } catch (e) { }

      const bbox = turf.bbox(poly) as [number, number, number, number];
      const currentPitch = typeof map.getPitch === 'function' ? map.getPitch() : 0;
      map.fitBounds(bbox, { padding: 90, pitch: currentPitch > 0 ? currentPitch : 45, duration: 1200 });
      bringTacticalLayersToFront();
    };

    const handleRightClick = (e: mapboxgl.MapMouseEvent) => {
      if (activeToolRef.current === 'polygon') {
        e.preventDefault();
        finishPolygon();
      }
    };

    const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
      if (activeToolRef.current === 'polygon') {
        e.preventDefault();
        finishPolygon();
      }
    };

    map.on('mousemove', handleMouseMove);
    map.on('click', handleMapClick);
    map.on('contextmenu', handleRightClick);
    map.on('dblclick', handleDblClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('click', handleMapClick);
      map.off('contextmenu', handleRightClick);
      map.off('dblclick', handleDblClick);
      if (map.getCanvas()) map.getCanvas().style.cursor = '';
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
    };
  }, [map, activeTool, measurePoints, bufferRadius, bringTacticalLayersToFront, isPolygonFinished]);

  // Si hay elementos seleccionados y la herramienta buffer está activa
  useEffect(() => {
    if (!map || activeTool !== 'buffer' || !selectedFeatures.length) return;
    const selected = selectedFeatures[0];
    if (selected?.geometry) {
      try {
        let center: any = null;
        if (selected.geometry.type === 'Point') {
          center = selected.geometry.coordinates;
        } else {
          const bbox = turf.bbox(selected);
          center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
        }
        if (center) {
          const point = turf.point(center);
          const buffered = turf.buffer(point, bufferRadius, { units: 'kilometers' });
          const src = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
          if (src && buffered) src.setData({ type: 'FeatureCollection', features: [buffered] });
        }
      } catch (e) {
        console.warn("Error generando cobertura:", e);
      }
    }
  }, [map, activeTool, bufferRadius, selectedFeatures]);

  const handleClearAll = () => {
    setActiveTool('none');
    setMeasurePoints([]);
    setPolygonPoints([]);
    setTotalDistance(0);
    setTotalArea(0);

    if (map) {
      const measureSrc = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
      if (measureSrc) measureSrc.setData({ type: 'FeatureCollection', features: [] });

      const bufferSrc = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
      if (bufferSrc) bufferSrc.setData({ type: 'FeatureCollection', features: [] });

      const polySrc = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
      if (polySrc) polySrc.setData({ type: 'FeatureCollection', features: [] });

      const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
      if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  const downloadGeoJSON = () => {
    if (polygonPoints.length < 3) return;
    try {
      const closedRing = [...polygonPoints, polygonPoints[0]];
      const poly = turf.polygon([closedRing], {
        nombre: "Zona Táctica Trazada SOGNE",
        area_km2: Number((totalArea / 1000000).toFixed(2)),
        area_ha: Number((totalArea / 10000).toFixed(1)),
        vertices_count: polygonPoints.length,
        fecha_creacion: new Date().toISOString()
      });
      const geojsonObj = {
        type: "FeatureCollection",
        features: [poly]
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojsonObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `zona_tactica_${Date.now()}.geojson`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.warn("Error exportando GeoJSON:", e);
    }
  };

  const handleExportPDFReport = () => {
    exportPDFUtil(isExportingPDF, setIsExportingPDF);
  };

  const isLight = theme === 'light';
  const bufferArea = (Math.PI * Math.pow(bufferRadius, 2)).toFixed(2);

  return (
    <div className="absolute top-4 left-24 z-30 flex items-center gap-2 select-none flex-wrap max-w-[calc(100vw-120px)]">
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
        isLight ? 'bg-white/90 border-slate-300' : 'bg-slate-900/90 border-white/10'
      }`}>
        
        {/* Botón Medidor */}
        <button
          onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'measure'
              ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Regla de Medición de Distancia"
        >
          <Ruler size={14} />
          <span className="hidden md:inline">MEDIR</span>
        </button>

        {/* Botón Cobertura (Buffer) */}
        <button
          onClick={() => setActiveTool(activeTool === 'buffer' ? 'none' : 'buffer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'buffer'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Radio de Cobertura / Anillo Táctico Circular"
        >
          <CircleDot size={14} />
          <span className="hidden md:inline">RADIO COBERTURA</span>
        </button>

        {/* Botón Trazar Polígono / Área */}
        <button
          onClick={() => setActiveTool(activeTool === 'polygon' ? 'none' : 'polygon')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'polygon'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Trazar Polígono y Calcular Área Personalizada"
        >
          <Shapes size={14} />
          <span className="hidden md:inline">TRAZAR ÁREA</span>
        </button>

        {/* Botón Mapa de Calor (Heatmap) */}
        <button
          onClick={toggleHeatmap}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            isHeatmapActive
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title={isHeatmapActive ? "Desactivar Mapa de Calor" : "Activar Mapa de Calor de Incidencias"}
        >
          <Flame size={14} className={isHeatmapActive ? "text-amber-300" : ""} />
          <span className="hidden md:inline">MAPA DE CALOR</span>
        </button>

        {/* Botón Vista 3D Táctica */}
        <button
          onClick={toggle3D}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            is3DActive
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-black'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title={is3DActive ? "Desactivar Perspectiva 3D" : "Activar Perspectiva 3D y Edificaciones"}
        >
          <Box size={14} className={is3DActive ? "text-slate-950" : "text-cyan-400"} />
          <span className="hidden md:inline">VISTA 3D</span>
        </button>

        {/* Botón Limpiar */}
        {(activeTool !== 'none' || measurePoints.length > 0 || polygonPoints.length > 0) && (
          <button
            onClick={handleClearAll}
            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Limpiar herramientas tácticas"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Info Flotante de Medición */}
      {activeTool === 'measure' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-lg text-[11px] font-mono font-bold animate-in fade-in slide-in-from-left-2 ${
          isLight ? 'bg-white/95 border-sky-300 text-sky-800' : 'bg-slate-900/95 border-sky-500/40 text-sky-400'
        }`}>
          <span>Distancia: {totalDistance < 1 ? `${(totalDistance * 1000).toFixed(0)} m` : `${totalDistance.toFixed(2)} km`}</span>
          {measurePoints.length > 0 && (
            <button onClick={() => {
              setMeasurePoints([]);
              setTotalDistance(0);
              const src = map?.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
              if (src) src.setData({ type: 'FeatureCollection', features: [] });
            }} className="text-slate-400 hover:text-white ml-1 cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Selector de Radio de Cobertura */}
      {activeTool === 'buffer' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-lg text-[11px] font-bold animate-in fade-in slide-in-from-left-2 ${
          isLight ? 'bg-white/95 border-purple-300 text-purple-800' : 'bg-slate-900/95 border-purple-500/40 text-purple-300'
        }`}>
          <span>Radio:</span>
          {[0.5, 1, 3, 5, 10].map(r => (
            <button
              key={r}
              onClick={() => setBufferRadius(r)}
              className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                bufferRadius === r ? 'bg-purple-600 text-white font-bold' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {r} km
            </button>
          ))}
          <span className="text-[10px] opacity-80 border-l border-white/20 pl-2">Área: {bufferArea} km²</span>
        </div>
      )}

      {/* Info Flotante de Trazado de Área (Polígono) */}
      {activeTool === 'polygon' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-2xl text-[11px] font-mono font-bold animate-in fade-in slide-in-from-left-2 flex-wrap ${
          isLight ? 'bg-white/95 border-emerald-300 text-emerald-800' : 'bg-slate-900/95 border-emerald-500/50 text-emerald-400'
        }`}>
          <span>
            {polygonPoints.length === 0
              ? 'Haz clic en el mapa para iniciar trazado'
              : isPolygonFinished
              ? `Área Cerrada (${polygonPoints.length} vértices): ${(totalArea / 1000000).toFixed(2)} km² (${(totalArea / 10000).toFixed(1)} ha)`
              : `Vértices: ${polygonPoints.length} | Área aprox: ${(totalArea / 1000000).toFixed(2)} km² (Clic derecho / Doble clic para cerrar)`}
          </span>

          {polygonPoints.length >= 3 && !isPolygonFinished && (
            <button 
              onClick={() => {
                if (!map || polygonPoints.length < 3) return;
                setIsPolygonFinished(true);
                const closedRing = [...polygonPoints, polygonPoints[0]];
                const poly = turf.polygon([closedRing]);
                const bbox = turf.bbox(poly) as [number, number, number, number];
                const currentPitch = typeof map.getPitch === 'function' ? map.getPitch() : 0;
                map.fitBounds(bbox, { padding: 90, pitch: currentPitch > 0 ? currentPitch : 45, duration: 1200 });

                const maskData = turf.mask(poly);
                const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
                if (maskSrc) maskSrc.setData(maskData);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer ml-1"
              title="Cerrar polígono y enfocar área"
            >
              CERRAR Y ENFOCAR
            </button>
          )}

          {polygonPoints.length >= 3 && (
            <div className="flex items-center gap-1.5 ml-1 border-l border-white/20 pl-2">
              <button
                onClick={downloadGeoJSON}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1"
                title="Descargar datos trazados como archivo GeoJSON"
              >
                <FileJson size={12} />
                <span>Exportar GeoJSON</span>
              </button>

              <button
                onClick={handleExportPDFReport}
                disabled={isExportingPDF}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] cursor-pointer flex items-center gap-1"
                title="Descargar reporte PDF con captura del mapa"
              >
                <FileText size={12} />
                <span>{isExportingPDF ? 'Generando PDF...' : 'Reporte PDF'}</span>
              </button>
            </div>
          )}

          {polygonPoints.length > 0 && (
            <button onClick={() => {
              setPolygonPoints([]);
              setIsPolygonFinished(false);
              setTotalArea(0);
              const src = map?.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
              if (src) src.setData({ type: 'FeatureCollection', features: [] });
              const maskSrc = map?.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
              if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });
            }} className="text-slate-400 hover:text-white ml-1 cursor-pointer" title="Reiniciar polígono">
              <X size={12} />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
