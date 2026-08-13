"use client";
import React, { useMemo } from 'react';

export const MunicipioCard = ({ 
  nombre, 
  cuadrantesMaster = [], 
  densidadMaster = [], 
  redSaludMaster = [], 
  incidentesDB = {}, 
  traficoDB = {}, // Nuevo prop integrado
  puntosDB = [],
  personasDB = [],
  bandasDB = [],
  bandasOrganizadas = [],
  sectoresAPI = []
}: any) => {
  
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
    "MACANAO": { m: 10, p: 2 }
  };

  const stats = useMemo(() => {
    const nomNorm = nombre?.toUpperCase().trim() || "";
    const keyMatch = nomNorm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Cuadrantes
    const misCuadrantes = cuadrantesMaster.filter((c: any) => 
      (c.properties?.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Vehículos
    const vehiculos = fuerzaDesplegada[keyMatch] || { m: 0, p: 0 };

    // Población
    const rawPob = densidadMaster?.find((d: any) => 
      d.municipio?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    ) || {};
    const h = Number(rawPob.hombres) || 0;
    const m = Number(rawPob.women || rawPob.mujeres) || 0;

    // Salud
    const saludMun = redSaludMaster.filter((f: any) => 
      (f.properties?.municipio || f.properties?.adm2_name || f.properties?.municipality)?.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Incidencias (Búsqueda en objeto agrupado)
    const keyInc = Object.keys(incidentesDB).find(k => 
      k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Tráfico (Búsqueda en objeto agrupado)
    const keyTraf = Object.keys(traficoDB).find(k => 
      k.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Puntos de Interés (todo)
    const puntosLocales = puntosDB.filter((pt: any) => 
      (pt.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Personas de Interés
    const personasLocales = personasDB.filter((pe: any) => 
      (pe.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === keyMatch
    );

    // Bandas operativas (Por municipio o por sectores internos)
    const normalizedSectores = sectoresAPI.map((s: string) => s.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
    const zonasLocales = bandasDB.filter((z: any) => {
      const zonaStr = (z.nombre_zona || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const munStr = (z.municipio || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return munStr === keyMatch || zonaStr.includes(keyMatch) || normalizedSectores.some((s: string) => s.includes(zonaStr) || zonaStr.includes(s));
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
        hosp: saludMun.filter((f: any) => (f.tipo === 'hospital' || f.tipo_red === 'Hospital')).length,
        clin: saludMun.filter((f: any) => (f.tipo === 'clinica' || f.tipo_red === 'Clínica')).length,
        cdi: saludMun.filter((f: any) => (f.tipo === 'cdi' || f.tipo_red === 'CDI')).length,
        amb: saludMun.filter((f: any) => (f.tipo === 'ambulatorio' || f.tipo_red === 'Ambulatorio')).length,
      },
      inteligencia: {
        puntos: puntosLocales,
        personas: personasLocales,
        bandas: bandasLocales
      }
    };
  }, [nombre, cuadrantesMaster, densidadMaster, redSaludMaster, incidentesDB, traficoDB, puntosDB, personasDB, bandasDB, bandasOrganizadas]);

  return (
    <div className="bg-slate-50 rounded-4xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER TÁCTICO */}
      <div className="bg-slate-900 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <img src="/Municipios.png" className="w-20 h-20 object-contain grayscale" alt="Fondo" />
        </div>
        <div className="flex items-center gap-2 mb-2 bg-white w-max px-3 py-1 rounded-full shadow-sm border border-cyan-500/20">
            <img src="/Municipios.png" alt="Municipio" className="w-5 h-5 object-contain" />
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600">
              Ficha de Inteligencia Municipal
            </span>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight italic leading-none">{stats.nombre}</h2>
      </div>

      <div className="p-6 space-y-5">
        
        {/* FILA 1: SEGURIDAD Y TRÁFICO */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest text-center">Estado de Operaciones</p>
            <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800">{stats.cuadrantes}</p>
                <p className="text-[8px] font-black text-slate-500 uppercase">N° Cuadrantes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-rose-600">{stats.incidencias}</p>
                <p className="text-[8px] font-black text-slate-500 uppercase">Incidencias</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-amber-500">{stats.trafico}</p>
                <p className="text-[8px] font-black text-slate-500 uppercase">Tráfico Droga</p>
              </div>
            </div>
          </div>
        </div>

        {/* FILA 2: VEHÍCULOS DE RESPUESTA */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
                <div>
                    <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1">Vehiculos</p>
                    <div className="flex gap-4">
                        <div>
                            <span className="text-xl font-black">{stats.fuerza.m}</span>
                            <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Motos</span>
                        </div>
                        <div>
                            <span className="text-xl font-black">{stats.fuerza.p}</span>
                            <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Patrullas</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[18px] font-black text-white">{stats.fuerza.total}</p>
                    <p className="text-[8px] font-bold text-cyan-500 uppercase leading-none">Total</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-full opacity-50" />
        </div>

        {/* BLOQUE DEMOGRAFÍA */}
        <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 text-center tracking-widest">Censo Poblacional</p>
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700">{stats.pob.h.toLocaleString()}</p>
              <p className="text-[9px] font-black text-blue-600 uppercase">Hombres</p>
            </div>
            <div className="text-center bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm ring-4 ring-slate-50">
              <p className="text-3xl font-black text-slate-900 leading-none">{stats.pob.total.toLocaleString()}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase mt-1">Densidad de personas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700">{stats.pob.m.toLocaleString()}</p>
              <p className="text-[9px] font-black text-pink-600 uppercase">Mujeres</p>
            </div>
          </div>
        </div>

        {/* BLOQUE SALUD */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Infraestructura de Salud</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Hospitales', val: stats.salud.hosp, bg: 'bg-rose-500', text: 'text-white' },
              { label: 'Clínicas', val: stats.salud.clin, bg: 'bg-orange-500', text: 'text-white' },
              { label: 'CDI', val: stats.salud.cdi, bg: 'bg-emerald-500', text: 'text-white' },
              { label: 'Ambulatorio', val: stats.salud.amb, bg: 'bg-blue-500', text: 'text-white' }
            ].map((item, i) => (
              <div key={i} className={`${item.bg} p-3 rounded-xl shadow-sm text-center transform transition-hover hover:scale-105`}>
                <p className={`text-xl font-black ${item.text}`}>{item.val}</p>
                <p className={`text-[8px] font-black ${item.text} uppercase leading-none opacity-80`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BLOQUE INTELIGENCIA SERVIDOR */}
        <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 text-center tracking-widest">Base de Datos de Inteligencia</p>
          <div className="flex justify-around items-center">
            <div className="text-center">
              <p className="text-xl font-black text-amber-500">{stats.inteligencia.puntos.length}</p>
              <p className="text-[8px] font-black text-slate-500 uppercase">Puntos Interés</p>
            </div>
            <div className="text-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-2xl font-black text-sky-500 leading-none">{stats.inteligencia.personas.length}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Sujetos Registrados</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-rose-500">{stats.inteligencia.bandas.length}</p>
              <p className="text-[8px] font-black text-slate-500 uppercase">Grupos Delictivos</p>
            </div>
          </div>
          
        </div>

      </div>

      <div className="bg-slate-900/5 p-4 text-center border-t border-slate-200">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          SOGNE • Inteligencia Geográfica • 2026
        </p>
      </div>
    </div>
  );
};

// Componente decorativo interno si no tienes lucide-react instalado
const Activity = ({ size, className }: any) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
        strokeLinejoin="round" className={className}
    >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);