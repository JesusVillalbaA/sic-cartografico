"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Cpu, CheckCircle2 } from 'lucide-react';

interface TacticalMapLoaderProps {
  isLoading: boolean;
  theme?: 'dark' | 'light';
  progress?: number;
  statusMessage?: string;
}

const TACTICAL_MESSAGES = [
  "Iniciando motor cartográfico vectorial y capas geoespaciales...",
  "Cargando 68 Cuadrantes de Paz (COMPAS) y despliegue de seguridad...",
  "Sincronizando 11 Municipios y división político-territorial...",
  "Indexando infraestructura estratégica: Eléctrica, Gas, Agua y Salud...",
  "Verificando radiobases Digitel, Movistar y Movilnet en Nueva Esparta...",
  "Calibrando centros de respuesta y unidades tácticas...",
  "Estableciendo enlace seguro con el Centro de Mando y Control SOGNE..."
];

export const TacticalMapLoader: React.FC<TacticalMapLoaderProps> = ({ 
  isLoading, 
  theme = 'dark',
  progress: externalProgress,
  statusMessage: externalMessage
}) => {
  const [internalProgress, setInternalProgress] = useState(15);
  const [msgIndex, setMsgIndex] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Rotar mensajes informativos cada 1.8 segundos si no hay mensaje externo
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % TACTICAL_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Manejo de progreso fluido y continuo (NUNCA se queda trabado en 94%)
  useEffect(() => {
    if (externalProgress !== undefined) {
      // Si viene progreso real medido desde useMapbox
      if (externalProgress >= 100 || !isLoading) {
        setInternalProgress(100);
        setIsCompleted(true);
        const timer = setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => setShouldRender(false), 500);
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setInternalProgress(externalProgress);
      }
    } else {
      // Si corre en modo automático fluido
      if (!isLoading) {
        setInternalProgress(100);
        setIsCompleted(true);
        const timer = setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => setShouldRender(false), 500);
        }, 350);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(true);
        setIsFadingOut(false);
        setIsCompleted(false);

        // Incremento asintótico continuo y constante que avanza suavemente hacia 99% sin detenerse nunca
        const interval = setInterval(() => {
          setInternalProgress((prev) => {
            if (prev < 40) return prev + 6;
            if (prev < 70) return prev + 4;
            if (prev < 88) return prev + 2;
            if (prev < 96) return prev + 1;
            if (prev < 99) return prev + 0.5;
            return prev;
          });
        }, 180);

        return () => clearInterval(interval);
      }
    }
  }, [isLoading, externalProgress]);

  if (!shouldRender) return null;

  const currentDisplayProgress = Math.min(100, Math.floor(internalProgress));
  const displayMsg = externalMessage || TACTICAL_MESSAGES[msgIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
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
      <div className="relative z-10 max-w-lg w-full mx-4 p-7 sm:p-8 rounded-3xl bg-slate-950/85 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col items-center text-center">
        
        {/* Radar / Logo Animado */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
            {/* Escáner de Radar Giratorio */}
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.45)_360deg)] animate-[spin_1.8s_linear_infinite]" />
            <div className="w-20 h-20 rounded-full bg-slate-950/90 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] relative z-10">
              <img 
                src="/Municipios.png" 
                alt="SOGNE" 
                className="w-11 h-11 object-contain drop-shadow-[0_0_10px_cyan]" 
                onError={(e) => { (e.target as any).style.display = 'none'; }} 
              />
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
          {isCompleted ? "Geointeligencia Lista" : "Cargando Geointeligencia"}
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Centro de Orientación Geoespacial y Comando Estratégico
        </p>

        {/* Barra de Progreso Fluida en Tiempo Real */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
              {isCompleted ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <Activity size={12} className="animate-pulse text-cyan-400" />
              )}
              <span className={isCompleted ? "text-emerald-400 font-black" : "text-cyan-300"}>
                {isCompleted ? "SISTEMA OPERATIVO Y CONECTADO" : "SINCRONIZANDO ENTORNO GEOESPACIAL"}
              </span>
            </span>
            <span className="text-white font-mono font-black text-xs">
              {currentDisplayProgress}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/15 p-0.5 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-200 ease-out shadow-[0_0_15px_rgba(6,182,212,0.8)] ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400' 
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400'
              }`}
              style={{ width: `${currentDisplayProgress}%` }}
            />
          </div>
        </div>

        {/* Mensaje Táctico Dinámico y Legible */}
        <div className="mt-5 min-h-[50px] flex items-center justify-center p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 w-full">
          <p 
            key={displayMsg} 
            className="text-[11px] sm:text-xs text-slate-200 font-mono animate-in fade-in zoom-in-95 duration-300 leading-snug"
          >
            {displayMsg}
          </p>
        </div>

        {/* Nota de pie */}
        <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'}`} />
          <span>{isCompleted ? "Entorno cartográfico preparado" : "Calibrando capas vectoriales • Por favor espere"}</span>
        </div>

      </div>
    </div>
  );
};
