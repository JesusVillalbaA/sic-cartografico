"use client";
import React, { useState } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { GoogleMapsButton } from './GoogleMapsButton';

export const AnalysisPanel = ({ 
  features, 
  onClose, 
  theme,
  onClear 
}: any) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!features || features.length === 0) return null;

  return (
    <div className={`absolute top-20 right-4 md:right-6 w-[calc(100vw-2rem)] md:w-96 max-h-[80vh] flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300 z-40 ${
      theme === 'light' ? 'bg-white text-slate-800 border border-slate-200' : 'bg-slate-900/95 text-white border border-white/10'
    } backdrop-blur-xl ${isMinimized ? 'h-14' : ''}`}>
      {/* HEADER */}
      <div className={`flex items-center justify-between p-3 shrink-0 ${theme === 'light' ? 'bg-slate-100 border-b border-slate-200' : 'bg-slate-800/80 border-b border-white/10'}`}>
        <h3 className="font-bold text-sm tracking-widest text-cyan-500 uppercase">Panel de Detalles</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-black/10 rounded transition-colors">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={onClear || onClose} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {features.map((f: any, idx: number) => {
            const props = f.properties || {};
            // Intentar encontrar un nombre
            const name = props.name || props.nombre || props.NAME || props.NOMBRE || props.adm2_name || props.adm3_name || 'UbicaciÃ³n Registrada';
            
            // Coordenadas
            let lat = 0;
            let lng = 0;
            if (f.geometry?.type === 'Point') {
              lng = f.geometry.coordinates[0];
              lat = f.geometry.coordinates[1];
            } else if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
               // aproxima el centro si es polÃ­gono
               const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0][0] : f.geometry.coordinates[0][0][0];
               if (coords) {
                 lng = coords[0];
                 lat = coords[1];
               }
            }

            return (
              <div key={idx} className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-white/5'}`}>
                <h4 className="font-bold text-lg mb-2">{name}</h4>
                <div className="text-sm opacity-70 mb-4 font-mono">
                  {lat && lng ? `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Coordenadas no disponibles'}
                </div>
                
                {lat !== 0 && lng !== 0 && (
                  <GoogleMapsButton lat={lat} lng={lng} theme={theme} label="Abrir en Google Maps" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
