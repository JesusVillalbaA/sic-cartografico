import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Coordenadas dispersas en Nueva Esparta para incidencias cibernéticas (que carecen de coordenadas físicas reales)
const MOCK_CIBER_COORDS = [
  { lat: 11.025, lng: -63.85 }, // Cerca de La Asunción
  { lat: 10.980, lng: -63.87 }, // Cerca de El Valle
  { lat: 11.010, lng: -63.92 }, // Cerca de San Juan
  { lat: 10.960, lng: -63.85 }  // Cerca de Porlamar
];

// ── MOCK DATA / FALLBACK LAYER (Deduplicación por clave primaria) ────────────────
const MOCK_PUNTOS_INTERES: any[] = [
  { id_punto: 'mockP1', tipo_punto: 'traff_droga', descripcion: 'Venta de estupefacientes', municipio: 'Mariño', sector: 'Porlamar Centro', latitud: 10.955, longitud: -63.855, estado_actual: 'Activo' },
  { id_punto: 'mockP2', tipo_punto: 'vigilancia', descripcion: 'Punto de control preventivo', municipio: 'Maneiro', sector: 'Pampatar', latitud: 10.990, longitud: -63.800, estado_actual: 'Activo' }
];

const MOCK_PERSONAS_INTERES: any[] = [
  { id_persona_interes: 'mockA1', nombre_completo: 'Sujeto Desconocido', alias: 'El Fantasma', rol_o_categoria: 'Líder de banda', latitud: 10.970, longitud: -63.840 }
];

const MOCK_REPORTE_SUSTANCIAS: any[] = [
  { id_detalle: 'mockS1', id_punto: 'mockP1', sustancia: 'Marihuana' }
];

const MOCK_USUARIOS_MAESTRA: any[] = [];

const MOCK_INCIDENCIAS: any[] = [
  { id_incidencia: 'mockI1', tipo_incidente: 'Robo a mano armada', descripcion: 'Reporte de robo en zona comercial', municipio: 'Mariño', sector: 'Centro', latitud: 10.960, longitud: -63.850, fecha_registro: new Date().toISOString(), categoria_incidencia: 'delito', id_usuario_sistema: 'U1' },
  { id_incidencia: 'mockI2', tipo_incidente: 'Phishing', descripcion: 'Alerta cibernética en redes', municipio: 'Arismendi', sector: 'La Asunción', latitud: 11.025, longitud: -63.860, fecha_registro: new Date().toISOString(), categoria_incidencia: 'cibernetica', id_usuario_sistema: 'U1' },
  { id_incidencia: 'mockI3', tipo_incidente: 'Manifestación pacífica', descripcion: 'Cierre parcial de vía principal', municipio: 'Tubores', sector: 'Punta de Piedras', latitud: 10.900, longitud: -64.100, fecha_registro: new Date().toISOString(), categoria_incidencia: 'orden', id_usuario_sistema: 'U1' }
];

const MOCK_INCIDENCIAS_MANIFESTACIONES: any[] = [
  { id_incidencia: 'mockI3', estimacion_personas: 50, vias_afectadas: 'Av. Juan Bautista', consignas_gremio: 'Sindicato de Transporte', presunto_lider: 'Desconocido' }
];

const MOCK_BANDAS: any[] = [
  { id_banda: 'mockB1', nombre_organizacion: 'Los Náufragos', amenaza: 'Alta', miembros_est: 15, modus_operandi: 'Robo y extorsión', fecha_registro: new Date().toISOString(), latitud: 10.950, longitud: -63.870 }
];

const MOCK_ZONAS_BANDAS: any[] = [
  { id_zona: 'mockZ1', id_banda: 'mockB1', nombre_zona: 'Porlamar Oeste' }
];

// ──────────────────────────────────────────────────────────────────────────

/** Filtra los registros que tengan coordenadas válidas reales. */
function hasCoords(item: any): boolean {
  if (item.latitud == null || item.longitud == null) return false;
  const lat = parseFloat(item.latitud);
  const lng = parseFloat(item.longitud);
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
}

function toFeature(item: any, properties: Record<string, any>) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(item.longitud), parseFloat(item.latitud)],
    },
    properties,
  };
}

function geoJSON(features: any[]) {
  return new NextResponse(
    JSON.stringify({ type: 'FeatureCollection', features }),
    { status: 200, headers: JSON_HEADERS }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ layer: string }> }
) {
  try {
    const { layer } = await params;

    // ── 1. Delitos comunes (incidencias físicas) ───────────────────────────────
    if (layer === 'incidencias') {
      let dbIncidencias = [];
      try {
        const { data, error } = await supabase.from('incidencias').select('*, incidencia_fotos(url_foto)');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbIncidencias = data || [];
      } catch (err) {
        console.warn('Fallo al obtener incidencias de la DB, usando mock data', err);
      }

      const existingIds = new Set(dbIncidencias.map((i: any) => i.id_incidencia));
      const fallbacks = MOCK_INCIDENCIAS.filter(m => !existingIds.has(m.id_incidencia));
      const mergedIncidencias = [...dbIncidencias, ...fallbacks];

      let dbUsuarios = [];
      try {
        const { data, error } = await supabase.from('usuarios_maestra').select('*');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];
      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));

      const features = mergedIncidencias
        .filter((i: any) => {
          const cat = (i.categoria_incidencia || '').toLowerCase();
          const tipo = (i.tipo_incidente || '').toLowerCase();
          const isCiber = cat.includes('ciber');
          const isMani = cat.includes('orden') || cat.includes('gremio') || cat.includes('manifest') || tipo.includes('manifest') || cat.includes('concentra') || tipo.includes('concentra');
          return !isCiber && !isMani;
        })
        .filter(hasCoords)
        .map((item: any) => {
          const user = userMap.get(item.id_usuario_sistema);
          return toFeature(item, {
            id: item.id_incidencia,
            id_incidencia: item.id_incidencia,
            tipo_incidente: item.tipo_incidente,
            descripcion: item.descripcion,
            municipio: item.municipio,
            sector: item.sector,
            fecha_registro: item.fecha_registro,
            categoria_incidencia: item.categoria_incidencia,
            incidencia_fotos: JSON.stringify(item.incidencia_fotos?.map((f: any) => f.url_foto) || []),
            url_foto: item.url_foto || 'N/A',
            victimas: item.victimas,
            implicados: item.implicados,
            sujetos_vinculados: item.sujetos_vinculados,
            sujetos: item.sujetos,
            usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
            usuario_cargo: user?.cargo || 'P/O',
          });
        });
      return geoJSON(features);
    }

    // ── 2. Área Cibernética ────────────────────────────────────────────────────
    if (layer === 'cibernetica') {
      let dbIncidencias = [];
      try {
        const { data, error } = await supabase.from('incidencias').select('*, incidencia_fotos(url_foto)');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbIncidencias = data || [];
      } catch (err) {}

      const existingIds = new Set(dbIncidencias.map((i: any) => i.id_incidencia));
      const fallbacks = MOCK_INCIDENCIAS.filter(m => !existingIds.has(m.id_incidencia));
      const mergedIncidencias = [...dbIncidencias, ...fallbacks];

      let dbDetalles = [];
      try {
        const { data, error } = await supabase.from('incidencias_cibernetica').select('*, cibernetica_autores(*, personas_interes(*))');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbDetalles = data || [];
      } catch (err) {}

      let dbUsuarios = [];
      try {
        const { data, error } = await supabase.from('usuarios_maestra').select('*');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];
      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));
      const detMap = new Map(dbDetalles.map((d: any) => [d.id_incidencia, d]));

      const features = mergedIncidencias
        .filter((i: any) => {
          const cat = (i.categoria_incidencia || '').toLowerCase();
          return cat.includes('ciber');
        })
        .map((item: any, idx: number) => {
          // Si no tiene coordenadas, le asignamos una dispersa en Nueva Esparta
          let lat = item.latitud;
          let lng = item.longitud;
          if (lat == null || lng == null || parseFloat(lat) === 0 || parseFloat(lng) === 0) {
            const fallbackCoord = MOCK_CIBER_COORDS[idx % MOCK_CIBER_COORDS.length];
            lat = fallbackCoord.lat;
            lng = fallbackCoord.lng;
          }

          const det = detMap.get(item.id_incidencia);
          const user = userMap.get(item.id_usuario_sistema);
          return toFeature({ latitud: lat, longitud: lng }, {
            id: item.id_incidencia,
            id_incidencia: item.id_incidencia,
            tipo_incidente: item.tipo_incidente || 'Delito Informático',
            descripcion: item.descripcion,
            municipio: item.municipio || 'Nueva Esparta',
            sector: item.sector || 'Ciberespacio',
            fecha_registro: item.fecha_registro,
            categoria_incidencia: item.categoria_incidencia,
            incidencia_fotos: JSON.stringify(item.incidencia_fotos?.map((f: any) => f.url_foto) || []),
            plataforma: det?.plataforma ?? 'N/A',
            ip_origen: det?.ip_origen ?? 'N/A',
            url_afectada: det?.url_afectada ?? 'N/A',
            foto_evidencia_url: det?.foto_evidencia_url ?? null,
            autor_nombre: det?.cibernetica_autores?.personas_interes?.nombre_completo ?? 'Desconocido',
            autor_cedula: det?.cibernetica_autores?.personas_interes?.cedula ?? 'N/A',
            autor_alias: det?.cibernetica_autores?.personas_interes?.alias ?? 'N/A',
            autor_full: det?.cibernetica_autores?.personas_interes ?? null,
            usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
            usuario_cargo: user?.cargo || 'P/O',
          });
        });
      return geoJSON(features);
    }

    // ── 3. Concentraciones / Manifestaciones ──────────────────────────────────
    if (layer === 'concentraciones') {
      let dbIncidencias = [];
      try {
        const { data, error } = await supabase.from('incidencias').select('*, incidencia_fotos(url_foto)');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbIncidencias = data || [];
      } catch (err) {}

      const existingIds = new Set(dbIncidencias.map((i: any) => i.id_incidencia));
      const fallbacks = MOCK_INCIDENCIAS.filter(m => !existingIds.has(m.id_incidencia));
      const mergedIncidencias = [...dbIncidencias, ...fallbacks];

      let dbDetalles = [];
      try {
        const { data, error } = await supabase.from('incidencias_manifestaciones').select('*');
        if (error) console.warn('[API] Warning fetching data from Supabase (offline mode active)');
        dbDetalles = data || [];
      } catch (err) {}
      const existingDetIds = new Set(dbDetalles.map((d: any) => d.id_incidencia));
      const detFallbacks = MOCK_INCIDENCIAS_MANIFESTACIONES.filter(m => !existingDetIds.has(m.id_incidencia));
      const mergedDetalles = [...dbDetalles, ...detFallbacks];

      let dbUsuarios = [];
      try {
        const { data } = await supabase.from('usuarios_maestra').select('*');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];
      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));
      const detMap = new Map(mergedDetalles.map((d: any) => [d.id_incidencia, d]));

      const features = mergedIncidencias
        .filter((i: any) => {
          const cat = (i.categoria_incidencia || '').toLowerCase();
          const tipo = (i.tipo_incidente || '').toLowerCase();
          return cat.includes('orden') || cat.includes('gremio') || tipo.includes('manifest') || cat.includes('manifest') || cat.includes('concentra') || tipo.includes('concentra');
        })
        .filter(hasCoords)
        .map((item: any) => {
          const det = detMap.get(item.id_incidencia);
          const user = userMap.get(item.id_usuario_sistema);
          return toFeature(item, {
            id: item.id_incidencia,
            id_incidencia: item.id_incidencia,
            tipo_incidente: item.tipo_incidente || 'Manifestación',
            descripcion: item.descripcion,
            municipio: item.municipio,
            sector: item.sector,
            fecha_registro: item.fecha_registro,
            categoria_incidencia: item.categoria_incidencia,
            incidencia_fotos: JSON.stringify(item.incidencia_fotos?.map((f: any) => f.url_foto) || []),
            estimacion_personas: det?.estimacion_personas ?? 0,
            vias_afectadas: det?.vias_afectadas ?? 'N/A',
            consignas_gremio: det?.consignas_gremio ?? 'N/A',
            presunto_lider: det?.presunto_lider ?? 'N/A',
            foto_vistas_url: det?.foto_vistas_url ?? null,
            usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
            usuario_cargo: user?.cargo || 'P/O',
          });
        });
      return geoJSON(features);
    }

    // ── 4. Geocalizacion: Drogas ───────────────────────────────────────────────
    if (layer === 'drogas') {
      let dbPuntos = [];
      try {
        const { data } = await supabase.from('puntos_interes').select('*');
        dbPuntos = data || [];
      } catch (err) {}

      const existingIds = new Set(dbPuntos.map((p: any) => p.id_punto));
      const fallbacks = MOCK_PUNTOS_INTERES.filter(m => !existingIds.has(m.id_punto));
      const mergedPuntos = [...dbPuntos, ...fallbacks];

      let dbSustancias = [];
      try {
        const { data } = await supabase.from('reporte_sustancias').select('*');
        dbSustancias = data || [];
      } catch (err) {}
      const existingSustIds = new Set(dbSustancias.map((s: any) => s.id_detalle));
      const sustFallbacks = MOCK_REPORTE_SUSTANCIAS.filter(m => !existingSustIds.has(m.id_detalle));
      const mergedSustancias = [...dbSustancias, ...sustFallbacks];

      let dbUsuarios = [];
      try {
        const { data } = await supabase.from('usuarios_maestra').select('*');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];

      const sustMap = new Map<string, string[]>();
      mergedSustancias.forEach((s: any) => {
        if (!sustMap.has(s.id_punto)) sustMap.set(s.id_punto, []);
        sustMap.get(s.id_punto)!.push(s.sustancia);
      });

      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));

      const features = mergedPuntos
        .filter((i: any) => i.tipo_punto === 'traff_droga' || i.tipo_punto?.toLowerCase().includes('droga'))
        .filter(hasCoords)
        .map((item: any) => {
          const sList = sustMap.get(item.id_punto) || [];
          const user = userMap.get(item.id_usuario_sistema);
          return toFeature(item, {
            id: item.id_punto,
            id_punto: item.id_punto,
            tipo_punto: item.tipo_punto,
            tipo_sustancia: item.tipo_sustancia || sList.join(', '),
            sustancias_list: sList,
            nivel_trafico: item.nivel_trafico ?? 'MEDIO',
            descripcion: item.descripcion,
            fuente_informacion: item.fuente_informacion,
            municipio: item.municipio,
            sector: item.sector,
            fecha_reporte: item.fecha_reporte,
            estado_actual: item.estado_actual,
            url_foto: item.url_foto,
            usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
            usuario_cargo: user?.cargo || 'P/O',
          });
        });
      return geoJSON(features);
    }

    // ── 5. Geocalizacion: Actores de Interés ──────────────────────────────────
    if (layer === 'actores') {
      let dbActores = [];
      try {
        const { data } = await supabase.from('personas_interes').select('*');
        dbActores = data || [];
      } catch (err) {}

      const existingIds = new Set(dbActores.map((a: any) => a.id_persona_interes));
      const fallbacks = MOCK_PERSONAS_INTERES.filter(m => !existingIds.has(m.id_persona_interes));
      const mergedActores = [...dbActores, ...fallbacks];

      let dbUsuarios = [];
      try {
        const { data } = await supabase.from('usuarios_maestra').select('*');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];
      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));

      const features = mergedActores.filter(hasCoords).map((item: any) => {
        const user = userMap.get(item.id_usuario_sistema);
        return toFeature(item, {
          id: item.id_persona_interes,
          id_persona_interes: item.id_persona_interes,
          nombre_completo: item.nombre_completo,
          cedula: item.cedula,
          rol_o_categoria: item.rol_o_categoria,
          afiliacion_o_grupo: item.afiliacion_o_grupo,
          descripcion_actividad: item.descripcion_actividad,
          municipio: item.municipio,
          sector: item.sector,
          fecha_registro: item.fecha_registro,
          estado_actual: item.estado_actual,
          url_foto: item.url_foto,
          alias: item.alias,
          tipo: 'Actor de Interés',
          usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
          usuario_cargo: user?.cargo || 'P/O',
        });
      });
      return geoJSON(features);
    }

    // ── 6. Grupos Delictivos ───────────────────────────────────────────────────
    if (layer === 'grupos') {
      let dbBandas = [];
      try {
        const { data } = await supabase.from('grupos_delictivos').select('*');
        dbBandas = data || [];
      } catch (err) {}

      const existingIds = new Set(dbBandas.map((b: any) => b.id_banda));
      const fallbacks = MOCK_BANDAS.filter(m => !existingIds.has(m.id_banda));
      const mergedBandas = [...dbBandas, ...fallbacks];

      let dbZonas = [];
      try {
        const { data } = await supabase.from('zonas_influencia_banda').select('*');
        dbZonas = data || [];
      } catch (err) {}
      const existingZonaIds = new Set(dbZonas.map((z: any) => z.id_zona));
      const zonaFallbacks = MOCK_ZONAS_BANDAS.filter(m => !existingZonaIds.has(m.id_zona));
      const mergedZonas = [...dbZonas, ...zonaFallbacks];

      const zonasPorBanda = mergedZonas.reduce((acc: Record<string, string[]>, curr: any) => {
        if (!acc[curr.id_banda]) acc[curr.id_banda] = [];
        acc[curr.id_banda].push(curr.nombre_zona);
        return acc;
      }, {});

      const features = mergedBandas.filter(hasCoords).map((banda: any) =>
        toFeature(banda, {
          id: banda.id_banda,
          id_banda: banda.id_banda,
          nombre_organizacion: banda.nombre_organizacion,
          amenaza: banda.amenaza ?? 'Media',
          miembros_est: banda.miembros_est ?? 0,
          modus_operandi: banda.modus_operandi,
          zonas: (zonasPorBanda[banda.id_banda] ?? []).join(', '),
          fecha_registro: banda.fecha_registro,
        })
      );
      return geoJSON(features);
    }

    // ── 7. Geocalizacion: Puntos de Interés (generales) ───────────────────────
    if (layer === 'puntoInteres') {
      let dbPuntos = [];
      try {
        const { data } = await supabase.from('puntos_interes').select('*');
        dbPuntos = data || [];
      } catch (err) {}

      const existingIds = new Set(dbPuntos.map((p: any) => p.id_punto));
      const fallbacks = MOCK_PUNTOS_INTERES.filter(m => !existingIds.has(m.id_punto));
      const mergedPuntos = [...dbPuntos, ...fallbacks];

      let dbUsuarios = [];
      try {
        const { data } = await supabase.from('usuarios_maestra').select('*');
        dbUsuarios = data || [];
      } catch (err) {}
      const existingUserIds = new Set(dbUsuarios.map((u: any) => u.id_usuario));
      const userFallbacks = MOCK_USUARIOS_MAESTRA.filter(m => !existingUserIds.has(m.id_usuario));
      const mergedUsuarios = [...dbUsuarios, ...userFallbacks];
      const userMap = new Map(mergedUsuarios.map((u: any) => [u.id_usuario, u]));

      const features = mergedPuntos
        .filter((i: any) => i.tipo_punto !== 'traff_droga' && !i.tipo_punto?.toLowerCase().includes('droga'))
        .filter(hasCoords)
        .map((item: any) => {
          const user = userMap.get(item.id_usuario_sistema);
          return toFeature(item, {
            id: item.id_punto,
            id_punto: item.id_punto,
            tipo_punto: item.tipo_punto,
            descripcion: item.descripcion,
            fuente_informacion: item.fuente_informacion,
            municipio: item.municipio,
            sector: item.sector,
            fecha_reporte: item.fecha_reporte,
            estado_actual: item.estado_actual,
            url_foto: item.url_foto,
            tipo: 'Punto de Interés',
            usuario_nombre: user?.nombre_completo || 'DESCONOCIDO',
            usuario_cargo: user?.cargo || 'P/O',
          });
        });
      return geoJSON(features);
    }

    return new NextResponse(
      JSON.stringify({ error: `Capa '${layer}' no encontrada` }),
      { status: 404, headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error('[API /map] Error:', err?.message ?? err);
    return geoJSON([]);
  }
}
