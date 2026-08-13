"use client";
import React, { useMemo, useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { 
  Building2, 
  Zap, 
  Flame, 
  Droplets, 
  Bus, 
  Fuel, 
  Radio, 
  X, 
  Search, 
  Layers, 
  Users, 
  ShieldAlert, 
  HeartPulse 
} from 'lucide-react';

interface MunicipioCardProps {
  nombre: string;
  feature?: any;
  cuadrantesMaster?: any[];
  densidadMaster?: any[];
  redSaludMaster?: any[];
  incidentesDB?: any;
  traficoDB?: any;
  puntosDB?: any[];
  personasDB?: any[];
  bandasDB?: any[];
  bandasOrganizadas?: any[];
  sectoresAPI?: any[];
  onClose?: () => void;
}

// Diccionario de localidades y palabras clave por municipio en Nueva Esparta
const LOCALIDADES_NE: Record<string, string[]> = {
  'ARISMENDI': ['ASUNCION', 'SALAMANCA', 'GUAYATAMO', 'CAMORUCO', 'SIERRA', 'ATAMO', 'MATASIETE', 'FORTIN', 'CATALAN', 'PORTACHUELO'],
  'MARINO': ['PORLAMAR', 'BELLA VISTA', 'CONUCO', 'GENOVES', 'LLANO', 'COSTA AZUL', 'LOS COCOS', 'PALGUERITO', 'ACHIPANO', 'CAMPANERO', 'SANTIAGO MARINO', 'MACHO MUERTO', 'ISLETA', 'LUISA CACERES'],
  'MANEIRO': ['PAMPATAR', 'ROBLES', 'AGUIRRE', 'PLAYA EL ANGEL', 'JORGE COLL', 'CARANTA', 'APOLINAR', 'MORENO'],
  'GARCIA': ['VALLE', 'SAN ANTONIO', 'VILLA ROSA', 'CONEJEROS', 'PIEDRAS NEGRAS', 'ISNOBIL', 'PEDRO LUIS', 'ESPIRITU SANTO'],
  'GOMEZ': ['SANTA ANA', 'ALTAGRACIA', 'TACARIGUA', 'GUAYACAN', 'PEDREGALES', 'VECINDAD', 'EL MACAPO'],
  'DIAZ': ['SAN JUAN', 'ESPINAL', 'BARRANCAS', 'ZAPATO', 'DATIL', 'COTUPIZA', 'AEROPUERTO', 'BOQUERON', 'LAS BARRANCAS', 'SAN JUAN BAUTISTA', 'ENCRUCIJADA'],
  'MARCANO': ['JUAN GRIEGO', 'MILLANES', 'PEDREGALES', 'TETILLAS', 'LONJA', 'LOS MILLANES', 'TAGUANTAR'],
  'TUBORES': ['PUNTA DE PIEDRAS', 'GUAMACHE', 'BARALES', 'LOS BARALES', 'CHACACHACARE', 'GUAYACANCITO', 'ISLA DE CUBAGUA', 'LAS CUATAS', 'EL GUAMACHE'],
  'ANTOLIN DEL CAMPO': ['PARAGUACHI', 'TIRANO', 'MANZANILLO', 'PLAYA EL AGUA', 'CARDON', 'PATO', 'GUARAME', 'LA PLAZA', 'EL SALADO', 'ANTOLIN'],
  'PENINSULA DE MACANAO': ['BOCA DE RIO', 'BOCA DEL RIO', 'BOCA DE POZO', 'SAN FRANCISCO', 'ROBLEDO', 'MANGLILLO', 'GUAYACANCITO', 'MACANAO', 'EL TUNAL', 'LA YEGUA', 'INDIO MACANAO'],
  'MACANAO': ['BOCA DE RIO', 'BOCA DEL RIO', 'BOCA DE POZO', 'SAN FRANCISCO', 'ROBLEDO', 'MANGLILLO', 'GUAYACANCITO', 'MACANAO', 'EL TUNAL', 'LA YEGUA', 'INDIO MACANAO'],
  'VILLALBA': ['COCHE', 'SAN PEDRO', 'GUINCHO', 'EL BICHAR', 'ZULICA', 'AMOR', 'ISLA DE COCHE', 'SAN PEDRO DE COCHE', 'BM-22']
};

export const MunicipioCard: React.FC<MunicipioCardProps> = ({ 
  nombre, 
  feature,
  cuadrantesMaster = [], 
  densidadMaster = [], 
  redSaludMaster = [], 
  incidentesDB = {}, 
  traficoDB = {},
  puntosDB = [],
  personasDB = [],
  bandasDB = [],
  bandasOrganizadas = [],
  sectoresAPI = [],
  onClose
}) => {
  
  // Estados para datos de infraestructura
  const [escuelasData, setEscuelasData] = useState<any[]>([]);
  const [electricosData, setElectricosData] = useState<any[]>([]);
  const [gasData, setGasData] = useState<any[]>([]);
  const [aguaData, setAguaData] = useState<any[]>([]);
  const [transporteData, setTransporteData] = useState<any[]>([]);
  const [estacionesData, setEstacionesData] = useState<any[]>([]);
  const [antenasData, setAntenasData] = useState<any[]>([]);
  const [isLoadingInfra, setIsLoadingInfra] = useState<boolean>(true);

  // Estado del mini-modal de desglose
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');

  // Base de datos de fuerza motorizada
  const fuerzaDesplegada: Record<string, { m: number, p: number }> = {
    "TUBORES": { m: 6, p: 1 },
    "VILLALBA": { m: 4, p: 1 },
    "ANTOLIN DEL CAMPO": { m: 10, p: 2 },
    "ARISMENDI": { m: 8, p: 1 },
    "DIAZ": { m: 20, p: 3 },
    "MANEIRO": { m: 8, p: 1 },
    "GOMEZ": { m: 12, p: 2 },
    "MARCANO": { m: 12, p: 2 },
    "GARCIA": { m: 12, p: 2 },
    "MARINO": { m: 26, p: 3 },
    "MACANAO": { m: 10, p: 2 },
    "PENINSULA DE MACANAO": { m: 10, p: 2 }
  };

  const nomNorm = useMemo(() => {
    return (nombre || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/MP\./g, "")
      .replace(/MUNICIPIO/g, "")
      .trim();
  }, [nombre]);

  // Carga de todas las capas de infraestructura desde la API en memoria
  useEffect(() => {
    let isMounted = true;
    setIsLoadingInfra(true);

    const loadAllInfra = async () => {
      try {
        const [
          escuelasRes,
          electricosRes,
          gasRes,
          aguaRes,
          transporteRes,
          estacionesRes,
          movilnetRes,
          movistarRes,
          digitelRes
        ] = await Promise.all([
          fetch('/api/map/capas?nombre=escuelas').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=SISTEMAELECTRICONE').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=estaciongasNE').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=estacionagua').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=transporte').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=estacionservicio').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=movilnet').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=movistar').then(r => r.json()).catch(() => ({ features: [] })),
          fetch('/api/map/capas?nombre=digitel').then(r => r.json()).catch(() => ({ features: [] }))
        ]);

        if (isMounted) {
          setEscuelasData(escuelasRes.features || []);
          setElectricosData(electricosRes.features || []);
          setGasData(gasRes.features || []);
          setAguaData(aguaRes.features || []);
          setTransporteData(transporteRes.features || []);
          setEstacionesData(estacionesRes.features || []);

          const movilnetFeats = (movilnetRes.features || []).map((f: any) => ({
            ...f,
            properties: { ...(f.properties || {}), operadora: 'MOVILNET', operator: 'Movilnet' }
          }));
          const movistarFeats = (movistarRes.features || []).map((f: any) => ({
            ...f,
            properties: { ...(f.properties || {}), operadora: 'MOVISTAR', operator: 'Movistar' }
          }));
          const digitelFeats = (digitelRes.features || []).map((f: any) => ({
            ...f,
            properties: { ...(f.properties || {}), operadora: 'DIGITEL', operator: 'Digitel' }
          }));

          setAntenasData([...movilnetFeats, ...movistarFeats, ...digitelFeats]);
          setIsLoadingInfra(false);
        }
      } catch (e) {
        console.warn("Error cargando infraestructura municipal:", e);
        if (isMounted) setIsLoadingInfra(false);
      }
    };

    loadAllInfra();
    return () => { isMounted = false; };
  }, []);

  // Función híbrida de comprobación (Polígono Espacial + Atributos y Localidades)
  const isInsideMunicipality = (item: any): boolean => {
    if (!item) return false;

    // 1. Coincidencia espacial mediante Turf (Punto dentro del Polígono del Municipio)
    if (feature?.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') && item.geometry?.coordinates) {
      try {
        if (item.geometry.type === 'Point') {
          const isInside = turf.booleanPointInPolygon(item, feature);
          if (isInside) return true;
        }
      } catch (e) {
        // Fallback to text matching
      }
    }

    // 2. Coincidencia por texto en las propiedades del elemento
    const p = item.properties || {};
    const textValues = [
      p.municipio,
      p.MUNICIPIO,
      p.CityName,
      p.address,
      p.ubicacion,
      p.sector,
      p.parroquia,
      p.PARROQUIA,
      p.DESCRIPCION,
      p.NAME,
      p.nombre,
      p.name,
      p.adm2_name
    ].filter(Boolean).map(v => String(v).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/MP\./g, "").trim());

    // Coincidencia directa del nombre del municipio
    const directMatch = textValues.some(t => t.includes(nomNorm) || nomNorm.includes(t));
    if (directMatch) return true;

    // Coincidencia con palabras clave de localidades del municipio
    const keywords = LOCALIDADES_NE[nomNorm] || [];
    const keywordMatch = textValues.some(t => keywords.some(k => t.includes(k)));
    if (keywordMatch) return true;

    return false;
  };

  // Filtrado y agregación de infraestructura para este municipio
  const infraItems = useMemo(() => {
    return {
      escuelas: escuelasData.filter(isInsideMunicipality),
      subestaciones: electricosData.filter(isInsideMunicipality),
      estacionesGas: gasData.filter(isInsideMunicipality),
      serviciosAgua: aguaData.filter(isInsideMunicipality),
      paradas: transporteData.filter(isInsideMunicipality),
      estacionesServicio: estacionesData.filter(isInsideMunicipality),
      antenas: antenasData.filter(isInsideMunicipality)
    };
  }, [nomNorm, feature, escuelasData, electricosData, gasData, aguaData, transporteData, estacionesData, antenasData]);

  const stats = useMemo(() => {
    // Cuadrantes
    const misCuadrantes = cuadrantesMaster.filter(isInsideMunicipality);

    // Vehículos
    const vehiculos = fuerzaDesplegada[nomNorm] || { m: 0, p: 0 };

    // Población
    const rawPob = densidadMaster?.find((d: any) => {
      const mName = (d.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return mName.includes(nomNorm) || nomNorm.includes(mName);
    }) || {};
    const h = Number(rawPob.hombres) || 0;
    const m = Number(rawPob.women || rawPob.mujeres) || 0;

    // Salud
    const saludMun = redSaludMaster.filter(isInsideMunicipality);

    // Incidencias
    const keyInc = Object.keys(incidentesDB).find(k => {
      const clean = k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return clean.includes(nomNorm) || nomNorm.includes(clean);
    });
    const keyTraf = Object.keys(traficoDB).find(k => {
      const clean = k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return clean.includes(nomNorm) || nomNorm.includes(clean);
    });

    // Puntos de Interés
    const puntosLocales = puntosDB.filter((pt: any) => isInsideMunicipality(pt));
    const personasLocales = personasDB.filter((pe: any) => isInsideMunicipality(pe));

    // Bandas
    const normalizedSectores = sectoresAPI.map((s: string) => s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
    const zonasLocales = bandasDB.filter((z: any) => {
      const zonaStr = (z.nombre_zona || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const munStr = (z.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return munStr === nomNorm || zonaStr.includes(nomNorm) || normalizedSectores.some((s: string) => s.includes(zonaStr) || zonaStr.includes(s));
    });
    const idsBandas = Array.from(new Set(zonasLocales.map((z: any) => z.id_banda)));
    const bandasLocales = bandasOrganizadas.filter((b: any) => idsBandas.includes(b.id_banda));

    return {
      nombre,
      cuadrantes: misCuadrantes.length,
      incidencias: keyInc ? incidentesDB[keyInc] : 0,
      trafico: keyTraf ? traficoDB[keyTraf] : 0,
      pob: { h, m, total: h + m },
      fuerza: { m: vehiculos.m, p: vehiculos.p, total: vehiculos.m + vehiculos.p },
      salud: {
        hosp: saludMun.filter((f: any) => (f.tipo === 'hospital' || f.tipo_red === 'Hospital' || (f.properties?.tipo || '').toLowerCase().includes('hosp'))).length,
        clin: saludMun.filter((f: any) => (f.tipo === 'clinica' || f.tipo_red === 'Clínica' || (f.properties?.tipo || '').toLowerCase().includes('clin'))).length,
        cdi: saludMun.filter((f: any) => (f.tipo === 'cdi' || f.tipo_red === 'CDI' || (f.properties?.tipo || '').toLowerCase().includes('cdi'))).length,
        amb: saludMun.filter((f: any) => (f.tipo === 'ambulatorio' || f.tipo_red === 'Ambulatorio' || (f.properties?.tipo || '').toLowerCase().includes('amb'))).length,
      },
      inteligencia: {
        puntos: puntosLocales,
        personas: personasLocales,
        bandas: bandasLocales
      }
    };
  }, [nomNorm, feature, cuadrantesMaster, densidadMaster, redSaludMaster, incidentesDB, traficoDB, puntosDB, personasDB, bandasDB, bandasOrganizadas, sectoresAPI, nombre]);

  // Lista activa para el modal según la categoría clickeada
  const activeModalData = useMemo(() => {
    if (!modalCategory) return { title: '', icon: null, color: '', items: [] };

    let items: any[] = [];
    let title = '';
    let icon = null;
    let color = '';

    switch (modalCategory) {
      case 'escuelas':
        items = infraItems.escuelas;
        title = 'Planteles Educativos y Escuelas';
        icon = <Building2 className="text-blue-400" size={18} />;
        color = 'border-blue-500/40 text-blue-400 bg-blue-500/10';
        break;
      case 'subestaciones':
        items = infraItems.subestaciones;
        title = 'Subestaciones y Sistema Eléctrico';
        icon = <Zap className="text-amber-400" size={18} />;
        color = 'border-amber-500/40 text-amber-400 bg-amber-500/10';
        break;
      case 'gas':
        items = infraItems.estacionesGas;
        title = 'Centros de Distribución y Estaciones de Gas';
        icon = <Flame className="text-orange-400" size={18} />;
        color = 'border-orange-500/40 text-orange-400 bg-orange-500/10';
        break;
      case 'agua':
        items = infraItems.serviciosAgua;
        title = 'Instalaciones y Servicios de Agua';
        icon = <Droplets className="text-cyan-400" size={18} />;
        color = 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10';
        break;
      case 'transporte':
        items = infraItems.paradas;
        title = 'Paradas y Rutas de Transporte';
        icon = <Bus className="text-purple-400" size={18} />;
        color = 'border-purple-500/40 text-purple-400 bg-purple-500/10';
        break;
      case 'estacionesServicio':
        items = infraItems.estacionesServicio;
        title = 'Estaciones de Servicio de Combustible';
        icon = <Fuel className="text-emerald-400" size={18} />;
        color = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10';
        break;
      case 'antenas':
        items = infraItems.antenas;
        title = 'Infraestructura de Telecomunicaciones y Antenas';
        icon = <Radio className="text-rose-400" size={18} />;
        color = 'border-rose-500/40 text-rose-400 bg-rose-500/10';
        break;
    }

    // Filtrar por texto de búsqueda interno
    if (modalSearch.trim()) {
      const q = modalSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      items = items.filter(it => {
        const str = JSON.stringify(it.properties || {}).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return str.includes(q);
      });
    }

    return { title, icon, color, items };
  }, [modalCategory, modalSearch, infraItems]);

  return (
    <div className="bg-slate-900/95 text-slate-100 rounded-3xl shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 flex flex-col relative">
      
      {/* HEADER TÁCTICO */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 p-6 relative overflow-hidden border-b border-white/10 shrink-0">
        <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
          <img src="/Municipios.png" className="w-24 h-24 object-contain" alt="Fondo" />
        </div>
        
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <img src="/Municipios.png" alt="Municipio" className="w-4 h-4 object-contain" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              FICHA DE INTELIGENCIA TERRITORIAL
            </span>
          </div>

          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar Ficha"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic leading-tight">
          MUNICIPIO {stats.nombre}
        </h2>
        <p className="text-[11px] font-mono text-cyan-400/80 mt-0.5">
          Estado Nueva Esparta • Centro de Comando y Control Geointeligente
        </p>
      </div>

      {/* CONTENIDO PRINCIPAL SCROLLEABLE */}
      <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-140px)] custom-scrollbar">
        
        {/* =========================================================================
            SECCIÓN: INFRAESTRUCTURA ESTRATÉGICA Y SERVICIOS CON CLICK INTERACTIVO
            ========================================================================= */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-cyan-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-300">
                Infraestructura Estratégica
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              Toca un número para desglose
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
            
            {/* 1. ESCUELAS */}
            <button
              onClick={() => { setModalCategory('escuelas'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-blue-950/70 border border-blue-500/30 hover:border-blue-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-blue-300 transition-colors uppercase">Escuelas</span>
                <Building2 size={15} className="text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-blue-400 group-hover:text-blue-300">
                  {infraItems.escuelas.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-blue-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 2. SUBESTACIONES */}
            <button
              onClick={() => { setModalCategory('subestaciones'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-amber-950/70 border border-amber-500/30 hover:border-amber-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-300 transition-colors uppercase">Subestaciones</span>
                <Zap size={15} className="text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-amber-400 group-hover:text-amber-300">
                  {infraItems.subestaciones.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-amber-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 3. ESTACIONES DE GAS */}
            <button
              onClick={() => { setModalCategory('gas'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-orange-950/70 border border-orange-500/30 hover:border-orange-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-orange-300 transition-colors uppercase">Est. de Gas</span>
                <Flame size={15} className="text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-orange-400 group-hover:text-orange-300">
                  {infraItems.estacionesGas.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-orange-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 4. SERVICIOS DE AGUA */}
            <button
              onClick={() => { setModalCategory('agua'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-cyan-300 transition-colors uppercase">Servicios Agua</span>
                <Droplets size={15} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-cyan-400 group-hover:text-cyan-300">
                  {infraItems.serviciosAgua.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-cyan-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 5. PARADAS / TRANSPORTE */}
            <button
              onClick={() => { setModalCategory('transporte'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-purple-950/70 border border-purple-500/30 hover:border-purple-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-purple-300 transition-colors uppercase">Paradas / Rutas</span>
                <Bus size={15} className="text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-purple-400 group-hover:text-purple-300">
                  {infraItems.paradas.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-purple-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 6. ESTACIONES DE SERVICIO */}
            <button
              onClick={() => { setModalCategory('estacionesServicio'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-emerald-950/70 border border-emerald-500/30 hover:border-emerald-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-300 transition-colors uppercase">E/S Combustible</span>
                <Fuel size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-emerald-400 group-hover:text-emerald-300">
                  {infraItems.estacionesServicio.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-emerald-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

            {/* 7. ANTENAS */}
            <button
              onClick={() => { setModalCategory('antenas'); setModalSearch(''); }}
              className="group flex flex-col p-3 rounded-xl bg-slate-900/90 hover:bg-rose-950/70 border border-rose-500/30 hover:border-rose-400/70 transition-all hover:scale-[1.03] text-left cursor-pointer shadow-md col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold text-slate-300 group-hover:text-rose-300 transition-colors uppercase">Antenas Telecom</span>
                <Radio size={15} className="text-rose-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline justify-between mt-auto">
                <span className="text-2xl font-black text-rose-400 group-hover:text-rose-300">
                  {infraItems.antenas.length}
                </span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-rose-400/80">Ver detalle &rarr;</span>
              </div>
            </button>

          </div>
        </div>

        {/* OPERACIONES Y SEGURIDAD */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Cuadrantes</span>
            <p className="text-2xl font-black text-white">{stats.cuadrantes}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-rose-500/20 text-center">
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block mb-1">Incidencias</span>
            <p className="text-2xl font-black text-rose-500">{stats.incidencias}</p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/20 text-center">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider block mb-1">Tráfico Droga</span>
            <p className="text-2xl font-black text-amber-400">{stats.trafico}</p>
          </div>
        </div>

        {/* VEHÍCULOS DE RESPUESTA */}
        <div className="bg-slate-950/90 text-white p-4 rounded-2xl border border-cyan-500/20 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1.5">Fuerza Desplegada</p>
              <div className="flex gap-4">
                <div>
                  <span className="text-xl font-black text-white">{stats.fuerza.m}</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Motos</span>
                </div>
                <div>
                  <span className="text-xl font-black text-white">{stats.fuerza.p}</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Patrullas</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-cyan-300">{stats.fuerza.total}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Unidades Totales</p>
            </div>
          </div>
        </div>

        {/* CENSO POBLACIONAL */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-cyan-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Censo Poblacional</p>
          </div>
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{stats.pob.h.toLocaleString()}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase">Hombres</p>
            </div>
            <div className="text-center bg-slate-900 px-5 py-2.5 rounded-2xl border border-white/10 shadow-inner">
              <p className="text-2xl font-black text-white leading-none">{stats.pob.total.toLocaleString()}</p>
              <p className="text-[8px] font-black text-cyan-400 uppercase mt-1">Población Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-pink-400">{stats.pob.m.toLocaleString()}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase">Mujeres</p>
            </div>
          </div>
        </div>

        {/* RED DE SALUD */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <HeartPulse size={14} className="text-rose-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Red Asistencial de Salud</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hospitales', val: stats.salud.hosp, bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
              { label: 'Clínicas', val: stats.salud.clin, bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
              { label: 'CDI', val: stats.salud.cdi, bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
              { label: 'Ambulatorio', val: stats.salud.amb, bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
            ].map((item, i) => (
              <div key={i} className={`${item.bg} border p-2.5 rounded-xl text-center shadow-sm`}>
                <p className="text-xl font-black">{item.val}</p>
                <p className="text-[8px] font-black uppercase leading-none opacity-80 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BASE DE INTELIGENCIA */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={14} className="text-amber-400" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registro de Inteligencia</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
              <p className="text-xl font-black text-amber-400">{stats.inteligencia.puntos.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase">Puntos Interés</p>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
              <p className="text-xl font-black text-sky-400">{stats.inteligencia.personas.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase">Sujetos</p>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
              <p className="text-xl font-black text-rose-400">{stats.inteligencia.bandas.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase">Grupos Delictivos</p>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="bg-slate-950/90 p-3.5 text-center border-t border-white/10 shrink-0">
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          SOGNE • REDIMAIN • SISTEMA DE ORIENTACIÓN GEOINTELIGENTE
        </p>
      </div>

      {/* =========================================================================
          MINI-MODAL INTERACTIVO DE DESGLOSE TÁCTICO
          ========================================================================= */}
      {modalCategory && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header del Modal */}
          <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${activeModalData.color}`}>
                {activeModalData.icon}
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider leading-tight">
                  {activeModalData.title}
                </h4>
                <p className="text-[10px] font-mono text-cyan-400">
                  {stats.nombre} • {activeModalData.items.length} Registros Encontrados
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalCategory(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cerrar Desglose"
            >
              <X size={18} />
            </button>
          </div>

          {/* Buscador dentro del Modal */}
          <div className="p-3 bg-slate-900/50 border-b border-white/5 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, sector o tipo..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {modalSearch && (
                <button
                  onClick={() => setModalSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Registros Desglosados */}
          <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto custom-scrollbar">
            {activeModalData.items.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-xs">No se encontraron registros para esta categoría en {stats.nombre}.</p>
              </div>
            ) : (
              activeModalData.items.map((it: any, idx: number) => {
                const p = it.properties || {};
                const coords = it.geometry?.coordinates;
                const itemNombre = p.NAME || p.nombre || p.name || p.NOMBRE || p.denominacion || `Instalación #${idx + 1}`;
                const itemTipo = p.gpxx_Categ || p.tipo || p.subcategoria || p.categoria || p.CATEGORIA || p.TIPO_SERVICIO || p.TENSION_ASOCIADA || 'Infraestructura';
                const itemUbicacion = p.sector || p.address || p.ubicacion || p.CityName || p.PARROQUIA || p.DESCRIPCION || p.parroquia || (p.NAME ? p.NAME.replace(/ANTENA\s+/i, '') : 'Nueva Esparta');
                const itemExtra = p.OPERADOR || p.empresa || p.institution || p.circuito || p.CUSTODIA || p.status || p.estatus || p.OPERADORA || p.region_tipo || p.sym || p.LAYER;

                // Detección de Operadora para Antenas
                let opBadge = null;
                if (modalCategory === 'antenas') {
                  const rawOp = (p.operadora || p.operator || p.OPERADORA || p.gpxx_Categ || p.NAME || '').toUpperCase();
                  if (rawOp.includes('DIGITEL')) {
                    opBadge = { name: 'Digitel', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', icon: '/digitel.png' };
                  } else if (rawOp.includes('MOVISTAR')) {
                    opBadge = { name: 'Movistar', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10', icon: '/movistar.png' };
                  } else {
                    opBadge = { name: 'Movilnet', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: '/movilnet.png' };
                  }
                }

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/80 hover:bg-slate-850 rounded-xl border border-white/10 hover:border-cyan-500/40 transition-all shadow-sm flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {opBadge && (
                          <img src={opBadge.icon} alt={opBadge.name} className="w-4 h-4 object-contain rounded-full bg-white/10 shrink-0" onError={(e) => { (e.target as any).src = '/antena.png'; }} />
                        )}
                        <h5 className="text-xs font-bold text-white uppercase tracking-tight leading-snug">
                          {itemNombre}
                        </h5>
                      </div>
                      {opBadge ? (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${opBadge.color}`}>
                          {opBadge.name}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300 shrink-0">
                          {itemTipo}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-tight">
                      📍 {itemUbicacion}
                    </p>

                    {itemExtra && (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 mt-0.5">
                        <span className="text-slate-500">Info:</span>
                        <span className="text-slate-300 font-semibold">{itemExtra}</span>
                      </div>
                    )}

                    {p.responsable && (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono mt-0.5">
                        <span className="text-orange-400/80 font-bold">Resp:</span>
                        <span className="text-orange-300 font-bold">{p.responsable} {p.telefono ? `(${p.telefono})` : ''}</span>
                      </div>
                    )}

                    {coords && (
                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-white/5 mt-1">
                        <span>GPS: {coords[1].toFixed(4)}, {coords[0].toFixed(4)}</span>
                        <span className="text-cyan-400/80 font-bold">Activo</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Botón de Cierre del Modal */}
          <div className="p-3 bg-slate-900 border-t border-white/10 shrink-0 text-center">
            <button
              onClick={() => setModalCategory(null)}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Volver a la Ficha Municipal
            </button>
          </div>

        </div>
      )}

    </div>
  );
};