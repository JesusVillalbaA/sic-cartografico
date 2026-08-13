"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Radio, Layers, Activity, Cpu } from 'lucide-react';

interface TacticalMapLoaderProps {
  isLoading: boolean;
  theme?: 'dark' | 'light';
}

const TACTICAL_MESSAGES = [
  "Iniciando motor cartográfico vectorial y capas geoespaciales...",
  "Cargando 68 Cuadrantes de Paz (COMPAS) y despliegue de seguridad...",
  "Sincronizando 11 Municipios y división político-territorial de Nueva Esparta...",
  "Indexando infraestructura estratégica: Eléctrica, Gas, Agua, Salud y Transporte...",
  "Verificando radiobases y antenas Digitel, Movistar y Movilnet en el estado...",
  "Calibrando centros de respuesta, patrullas y unidades motorizadas...",
  "Estableciendo enlace seguro con el Centro de Mando y Control SOGNE..."
];

export const TacticalMapLoader: React.FC<TacticalMapLoaderProps> = ({ isLoading, theme = 'dark' }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Rotar mensajes tácticos informativos cada 1.6 segundos
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % TACTICAL_MESSAGES.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Simular progreso fluido mientras carga
  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
      setIsFadingOut(false);
      setProgress(15);
      const progTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 94) return prev;
          const inc = Math.floor(Math.random() * 8) + 4;
          return Math.min(prev + inc, 94);
        });
      }, 300);
      return () => clearInterval(progTimer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-600 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        theme === 'light'
          ? 'bg-slate-100/90 backdrop-blur-2xl text-slate-900'
          : 'bg-[#030712]/95 backdrop-blur-2xl text-white'
      }`}
    >
      {/* Fondo con Cuadrícula Táctica y Efecto Radar */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      {/* Halo de luz cian central */}
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Contenedor Central */}
      <div className="relative z-10 max-w-lg w-full mx-4 p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center text-center">
        
        {/* Radar / Logo Animado */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
            {/* Escáner de Radar Giratorio */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.4)_360deg)] animate-[spin_2s_linear_infinite]" />
            <div className="w-20 h-20 rounded-full bg-slate-950/90 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10">
              <img src="/Municipios.png" alt="SOGNE" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_cyan]" onError={(e) => { (e.target as any).style.display = 'none'; }} />
            </div>
          </div>
          {/* Puntos pulsantes orbitales */}
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
        </div>

        {/* Insignia Superior */}
        <div className="flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/40 px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)] mb-3">
          <Cpu size={13} className="text-cyan-400 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
            SISTEMA SOGNE • REDIMAIN
          </span>
        </div>

        {/* Título Principal */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight leading-tight">
          Cargando Geointeligencia
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Centro de Orientación Geoespacial y Comando Estratégico
        </p>

        {/* Barra de Progreso Fluida */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
              <Activity size={12} className="animate-pulse" />
              <span>SINCRONIZANDO DATOS</span>
            </span>
            <span className="text-white font-black">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mensaje Táctico Dinámico que cambia para lectura del usuario */}
        <div className="mt-5 min-h-[48px] flex items-center justify-center p-3 rounded-2xl bg-slate-900/90 border border-white/5 w-full">
          <p key={msgIndex} className="text-[11px] sm:text-xs text-slate-300 font-mono animate-in fade-in zoom-in-95 duration-400 leading-snug">
            {TACTICAL_MESSAGES[msgIndex]}
          </p>
        </div>

        {/* Nota en el pie */}
        <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span>Por favor espere unos segundos • Optimizando entorno</span>
        </div>

      </div>
    </div>
  );
};
