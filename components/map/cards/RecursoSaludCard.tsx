// cards/RecursoSaludCard.tsx
"use client";
import React from 'react';

interface RecursoSaludCardProps {
  f: any;
  onRemove: (feature: any) => void;
  recursosConfig: Array<{ id: string; label: string; color: string }>;
  estadisticasIncidentes?: Record<string, number>;
  estadisticasTrafico?: Record<string, number>;
}

export const RecursoSaludCard = ({ 
  f, 
  onRemove, 
  recursosConfig,
  estadisticasIncidentes = {},
  estadisticasTrafico = {}
}: RecursoSaludCardProps) => {
  const p = f.properties || {};
  const tipo = p.tipo || p.tipo_recurso || 'hospital';
  const config = recursosConfig.find(r => r.id === tipo || r.label === tipo);
  const color = config?.color || '#60a5fa';
  
  const nombre = p.nombre || p.name || p.establecimiento || 'Recurso de Salud';
  const direccion = p.direccion || p.address || p.ubicacion;
  const telefono = p.telefono || p.phone;
  const nivel = p.nivel || p.tipo_nivel || 'No especificado';
  const municipio = p.municipio || p.city || p.ciudad;

  // Obtener estadísticas del municipio
  const incidentesEnMunicipio = municipio ? (estadisticasIncidentes[municipio.toLowerCase()] || 0) : 0;
  const traficoEnMunicipio = municipio ? (estadisticasTrafico[municipio.toLowerCase()] || 0) : 0;

  return (
    <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-5 relative overflow-hidden group">
      {/* Barra de color lateral */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
      />
      
      <button 
        onClick={() => onRemove(f)} 
        className="absolute top-4 right-4 text-white/20 hover:text-rose-500 transition-colors z-10"
      >
        ✕
      </button>

      {/* Tipo de Recurso */}
      <div className="flex items-center gap-2 mb-3 bg-white w-max px-3 py-1 rounded-full shadow-sm">
        <img 
          src={config?.id === 'hospitales' ? '/hospital.png' : config?.id === 'clinicas' ? '/clinica.png' : config?.id === 'ambulatorios' ? '/ambulatorio.png' : '/centrosalud.png'} 
          className="w-5 h-5 object-contain" 
          alt={tipo} 
        />
        <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{color}}>
          {config?.label || tipo}
        </p>
      </div>

      {/* Nombre */}
      <h4 className="text-xl font-black text-white uppercase italic leading-tight mb-3">
        {nombre}
      </h4>

      {/* Información del Recurso */}
      <div className="space-y-2 mb-4">
        {municipio && (
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-[10px]">📍</span>
            <span className="text-[11px] text-slate-300 font-mono break-all">
              {municipio}
            </span>
          </div>
        )}
        
        {direccion && (
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-[10px]">🏥</span>
            <span className="text-[11px] text-slate-300 font-mono break-all">
              {direccion}
            </span>
          </div>
        )}
        
        {telefono && (
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-[10px]">📞</span>
            <span className="text-[11px] text-slate-300 font-mono">
              {telefono}
            </span>
          </div>
        )}
        
        {nivel && (
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-[10px]">🏷️</span>
            <span className="text-[11px] text-slate-300 font-mono">
              Nivel: {nivel}
            </span>
          </div>
        )}
      </div>

      {/* Estadísticas de Seguridad del Municipio */}
      {municipio && (incidentesEnMunicipio > 0 || traficoEnMunicipio > 0) && (
        <div className="border-t border-white/10 pt-3 mt-2">
          <p className="text-[8px] text-slate-500 uppercase tracking-[0.15em] mb-2">
            ESTADÍSTICAS MUNICIPALES
          </p>
          <div className="flex gap-3 text-[10px]">
            {incidentesEnMunicipio > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-rose-500">⚠️</span>
                <span className="text-slate-300">{incidentesEnMunicipio} incidentes</span>
              </div>
            )}
            {traficoEnMunicipio > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-amber-500">🚗</span>
                <span className="text-slate-300">{traficoEnMunicipio} reportes</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};