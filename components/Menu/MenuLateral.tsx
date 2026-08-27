"use client";
import React, { useState } from 'react';
import { MenuLogo } from './MenuLogo';
import { MenuItem } from './MenuItem';
import { ChevronDown, KeyRound, Sun, Moon } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalExito, ModalError, ModalCarga, ModalAccesoDenegado } from './ModalsBasicos';
import { ModalCrearUsuario } from './ModalCrearUsuario';
import { ModalGenerarCodigo } from './ModalGenerarCodigo';

export const MenuLateral = ({ layersVisible, onToggle, mapRef, theme, setTheme, isMobileMenuOpen, setIsMobileMenuOpen }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModalUsuario, setShowModalUsuario] = useState(false);
  const [showAccesoDenegado, setShowAccesoDenegado] = useState(false);
  
  const [showExito, setShowExito] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showCarga, setShowCarga] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeCarga, setMensajeCarga] = useState('');
  
  // Estados para despliegue de secciones
  const [showCapas, setShowCapas] = useState(false);
  const [showZonas, setShowZonas] = useState(false);
  const [showCuadranteOptions, setShowCuadranteOptions] = useState(false);
  const [showInfraestructura, setShowInfraestructura] = useState(false);
  const [showServiciosBasicos, setShowServiciosBasicos] = useState(false);
  const [showAntenas, setShowAntenas] = useState(false);
  const [showTransporte, setShowTransporte] = useState(false);
  const [showConppas, setShowConppas] = useState(false);
  const [showGestion, setShowGestion] = useState(false);

  const [showZonasRiesgoSub, setShowZonasRiesgoSub] = useState(false);
  const [showGeocalizacionesSub, setShowGeocalizacionesSub] = useState(false);
  const [showTransportePublicoSub, setShowTransportePublicoSub] = useState(false);
  const [showTransportePrivadoSub, setShowTransportePrivadoSub] = useState(false);
  const [showServicioAguaSub, setShowServicioAguaSub] = useState(false);

  const [userRol, setUserRol] = useState('REDES');
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const isMenuOpen = isHovered || isMobileMenuOpen;

  const isAnySubmenuOpen = showCapas || showZonas || showCuadranteOptions || showInfraestructura || showServiciosBasicos || showAntenas || showTransporte || showConppas || showGestion || showServicioAguaSub;

  const onToggleSub = (categoria: string, subcategoria: string) => {
    onToggle(`${categoria}.${subcategoria}`);
  };

  const showExitoModal = (mensaje: string) => {
    setMensajeExito(mensaje);
    setShowExito(true);
    setTimeout(() => setShowExito(false), 3000);
  };

  const showErrorModal = (mensaje: string) => {
    setMensajeError(mensaje);
    setShowError(true);
  };

  const showCargaModal = (mensaje: string) => {
    setMensajeCarga(mensaje);
    setShowCarga(true);
  };

  const hideCargaModal = () => setShowCarga(false);

  const handleOpenCrearUsuario = () => {
    if (userRol === 'REDES') setShowModalUsuario(true);
    else setShowAccesoDenegado(true);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
    });
  };

  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    showCargaModal('Generando reporte PDF...');
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      try {
        const logo = await loadImage('/logo.png');
        doc.addImage(logo, 'PNG', 15, 10, 20, 20);
      } catch (e) { console.warn("Logo no disponible"); }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("SOGNE", 40, 22);
      doc.setFontSize(10);
      doc.text("REPORTE OPERATIVO - ESTADO NUEVA ESPARTA", 40, 30);

      if (mapRef?.current) {
        // Obtenemos el canvas original de Mapbox
        const mapboxCanvas = mapRef.current.querySelector('.mapboxgl-canvas') as HTMLCanvasElement;
        
        if (mapboxCanvas) {
          const imgData = mapboxCanvas.toDataURL('image/png');
          // Añadimos la captura del mapa al PDF
          doc.addImage(imgData, 'PNG', 15, 40, 180, 100);
          doc.setDrawColor(203, 213, 225);
          doc.rect(15, 40, 180, 100);
        }
      }

      // == CAPAS ACTIVAS ==
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.text("Resumen de Capas Activas", 15, 150);
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      
      const activeLayers: string[] = [];
      const extractActive = (obj: Record<string, unknown>, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'boolean' && value) {
            activeLayers.push(`${prefix}${key}`);
          } else if (typeof value === 'object' && value !== null) {
            extractActive(value as Record<string, unknown>, `${key} > `);
          }
        });
      };
      extractActive(layersVisible);
      
      let yPos = 160;
      if (activeLayers.length === 0) {
        doc.text("Ninguna capa activa.", 15, yPos);
        yPos += 10;
      } else {
        const layersText = doc.splitTextToSize(activeLayers.join(', '), 180);
        doc.text(layersText, 15, yPos);
        yPos += (layersText.length * 5) + 10;
      }

      // == INFORMACIÓN DE PANELES ==
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Información de Elementos (Paneles)", 15, yPos);
      yPos += 10;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      
      const panelContent = document.getElementById('analysis-panel-content');
      if (panelContent && panelContent.innerText.trim().length > 0) {
        // Limpiamos un poco el texto (quitar botones '✕', saltos excesivos)
        let text = panelContent.innerText
          .replace(/✕/g, '')
          .replace(/\n\s*\n/g, '\n')
          .trim();
          
        const lines = doc.splitTextToSize(text, 180);
        
        // Si el texto es muy largo, lo cortamos para que quepa en la primera página o lo paginamos
        for (let i = 0; i < lines.length; i++) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(lines[i], 15, yPos);
          yPos += 5;
        }
      } else {
        doc.text("No hay elementos seleccionados en el mapa.", 15, yPos);
      }

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generado por SOGNE REDIMAIN - ${new Date().toLocaleString()}`, 15, 287);
      doc.save(`Reporte_SOGNE_${Date.now()}.pdf`);
      
      hideCargaModal();
      showExitoModal('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error("Error PDF:", error);
      hideCargaModal();
      showErrorModal('Error al generar el reporte PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMouseLeave = () => {
    if (isLockedOpen || isAnySubmenuOpen) return;
    setIsHovered(false);
    setShowCapas(false);
    setShowZonas(false);
    setShowCuadranteOptions(false);
    setShowInfraestructura(false);
    setShowServiciosBasicos(false);
    setShowAntenas(false);
    setShowTransporte(false);
    setShowConppas(false);
    setShowGestion(false);
    setShowZonasRiesgoSub(false);
    setShowGeocalizacionesSub(false);
    setShowTransportePublicoSub(false);
    setShowTransportePrivadoSub(false);
    setShowServicioAguaSub(false);
  };

  const forceCloseMenu = () => {
    setIsLockedOpen(false);
    setIsHovered(false);
    setShowCapas(false);
    setShowZonas(false);
    setShowCuadranteOptions(false);
    setShowInfraestructura(false);
    setShowServiciosBasicos(false);
    setShowAntenas(false);
    setShowTransporte(false);
    setShowConppas(false);
    setShowGestion(false);
    setShowZonasRiesgoSub(false);
    setShowGeocalizacionesSub(false);
    setShowTransportePublicoSub(false);
    setShowTransportePrivadoSub(false);
    setShowServicioAguaSub(false);
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={`fixed md:relative h-dvh ${theme === 'light' ? 'bg-[#0ea5e9]/95 menu-light' : 'bg-slate-950'} border-r border-white/10 transition-all duration-700 ease-in-out flex flex-col z-50 overflow-hidden transform md:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isHovered || isMobileMenuOpen ? 'w-[85vw] md:w-80 shadow-[40px_0_100px_rgba(0,0,0,0.9)]' : 'w-20'
        }`}
      >
        <div className={`shrink-0 transition-all duration-700 ${isHovered || isMobileMenuOpen ? 'mt-8 mb-4 relative' : 'mt-6 mb-12'}`}>
          <MenuLogo isHovered={isHovered || isMobileMenuOpen} />
          {(isHovered || isMobileMenuOpen) && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isLockedOpen || isAnySubmenuOpen) {
                  forceCloseMenu();
                } else {
                  setIsLockedOpen(true);
                }
              }}
              className="absolute top-0 right-4 p-2 text-white/30 hover:text-white transition-colors"
              title={isLockedOpen || isAnySubmenuOpen ? "Forzar cierre del menú" : "Fijar menú abierto"}
            >
              {isLockedOpen || isAnySubmenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              )}
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-start overflow-y-auto px-2 mini-menu-scrollbar transition-all duration-300">
          <nav className="w-full space-y-6 pb-10">
            
            {/* ==================== CAPAS BASE ==================== */}
            <div className="space-y-3">
              <button 
                onClick={() => isMenuOpen && setShowCapas(!showCapas)}
                className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${
                  isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'
                } ${showCapas ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}
              >
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/Capas.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Capas" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>CAPAS BASE</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showCapas ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showCapas && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2 animate-in slide-in-from-top-4 fade-in duration-500">
                  <MenuItem theme={theme} iconSrc="/Municipios.png" label="MUNICIPIOS" active={layersVisible.municipios} accentColor="#3b82f6" isHovered={isMenuOpen} onClick={() => onToggle('municipios')} />
                  <MenuItem theme={theme} iconSrc="/parroquia.png" label="PARROQUIAS" active={layersVisible.parroquias} accentColor="#ec4899" isHovered={isMenuOpen} onClick={() => onToggle('parroquias')} />
                  <MenuItem theme={theme} iconSrc="/Sectores.png" label="SECTORES" active={layersVisible.sectores} accentColor="#10b981" isHovered={isMenuOpen} onClick={() => onToggle('sectores')} />
                  <MenuItem theme={theme} iconSrc="/Cuadrantes.png" label="CUADRANTES" active={layersVisible.compas} accentColor="#f59e0b" isHovered={isMenuOpen} onClick={() => onToggle('compas')} />
                </div>
              )}
            </div>

            {/* ==================== ZONAS ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowZonas(!showZonas)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showZonas ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/zonas.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Zonas" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>ZONAS</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showZonas ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showZonas && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  
                  {/* ZONAS DE RIESGO */}
                  <div>
                    <div onClick={() => setShowZonasRiesgoSub(!showZonasRiesgoSub)} className="cursor-pointer">
                      <MenuItem theme={theme} 
                        iconSrc="/Zonapeligro.png" 
                        label="ZONAS DE RIESGO" 
                        active={layersVisible.zonasDeRiesgo ? Object.values(layersVisible.zonasDeRiesgo).some(v => v) : false} 
                        accentColor="#ef4444" 
                        isHovered={isMenuOpen} 
                        onClick={() => {}}
                      />
                    </div>
                    {showZonasRiesgoSub && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-left-2 duration-300">
                        <button onClick={() => onToggleSub('zonasDeRiesgo', 'delitosComunes')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.zonasDeRiesgo?.delitosComunes ? 'text-red-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/delitos.png" className="w-4 h-4 object-contain" alt="Delitos" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Delitos comunes</span>
                        </button>
                        <button onClick={() => onToggleSub('zonasDeRiesgo', 'areaCibernetica')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.zonasDeRiesgo?.areaCibernetica ? 'text-red-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/hacker.png" className="w-4 h-4 object-contain" alt="Cibernética" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Área cibernética</span>
                        </button>
                        <button onClick={() => onToggleSub('zonasDeRiesgo', 'concentraciones')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.zonasDeRiesgo?.concentraciones ? 'text-red-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/concentracion.png" className="w-4 h-4 object-contain" alt="Concentraciones" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Concentraciones</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* GEOCALIZACIONES (nuevo) */}
                  <div>
                    <div onClick={() => setShowGeocalizacionesSub(!showGeocalizacionesSub)} className="cursor-pointer">
                      <MenuItem theme={theme} 
                        iconSrc="/zonadroga.png" 
                        label="GEOCALIZACIONES" 
                        active={layersVisible.geocalizaciones ? Object.values(layersVisible.geocalizaciones).some(v => v) : false} 
                        accentColor="#a855f7" 
                        isHovered={isMenuOpen} 
                        onClick={() => {}}
                      />
                    </div>
                    {showGeocalizacionesSub && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-left-2 duration-300">
                        <button onClick={() => onToggleSub('geocalizaciones', 'drogas')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.geocalizaciones?.drogas ? 'text-purple-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/drogas.png" className="w-4 h-4 object-contain" alt="Drogas" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Drogas</span>
                        </button>
                        <button onClick={() => onToggleSub('geocalizaciones', 'actorInteres')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.geocalizaciones?.actorInteres ? 'text-purple-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/actor.png" className="w-4 h-4 object-contain" alt="Actor de interés" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Actor de interés</span>
                        </button>
                        <button onClick={() => onToggleSub('geocalizaciones', 'puntoInteres')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.geocalizaciones?.puntoInteres ? 'text-purple-500' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/punto.png" className="w-4 h-4 object-contain" alt="Punto de interés" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest">Punto de interés</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* GRUPOS DELICTIVOS */}
                  <MenuItem theme={theme} 
                    iconSrc="/banda.png" 
                    label="GRUPOS DELICTIVOS" 
                    active={layersVisible.bandasDelictivas} 
                    accentColor="#f97316" 
                    isHovered={isMenuOpen} 
                    onClick={() => onToggle('bandasDelictivas')} 
                  />
                </div>
              )}
            </div>

            <div className="px-6"><hr className="border-white/10" /></div>

            {/* ==================== INFRAESTRUCTURA ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowInfraestructura(!showInfraestructura)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showInfraestructura ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/infraestructura.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Infraestructura" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>INFRAESTRUCTURA</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showInfraestructura ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showInfraestructura && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  <MenuItem theme={theme} iconSrc="/hospital.png" label="HOSPITALES" active={layersVisible.hospitales} accentColor="#6366f1" isHovered={isMenuOpen} onClick={() => onToggle('hospitales')} />
                  <MenuItem theme={theme} iconSrc="/clinica.png" label="CLÍNICAS" active={layersVisible.clinicas} accentColor="#0ea5e9" isHovered={isMenuOpen} onClick={() => onToggle('clinicas')} />
                  <MenuItem theme={theme} iconSrc="/ambulatorio.png" label="AMBULATORIOS" active={layersVisible.ambulatorios} accentColor="#f43f5e" isHovered={isMenuOpen} onClick={() => onToggle('ambulatorios')} />
                  <MenuItem theme={theme} iconSrc="/dispensario.png" label="CDI" active={layersVisible.cdi} accentColor="#d946ef" isHovered={isMenuOpen} onClick={() => onToggle('cdi')} />
                  <MenuItem theme={theme} iconSrc="/gasolinera.png" label="ESTACIONES DE SERVICIO" active={layersVisible.estaciones} accentColor="#f97316" isHovered={isMenuOpen} onClick={() => onToggle('estaciones')} />
                  <MenuItem theme={theme} iconSrc="/social.png" label="ESCUELAS" active={layersVisible.escuelas} accentColor="#d946ef" isHovered={isMenuOpen} onClick={() => onToggle('escuelas')} />
                </div>
              )}
            </div>

            {/* ==================== SERVICIOS BÁSICOS ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowServiciosBasicos(!showServiciosBasicos)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showServiciosBasicos ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/serviciobasico.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Servicios Básicos" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>SERVICIOS BÁSICOS</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showServiciosBasicos ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showServiciosBasicos && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  <div>
                    <div onClick={() => setShowServicioAguaSub(!showServicioAguaSub)} className="cursor-pointer">
                      <MenuItem theme={theme} iconSrc="/agua.png" label="SERVICIO DE AGUA" active={layersVisible.servicioAgua ? Object.values(layersVisible.servicioAgua).some(v => v) : false} accentColor="#0ea5e9" isHovered={isMenuOpen} onClick={() => {}} />
                    </div>
                    {showServicioAguaSub && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-left-2 duration-300">
                        <button onClick={() => onToggleSub('servicioAgua', 'desalinizadoras')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.desalinizadoras ? 'text-sky-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Desalinizadoras" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Desalinizadoras</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'tratamiento')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.tratamiento ? 'text-teal-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Tratamiento" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Plantas de Tratamiento</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'bombeoServidas')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.bombeoServidas ? 'text-amber-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="E/B Aguas Servidas" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">E/B Aguas Servidas</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'bombeoPotable')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.bombeoPotable ? 'text-sky-400 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="E/B Agua Potable" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">E/B Agua Potable</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'tanques')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.tanques ? 'text-blue-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Tanques" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Tanques de Almacenamiento</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'diques')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.diques ? 'text-emerald-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Diques" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Diques y Tomas</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'pozos')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.pozos ? 'text-cyan-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Pozos" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Pozos Agua Potable</span>
                        </button>

                        <button onClick={() => onToggleSub('servicioAgua', 'clorado')} className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${layersVisible.servicioAgua?.clorado ? 'text-yellow-500 font-black' : (theme === 'light' ? 'text-[#172554]/70 hover:text-[#172554]' : 'text-slate-500 hover:text-slate-300')}`}>
                          <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                            <img src="/agua.png" className="w-4 h-4 object-contain" alt="Estaciones de Clorado" />
                          </div>
                          <span className="text-[10px] font-bold tracking-wider">Estaciones de Clorado</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <MenuItem theme={theme} iconSrc="/gas.png" label="ESTACIONES DE GAS" active={layersVisible.estacionesGas} accentColor="#f59e0b" isHovered={isMenuOpen} onClick={() => onToggle('estacionesGas')} />
                  <MenuItem theme={theme} iconSrc="/electricidad.png" label="SUB-ESTACIONES ELÉCTRICAS" active={layersVisible.sistemasElectricos} accentColor="#facc15" isHovered={isMenuOpen} onClick={() => onToggle('sistemasElectricos')} />
                </div>
              )}
            </div>

            {/* ==================== ANTENAS ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowAntenas(!showAntenas)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showAntenas ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/antena.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Antenas" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>ANTENAS</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showAntenas ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showAntenas && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  <MenuItem theme={theme} iconSrc="/digitel.png" label="DIGITEL" active={layersVisible.antenasDigitel} accentColor="#8b5cf6" isHovered={isMenuOpen} onClick={() => onToggle('antenasDigitel')} />
                  <MenuItem theme={theme} iconSrc="/movistar.png" label="MOVISTAR" active={layersVisible.antenasMovistar} accentColor="#06b6d4" isHovered={isMenuOpen} onClick={() => onToggle('antenasMovistar')} />
                  <MenuItem theme={theme} iconSrc="/movilnet.png" label="MOVILNET" active={layersVisible.antenasMovilnet} accentColor="#10b981" isHovered={isMenuOpen} onClick={() => onToggle('antenasMovilnet')} />
                </div>
              )}
            </div>

            {/* ==================== TRANSPORTE (PÚBLICO Y PRIVADO) ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowTransporte(!showTransporte)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showTransporte ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/transporte.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="Transporte" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>TRANSPORTE</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showTransporte ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showTransporte && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  
                  <MenuItem theme={theme} iconSrc="/transporte_publico.png" label="TERMINALES Y PARADAS" active={layersVisible.transporteGeneral} accentColor="#0ea5e9" isHovered={isMenuOpen} onClick={() => onToggle('transporteGeneral')} />
                </div>
              )}
            </div>

            {/* ==================== CONPPAS (SECTOR PESQUERO) ==================== */}
            <div className="space-y-3">
              <button 
                onClick={() => isMenuOpen && setShowConppas(!showConppas)} 
                className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showConppas ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}
              >
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <img src="/hidrografia.png" className="w-7 h-7 object-contain transition-transform duration-500 group-hover:rotate-12" alt="CONPPAS" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex flex-col text-left">
                      <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>CONPPAS</span>
                      <span className="text-[9px] font-bold text-cyan-400 font-mono tracking-wider">PESCA Y ACUICULTURA</span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showConppas ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showConppas && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2 animate-in slide-in-from-top-4 fade-in duration-500">
                  <MenuItem 
                    theme={theme} 
                    iconSrc="/hidrografia.png" 
                    label="PUERTOS Y CONPPAS (52)" 
                    active={layersVisible.conppas} 
                    accentColor="#06b6d4" 
                    isHovered={isMenuOpen} 
                    onClick={() => onToggle('conppas')} 
                  />
                </div>
              )}
            </div>

            <div className="px-6"><hr className="border-white/10" /></div>

            {/* ==================== GESTIÓN ==================== */}
            <div className="space-y-3">
              <button onClick={() => isMenuOpen && setShowGestion(!showGestion)} className={`w-full flex items-center transition-all duration-500 group relative overflow-hidden ${isMenuOpen ? 'gap-4 p-4 rounded-3xl mx-1' : 'justify-center py-4'} ${showGestion ? 'bg-white/10 shadow-xl' : 'hover:bg-white/5'}`}>
                <div className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isMenuOpen ? 'w-11 h-11' : 'w-14 h-14'} bg-white/90 group-hover:bg-white group-hover:scale-105 shadow-lg`}>
                  <KeyRound className="w-6 h-6 text-slate-800 transition-transform duration-500 group-hover:rotate-12" />
                </div>
                {isMenuOpen && (
                  <div className="flex-1 flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-500">
                    <span className={`text-[13px] font-black tracking-[0.15em] transition-colors ${theme === 'light' ? 'text-[#172554] group-hover:text-[#172554]' : 'text-slate-400 group-hover:text-white'}`}>GESTIÓN</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-slate-500 ${showGestion ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </button>
              {isMenuOpen && showGestion && (
                <div className="ml-8 space-y-3 border-l-2 border-white/5 pl-4 mt-2">
                  <MenuItem theme={theme} iconSrc="/usuario.png" label="CREAR USUARIO" active={showModalUsuario} accentColor="#10b981" isHovered={isMenuOpen} onClick={handleOpenCrearUsuario} />
                  <MenuItem theme={theme} iconSrc="/codigo.png" label="GENERAR CÓDIGO" active={layersVisible.generarClave} accentColor="#06b6d4" isHovered={isMenuOpen} onClick={() => { if (userRol === 'REDES') onToggle('generarClave'); else setShowAccesoDenegado(true); }} />
                  <MenuItem theme={theme} iconSrc="/pdf.png" label={isGenerating ? "SINCRONIZANDO..." : "GENERAR REPORTE"} active={false} accentColor="#f59e0b" isHovered={isMenuOpen} onClick={handleGeneratePDF} />
                </div>
              )}
            </div>

          </nav>
          
          {/* Map Style Toggle */}
          <div className={`mt-4 mb-2 flex justify-center transition-all duration-500 ${isHovered ? 'px-4' : 'px-0'}`}>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`flex items-center justify-center gap-2 rounded-full p-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all ${isHovered ? 'w-full' : 'w-10 h-10'}`}
              title={theme === 'dark' ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-sky-300" />
              )}
              {(isHovered || isMobileMenuOpen) && <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#172554]' : 'text-slate-300'}`}>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>}
            </button>
          </div>
        </div>

      </aside>

      <ModalExito isOpen={showExito} onClose={() => setShowExito(false)} mensaje={mensajeExito} />
      <ModalError isOpen={showError} onClose={() => setShowError(false)} mensaje={mensajeError} />
      <ModalCarga isOpen={showCarga} mensaje={mensajeCarga} />
      <ModalAccesoDenegado isOpen={showAccesoDenegado} onClose={() => setShowAccesoDenegado(false)} />
      
      <ModalCrearUsuario 
        isOpen={showModalUsuario} 
        onClose={() => setShowModalUsuario(false)}
        onShowExito={showExitoModal}
        onShowError={showErrorModal}
        onShowCarga={showCargaModal}
        onHideCarga={hideCargaModal}
        userRol={userRol}
      />
      <ModalGenerarCodigo 
        isOpen={!!layersVisible.generarClave} 
        onClose={() => onToggle('generarClave')} 
      />
    </>
  );
};