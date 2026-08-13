import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import { RECURSOS_SALUD, RECURSOS_INFRAESTRUCTURA, RESET_VIEW, BOUNDS } from './mapConstants';
import { cleanPaint, toggleState, clearAndReset } from './mapUtils';
import { MAP_LAYERS } from './MapConfig';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const fetchAndSetData = async (map: mapboxgl.Map | null | undefined, sourceId: string, url: string) => {
  if (!map) return;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const geojson = await response.json();
    // Re-check after async: map may have been destroyed during fetch
    if (!map || typeof map.getSource !== 'function' || !map.getStyle()) return;
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) source.setData(geojson);
  } catch (err) {
    // Silently ignore if map was removed (e.g. theme change triggers remount)
    if (err instanceof Error && err.message.includes('removed')) return;
    console.error(`[SIGDI] Error cargando ${sourceId} desde ${url}:`, err);
  }
};

export const useMapbox = (
  layersVisible: any,
  fetchZonasDeRiesgo: () => Promise<void>,
  setSelectedFeatures: React.Dispatch<React.SetStateAction<any[]>>,
  selectedFeatures: any[],
  theme: string = 'dark',
  onFeatureClick?: (feature: any) => void
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapInitialized = useRef(false);
  // Usamos un state para que el useEffect de visibilidad se dispare DESPUÉS de que el mapa cargue
  const [mapReady, setMapReady] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  // INICIALIZACIÓN DEL MAPA (solo una vez)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapInitialized.current) return;
    mapInitialized.current = true;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: theme === 'light' ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/satellite-streets-v12',
      ...RESET_VIEW,
      fadeDuration: 0,
      minZoom: 7,
      maxZoom: 19,
      dragRotate: false,
      trackResize: true,
      preserveDrawingBuffer: true
    });

    m.on('load', async () => {
      map.current = m;

      // Ocultar capas de salud del basemap
      m.getStyle().layers.forEach(layer => {
        const id = layer.id;
        if (id.includes('hospital') || id.includes('clinic') || id.includes('pharmacy') ||
            id.includes('doctor') || id.includes('health') || id.includes('medical')) {
          m.setLayoutProperty(id, 'visibility', 'none');
        }
      });

      // ── FUENTES ESTÁTICAS ──────────────────────────────────────────────────
      m.addSource('municipios-source', { type: 'geojson', data: '/api/map/capas?nombre=ven_admin2', generateId: true });
      m.addSource('salud-source',      { type: 'geojson', data: '/api/map/capas?nombre=centrossalud', generateId: true });
      m.addSource('cuadrantes-source', { type: 'geojson', data: '/api/map/capas?nombre=cuadrantes', generateId: true });
      m.addSource('poligonos-source',  { type: 'geojson', data: '/api/map/capas?nombre=PoligonoCuadrantes', generateId: true });
      m.addSource('compas-source',     { type: 'geojson', data: '/api/map/capas?nombre=compas', generateId: true });
      m.addSource('incidentes-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('heatmap-delitos-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addSource('parroquias-source', { type: 'geojson', data: '/api/map/capas?nombre=ven_admin3', generateId: true });
      m.addSource('vialidad-source',   { type: 'geojson', data: '/api/map/capas?nombre=viabilidad', generateId: true });
      m.addSource('estaciones-source', { type: 'geojson', data: '/api/map/capas?nombre=estacionservicio', generateId: true });
      m.addSource('antenas-digitel-source',  { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true });
      m.addSource('antenas-movilnet-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true });
      m.addSource('antenas-movistar-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true });
      m.addSource('sistemas-electricos-source', { type: 'geojson', data: '/api/map/capas?nombre=SISTEMAELECTRICONE', generateId: true });
      m.addSource('embalses-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, generateId: true });
      m.addSource('estaciones-gas-source', { type: 'geojson', data: '/api/map/capas?nombre=estaciongasNE', generateId: true });
      m.addSource('transporte-source', { type: 'geojson', data: '/api/map/capas?nombre=transporte', generateId: true });

      RECURSOS_SALUD.forEach(res => {
        m.addSource(`${res.id}-source`, { type: 'geojson', data: res.src, generateId: true });
      });
      RECURSOS_INFRAESTRUCTURA.forEach(res => {
        m.addSource(`${res.id}-source`, { type: 'geojson', data: res.src, generateId: true });
      });

      // ── FUENTES DINÁMICAS (Supabase via API) ──────────────────────────────
      const empty: any = { type: 'FeatureCollection', features: [] };
      m.addSource('incidencias-riesgo',       { type: 'geojson', data: empty });
      m.addSource('cibernetica-incidente',     { type: 'geojson', data: empty });
      m.addSource('concentraciones-incidente', { type: 'geojson', data: empty });
      m.addSource('drogas-trafico',            { type: 'geojson', data: empty });
      m.addSource('actores',                   { type: 'geojson', data: empty });
      m.addSource('grupos-bandas',             { type: 'geojson', data: empty });
      m.addSource('puntos-interes',            { type: 'geojson', data: empty });

      // IAPOLENE (polígonos)
      m.addSource('iapollene-polygons', { type: 'geojson', data: empty });
      fetch('/api/map/capas?nombre=IAPOLENE')
        .then(r => r.json())
        .then(geojson => {
          const polygons = (geojson.features || []).filter((f: any) =>
            f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
          );
          if (!map.current || typeof map.current.getSource !== 'function') return;
          const src = map.current.getSource('iapollene-polygons') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features: polygons });
        })
        .catch(err => console.error('Error IAPOLENE:', err));

      // ── CAPAS ─────────────────────────────────────────────────────────────

      // IAPOLENE — AZUL OPERATIVO (#2563eb)
      m.addLayer({ id: 'iapollene-fill', type: 'fill', source: 'iapollene-polygons', layout: { visibility: 'visible' }, paint: { 'fill-color': '#2563eb', 'fill-opacity': 0.35, 'fill-outline-color': '#1e3a8a' } });
      m.addLayer({ id: 'iapollene-polygon-line', type: 'line', source: 'iapollene-polygons', layout: { visibility: 'visible' }, paint: { 'line-color': '#1e3a8a', 'line-width': 2.5, 'line-opacity': 1 } });
      m.addLayer({ id: 'iapollene-labels', type: 'symbol', source: 'iapollene-polygons', layout: { visibility: 'visible', 'text-field': ['get', 'NAME'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 0.8], 'text-anchor': 'center' }, paint: { 'text-color': '#1e3a8a', 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });

      // Municipios — NEÓN CYAN (#00f0ff)
      m.addLayer({ id: 'municipios-fill', type: 'fill', source: 'municipios-source', filter: ['==', ['get', 'adm1_name'], 'Nueva Esparta'], paint: { 'fill-color': 'rgba(6, 182, 212, 0.03)' } });
      m.addLayer({ id: 'municipios-local', type: 'line', source: 'municipios-source', filter: ['==', ['get', 'adm1_name'], 'Nueva Esparta'], paint: { 'line-color': '#06b6d4', 'line-width': 1.8, 'line-opacity': 0.8 } });

      // Sectores — VERDE ESMERALDA (#10b981)
      m.addLayer({ id: 'sectores-api', type: 'circle', source: 'composite', 'source-layer': 'place_label', filter: ['match', ['get', 'class'], ['settlement', 'suburb', 'neighbourhood'], true, false], layout: { visibility: 'visible' }, paint: { 'circle-radius': 5.5, 'circle-color': '#10b981', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.9 } });

      // Cuadrantes polígonos — ORO BRILLANTE (#fbbf24)
      m.addLayer({ id: 'poligonos-fill',   type: 'fill',   source: 'poligonos-source', layout: { visibility: 'none' }, paint: { 'fill-color': '#fbbf24', 'fill-opacity': 0.2, 'fill-outline-color': '#b45309' } });
      m.addLayer({ id: 'poligonos-line',   type: 'line',   source: 'poligonos-source', layout: { visibility: 'none' }, paint: { 'line-color': '#b45309', 'line-width': 2 } });
      m.addLayer({ id: 'poligonos-labels', type: 'symbol', source: 'poligonos-source', layout: { ...MAP_LAYERS.cuadrantesPoligonos.label.layout, 'text-field': ['coalesce', ['get', 'comuna'], ['concat', 'C-', ['get', 'cuadrante']]] } as any, paint: { 'text-color': '#b45309', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // Compas polígonos — ROJO (#ef4444)
      m.addLayer({ id: 'compas-fill',   type: 'fill',   source: 'compas-source', layout: { visibility: 'none' }, paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.2, 'fill-outline-color': '#991b1b' } });
      m.addLayer({ id: 'compas-line',   type: 'line',   source: 'compas-source', layout: { visibility: 'none' }, paint: { 'line-color': '#991b1b', 'line-width': 2 } });
      m.addLayer({ id: 'compas-labels', type: 'symbol', source: 'compas-source', layout: { visibility: 'none', 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 11, 'text-anchor': 'center' }, paint: { 'text-color': '#991b1b', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // Cuadrantes puntos
      m.addLayer({ id: 'cuadrantes-glow',   type: 'circle', source: 'cuadrantes-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 16, 'circle-color': '#fbbf24', 'circle-blur': 1.8, 'circle-opacity': 0.5 } });
      m.addLayer({ id: 'cuadrantes-layer',  type: 'circle', source: 'cuadrantes-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 6, 'circle-color': '#d97706', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.9 } });
      m.addLayer({ id: 'cuadrantes-labels', type: 'symbol', source: 'cuadrantes-source', layout: { visibility: 'none', 'text-field': ['coalesce', ['get', 'comuna'], ['concat', 'C-', ['get', 'cuadrante']]], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-anchor': 'top', 'text-offset': [0, 1.2] }, paint: { 'text-color': '#92400e', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // Salud / Incidentes legacy
      m.addLayer({ id: 'salud-glow',    type: 'circle', source: 'salud-source',     layout: { visibility: 'none' }, paint: { 'circle-radius': 16, 'circle-color': '#39ff14', 'circle-blur': 1.2, 'circle-opacity': 0.5 } });
      m.addLayer({ id: 'incidentes-glow',  type: 'circle', source: 'incidentes-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 16, 'circle-color': '#ff003c', 'circle-blur': 1.2, 'circle-opacity': 0.6 } });
      m.addLayer({ id: 'incidentes-icons', type: 'circle', source: 'incidentes-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 6,  'circle-color': '#ff003c', 'circle-stroke-width': 1.5, 'circle-stroke-color': '#ffffff' } });
      m.addLayer({
        id: 'incidentes-heatmap',
        type: 'heatmap',
        source: 'heatmap-delitos-source',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0)',
            0.2, 'rgb(0, 255, 200)',
            0.4, 'rgb(0, 200, 255)',
            0.6, 'rgb(255, 230, 0)',
            0.8, 'rgb(255, 100, 0)',
            1, 'rgb(255, 0, 60)'
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 4, 9, 22, 15, 45],
          'heatmap-opacity': 0.85
        }
      });

      // ── CARGAR ÍCONOS PERSONALIZADOS ──
      const customIcons = [
        { id: 'icon-hospitales', url: '/hospital.png' },
        { id: 'icon-clinicas', url: '/clinica.png' },
        { id: 'icon-ambulatorios', url: '/ambulatorio.png' },
        { id: 'icon-cdi', url: '/centrosalud.png' },
        { id: 'icon-estaciones', url: '/gasolinera.png' },
        { id: 'icon-escuelas', url: '/infraestructura.png' },
        { id: 'icon-electricos', url: '/electricidad.png' },
        { id: 'icon-gas', url: '/gas.png' },
        { id: 'icon-agua', url: '/agua.png' },
        { id: 'icon-delitos', url: '/delitos.png' },
        { id: 'icon-cibernetica', url: '/hacker.png' },
        { id: 'icon-concentraciones', url: '/concentracion.png' },
        { id: 'icon-drogas', url: '/drogas.png' },
        { id: 'icon-actores', url: '/actor.png' },
        { id: 'icon-bandas', url: '/banda.png' },
        { id: 'icon-puntos-interes', url: '/punto.png' }
      ];
      customIcons.forEach(icon => {
        m.loadImage(icon.url, (error, image) => {
          if (!error && image && !m.hasImage(icon.id)) {
            m.addImage(icon.id, image);
          }
        });
      });

      // Recursos salud e infraestructura
      RECURSOS_SALUD.forEach(res => {
        m.addLayer({ id: `${res.id}-layer`, type: 'circle', source: `${res.id}-source`, layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': res.color, 'circle-opacity': 1 } });
        m.addLayer({ id: `${res.id}-icons`, type: 'symbol', source: `${res.id}-source`, layout: { visibility: 'none', 'icon-image': `icon-${res.id}`, 'icon-size': 0.04, 'text-field': ['get', 'nombre'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': res.color, 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });
      });
      RECURSOS_INFRAESTRUCTURA.forEach(res => {
        if (res.type === 'line') {
          m.addLayer({ id: `${res.id}-layer`, type: 'line',   source: `${res.id}-source`, layout: { visibility: 'none' }, paint: { 'line-color': res.color, 'line-width': 3.5, 'line-opacity': 0.9 } });
        } else {
          m.addLayer({ id: `${res.id}-layer`, type: 'circle', source: `${res.id}-source`, layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': res.color, 'circle-opacity': 1 } });
          const iconId = res.id === 'escuelas' ? 'icon-escuelas' : 'icon-estaciones';
          m.addLayer({ id: `${res.id}-icons`, type: 'symbol', source: `${res.id}-source`, layout: { visibility: 'none', 'icon-image': iconId, 'icon-size': 0.04, 'text-field': ['coalesce', ['get', 'nombre'], ['get', 'NAME']], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': res.color, 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });
        }
      });

      // Parroquias / Vialidad / Estaciones
      m.addLayer({ id: 'parroquias-fill', type: 'fill', source: 'parroquias-source', layout: { visibility: 'none' }, paint: { 'fill-color': '#ff00ff', 'fill-opacity': 0.15, 'fill-outline-color': '#ff00ff' } });
      m.addLayer({ id: 'parroquias-line', type: 'line', source: 'parroquias-source', filter: ['==', ['get', 'adm1_name'], 'Nueva Esparta'], layout: { visibility: 'none' }, paint: { 'line-color': '#ff00ff', 'line-width': 2, 'line-opacity': 0.8 } });
      m.addLayer({ id: 'vialidad-layer',  type: 'line', source: 'vialidad-source',   layout: { visibility: 'none' }, paint: { 'line-color': '#adff2f', 'line-width': 2.5, 'line-opacity': 0.9 } });
      m.addLayer({ id: 'estaciones-layer',  type: 'circle', source: 'estaciones-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': ['match', ['get', 'TIPO_SERVICIO'], 'Marítima', '#0ea5e9', '#ff4500'], 'circle-opacity': 1 } });
      m.addLayer({ id: 'estaciones-labels', type: 'symbol', source: 'estaciones-source', layout: { visibility: 'none', 'icon-image': 'icon-estaciones', 'icon-size': 0.04, 'text-field': ['get', 'NAME'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': ['match', ['get', 'TIPO_SERVICIO'], 'Marítima', '#0ea5e9', '#ff4500'], 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });
      // TRANSPORTE
      m.addLayer({ id: 'transporte-layer',  type: 'circle', source: 'transporte-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 8, 'circle-color': ['match', ['get', 'tipo'], 'Terminal Principal', '#6366f1', 'Terminal de Autobuses', '#6366f1', 'Histórico / Antiguo Terminal', '#6366f1', '#0ea5e9'], 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.95 } });
      m.addLayer({ id: 'transporte-labels', type: 'symbol', source: 'transporte-source', layout: { visibility: 'none', 'text-field': ['get', 'nombre'], 'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'], 'text-size': 10, 'text-offset': [0, 1.2], 'text-anchor': 'top' }, paint: { 'text-color': ['match', ['get', 'tipo'], 'Terminal Principal', '#6366f1', 'Terminal de Autobuses', '#6366f1', 'Histórico / Antiguo Terminal', '#6366f1', '#0ea5e9'], 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // Antenas — DIGITEL (#9400d3), MOVILNET (#00ff7f), MOVISTAR (#00bfff)
      m.addLayer({ id: 'antenas-digitel-layer', type: 'circle', source: 'antenas-digitel-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 8, 'circle-color': '#9400d3', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.95 } });
      m.addLayer({ id: 'antenas-movilnet-layer', type: 'circle', source: 'antenas-movilnet-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 8, 'circle-color': '#00ff7f', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.95 } });
      m.addLayer({ id: 'antenas-movistar-layer', type: 'circle', source: 'antenas-movistar-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 8, 'circle-color': '#00bfff', 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff', 'circle-opacity': 0.95 } });

      // Sistemas Eléctricos — NEÓN AMARILLO ELÉCTRICO (#ffff00)
      m.addLayer({ id: 'sistemas-electricos-layer', type: 'circle', source: 'sistemas-electricos-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 16, 'circle-color': '#ffffff', 'circle-stroke-width': 3, 'circle-stroke-color': '#eab308', 'circle-opacity': 1 } });
      m.addLayer({ id: 'sistemas-electricos-icons', type: 'symbol', source: 'sistemas-electricos-source', layout: { visibility: 'none', 'icon-image': 'icon-electricos', 'icon-size': 0.04, 'text-field': ['get', 'nombre'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#eab308', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // Servicio de Agua — Subcategorías
      const waterSubcats = [
        { id: 'desalinizadoras', color: '#0284c7' },
        { id: 'tratamiento',     color: '#0d9488' },
        { id: 'bombeoServidas',  color: '#854d0e' },
        { id: 'bombeoPotable',   color: '#0369a1' },
        { id: 'tanques',         color: '#2563eb' },
        { id: 'diques',          color: '#047857' },
        { id: 'pozos',           color: '#06b6d4' },
        { id: 'clorado',         color: '#eab308' },
        { id: 'parales',         color: '#00bcd4' },
        { id: 'embalses',        color: '#00838f' }
      ];

      waterSubcats.forEach(sub => {
        m.addLayer({
          id: `agua-${sub.id}-point`,
          type: 'circle',
          source: 'embalses-source',
          filter: ['==', ['get', 'subcategoria'], sub.id],
          layout: { visibility: 'none' },
          paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': sub.color, 'circle-opacity': 1 }
        });
        m.addLayer({
          id: `agua-${sub.id}-icons`,
          type: 'symbol',
          source: 'embalses-source',
          filter: ['==', ['get', 'subcategoria'], sub.id],
          layout: { visibility: 'none', 'icon-image': 'icon-agua', 'icon-size': 0.04, 'text-field': ['get', 'name'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true },
          paint: { 'text-color': sub.color, 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 }
        });
      });

      // Estaciones de Gas — NARANJA INTENSO (#ff8c00)
      m.addLayer({ id: 'estaciones-gas-layer', type: 'circle', source: 'estaciones-gas-source', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#ff8c00', 'circle-opacity': 1 } });
      m.addLayer({ id: 'estaciones-gas-labels', type: 'symbol', source: 'estaciones-gas-source', layout: { visibility: 'none', 'icon-image': 'icon-gas', 'icon-size': 0.04, 'text-field': ['get', 'nombre'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#ff8c00', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // ── CAPAS DINÁMICAS (Supabase) ─────────────────────────────────────────
      // 1. Delitos comunes — ROJO BRILLANTE (#ff003c)
      m.addLayer({ id: 'incidencias-riesgo-layer', type: 'circle', source: 'incidencias-riesgo', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#ff003c', 'circle-opacity': 1 } });
      m.addLayer({ id: 'incidencias-riesgo-icons', type: 'symbol', source: 'incidencias-riesgo', layout: { visibility: 'none', 'icon-image': 'icon-delitos', 'icon-size': 0.04, 'text-field': ['get', 'tipo_incidente'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#ff003c', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // 2. Cibernética — VIOLETA ELECTRICO (#7b2cbf)
      m.addLayer({ id: 'cibernetica-incidente-layer', type: 'circle', source: 'cibernetica-incidente', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#7b2cbf', 'circle-opacity': 1 } });
      m.addLayer({ id: 'cibernetica-incidente-icons', type: 'symbol', source: 'cibernetica-incidente', layout: { visibility: 'none', 'icon-image': 'icon-cibernetica', 'icon-size': 0.04, 'text-field': ['get', 'tipo_incidente'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#7b2cbf', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // 3. Concentraciones — ORO BRILLANTE (#ffd700)
      m.addLayer({ id: 'concentraciones-incidente-layer', type: 'circle', source: 'concentraciones-incidente', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#ffd700', 'circle-opacity': 1 } });
      m.addLayer({ id: 'concentraciones-incidente-icons', type: 'symbol', source: 'concentraciones-incidente', layout: { visibility: 'none', 'icon-image': 'icon-concentraciones', 'icon-size': 0.04, 'text-field': ['get', 'tipo_incidente'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#eab308', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // 4. Drogas — VERDE NEON (#39ff14)
      m.addLayer({ id: 'drogas-trafico-layer', type: 'circle', source: 'drogas-trafico', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#39ff14', 'circle-opacity': 1 } });
      m.addLayer({ id: 'drogas-trafico-icons', type: 'symbol', source: 'drogas-trafico', layout: { visibility: 'none', 'icon-image': 'icon-drogas', 'icon-size': 0.04, 'text-anchor': 'top', 'icon-allow-overlap': true } });

      // 5. Actores de interés — ROSA MEXICANO (#ff007f)
      m.addLayer({ id: 'actores-layer', type: 'circle', source: 'actores', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#ff007f', 'circle-opacity': 1 } });
      m.addLayer({ id: 'actores-icons', type: 'symbol', source: 'actores', layout: { visibility: 'none', 'icon-image': 'icon-actores', 'icon-size': 0.04, 'text-field': ['get', 'alias'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#ff007f', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // 6. Grupos delictivos — AZUL ZAFIRO (#0f52ba)
      m.addLayer({ id: 'grupos-bandas-layer', type: 'circle', source: 'grupos-bandas', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#0f52ba', 'circle-opacity': 1 } });
      m.addLayer({ id: 'grupos-bandas-icons', type: 'symbol', source: 'grupos-bandas', layout: { visibility: 'none', 'icon-image': 'icon-bandas', 'icon-size': 0.04, 'text-field': ['get', 'nombre_banda'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#0f52ba', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // 7. Puntos de interés — TURQUESA ELÉCTRICO (#00f5ff)
      m.addLayer({ id: 'puntos-interes-layer', type: 'circle', source: 'puntos-interes', layout: { visibility: 'none' }, paint: { 'circle-radius': 12, 'circle-color': '#ffffff', 'circle-stroke-width': 2.5, 'circle-stroke-color': '#00f5ff', 'circle-opacity': 1 } });
      m.addLayer({ id: 'puntos-interes-icons', type: 'symbol', source: 'puntos-interes', layout: { visibility: 'none', 'icon-image': 'icon-puntos-interes', 'icon-size': 0.04, 'text-field': ['get', 'nombre_punto'], 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'], 'text-size': 10, 'text-offset': [0, 1.6], 'text-anchor': 'top', 'icon-allow-overlap': true }, paint: { 'text-color': '#00f5ff', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } });

      // ── BÚSQUEDA GLOBAL / RESALTADO (Siempre visible) ────────────────────
      m.addSource('search-highlight-source', { type: 'geojson', data: empty });
      
      // Capa para polígonos (ej. Municipios, Parroquias) resaltados
      m.addLayer({ 
        id: 'search-highlight-fill', 
        type: 'fill', 
        source: 'search-highlight-source', 
        filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']],
        paint: { 'fill-color': '#06b6d4', 'fill-opacity': 0.3, 'fill-outline-color': '#00ffff' } 
      });
      m.addLayer({ 
        id: 'search-highlight-line', 
        type: 'line', 
        source: 'search-highlight-source', 
        filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon'], ['==', ['geometry-type'], 'LineString']],
        paint: { 'line-color': '#00ffff', 'line-width': 4, 'line-opacity': 1 } 
      });
      // Capa para puntos resaltados
      m.addLayer({ 
        id: 'search-highlight-circle', 
        type: 'circle', 
        source: 'search-highlight-source', 
        filter: ['==', ['geometry-type'], 'Point'],
        paint: { 
          'circle-radius': 14, 
          'circle-color': 'rgba(0, 255, 255, 0.4)', 
          'circle-stroke-width': 3, 
          'circle-stroke-color': '#00ffff' 
        } 
      });

      // ── FOCUS MASK (Efecto animado pro) ────────────────────
      m.addSource('focus-mask-source', { type: 'geojson', data: empty });
      m.addLayer({
        id: 'focus-mask-layer',
        type: 'fill',
        source: 'focus-mask-source',
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.75,
          'fill-opacity-transition': { duration: 1000 }
        }
      });

      // ── CARGA DE DATOS DESDE LA API ────────────────────────────────────────
      fetchAndSetData(m, 'incidencias-riesgo',       '/api/map/incidencias');
      fetchAndSetData(m, 'cibernetica-incidente',     '/api/map/cibernetica');
      fetchAndSetData(m, 'concentraciones-incidente', '/api/map/concentraciones');
      fetchAndSetData(m, 'drogas-trafico',            '/api/map/drogas');
      fetchAndSetData(m, 'actores',                   '/api/map/actores');
      fetchAndSetData(m, 'grupos-bandas',             '/api/map/grupos');
      fetchAndSetData(m, 'puntos-interes',            '/api/map/puntoInteres');

      // ── CARGA COMBINADA PARA MAPA DE CALOR (Delitos Comunes + Cibernéticos) ──
      const loadHeatmapData = async () => {
        try {
          const [resInc, resCiber] = await Promise.all([
            fetch('/api/map/incidencias').then(r => r.json()).catch(() => ({ features: [] })),
            fetch('/api/map/cibernetica').then(r => r.json()).catch(() => ({ features: [] }))
          ]);
          const combinedFeatures = [
            ...(resInc?.features || []),
            ...(resCiber?.features || [])
          ];
          const heatSrc = m.getSource('heatmap-delitos-source') as mapboxgl.GeoJSONSource;
          if (heatSrc) {
            heatSrc.setData({ type: 'FeatureCollection', features: combinedFeatures });
          }
        } catch (e) {
          console.warn("Error cargando datos de mapa de calor:", e);
        }
      };
      loadHeatmapData();

      // ── CARGA DE ANTENAS DESDE ARCHIVOS SEPARADOS POR OPERADORA ──────────────
      const loadAntenaFile = async (file: string, operadora: string, sourceId: string) => {
        try {
          const r = await fetch(file);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const raw = await r.json();

          // Soporta tanto GeoJSON FeatureCollection como un array simple [{name, address, coordinates}]
          let features: any[] = [];
          if (raw.type === 'FeatureCollection') {
            features = (raw.features || []).map((f: any) => {
              if (!f.properties) f.properties = {};
              f.properties.operadora = operadora;
              // Normalizar campos del formato ANTENAS.geojson viejo
              if (!f.properties.name && f.properties.NAME) f.properties.name = f.properties.NAME;
              if (!f.properties.address && f.properties.DIRECCION) f.properties.address = f.properties.DIRECCION;
              if (!f.properties.address && f.properties.SECTOR)    f.properties.address = f.properties.SECTOR;
              return f;
            });
          } else if (Array.isArray(raw)) {
            // Formato nuevo: [{name, address, coordinates}]
            features = raw.map((item: any) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: item.coordinates || [0, 0]
              },
              properties: {
                name: item.name || item.NAME || 'Antena',
                address: item.address || item.DIRECCION || '',
                operadora,
                ...Object.fromEntries(Object.entries(item).filter(([k]) => !['name','address','coordinates'].includes(k)))
              }
            }));
          }
          if (!map.current || typeof map.current.getSource !== 'function') return;
          const src = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features });
        } catch (e) {
          console.error(`[SIGDI] Error cargando ${file}:`, e);
        }
      };

      loadAntenaFile('/api/map/capas?nombre=movilnet', 'MOVILNET', 'antenas-movilnet-source');
      loadAntenaFile('/api/map/capas?nombre=digitel',  'DIGITEL',  'antenas-digitel-source');
      loadAntenaFile('/api/map/capas?nombre=movistar', 'MOVISTAR', 'antenas-movistar-source');


      // ── CARGA DE ESTACIONES DE AGUA DESDE estacionesagua.geojson ──────────
      const loadEstacionesAgua = async () => {
        try {
          const r = await fetch('/api/map/capas?nombre=estacionagua');
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const raw = await r.json();
          let features: any[] = [];

          const getWaterSubcat = (p: any) => {
            if (p.subcategoria && !['parales', 'embalses'].includes(p.subcategoria)) {
              return p.subcategoria;
            }
            const tp = (p.tipo || p.type || '').toUpperCase();
            const nm = (p.name || p.NAME || '').toUpperCase();
            if (tp.includes('DESALINIZADORA') || nm.includes('DESALINIZADORA')) return 'desalinizadoras';
            if (tp.includes('TRATAMIENTO') || nm.includes('TRATAMIENTO')) return 'tratamiento';
            if (tp.includes('SERVIDAS') || nm.includes('AGUAS SERVIDAS') || nm.includes(' AS ')) return 'bombeoServidas';
            if (tp.includes('POTABLE') || nm.includes('AGUA POTABLE') || nm.includes(' AP ')) return 'bombeoPotable';
            if (tp.includes('TANQUE') || nm.includes('TANQUE')) return 'tanques';
            if (tp.includes('DIQUE') || nm.includes('DIQUE')) return 'diques';
            if (tp.includes('POZO') || nm.includes('POZO')) return 'pozos';
            if (tp.includes('CLORADO') || nm.includes('CLORADO')) return 'clorado';
            if (nm.includes('PARAL')) return 'parales';
            return 'embalses';
          };

          if (raw.type === 'FeatureCollection') {
            features = (raw.features || []).map((f: any) => {
              if (!f.properties) f.properties = {};
              f.properties.subcategoria = getWaterSubcat(f.properties);
              return f;
            });
          } else if (Array.isArray(raw)) {
            features = raw.map((item: any) => {
              const subcategoria = getWaterSubcat(item);
              return {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: item.coordinates || [0, 0] },
                properties: {
                  name: item.name || item.NAME || 'Estación de Agua',
                  subcategoria,
                  institution: item.institution || '',
                  status: item.status || '',
                  type: item.type || item.tipo || '',
                  municipality: item.municipality || item.municipio || '',
                  parish: item.parish || '',
                  address: item.address || item.direccion || '',
                  gpxx_Categ: item.gpxx_Categ || '',
                  ...Object.fromEntries(Object.entries(item).filter(([k]) => !['name','NAME','institution','status','type','municipality','municipio','parish','address','coordinates','gpxx_Categ'].includes(k)))
                }
              };
            });
          }
          if (!map.current || typeof map.current.getSource !== 'function') return;
          const src = map.current.getSource('embalses-source') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features });
          console.log(`[SIGDI] Estaciones de agua: ${features.length} cargadas correctamente`);
        } catch (e) { console.error('[SIGDI] Error cargando estacionagua.geojson:', e); }
      };
      loadEstacionesAgua();

      await fetchZonasDeRiesgo();

      // ── EVENTOS CLICK Y HOVER ──────────────────────────────────────────────
      const capasSalud = RECURSOS_SALUD.map(r => `${r.id}-layer`);
      const capasInf   = RECURSOS_INFRAESTRUCTURA.map(r => `${r.id}-layer`);
      const waterLayers = ['desalinizadoras', 'tratamiento', 'bombeoServidas', 'bombeoPotable', 'tanques', 'diques', 'pozos', 'clorado', 'parales', 'embalses'].map(s => `agua-${s}-point`);

      const layersToQuery = [
        ...capasSalud, ...capasInf, ...waterLayers,
        'iapollene-fill', 'iapollene-polygon-line', 'iapollene-labels',
        'vialidad-layer', 'parroquias-fill', 'incidentes-icons', 'cuadrantes-layer',
        'municipios-fill', 'sectores-api', 'poligonos-fill', 'compas-fill',
        'estaciones-layer', 'estaciones-labels',
        'incidencias-riesgo-layer', 'cibernetica-incidente-layer', 'concentraciones-incidente-layer',
        'drogas-trafico-layer', 'actores-layer', 'grupos-bandas-layer', 'puntos-interes-layer',
        'antenas-digitel-layer', 'antenas-movilnet-layer', 'antenas-movistar-layer',
        'sistemas-electricos-layer', 'estaciones-gas-layer', 'transporte-layer'
      ];

      m.on('click', (e) => {
        const queryable = layersToQuery.filter(l => m.getLayer(l));
        const features  = m.queryRenderedFeatures(e.point, { layers: queryable });
        if (!features.length) {
          clearAndReset(m, selectedFeatures, setSelectedFeatures);
          if (onFeatureClick) onFeatureClick(null);
          const maskSrc = m.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
          if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });
          return;
        }
        const clicked = features[0];
        
        // --- PRO ANIMATION LOGIC ---
        let focusPoly: any = null;
        if (clicked.geometry) {
            try {
                if (clicked.geometry.type === 'Polygon' || clicked.geometry.type === 'MultiPolygon') {
                    focusPoly = clicked;
                } else if (clicked.geometry.type === 'Point' || clicked.geometry.type === 'MultiPoint') {
                    const coords = clicked.geometry.type === 'Point' ? (clicked.geometry as any).coordinates : (clicked.geometry as any).coordinates[0];
                    const isElectrical = clicked.layer?.id?.includes('electric');
                    focusPoly = turf.circle(coords, isElectrical ? 0.1 : 0.1); // 100m de radio
                } else if (clicked.geometry.type === 'LineString' || clicked.geometry.type === 'MultiLineString') {
                    focusPoly = turf.buffer(clicked as any, 0.1); // 100m de radio para lineas
                }

                if (focusPoly) {
                    const bbox = turf.bbox(focusPoly) as [number, number, number, number];
                    m.fitBounds(bbox, { padding: 80, pitch: 45, duration: 1000 });
                    const mask = turf.mask(focusPoly);
                    const maskSrc = m.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
                    if (maskSrc) maskSrc.setData(mask);
                } else {
                    m.flyTo({ center: e.lngLat, zoom: 14, pitch: 45, duration: 1000 });
                }
            } catch (err) {
                console.error("Error al hacer focus:", err);
                m.flyTo({ center: e.lngLat, zoom: 14, pitch: 45, duration: 1000 });
            }
        }
        // ---------------------------

        const props = clicked.properties;
        const id = props?.id || props?.id_punto || props?.id_incidencia || props?.id_persona_interes || props?.cuadrante || props?.nombre || props?.adm2_name || props?.NAME;
        setSelectedFeatures(prev => {
          toggleState(m, clicked, true);
          const filtered = prev.filter(p => (p.properties?.id || p.properties?.id_punto || p.properties?.id_incidencia || p.properties?.id_persona_interes || p.properties?.cuadrante || p.properties?.nombre || p.properties?.adm2_name || p.properties?.NAME) !== id);
          const next = [clicked, ...filtered];
          return next;
        });
        if (onFeatureClick) onFeatureClick(clicked);
      });

      m.on('mousemove', (e) => {
        const queryable = layersToQuery.filter(l => m.getLayer(l));
        const features  = m.queryRenderedFeatures(e.point, { layers: queryable });
        m.getCanvas().style.cursor = features.length ? 'pointer' : '';
      });

      // ✅ AVISAR que el mapa está listo — esto dispara el useEffect de visibilidad
      setMapReady(true);
    });

    return () => {
      m.remove();
      map.current = null;
      mapInitialized.current = false;
      setMapReady(false);
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // CONTROL DE VISIBILIDAD
  // Depende de `layersVisible` Y `mapReady` para que se ejecute:
  //   - cada vez que el usuario activa/desactiva una capa
  //   - también justo cuando el mapa termina de cargar (por si ya había toggles pendientes)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m || !mapReady) return;

    const set = (layerId: string, visible: boolean) => {
      if (m.getLayer(layerId)) m.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    };

    // Capas base
    RECURSOS_SALUD.forEach(res => {
      set(`${res.id}-layer`, !!layersVisible[res.id]);
      set(`${res.id}-icons`, !!layersVisible[res.id]);
    });
    RECURSOS_INFRAESTRUCTURA.forEach(res => {
      set(`${res.id}-layer`, !!layersVisible[res.id]);
      set(`${res.id}-icons`, !!layersVisible[res.id]);
    });
    set('parroquias-fill',   !!layersVisible.parroquias);
    set('parroquias-line',   !!layersVisible.parroquias);
    set('vialidad-layer',    !!layersVisible.vialidad);
    set('municipios-local',  !!layersVisible.municipios);
    set('municipios-fill',   !!layersVisible.municipios);
    set('sectores-api',      !!layersVisible.sectores);
    set('cuadrantes-layer',  !!layersVisible.cuadrantes);
    set('cuadrantes-glow',   !!layersVisible.cuadrantes);
    set('cuadrantes-labels', !!layersVisible.cuadrantes);
    set('poligonos-fill',    !!layersVisible.cuadrantesPoligonos);
    set('poligonos-line',    !!layersVisible.cuadrantesPoligonos);
    set('poligonos-labels',  false);
    set('compas-fill',       !!layersVisible.compas);
    set('compas-line',       !!layersVisible.compas);
    set('compas-labels',     false);
    set('estaciones-layer',  !!layersVisible.estaciones);
    set('estaciones-labels', !!layersVisible.estaciones);

    const incVisible = !!layersVisible.incidentes;
    set('incidentes-glow',  incVisible);
    set('incidentes-icons', incVisible);

    // ── ZONAS DE RIESGO ────────────────────────────────────────────────────
    set('incidencias-riesgo-layer',       !!layersVisible.zonasDeRiesgo?.delitosComunes);
    set('incidencias-riesgo-icons',       !!layersVisible.zonasDeRiesgo?.delitosComunes);
    set('cibernetica-incidente-layer',    !!layersVisible.zonasDeRiesgo?.areaCibernetica);
    set('cibernetica-incidente-icons',    !!layersVisible.zonasDeRiesgo?.areaCibernetica);
    set('concentraciones-incidente-layer',!!layersVisible.zonasDeRiesgo?.concentraciones);
    set('concentraciones-incidente-icons',!!layersVisible.zonasDeRiesgo?.concentraciones);

    // ── GEOCALIZACIONES ────────────────────────────────────────────────────
    set('drogas-trafico-layer',   !!layersVisible.geocalizaciones?.drogas);
    set('drogas-trafico-icons',   !!layersVisible.geocalizaciones?.drogas);
    set('actores-layer',          !!layersVisible.geocalizaciones?.actorInteres);
    set('actores-icons',          !!layersVisible.geocalizaciones?.actorInteres);
    set('puntos-interes-layer',   !!layersVisible.geocalizaciones?.puntoInteres);
    set('puntos-interes-icons',   !!layersVisible.geocalizaciones?.puntoInteres);

    // ── GRUPOS DELICTIVOS ──────────────────────────────────────────────────
    set('grupos-bandas-layer',    !!layersVisible.bandasDelictivas);
    set('grupos-bandas-icons',    !!layersVisible.bandasDelictivas);

    // ── ANTENAS ────────────────────────────────────────────────────────────
    set('antenas-digitel-layer',  !!layersVisible.antenasDigitel);
    set('antenas-movilnet-layer', !!layersVisible.antenasMovilnet);
    set('antenas-movistar-layer', !!layersVisible.antenasMovistar);

    // ── SERVICIOS BÁSICOS ──────────────────────────────────────────────────
    set('sistemas-electricos-layer', !!layersVisible.sistemasElectricos);
    set('sistemas-electricos-icons', !!layersVisible.sistemasElectricos);
    
    ['desalinizadoras', 'tratamiento', 'bombeoServidas', 'bombeoPotable', 'tanques', 'diques', 'pozos', 'clorado', 'parales', 'embalses'].forEach(sub => {
      set(`agua-${sub}-point`, !!layersVisible.servicioAgua?.[sub]);
      set(`agua-${sub}-icons`, !!layersVisible.servicioAgua?.[sub]);
    });

    set('estaciones-gas-layer',      !!layersVisible.estacionesGas);
    set('estaciones-gas-labels',     !!layersVisible.estacionesGas);

    // ── TRANSPORTE ─────────────────────────────────────────────────────────
    set('transporte-layer',  !!layersVisible.transporteGeneral);
    set('transporte-labels', !!layersVisible.transporteGeneral);

  }, [layersVisible, mapReady]); // <-- mapReady asegura que corra al terminar de cargar

  // ──────────────────────────────────────────────────────────────────────────
  // SINCRONIZACIÓN DE FEATURES SELECCIONADOS AL HIGHLIGHT SOURCE
  // Asegura que "se active únicamente lo que se busque" mostrándose siempre
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !map.current) return;
    const source = map.current.getSource('search-highlight-source') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: selectedFeatures
      });
    }
  }, [selectedFeatures, mapReady]);

  // ──────────────────────────────────────────────────────────────────────────
  // RESIZE OBSERVER — Fuerza al mapa a redibujarse al cambiar el tamaño del contenedor
  // (elimina el espacio negro cuando el menú lateral se expande/contrae)
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mapContainer.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      if (map.current) map.current.resize();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, []);

  return { mapContainer, map, mapReady };
};