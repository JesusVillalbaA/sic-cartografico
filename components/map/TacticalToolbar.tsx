"use client";

import React, { useState, useEffect } from 'react';
import { Ruler, CircleDot, Flame, Trash2, X } from 'lucide-react';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';

interface TacticalToolbarProps {
  map: mapboxgl.Map | null;
  theme?: string;
  selectedFeatures?: any[];
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({ map, theme = 'dark', selectedFeatures = [] }) => {
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'buffer'>('none');
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [bufferRadius, setBufferRadius] = useState<number>(1); // km

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
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': '#38bdf8',
            'line-width': 3,
            'line-dasharray': [2, 2]
          }
        });
        map.addLayer({
          id: 'tactical-measure-points',
          type: 'circle',
          source: 'tactical-measure-source',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#0ea5e9',
            'circle-stroke-width': 2,
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
            'fill-opacity': 0.25,
            'fill-outline-color': '#9333ea'
          }
        });
        map.addLayer({
          id: 'tactical-buffer-line',
          type: 'line',
          source: 'tactical-buffer-source',
          paint: {
            'line-color': '#9333ea',
            'line-width': 2,
            'line-dasharray': [3, 2]
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      setupSources();
    } else {
      map.once('load', setupSources);
    }
  }, [map]);

  // Manejo de Heatmap
  const toggleHeatmap = () => {
    if (!map) return;
    const nextState = !isHeatmapActive;
    setIsHeatmapActive(nextState);
    if (map.getLayer('incidentes-heatmap')) {
      map.setLayoutProperty('incidentes-heatmap', 'visibility', nextState ? 'visible' : 'none');
    }
  };

  // Manejar clics en el mapa según la herramienta activa
  useEffect(() => {
    if (!map || activeTool === 'none') return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (activeTool === 'measure') {
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

      } else if (activeTool === 'buffer') {
        const point = turf.point(coords);
        const buffered = turf.buffer(point, bufferRadius, { units: 'kilometers' });
        const src = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
        if (src && buffered) {
          src.setData({ type: 'FeatureCollection', features: [buffered] });
        }
      }
    };

    map.on('click', handleMapClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      if (map.getCanvas()) map.getCanvas().style.cursor = '';
    };
  }, [map, activeTool, measurePoints, bufferRadius]);

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
    setTotalDistance(0);

    if (map) {
      const measureSrc = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
      if (measureSrc) measureSrc.setData({ type: 'FeatureCollection', features: [] });

      const bufferSrc = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
      if (bufferSrc) bufferSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="absolute top-4 left-24 z-30 flex items-center gap-2 select-none">
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
          title="Radio de Cobertura / Anillo Táctico"
        >
          <CircleDot size={14} />
          <span className="hidden md:inline">RADIO COBERTURA</span>
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

        {/* Botón Limpiar */}
        {(activeTool !== 'none' || measurePoints.length > 0) && (
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
            <button onClick={() => setMeasurePoints([])} className="text-slate-400 hover:text-white ml-1 cursor-pointer">
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
          {[1, 3, 5].map(r => (
            <button
              key={r}
              onClick={() => setBufferRadius(r)}
              className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                bufferRadius === r ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      )}

    </div>
  );
};
