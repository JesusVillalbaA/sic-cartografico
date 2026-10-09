"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Map as MapIcon, CheckCircle2 } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

interface TacticalMapLoaderProps {
  isLoading: boolean;
  theme?: 'dark' | 'light';
  progress?: number;
  statusMessage?: string;
}

const TACTICAL_MESSAGES = [
  "Iniciando motor cartográfico vectorial...",
  "Cargando municipios, parroquias y sectores...",
  "Indexando infraestructura médica (Hospitales, Clínicas, CDI)...",
  "Sincronizando servicios básicos y estaciones...",
  "Calibrando capas espaciales...",
  "Estableciendo entorno cartográfico digital..."
];

export const TacticalMapLoader: React.FC<TacticalMapLoaderProps> = ({ 
  isLoading, 
  theme = 'dark',
  progress: externalProgress,
  statusMessage: externalMessage
}) => {
  const [percent, setPercent] = useState<number>(5);
  const [msgIndex, setMsgIndex] = useState<number>(0);
  const [shouldRender, setShouldRender] = useState<boolean>(true);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const percentRef = useRef<number>(5);
  const targetPercentRef = useRef<number>(externalProgress || 20);

  useEffect(() => {
    if (!isLoading) {
      targetPercentRef.current = 100;
    } else if (externalProgress) {
      targetPercentRef.current = Math.max(targetPercentRef.current, externalProgress);
    }
  }, [isLoading, externalProgress]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % TACTICAL_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let animFrame: number;

    const updateFrame = () => {
      const current = percentRef.current;
      const target = targetPercentRef.current;

      if (current < target) {
        const diff = target - current;
        const speed = Math.max(0.3, Math.min(1.8, diff * 0.1));
        const next = Math.min(target, current + speed);
        percentRef.current = next;
        setPercent(Math.floor(next));
      } else if (current < 95 && isLoading) {
        const next = current + 0.04;
        percentRef.current = next;
        setPercent(Math.floor(next));
      } else if (current >= 100 && !isCompleted) {
        setPercent(100);
        setIsCompleted(true);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => setShouldRender(false), 450);
        }, 350);
        return;
      }

      animFrame = requestAnimationFrame(updateFrame);
    };

    animFrame = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animFrame);
  }, [isLoading, isCompleted]);

  if (!shouldRender) return null;

  const displayMsg = externalMessage || TACTICAL_MESSAGES[msgIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-450 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      } ${
        theme === 'light'
          ? 'bg-slate-100/90 backdrop-blur-2xl text-slate-900'
          : 'bg-[#030712]/95 backdrop-blur-2xl text-white'
      }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 max-w-lg w-full mx-4 p-7 sm:p-8 rounded-3xl bg-slate-950/85 border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.25)] flex flex-col items-center text-center">
        
        {/* Radar Spinner Sin Logo */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(59,130,246,0.45)_360deg)] animate-[spin_1.6s_linear_infinite]" />
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-blue-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.8)] relative z-10">
               <MapIcon size={24} className="text-blue-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Insignia Superior */}
        <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/40 px-3.5 py-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)] mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
            SIC SISTEMA CARTOGRAFICO DIGITAL
          </span>
        </div>

        {/* Título Principal */}
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight leading-tight">
          {isCompleted ? "Sistema Listo" : "Cargando Sistema"}
        </h2>
        
        {/* Barra de Progreso */}
        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-blue-400 flex items-center gap-1.5 font-bold">
              {isCompleted ? (
                <CheckCircle2 size={12} className="text-indigo-400" />
              ) : (
                <Activity size={12} className="animate-pulse text-blue-400" />
              )}
              <span className={isCompleted ? "text-indigo-400 font-black" : "text-blue-300"}>
                {isCompleted ? "SISTEMA OPERATIVO Y CONECTADO" : "SINCRONIZANDO CARTOGRAFIA"}
              </span>
            </span>
            <span className="text-white font-mono font-black text-xs">
              {percent}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/15 p-0.5 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(59,130,246,0.8)] ${
                isCompleted 
                  ? 'bg-gradient-to-r from-indigo-500 via-blue-400 to-sky-400' 
                  : 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Mensajes Dinámicos */}
        <div className="mt-5 min-h-[50px] flex items-center justify-center p-3.5 rounded-2xl bg-slate-900/90 border border-white/5 w-full">
          <p 
            key={displayMsg} 
            className="text-[11px] sm:text-xs text-slate-200 font-mono animate-in fade-in zoom-in-95 duration-300 leading-snug"
          >
            {displayMsg}
          </p>
        </div>

      </div>
    </div>
  );
};
