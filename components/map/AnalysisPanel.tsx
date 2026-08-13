"use client";
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Minimize2, Maximize2, X, ChevronDown, Layers } from 'lucide-react';

// Importación de Componentes de Tarjetas
import { MunicipioCard } from './cards/MunicipioCard';
import { SectorCard } from './cards/SectorCard';
import { CuadrantePuntoCard } from './cards/CuadrantePuntoCard';
import { CuadranteAreaCard } from './cards/CuadranteAreaCard';
import { IncidenteCard } from './cards/IncidenteCard';
import { InteligenciaCard } from './cards/InteligenciaCard';
import { SaludCard } from './cards/SaludCard';
import { ParroquiaCard } from './cards/ParroquiaCard';
import { EstacionServicioCard } from './cards/EstacionServicioCard';
import { IapolepneCard } from './cards/IapolepneCard';
import { CiberneticaCard } from './cards/CiberneticaCard';
import { ConcentracionCard } from './cards/ConcentracionCard';
import { DrogasCard } from './cards/DrogasCard';
import { ActorInteresCard } from './cards/ActorInteresCard';
import { PuntoInteresCard } from './cards/PuntoInteresCard';
import { AntenaCard } from './cards/AntenaCard';
import { ElectricoCard } from './cards/ElectricoCard';
import { EmbalseCard } from './cards/EmbalseCard';
import { EstacionGasCard } from './cards/EstacionGasCard';
import { EscuelaCard } from './cards/EscuelaCard';
import { TransporteCard } from './cards/TransporteCard';

const normalizeText = (text: string) =>
  text?.toLowerCase()
    .replace(/municipio/g, '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim() || "";

// ─── Tipos de feature ────────────────────────────────────────────────────────
function detectType(f: any) {
  const p = f.properties || {};
  const layerId = (f.layer?.id || "").toLowerCase();
  const geo = f.geometry?.type;

  // Sistemas eléctricos y agua
  if (layerId === 'sistemas-electricos-layer' || p.gpxx_Categ?.includes('ELECTRICAS') || p.wptx1_Cate?.includes('ELECTRICAS') || p.link?.includes('thunder')) return 'sistemasElectricos';
  if (layerId.includes('embalse') || p.institution !== undefined || p.Afluencia !== undefined || p.Embalse !== undefined || p["Superficie del embalse"] !== undefined || (p.gpxx_Categ && p.gpxx_Categ.includes('AGUA'))) return 'estacionesAgua';
  if (layerId === 'estaciones-gas-layer' || layerId === 'estaciones-gas-labels' || (p.empresa && p.tipo && p.estatus && layerId.includes('gas'))) return 'estacionGas';
  if (layerId === 'escuelas-layer' || layerId.includes('escuela')) return 'escuela';

  if (layerId.includes('poligono') || layerId === 'poligonos-fill' || layerId === 'poligonos-line') {
    return geo === 'Point' ? 'cuadrantePunto' : 'cuadranteArea';
  }
  if (layerId === 'parroquias-fill' || layerId === 'parroquias-line' || p.adm3_name !== undefined) return 'parroquia';
  if (layerId.includes('municipio')) return 'municipio';
  if (layerId.includes('antena') || layerId.includes('digitel') || layerId.includes('movilnet') || layerId.includes('movistar') || layerId === 'antenas-digitel-layer' || layerId === 'antenas-movilnet-layer' || layerId === 'antenas-movistar-layer') return 'antena';
  if (layerId.includes('cibernetica') || layerId === 'cibernetica-incidente-layer') return 'cibernetica';
  if (layerId.includes('concentracion') || layerId === 'concentraciones-incidente-layer') return 'concentracion';
  if (layerId === 'incidencias-riesgo-layer' || p.id_incidencia) return 'incidente';
  if (layerId === 'drogas-trafico-layer') return 'drogas';
  if (layerId === 'actores-layer' || p.id_persona_interes) return 'actor';
  if (layerId === 'puntos-interes-layer') return 'puntoInteres';
  if (layerId.includes('banda') || layerId.includes('gedo') || layerId === 'grupos-bandas-layer') return 'banda';
  if (layerId.includes('hospital') || layerId.includes('clinica') || layerId.includes('ambulatorio') || layerId.includes('cdi') ||
    p.tipo === 'hospital' || p.tipo === 'clinica' || p.tipo === 'ambulatorio' || p.tipo === 'cdi') return 'salud';
  if (layerId === 'estaciones-layer' || layerId === 'estaciones-labels' || p.NAME?.toUpperCase().includes('E/S')) return 'estacion';
  if (layerId.includes('iapole') || p.institucion === 'IAPOLEPNE') return 'iapolepne';
  if ((layerId.includes('sector') || layerId === 'sectores-api') && !p.id_incidencia) return 'sector';
  if (layerId.includes('cuadrante') || layerId.includes('compas') || p.cuadrante !== undefined) {
    return geo === 'Point' ? 'cuadrantePunto' : 'cuadranteArea';
  }
  if (layerId.includes('transporte') || p.CATEGORIA || p.NOMBRE_ENTIDAD || p.linea) return 'transporte';
  return 'fallback';
}

// ─── Necesidades de datos por tipo ───────────────────────────────────────────
type DataNeeds = {
  cuadrantesGeoData?: any;
  densidadData?: any[];
  redSaludMaster?: any[];
  incidentesDB?: any[];
  traficoDB?: any[];
  zonasDB?: any[];
  bandasOrganizadasMaster?: any[];
  sujetosDB?: any[];
  usuariosDB?: any[];
  puntosDB?: any[];
  personasDB?: any[];
};

const DATA_NEEDS: Record<string, (keyof DataNeeds)[]> = {
  municipio: ['cuadrantesGeoData', 'densidadData', 'redSaludMaster', 'incidentesDB', 'traficoDB', 'puntosDB', 'personasDB', 'zonasDB', 'bandasOrganizadasMaster'],
  sector: ['incidentesDB', 'zonasDB', 'bandasOrganizadasMaster', 'puntosDB', 'personasDB'],
  incidente: ['incidentesDB', 'traficoDB', 'sujetosDB', 'usuariosDB'],
  banda: ['bandasOrganizadasMaster', 'zonasDB'],
  sistemasElectricos: [],
  estacionesAgua: [],
  estacionGas: [],
  parroquia: ['incidentesDB', 'puntosDB', 'personasDB', 'zonasDB', 'bandasOrganizadasMaster'],
  cibernetica: ['sujetosDB'],
  concentracion: [],
  drogas: [],
  actor: [],
  puntoInteres: [],
  salud: [],
  estacion: [],
  iapolepne: [],
  escuela: [],
  cuadrantePunto: ['cuadrantesGeoData'],
  cuadranteArea: [],
  transporte: [],
  fallback: [],
};

// ─── Loaders de datos ─────────────────────────────────────────────────────────
const dataCache: Partial<DataNeeds> = {};
const loadingKeys = new Set<string>();

async function loadKey(key: keyof DataNeeds): Promise<void> {
  if (dataCache[key] !== undefined || loadingKeys.has(key)) return;
  loadingKeys.add(key);
  try {
    switch (key) {
      case 'cuadrantesGeoData': {
        const r = await fetch('/cuadrantes.geojson');
        dataCache.cuadrantesGeoData = await r.json();
        break;
      }
      case 'densidadData': {
        const r = await fetch('/densidadpersonas.json');
        dataCache.densidadData = await r.json();
        break;
      }
      case 'redSaludMaster': {
        const [h, c, d, a] = await Promise.all([
          fetch('/hospitales.geojson').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/clinicas.geojson').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/cdi.geojson').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/ambulatorios.geojson').then(r => r.json()).catch(() => ({ features: [] })),
        ]);
        dataCache.redSaludMaster = [
          ...(h.features || []).map((f: any) => ({ ...f, tipo_red: 'Hospital' })),
          ...(c.features || []).map((f: any) => ({ ...f, tipo_red: 'Clínica' })),
          ...(d.features || []).map((f: any) => ({ ...f, tipo_red: 'CDI' })),
          ...(a.features || []).map((f: any) => ({ ...f, tipo_red: 'Ambulatorio' })),
        ];
        break;
      }
      case 'incidentesDB': {
        const { data } = await supabase.from('incidencias').select('*, incidencia_fotos(url_foto)');
        dataCache.incidentesDB = data || [];
        break;
      }
      case 'traficoDB': {
        const { data } = await supabase.from('puntos_interes').select('*').eq('tipo_punto', 'traff_droga');
        dataCache.traficoDB = data || [];
        break;
      }
      case 'puntosDB': {
        const { data } = await supabase.from('puntos_interes').select('*');
        dataCache.puntosDB = data || [];
        break;
      }
      case 'personasDB': {
        const { data } = await supabase.from('personas_interes').select('*');
        dataCache.personasDB = data || [];
        break;
      }
      case 'zonasDB': {
        const { data } = await supabase.from('zonas_influencia_banda').select('*');
        dataCache.zonasDB = data || [];
        break;
      }
      case 'bandasOrganizadasMaster': {
        const { data } = await supabase.from('grupos_delictivos').select('*');
        dataCache.bandasOrganizadasMaster = data || [];
        break;
      }
      case 'sujetosDB': {
        const { data } = await supabase.from('personas_interes').select('*');
        dataCache.sujetosDB = data || [];
        break;
      }
      case 'usuariosDB': {
        const { data } = await supabase.from('usuarios_maestra').select('*');
        dataCache.usuariosDB = data || [];
        break;
      }
    }
  } catch (e) {
    console.warn(`[AnalysisPanel] Error cargando ${key}:`, e);
  } finally {
    loadingKeys.delete(key);
  }
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export const AnalysisPanel = ({ features, onRemove, onClear, mapRef, theme, onOpenDiagrama }: any) => {
  const [loadedData, setLoadedData] = useState<Partial<DataNeeds>>({});
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [isContainerMinimized, setIsContainerMinimized] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al inicio cuando cambia o se añade un nuevo panel
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [features]);

  // Determinar qué claves de datos se necesitan para las features actualmente visibles
  const requiredKeys = useMemo(() => {
    const keys = new Set<keyof DataNeeds>();
    features.forEach((f: any) => {
      const type = detectType(f);
      (DATA_NEEDS[type] || []).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [features]);

  // Cargar sólo lo que falta bajo demanda
  useEffect(() => {
    const missing = requiredKeys.filter(k => dataCache[k] === undefined);
    if (missing.length === 0) {
      const snap: DataNeeds = {};
      requiredKeys.forEach(k => { (snap as any)[k] = dataCache[k]; });
      setLoadedData(snap);
      return;
    }

    setLoadingItems(new Set(missing));
    Promise.all(missing.map(k => loadKey(k as keyof DataNeeds))).then(() => {
      const snap: DataNeeds = {};
      requiredKeys.forEach(k => { (snap as any)[k] = dataCache[k]; });
      setLoadedData(snap);
      setLoadingItems(new Set());
    });
  }, [requiredKeys.join(',')]);

  const getIncidentesPorMunicipio = useMemo(() => {
    if (!Array.isArray(loadedData.incidentesDB)) return {};
    return loadedData.incidentesDB.reduce((acc: Record<string, number>, curr: any) => {
      const mun = normalizeText(curr.municipio);
      if (mun) acc[mun] = (acc[mun] || 0) + 1;
      return acc;
    }, {});
  }, [loadedData.incidentesDB]);

  const getTraficoPorMunicipio = useMemo(() => {
    if (!Array.isArray(loadedData.traficoDB)) return {};
    return loadedData.traficoDB.reduce((acc: Record<string, number>, curr: any) => {
      const mun = normalizeText(curr.municipio);
      if (mun) acc[mun] = (acc[mun] || 0) + 1;
      return acc;
    }, {});
  }, [loadedData.traficoDB]);

  const getSectoresFromMap = (municipioNombre: string) => {
    if (!mapRef || typeof mapRef.queryRenderedFeatures !== 'function') return [];
    const target = normalizeText(municipioNombre);
    return mapRef.queryRenderedFeatures({ layers: ['sectores-api'] })
      .filter((f: any) => {
        const parent = normalizeText(f.properties?.municipality || f.properties?.parent || "");
        return parent.includes(target) || target.includes(parent);
      })
      .map((f: any) => f.properties?.name || f.properties?.name_en)
      .filter(Boolean);
  };

  if (features.length === 0) return null;

  const isLoadingAny = loadingItems.size > 0;
  const hasMunicipio = features.some((f: any) => detectType(f) === 'municipio');

  // ── MODO CONTENEDOR MINIMIZADO (Permite zoom y navegación total en el mapa) ──
  if (isContainerMinimized) {
    const firstFeature = features[0]?.properties || {};
    const label = features.length === 1 
      ? (firstFeature.nombre || firstFeature.name || firstFeature.adm2_name || firstFeature.SECTOR || 'Elemento')
      : `${features.length} PANELES ACTIVOS`;

    return (
      <div className="fixed top-24 right-6 z-40 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className={`p-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-2xl transition-all ${
          theme === 'light' 
            ? 'bg-white/95 border-slate-300 text-slate-800' 
            : 'bg-slate-950/95 border-cyan-500/40 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]'
        }`}>
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => setIsContainerMinimized(false)}
            title="Hacer clic para expandir panel"
          >
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_cyan]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-300 leading-none">
                SOGNE • PANEL MINIMIZADO
              </span>
              <span className="text-xs font-black text-white truncate max-w-[210px] mt-0.5 group-hover:text-cyan-200 transition-colors">
                {label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <button
              onClick={() => setIsContainerMinimized(false)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Expandir Panel Completo"
            >
              <Maximize2 size={13} />
              <span>Expandir</span>
            </button>
            <button
              onClick={onClear}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all border border-white/10 hover:border-rose-500/40 cursor-pointer"
              title="Cerrar y Limpiar Todo"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MODO CONTENEDOR EXPANDIDO ──
  return (
    <div className={`fixed bottom-0 left-0 right-0 w-full max-h-[88vh] rounded-t-3xl md:absolute md:top-14 md:bottom-4 md:right-6 ${
      hasMunicipio ? 'md:w-[38rem] lg:w-[44rem] xl:w-[48rem] max-w-[96vw]' : 'md:w-[28rem] lg:w-[32rem]'
    } md:rounded-[2.5rem] md:left-auto md:max-h-[92vh] shadow-2xl overflow-hidden flex flex-col z-40 transition-all duration-500 border ${
      theme === 'light' ? 'bg-white/95 border-slate-300 light-theme' : 'bg-slate-950/95 border-white/10 backdrop-blur-2xl'
    }`}>

      {/* Header Táctico con Botón de Minimizar Contenedor */}
      <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-slate-900/70 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_12px_cyan]" />
          <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
            SOGNE — CONTROL TERRITORIAL
          </h3>
          {features.length > 1 && (
            <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 px-3 py-0.5 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              {features.length} PANELES ACTIVOS
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoadingAny && (
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-1" />
          )}

          {/* Minimizar Contenedor Entero */}
          <button
            onClick={() => setIsContainerMinimized(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Minimizar panel para ver y hacer zoom en el mapa"
          >
            <Minimize2 size={13} />
            <span className="hidden sm:inline">Minimizar Panel</span>
          </button>

          {/* Cerrar Todo */}
          <button
            onClick={onClear}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all cursor-pointer"
            title="Cerrar y Limpiar Todo"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Contenedor de Tarjetas con Scroll Mejorado */}
      <div 
        ref={scrollContainerRef}
        id="analysis-panel-content" 
        className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar scroll-smooth"
      >
        {/* Banner Táctico Informativo durante Cargas */}
        {isLoadingAny && (
          <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider block leading-none">
                  Sincronizando Inteligencia Territorial
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Por favor espere mientras se cargan los registros...
                </span>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40 animate-pulse">
              En Vivo
            </span>
          </div>
        )}
        {features.map((f: any, i: number) => {
          const p = f.properties || {};
          const type = detectType(f);
          const nombreRaw = p.nombre || p.sector || p.name || p.adm2_name || p.NAME || "Elemento";

          return (
            <div key={`${i}-${type}-${nombreRaw}`} className="pdf-capture-card animate-in fade-in slide-in-from-top-4 duration-300">
              {type === 'sistemasElectricos' ? (
                <ElectricoCard f={f} onRemove={onRemove} onOpenDiagrama={onOpenDiagrama} />
              ) : type === 'estacionesAgua' ? (
                <EmbalseCard f={f} onRemove={onRemove} />
              ) : type === 'estacionGas' ? (
                <EstacionGasCard f={f} onRemove={onRemove} />
              ) : type === 'transporte' ? (
                <TransporteCard f={f} onRemove={onRemove} />
              ) : type === 'parroquia' ? (
                <ParroquiaCard
                  feature={f}
                  onClose={() => onRemove(f)}
                  incidenciasDB={loadedData.incidentesDB || []}
                  puntosDB={loadedData.puntosDB || []}
                  personasDB={loadedData.personasDB || []}
                  bandasDB={loadedData.zonasDB || []}
                  bandasOrganizadas={loadedData.bandasOrganizadasMaster || []}
                />
              ) : type === 'municipio' ? (
                <MunicipioCard
                  feature={f}
                  nombre={nombreRaw}
                  cuadrantesMaster={loadedData.cuadrantesGeoData?.features || []}
                  densidadMaster={loadedData.densidadData || []}
                  redSaludMaster={loadedData.redSaludMaster || []}
                  incidentesDB={getIncidentesPorMunicipio}
                  traficoDB={getTraficoPorMunicipio}
                  puntosDB={loadedData.puntosDB || []}
                  personasDB={loadedData.personasDB || []}
                  bandasDB={loadedData.zonasDB || []}
                  bandasOrganizadas={loadedData.bandasOrganizadasMaster || []}
                  sectoresAPI={getSectoresFromMap(nombreRaw)}
                  onClose={() => onRemove(f)}
                />
              ) : type === 'salud' ? (
                <SaludCard feature={f} onClose={() => onRemove(f)} />
              ) : type === 'cibernetica' ? (
                <CiberneticaCard f={f} onRemove={onRemove} allSujetos={loadedData.sujetosDB || []} />
              ) : type === 'concentracion' ? (
                <ConcentracionCard f={f} onRemove={onRemove} allSujetos={loadedData.sujetosDB || []} />
              ) : type === 'incidente' ? (
                <IncidenteCard
                  f={f}
                  onRemove={onRemove}
                  allIncidentes={loadedData.incidentesDB || []}
                  allTrafico={loadedData.traficoDB || []}
                  allSujetos={loadedData.sujetosDB || []}
                  allUsuarios={loadedData.usuariosDB || []}
                />
              ) : type === 'drogas' ? (
                <DrogasCard f={f} onRemove={onRemove} />
              ) : type === 'actor' ? (
                <ActorInteresCard f={f} onRemove={onRemove} />
              ) : type === 'puntoInteres' ? (
                <PuntoInteresCard f={f} onRemove={onRemove} />
              ) : type === 'antena' ? (
                <AntenaCard f={f} onRemove={onRemove} />
              ) : type === 'banda' ? (
                <InteligenciaCard
                  f={f}
                  onRemove={onRemove}
                  allBandas={loadedData.bandasOrganizadasMaster || []}
                  allZonasVínculos={loadedData.zonasDB || []}
                />
              ) : type === 'estacion' ? (
                <EstacionServicioCard feature={f} onRemove={() => onRemove(f)} />
              ) : type === 'iapolepne' ? (
                <IapolepneCard feature={f} onRemove={() => onRemove(f)} />
              ) : type === 'escuela' ? (
                <EscuelaCard f={f} onRemove={onRemove} />
              ) : type === 'sector' ? (
                <SectorCard
                  f={f}
                  incidenciasDB={loadedData.incidentesDB || []}
                  bandasDB={loadedData.zonasDB || []}
                  bandasOrganizadas={loadedData.bandasOrganizadasMaster || []}
                  puntosDB={loadedData.puntosDB || []}
                  personasDB={loadedData.personasDB || []}
                  onRemove={onRemove}
                />
              ) : type === 'cuadrantePunto' ? (
                <CuadrantePuntoCard f={f} geoData={loadedData.cuadrantesGeoData} onRemove={onRemove} />
              ) : type === 'cuadranteArea' ? (
                <CuadranteAreaCard f={f} onRemove={onRemove} />
              ) : (
                /* FALLBACK */
                <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-6 relative">
                  <button onClick={() => onRemove(f)} className="absolute top-4 right-4 text-white/20 hover:text-rose-500 transition-colors">✕</button>
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">Sin Clasificación</p>
                  <h4 className="text-xl font-black text-white uppercase italic leading-none truncate">{nombreRaw}</h4>
                  <div className="mt-3 flex flex-col gap-1">
                    <span className="text-[8px] text-slate-500 font-mono">Layer: {f.layer?.id}</span>
                    <span className="text-[8px] text-slate-500 font-mono">Geo: {f.geometry?.type}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-900/50 border-t border-white/5 shrink-0 flex items-center gap-3">
        <button
          onClick={onClear}
          className="w-full py-3 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all border border-rose-500/20 shadow-md cursor-pointer"
        >
          Limpiar Todos los Paneles
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 6px; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: rgba(15, 23, 42, 0.5); 
          border-radius: 9999px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(6, 182, 212, 0.35); 
          border-radius: 9999px; 
          border: 1px solid rgba(6, 182, 212, 0.2); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(6, 182, 212, 0.7); 
        }
      `}</style>
    </div>
  );
};