"use client";
import Image from 'next/image';

export const MenuItem = ({ iconSrc, label, active, isHovered, accentColor, onClick, theme }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${
      isHovered ? 'gap-4 p-3.5 rounded-4xl mx-1' : 'justify-center py-3'
    } ${active ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5'}`}
  >
    {/* 1. Indicador lateral - Barra Neon refinada */}
    {active && isHovered && (
      <div 
        className="absolute left-0 w-1.5 h-10 rounded-r-full animate-pulse transition-all duration-500 z-10"
        style={{ 
          backgroundColor: accentColor, 
          boxShadow: `0 0 15px ${accentColor}, 0 0 30px ${accentColor}` 
        }}
      />
    )}

    {/* 2. Círculo Blanco - Tamaño optimizado */}
    <div 
      className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isHovered ? 'w-12 h-12' : 'w-14 h-14' 
      } ${
        active 
          ? 'bg-white scale-105' 
          : 'bg-white/90 group-hover:bg-white group-hover:scale-110'
      }`}
      style={{ 
        boxShadow: active 
          ? `0 0 25px ${accentColor}` 
          : '0 6px 12px -4px rgba(0,0,0,0.4)',
        border: active ? `2.5px solid ${accentColor}` : 'none'
      }}
    >
      {/* Icono (w-7.5 h-7.5) */}
      <div className={`relative w-7.5 h-7.5 transition-transform duration-500 ${active ? 'animate-[wiggle_1.5s_infinite]' : 'group-hover:rotate-12'}`}>
        <Image 
          src={iconSrc} 
          alt={label} 
          fill 
          sizes="30px"
          className="object-contain p-0.5" 
          priority
        />
      </div>

      {/* Onda de choque sutil */}
      {active && (
        <div 
          className="absolute inset-0 rounded-full animate-[ping_2.5s_infinite] opacity-30" 
          style={{ backgroundColor: accentColor }} 
        />
      )}
    </div>
    
    {/* 3. Texto Principal - Legible y estilizado */}
    {isHovered && (
      <div className="flex-1 flex flex-col items-start overflow-hidden animate-in fade-in slide-in-from-left-3">
        <span className={`menu-item-text text-[14px] font-black tracking-[0.12em] transition-all duration-300 ${
          active 
            ? (theme === 'light' ? 'text-[#172554] translate-x-1' : 'text-white translate-x-1') 
            : (theme === 'light' ? 'text-[#172554]/80 group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-slate-100')
        }`}>
          {label}
        </span>
        
        {active && (
          <div className="flex items-center gap-2 mt-0.5 translate-x-1">
            <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-70" style={{ color: theme === 'light' ? '#172554' : accentColor }}>
              Sincronizado
            </span>
          </div>
        )}
      </div>
    )}

    {/* 4. Tooltip Flotante (Cuando el menú está colapsado) */}
    {!isHovered && (
      <div className="absolute left-20 bg-white text-black text-[11px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0 pointer-events-none whitespace-nowrap z-50 shadow-2xl">
        <div className="absolute -left-1 w-2 h-2 bg-white rotate-45 top-1/2 -translate-y-1/2" />
        {label}
      </div>
    )}

    {/* 5. Reflejo de cristal rápido */}
    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

    <style jsx>{`
      @keyframes wiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
      }
    `}</style>
  </button>
);