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
      <div className="w-full h-full flex items-center justify-center bg-slate-950 text-cyan-400 font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="tracking-widest uppercase text-slate-400">INICIALIZANDO MOTOR CARTOGRÁFICO SOGNE...</span>
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