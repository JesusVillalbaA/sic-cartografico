"use client";
import Image from 'next/image';

export const MenuLogo = ({ isHovered }: { isHovered: boolean }) => (
  <div className={`pt-4 flex flex-col items-center transition-all duration-500`}>
    
    {/* Contenedor del Logo - Reducido mb-6 a mb-4 */}
    <div className={`relative transition-all ease-out animate-in fade-in zoom-in-50 duration-1000 ${
      isHovered ? 'w-24 h-24 mb-4' : 'w-14 h-14'
    }`}>
      
      {/* Aura de fondo */}
      <div className="absolute inset-0 bg-blue-600/30 blur-[35px] rounded-full animate-[pulse_3s_ease-in-out_infinite] opacity-70" />
      
      {/* Anillo Giratorio */}
      {isHovered && (
        <div className="absolute -inset-2 border-2 border-dashed border-blue-400/20 rounded-full animate-[spin_20s_linear_infinite] opacity-50" />
      )}

      {/* Imagen del Logo */}
      <div className="relative w-full h-full group">
        <Image 
          src="/logo.png" 
          alt="SOGNE Logo" 
          fill 
          priority 
          sizes="(max-width: 768px) 56px, 96px" 
          className="object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.7)] transition-transform duration-700 ease-out group-hover:rotate-360 group-hover:scale-110" 
        />
      </div>
    </div>

    {/* Bloque de Textos - Ajustado slide-in y espaciados */}
    {isHovered && (
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-90 slide-in-from-top-4 duration-700 logo-preserve">
        
        {/* SIGDI - Reducido un poco de 6xl a 5xl para ganar espacio vertical */}
        <h1 className="text-5xl font-black tracking-tighter text-white leading-none relative">
          <span className="relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] animate-[textPulse_4s_ease-in-out_infinite]">
            SOGNE
          </span>
          <span className="absolute inset-0 text-white blur-md opacity-50 select-none">SOGNE</span>
          <span className="absolute inset-0 text-blue-500 blur-[30px] opacity-40 select-none animate-pulse">SOGNE</span>
        </h1>
        
        {/* Línea Divisora - Reducido my-5 a my-3 */}
        <div className="relative h-0.5 w-24 my-3 overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-slate-800" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-400 to-transparent animate-[shimmer_2s_infinite] shadow-[0_0_15px_#3b82f6]" />
        </div>
        
        {/* Nueva Esparta */}
        <span className="text-[13px] text-blue-300 font-black tracking-[0.6em] uppercase italic drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
          Nueva Esparta
        </span>
      </div>
    )}
  </div>
);