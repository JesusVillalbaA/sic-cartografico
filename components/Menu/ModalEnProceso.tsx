"use client";
import React, { useEffect, useState } from 'react';
import { Sparkles, Compass, Clock, ArrowRight, X, Cpu, ShieldCheck } from 'lucide-react';

interface ModalEnProcesoProps {
  isOpen: boolean;
  onClose: () => void;
  modulo?: string;
  descripcion?: string;
}

export const ModalEnProceso: React.FC<ModalEnProcesoProps> = ({
  isOpen,
  onClose,
  modulo = "Módulo Cartográfico",
  descripcion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center animate-in zoom-in-95 duration-300">
        
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Animación Central de Radar / Engranaje Futurista */}
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Anillos giratorios pulsantes */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-dotted border-indigo-400/40 animate-[spin_12s_linear_infinite_reverse]" />
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-xl animate-pulse" />
            
            {/* Núcleo con Icono */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-white/20">
              <Compass className="w-8 h-8 text-white animate-[pulse_2s_infinite]" />
            </div>

            {/* Badge flotante de estado */}
            <div className="absolute -bottom-2 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-300 animate-bounce">
              <Clock size={10} />
              <span>En Proceso</span>
            </div>
          </div>
        </div>

        {/* Título de la alerta */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
          <Cpu size={12} className="animate-spin text-cyan-400" />
          <span>DESARROLLO CARTOGRÁFICO</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug mb-2">
          En Proceso para la Próxima Actualización
        </h3>

        {/* Nombre del Módulo Destacado */}
        <div className="my-3 py-1.5 px-4 rounded-xl bg-white/5 border border-white/10 inline-block max-w-full truncate">
          <span className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
            {modulo}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6 font-medium">
          {descripcion || "Este apartado se encuentra actualmente en fase de trazado vial y georreferenciación de paradas y terminales. Estará disponible y totalmente operativo en la siguiente versión."}
        </p>

        {/* Barra de progreso animada decorativa */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 mb-6 overflow-hidden border border-white/10 relative">
          <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 h-full rounded-full w-3/4 animate-[shimmer_2s_infinite] relative">
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>

        {/* Botón Aceptar */}
        <button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>ENTENDIDO</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
};

// Hook global para disparar el modal desde cualquier lugar de la app si se desea
export const useModalEnProceso = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modulo, setModulo] = useState('');
  const [descripcion, setDescripcion] = useState<string | undefined>();

  const abrirEnProceso = (nombreModulo: string, desc?: string) => {
    setModulo(nombreModulo);
    setDescripcion(desc);
    setIsOpen(true);
  };

  const cerrarEnProceso = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleGlobalEvent = (e: any) => {
      const { modulo: mod, descripcion: desc } = e.detail || {};
      abrirEnProceso(mod || "Módulo en Desarrollo", desc);
    };
    window.addEventListener('sigdi_en_proceso', handleGlobalEvent);
    return () => window.removeEventListener('sigdi_en_proceso', handleGlobalEvent);
  }, []);

  return {
    isOpen,
    modulo,
    descripcion,
    abrirEnProceso,
    cerrarEnProceso
  };
};
