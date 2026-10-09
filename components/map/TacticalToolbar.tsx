"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Ruler, Box, Download, Cpu } from 'lucide-react';
import { exportMapToPDF } from '@/app/lib/exportMapPDF';

interface TacticalToolbarProps {
  map: mapboxgl.Map | null;
  theme?: 'dark' | 'light';
  selectedFeatures?: any[];
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({ map, theme = 'dark', selectedFeatures = [] }) => {
  const [activeTool, setActiveTool] = useState<'none' | 'measure'>('none');
  const [is3DActive, setIs3DActive] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const measurePointsRef = useRef<number[][]>([]);
  const lineGeoJSONRef = useRef<any>({ type: 'FeatureCollection', features: [] });

  const isLight = theme === 'light';

  const toggleMeasure = () => {
    setActiveTool(prev => prev === 'measure' ? 'none' : 'measure');
  };

  useEffect(() => {
    if (!map) return;

    const onClick = (e: any) => {
      if (activeTool !== 'measure') return;
      
      const coords = [e.lngLat.lng, e.lngLat.lat];
      measurePointsRef.current.push(coords);

      lineGeoJSONRef.current = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: measurePointsRef.current },
          properties: {}
        }]
      };

      if (map.getSource('measure-source')) {
        (map.getSource('measure-source') as any).setData(lineGeoJSONRef.current);
      }
    };

    if (activeTool === 'measure') {
      map.getCanvas().style.cursor = 'crosshair';
      map.on('click', onClick);

      if (!map.getSource('measure-source')) {
        map.addSource('measure-source', { type: 'geojson', data: lineGeoJSONRef.current });
        map.addLayer({
          id: 'measure-line',
          type: 'line',
          source: 'measure-source',
          paint: { 'line-color': '#0ea5e9', 'line-width': 3, 'line-dasharray': [2, 1] }
        });
      }
    } else {
      map.getCanvas().style.cursor = '';
      map.off('click', onClick);
      measurePointsRef.current = [];
      lineGeoJSONRef.current = { type: 'FeatureCollection', features: [] };
      if (map.getSource('measure-source')) {
        (map.getSource('measure-source') as any).setData(lineGeoJSONRef.current);
      }
    }

    return () => {
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, activeTool]);


  const toggle3D = () => {
    if (!map) return;
    setIs3DActive(prev => {
      const next = !prev;
      if (next) {
        map.easeTo({ pitch: 65, bearing: 15, duration: 2500, curve: 1 });
      } else {
        map.easeTo({ pitch: 0, bearing: 0, duration: 1500 });
      }
      return next;
    });
  };

  const handleExportPDF = async () => {
    if (!map) return;
    setIsExportingPDF(true);
    try {
      await exportMapToPDF(map, selectedFeatures);
    } catch (e) {
      console.error(e);
    }
    setIsExportingPDF(false);
  };

  return (
    <>
      <div className="absolute top-16 md:top-4 left-4 md:left-24 z-30 flex items-center gap-2 select-none flex-wrap max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-120px)]">
        
        <div className={`flex items-center p-1 rounded-2xl backdrop-blur-md border shadow-lg transition-all duration-300 ${
          isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/80 border-blue-500/20 shadow-blue-900/20'
        }`}>
          
          <button
            onClick={toggleMeasure}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
              activeTool === 'measure' 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
            }`}
            title="Medir Distancia (Clic en el mapa)"
          >
            <Ruler size={14} />
            <span className="hidden md:inline">MEDIR DISTANCIA</span>
          </button>

          <button
            onClick={toggle3D}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
              is3DActive 
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' 
                : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
            }`}
            title={is3DActive ? "Volver a 2D" : "Activar 3D Táctico"}
          >
            <Box size={14} />
            <span className="hidden md:inline">VISTA 3D</span>
          </button>

          <div className={`w-px h-6 mx-1 ${isLight ? 'bg-slate-300' : 'bg-blue-500/30'}`} />

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
              isExportingPDF
                ? 'bg-slate-600 text-white opacity-75 cursor-wait'
                : (isLight ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30')
            }`}
            title="Generar PDF del Despliegue"
          >
            {isExportingPDF ? <Cpu size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden md:inline">{isExportingPDF ? 'GENERANDO...' : 'EXPORTAR PDF'}</span>
          </button>

        </div>
      </div>

      {activeTool === 'measure' && (
        <div className="absolute top-28 md:top-20 left-4 md:left-24 z-30 bg-blue-950/90 text-blue-300 px-4 py-2 rounded-xl text-xs font-mono font-bold animate-pulse border border-blue-500/30">
          Haz clic en el mapa para trazar una línea
        </div>
      )}
    </>
  );
};
