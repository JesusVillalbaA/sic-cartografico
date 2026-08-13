"use client";
import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MenuLateral } from '../components/Menu/MenuLateral';

// Carga dinámica de MapaCentral sin SSR para máxima velocidad de compilación y renderizado
const MapaCentral = dynamic(
  () => import('../components/map/MapaCentral').then((mod) => mod.MapaCentral),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#030712] text-cyan-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-14 h-14 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.3)]">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.6)_360deg)] animate-spin" />
            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center z-10">
              <img src="/Municipios.png" alt="SOGNE" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_cyan]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black tracking-[0.25em] uppercase text-cyan-300 block">
              SISTEMA SOGNE • REDIMAIN
            </span>
            <span className="text-[10px] text-slate-400 font-mono block animate-pulse">
              Iniciando motor de Geointeligencia... Por favor espere...
            </span>
          </div>
        </div>
      </div>
    ),
  }
);

export default function DespachadorPage() {
  const zonaReporteRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('dark');

  const [layersVisible, setLayersVisible] = useState({
    // Capas Base
    municipios: false,
    parroquias: false,
    sectores: false,
    cuadrantes: false,
    cuadrantesPoligonos: false,
    compas: false,

    // ZONAS
    zonasDeRiesgo: {
      delitosComunes: false,
      areaCibernetica: false,
      concentraciones: false,
    },
    geocalizaciones: {
      drogas: false,
      actorInteres: false,
      puntoInteres: false,
    },
    bandasDelictivas: false,

    // Infraestructura
    hospitales: false,
    clinicas: false,
    ambulatorios: false,
    cdi: false,
    estaciones: false,
    centrosVotacion: false,

    // Servicios básicos
    servicioAgua: {
      desalinizadoras: false,
      tratamiento: false,
      bombeoServidas: false,
      bombeoPotable: false,
      tanques: false,
      diques: false,
      pozos: false,
      clorado: false,
      parales: false,
      embalses: false,
    },
    estacionesGas: false,
    sistemasElectricos: false,

    // Antenas
    antenasDigitel: false,
    antenasMovistar: false,
    antenasMovilnet: false,

    // Transporte
    paradasPasajeros: false,
    terminales: false,
    recorridoBusesPublicos: false,
    mototaxis: false,
    taxis: false,
    recorridoBusesPrivados: false,

    // Gestión
    generarClave: false
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggle = (layer: string) => {
    setLayersVisible(prev => {
      if (layer.includes('.')) {
        const [parent, child] = layer.split('.');
        const parentKey = parent as keyof typeof prev;
        const currentParent = (prev[parentKey] || {}) as Record<string, boolean>;
        return {
          ...prev,
          [parentKey]: {
            ...currentParent,
            [child]: !currentParent[child]
          }
        };
      }
      return {
        ...prev,
        [layer]: !prev[layer as keyof typeof prev]
      };
    });
  };

  return (
    <div className="flex h-[100dvh] w-screen bg-slate-950 overflow-hidden relative">
      {/* Botón Hamburguesa Móvil */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden absolute top-4 left-4 z-40 p-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-xl cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <MenuLateral 
        layersVisible={layersVisible} 
        onToggle={handleToggle} 
        mapRef={zonaReporteRef}
        theme={theme}
        setTheme={setTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main ref={zonaReporteRef} className={`flex-1 relative ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'}`}>
        <MapaCentral key={theme} theme={theme} layersVisible={layersVisible} />
      </main>
    </div>
  );
}