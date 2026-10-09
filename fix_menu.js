const fs = require('fs');
const content = use client;
import React, { useState } from 'react';
import { Sun, Moon, Layers, Building2, Zap, Map as MapIcon, Pin, PinOff } from 'lucide-react';
import { MenuItem } from './MenuItem';

export const MenuLateral = ({ layersVisible, onToggle, theme, setTheme, isMobileMenuOpen, setIsMobileMenuOpen }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isMenuOpen = isHovered || isPinned || isMobileMenuOpen;

  return (
    <>
      {/* Overlay movil */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={\ixed md:relative z-50 h-[100dvh] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r shadow-2xl flex flex-col \ backdrop-blur-2xl \ \\}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Encabezado del Menú */}
        <div className="pt-8 pb-4 flex flex-col items-center transition-all duration-500 group cursor-pointer relative">
          
          {isMenuOpen && (
            <button 
              onClick={() => setIsPinned(!isPinned)}
              className="absolute top-2 right-4 p-1.5 rounded-full text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors z-20"
              title={isPinned ? "Desfijar Menú" : "Fijar Menú"}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} className="rotate-45" />}
            </button>
          )}

          {/* Contenedor del Logo Animado */}
          <div className={\elative flex items-center justify-center transition-all duration-700 ease-out \ group-hover:scale-110\}>
            <div className="absolute inset-[-4px] rounded-full border border-blue-500/30 border-dashed animate-[spin_10s_linear_infinite] opacity-50 group-hover:border-blue-400/80" />
            <div className="absolute inset-[-8px] rounded-full border border-indigo-500/20 border-dotted animate-[spin_15s_linear_infinite_reverse] opacity-30 group-hover:border-indigo-400/60" />
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-400/40 transition-colors duration-500" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center overflow-hidden border border-white/10 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-all duration-500">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_3s_infinite]" />
              <MapIcon size={isMenuOpen ? 32 : 24} className="relative z-10 transition-transform duration-700 group-hover:rotate-[360deg] text-blue-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          
          {/* Textos Mejorados e Inteligibles */}
          {isMenuOpen && (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-90 slide-in-from-top-2 duration-700 overflow-hidden px-4">
              <h1 className="text-4xl font-black tracking-tighter leading-none relative group-hover:scale-105 transition-transform duration-500">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite] drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  SIC
                </span>
              </h1>
              
              <div className="relative h-px w-16 my-2 overflow-hidden rounded-full opacity-50 group-hover:w-24 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_10px_#3b82f6]" />
              </div>
              
              <span className="text-xs sm:text-sm text-blue-200 font-bold tracking-widest uppercase mt-1 drop-shadow-md">
                Cartografía Digital
              </span>
            </div>
          )}
        </div>

        <div className="px-4"><hr className={\my-2 \\} /></div>

        {/* Contenedor de Capas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
          
          {/* GRUPO: CAPAS BASE */}
          <div className="mb-6 px-2">
            {isMenuOpen ? (
              <div className="flex items-center gap-2 mb-3 px-3">
                <Layers size={14} className="text-blue-500" />
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Divisiones Base</span>
              </div>
            ) : (
              <div className="flex justify-center mb-2" title="Capas Base"><Layers size={18} className="text-blue-500" /></div>
            )}
            <div className={\space-y-1 \\}>
              <MenuItem theme={theme} iconSrc="/Municipios.png" label="MUNICIPIOS" active={layersVisible.municipios} accentColor="#3b82f6" isHovered={isMenuOpen} onClick={() => onToggle('municipios')} />
              <MenuItem theme={theme} iconSrc="/parroquia.png" label="PARROQUIAS" active={layersVisible.parroquias} accentColor="#ec4899" isHovered={isMenuOpen} onClick={() => onToggle('parroquias')} />
              <MenuItem theme={theme} iconSrc="/Sectores.png" label="SECTORES" active={layersVisible.sectores} accentColor="#10b981" isHovered={isMenuOpen} onClick={() => onToggle('sectores')} />
            </div>
          </div>

          {/* GRUPO: INFRAESTRUCTURA Y SALUD */}
          <div className="mb-6 px-2">
            {isMenuOpen ? (
              <div className="flex items-center gap-2 mb-3 px-3">
                <Building2 size={14} className="text-indigo-500" />
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Salud e Infra</span>
              </div>
            ) : (
              <div className="flex justify-center mb-2" title="Infraestructura"><Building2 size={18} className="text-indigo-500" /></div>
            )}
            <div className={\space-y-1 \\}>
              <MenuItem theme={theme} iconSrc="/hospital.png" label="HOSPITALES" active={layersVisible.hospitales} accentColor="#6366f1" isHovered={isMenuOpen} onClick={() => onToggle('hospitales')} />
              <MenuItem theme={theme} iconSrc="/clinica.png" label="CLÍNICAS" active={layersVisible.clinicas} accentColor="#0ea5e9" isHovered={isMenuOpen} onClick={() => onToggle('clinicas')} />
              <MenuItem theme={theme} iconSrc="/ambulatorio.png" label="AMBULATORIOS" active={layersVisible.ambulatorios} accentColor="#f43f5e" isHovered={isMenuOpen} onClick={() => onToggle('ambulatorios')} />
              <MenuItem theme={theme} iconSrc="/dispensario.png" label="CDI" active={layersVisible.cdi} accentColor="#d946ef" isHovered={isMenuOpen} onClick={() => onToggle('cdi')} />
              <MenuItem theme={theme} iconSrc="/gasolinera.png" label="GASOLINERAS" active={layersVisible.estaciones} accentColor="#f97316" isHovered={isMenuOpen} onClick={() => onToggle('estaciones')} />
            </div>
          </div>

          {/* GRUPO: SERVICIOS */}
          <div className="mb-4 px-2">
            {isMenuOpen ? (
              <div className="flex items-center gap-2 mb-3 px-3">
                <Zap size={14} className="text-amber-500" />
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">Servicios Básicos</span>
              </div>
            ) : (
              <div className="flex justify-center mb-2" title="Servicios Básicos"><Zap size={18} className="text-amber-500" /></div>
            )}
            <div className={\space-y-1 \\}>
              <MenuItem theme={theme} iconSrc="/gas.png" label="PLANTAS DE GAS" active={layersVisible.estacionesGas} accentColor="#f59e0b" isHovered={isMenuOpen} onClick={() => onToggle('estacionesGas')} />
              <MenuItem theme={theme} iconSrc="/electricidad.png" label="ELÉCTRICO" active={layersVisible.sistemasElectricos} accentColor="#facc15" isHovered={isMenuOpen} onClick={() => onToggle('sistemasElectricos')} />
            </div>
          </div>

        </div>

        <div className="px-4"><hr className={\my-2 \\} /></div>

        {/* Footer (Tema) */}
        <div className="pb-6 pt-2 px-3 flex justify-center">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className={\lex items-center gap-3 p-3 rounded-2xl transition-all w-full cursor-pointer overflow-hidden \\}
            title="Cambiar Tema"
          >
            <div className="shrink-0 flex items-center justify-center">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            {isMenuOpen && (
              <span className="text-sm font-bold tracking-wide whitespace-nowrap animate-in fade-in duration-300">
                Tema {theme === 'light' ? 'Oscuro' : 'Claro'}
              </span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
};;
fs.writeFileSync('c:/Users/jesus/sic-sistema-cartografico/components/Menu/MenuLateral.tsx', "\" + content.substring(1), 'utf8');
