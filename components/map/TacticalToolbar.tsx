"use client";

import React, { useState, useEffect } from 'react';
import { Ruler, CircleDot, Flame, Trash2, X, Box, Shapes, Download, FileJson, FileText, ShieldAlert, Mic, MicOff } from 'lucide-react';
import * as turf from '@turf/turf';
import mapboxgl from 'mapbox-gl';
import { exportPDF as exportPDFUtil, exportSpatialRiskPDF } from './mapUtils';

interface TacticalToolbarProps {
  map: mapboxgl.Map | null;
  theme?: string;
  selectedFeatures?: any[];
}

export const TacticalToolbar: React.FC<TacticalToolbarProps> = ({ map, theme = 'dark', selectedFeatures = [] }) => {
  const [activeTool, setActiveTool] = useState<'none' | 'measure' | 'buffer' | 'polygon'>('none');
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [allPolygons, setAllPolygons] = useState<any[]>([]);
  const [isPolygonFinished, setIsPolygonFinished] = useState(false);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [bufferRadius, setBufferRadius] = useState<number>(1); // km

  const polygonPointsRef = React.useRef<[number, number][]>([]);
  const measurePointsRef = React.useRef<[number, number][]>([]);
  const allPolygonsRef = React.useRef<any[]>([]);
  const isPolygonFinishedRef = React.useRef(false);
  const activeToolRef = React.useRef(activeTool);
  const bufferCenterRef = React.useRef<[number, number] | null>(null);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    allPolygonsRef.current = allPolygons;
  }, [allPolygons]);

  // Manejo de Heatmap
  const toggleHeatmap = React.useCallback(() => {
    if (!map) return;
    setIsHeatmapActive(prev => {
      const nextState = !prev;
      if (map.getLayer('incidentes-heatmap')) {
        map.setLayoutProperty('incidentes-heatmap', 'visibility', nextState ? 'visible' : 'none');
      }
      return nextState;
    });
  }, [map]);

  // Manejo de Vista 3D Táctica
  const toggle3D = React.useCallback(() => {
    if (!map) return;
    setIs3DActive(prev => {
      const nextState = !prev;
      if (nextState) {
        const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : 11;
        const targetZoom = Math.max(currentZoom, 15.5);
        map.easeTo({
          pitch: 65,
          bearing: -25,
          zoom: targetZoom,
          duration: 1200
        });
      } else {
        map.easeTo({
          pitch: 0,
          bearing: 0,
          duration: 1000
        });
      }
      return nextState;
    });
  }, [map]);

  const toggleVoiceListener = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("El soporte de voz requiere Web Speech API (disponible en Google Chrome / MS Edge). Por favor revisa los permisos de tu micrófono.");
      return;
    }

    if (isVoiceListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      setIsVoiceListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-VE';

        recognition.onstart = () => setIsVoiceListening(true);
        recognition.onend = () => setIsVoiceListening(false);
        recognition.onerror = () => setIsVoiceListening(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0]?.transcript;
          if (transcript) {
            window.dispatchEvent(new CustomEvent('sogne_send_voice_text', { detail: { text: transcript } }));
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsVoiceListening(true);
      } catch(e) {
        setIsVoiceListening(false);
      }
    }
  };

  const handleClearAll = React.useCallback(() => {
    setActiveTool('none');
    setMeasurePoints([]);
    setPolygonPoints([]);
    setAllPolygons([]);
    allPolygonsRef.current = [];
    setTotalDistance(0);
    setTotalArea(0);

    if (map) {
      const measureSrc = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
      if (measureSrc) measureSrc.setData({ type: 'FeatureCollection', features: [] });

      const bufferSrc = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
      if (bufferSrc) bufferSrc.setData({ type: 'FeatureCollection', features: [] });

      const polySrc = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
      if (polySrc) polySrc.setData({ type: 'FeatureCollection', features: [] });

      const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
      if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [map]);

  // Escuchar acciones disparadas por comandos de voz
  useEffect(() => {
    const handleVoiceAction = (e: any) => {
      const action = e.detail?.action;
      if (action === 'toggle_3d') toggle3D();
      else if (action === 'toggle_heatmap') toggleHeatmap();
      else if (action === 'activate_buffer') setActiveTool('buffer');
      else if (action === 'activate_polygon') setActiveTool('polygon');
      else if (action === 'clear_tools') handleClearAll();
    };
    window.addEventListener('sogne_voice_action', handleVoiceAction);
    return () => window.removeEventListener('sogne_voice_action', handleVoiceAction);
  }, [toggle3D, toggleHeatmap, handleClearAll]);

  // Aplicar máscara oscura para enfocar y resaltar el área trazada eliminando el entorno del mapa
  const applyFocusMask = React.useCallback((polyGeoJSON: any) => {
    if (!map || !polyGeoJSON) return;
    try {
      const feature = polyGeoJSON.type === 'Feature' ? polyGeoJSON : { type: 'Feature', geometry: polyGeoJSON, properties: {} };
      const maskData = turf.mask(feature as any);
      const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
      if (maskSrc) maskSrc.setData(maskData);
    } catch (_) {
      try {
        const outerBounds = turf.polygon([[
          [-66, 9], [-66, 13], [-62, 13], [-62, 9], [-66, 9]
        ]]);
        const geom = polyGeoJSON.type === 'Feature' ? polyGeoJSON.geometry : polyGeoJSON;
        const diff = turf.difference(turf.featureCollection([outerBounds as any, geom as any]));
        const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
        if (maskSrc && diff) maskSrc.setData(diff as any);
      } catch (e) {}
    }
  }, [map]);

  // Escuchar trazado por voz automático de municipios
  useEffect(() => {
    const handleTraceMunicipality = (e: any) => {
      const muniName = e.detail?.municipality;
      if (!map || !muniName) return;

      try {
        const features = map.queryRenderedFeatures(undefined, { layers: ['municipios-fill'] });
        const matched = features.find((f: any) => {
          const p = f.properties || {};
          const n = (p.nombre || p.NAME || p.adm2_name || '').toLowerCase();
          return n.includes(muniName.toLowerCase());
        });

        if (matched && matched.geometry) {
          const bbox = turf.bbox(matched);
          const polyGeo = matched.geometry;

          const polySource = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
          if (polySource) {
            polySource.setData({
              type: 'FeatureCollection',
              features: [matched as any]
            });
          }

          applyFocusMask(polyGeo);
          map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 80, duration: 1500 });
        }
      } catch (err) {
        console.warn("Error al trazar municipio por voz:", err);
      }
    };

    window.addEventListener('sogne_voice_trace_municipality', handleTraceMunicipality);
    return () => window.removeEventListener('sogne_voice_trace_municipality', handleTraceMunicipality);
  }, [map, applyFocusMask]);

  // Escuchar trazado y radio por voz universal de cualquier lugar o punto
  useEffect(() => {
    const handleTracePlace = (e: any) => {
      const { placeName, mode = 'polygon', radiusKm = 2 } = e.detail || {};
      if (!map || !placeName) return;

      try {
        const style = map.getStyle();
        if (!style) return;

        // 1. Buscar en elementos renderizados
        const allRendered = map.queryRenderedFeatures();
        let matched = allRendered.find((f: any) => {
          const p = f.properties || {};
          const vals = Object.values(p).join(' ').toLowerCase();
          return vals.includes(placeName.toLowerCase());
        });

        // 2. Si no está renderizado, buscar en fuentes GeoJSON de Mapbox
        if (!matched && style.sources) {
          const sourceIds = Object.keys(style.sources);
          for (const sId of sourceIds) {
            try {
              const feats = map.querySourceFeatures(sId);
              const found = feats.find((f: any) => {
                const p = f.properties || {};
                const vals = Object.values(p).join(' ').toLowerCase();
                return vals.includes(placeName.toLowerCase());
              });
              if (found) {
                matched = found;
                break;
              }
            } catch (_) {}
          }
        }

        if (matched && matched.geometry) {
          let shapeGeo: any = null;
          let shapeTitle = `${placeName.toUpperCase()}`;

          if (mode === 'buffer' || matched.geometry.type === 'Point') {
            const centerPt = matched.geometry.type === 'Point' 
              ? matched.geometry 
              : turf.centroid(matched.geometry).geometry;
            shapeGeo = turf.buffer(centerPt as any, radiusKm, { units: 'kilometers' })?.geometry;
            shapeTitle = `Radio de ${radiusKm} km en ${matched.properties?.nombre || matched.properties?.NAME || placeName}`;

            const bufSource = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
            if (bufSource && shapeGeo) {
              bufSource.setData({
                type: 'FeatureCollection',
                features: [{ type: 'Feature', geometry: shapeGeo, properties: {} }]
              });
            }
          } else {
            shapeGeo = matched.geometry;
            shapeTitle = `Área Trazada en ${matched.properties?.nombre || matched.properties?.NAME || placeName}`;

            const polySource = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
            if (polySource && shapeGeo) {
              polySource.setData({
                type: 'FeatureCollection',
                features: [{ type: 'Feature', geometry: shapeGeo, properties: {} }]
              });
            }
          }

          if (shapeGeo) {
            applyFocusMask(shapeGeo);
            const bbox = turf.bbox(shapeGeo);
            map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 80, duration: 1500 });
          }
        }
      } catch (err) {
        console.warn("Error al trazar lugar por voz:", err);
      }
    };

    window.addEventListener('sogne_voice_trace_place', handleTracePlace);
    return () => window.removeEventListener('sogne_voice_trace_place', handleTracePlace);
  }, [map, applyFocusMask]);

  // Escanear espacialmente activos contenidos, rutas de salida y zona de influencia exterior (1-2 km)
  const evaluateAreaRiskWithAI = (shapeGeoJSON: any, shapeType: string, areaMetersSq: number) => {
    if (!map || !shapeGeoJSON) return;

    let antenasCount = 0;
    let saludCount = 0;
    let electricoCount = 0;
    let gasCount = 0;
    let aguaCount = 0;
    let cuadrantesCount = 0;
    let conppasCount = 0;
    let incidentesCount = 0;

    const exitRoutesSet = new Set<string>();
    const internalDetails: string[] = [];

    // Zona de Influencia Exterior (Buffer de 1.5 km alrededor del área)
    let outerBufferGeoJSON: any = null;
    try {
      outerBufferGeoJSON = turf.buffer(shapeGeoJSON, 1.5, { units: 'kilometers' })?.geometry;
    } catch (_) {}

    let externalSalud = 0;
    let externalElectrico = 0;
    let externalGas = 0;
    let externalAgua = 0;
    let externalAntenas = 0;

    const processedFeats = new Set<string>();
    const allFeaturesToProcess: any[] = [];

    // 1. Escanear directamente de TODAS las fuentes GeoJSON registradas en Mapbox
    const styleSources = map.getStyle()?.sources || {};
    Object.keys(styleSources).forEach(sourceId => {
      try {
        const srcFeats = map.querySourceFeatures(sourceId);
        srcFeats.forEach((f: any) => {
          const featKey = `${f.id || ''}_${f.properties?.nombre || f.properties?.NAME || ''}_${f.geometry?.type}`;
          if (!processedFeats.has(featKey)) {
            processedFeats.add(featKey);
            allFeaturesToProcess.push({ feature: f, sourceId });
          }
        });
      } catch (_) {}
    });

    // 2. Escanear elementos actualmente renderizados en pantalla
    try {
      const renderedFeats = map.queryRenderedFeatures();
      renderedFeats.forEach((f: any) => {
        const featKey = `${f.id || ''}_${f.properties?.nombre || f.properties?.NAME || ''}_${f.geometry?.type}`;
        if (!processedFeats.has(featKey)) {
          processedFeats.add(featKey);
          allFeaturesToProcess.push({ feature: f, sourceId: f.source || 'rendered' });
        }
      });
    } catch (_) {}

    allFeaturesToProcess.forEach(({ feature: f, sourceId }) => {
      if (!f || !f.geometry) return;

      let isInside = false;
      let isInsideOuter = false;

      try {
        if (f.geometry.type === 'Point') {
          isInside = turf.booleanPointInPolygon(f.geometry as any, shapeGeoJSON);
          if (!isInside && outerBufferGeoJSON) {
            isInsideOuter = turf.booleanPointInPolygon(f.geometry as any, outerBufferGeoJSON);
          }
        } else if (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon') {
          try {
            isInside = turf.booleanIntersects(f as any, shapeGeoJSON as any);
          } catch (_) {
            const centerPt = turf.centroid(f as any).geometry;
            isInside = turf.booleanPointInPolygon(centerPt as any, shapeGeoJSON);
          }
          if (!isInside && outerBufferGeoJSON) {
            try {
              isInsideOuter = turf.booleanIntersects(f as any, outerBufferGeoJSON as any);
            } catch (_) {
              const centerPt = turf.centroid(f as any).geometry;
              isInsideOuter = turf.booleanPointInPolygon(centerPt as any, outerBufferGeoJSON);
            }
          }
        } else if (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString') {
          try {
            isInside = turf.booleanIntersects(f as any, shapeGeoJSON as any);
          } catch (_) {
            const bbox = turf.bbox(f);
            const centerPt = turf.point([(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]);
            isInside = turf.booleanPointInPolygon(centerPt, shapeGeoJSON);
          }
        }
      } catch (_) {}

      const layerId = f.layer?.id || '';
      const p = f.properties || {};
      const propStr = (Object.values(p).join(' ') + ' ' + layerId + ' ' + sourceId).toLowerCase();
      const featName = p.nombre || p.NAME || p.nombre_sitio || p.cuadrante || p.highway || p.ref || p.sector || '';

      // Rutas de Salida / Evacuación
      if (propStr.includes('vialidad') || propStr.includes('viabilidad') || propStr.includes('calle') || propStr.includes('avenida') || propStr.includes('highway') || propStr.includes('troncal')) {
        if (featName && typeof featName === 'string' && featName.trim().length > 2 && isInside) {
          exitRoutesSet.add(featName.trim());
        }
      }

      // Clasificación de Capas e Infraestructura
      if (isInside) {
        if (propStr.includes('antena') || propStr.includes('digitel') || propStr.includes('movistar') || propStr.includes('movilnet') || propStr.includes('telecom')) {
          antenasCount++;
        } else if (propStr.includes('hospital') || propStr.includes('cdi') || propStr.includes('ambulatorio') || propStr.includes('clinica') || propStr.includes('salud') || propStr.includes('medico') || propStr.includes('centrossalud')) {
          saludCount++;
        } else if (propStr.includes('electr') || propStr.includes('corpoelec') || propStr.includes('subestacion') || propStr.includes('sistemaelectricone')) {
          electricoCount++;
        } else if (propStr.includes('gas') || propStr.includes('pdvsa') || propStr.includes('combustible') || propStr.includes('estaciongasne')) {
          gasCount++;
        } else if (propStr.includes('agua') || propStr.includes('embalse') || propStr.includes('pozo') || propStr.includes('hidro') || propStr.includes('desalinizad')) {
          aguaCount++;
        } else if (propStr.includes('cuadrante') || propStr.includes('paz') || propStr.includes('poligono')) {
          cuadrantesCount++;
        } else if (propStr.includes('conppa') || propStr.includes('compa') || propStr.includes('comuna')) {
          conppasCount++;
        } else if (propStr.includes('delito') || propStr.includes('incident') || propStr.includes('riesgo') || propStr.includes('concentrac') || propStr.includes('drogas') || propStr.includes('ciber')) {
          incidentesCount++;
        }

        if (featName && typeof featName === 'string' && featName.trim().length > 1) {
          internalDetails.push(featName.trim());
        }
      } else if (isInsideOuter) {
        if (propStr.includes('hospital') || propStr.includes('cdi') || propStr.includes('ambulatorio') || propStr.includes('clinica') || propStr.includes('salud')) externalSalud++;
        else if (propStr.includes('electr') || propStr.includes('corpoelec') || propStr.includes('subestacion')) externalElectrico++;
        else if (propStr.includes('gas')) externalGas++;
        else if (propStr.includes('agua') || propStr.includes('embalse')) externalAgua++;
        else if (propStr.includes('antena') || propStr.includes('telecom')) externalAntenas++;
      }
    });

    const exitRoutes = Array.from(exitRoutesSet).slice(0, 10);

    let centerCoords: [number, number] | null = null;
    try {
      centerCoords = turf.centroid(shapeGeoJSON).geometry.coordinates as [number, number];
    } catch (_) {}

    const spatialPayload = {
      shapeType,
      areaKm2: areaMetersSq / 1000000,
      centerCoords,
      antenasCount,
      saludCount,
      electricoCount,
      gasCount,
      aguaCount,
      cuadrantesCount,
      conppasCount,
      incidentesCount,
      exitRoutes,
      externalAssets: {
        salud: externalSalud,
        electrico: externalElectrico,
        gas: externalGas,
        agua: externalAgua,
        antenas: externalAntenas
      },
      internalDetails: Array.from(new Set(internalDetails)).slice(0, 20)
    };

    window.dispatchEvent(new CustomEvent('sogne_open_risk_analysis', { detail: { spatialPayload } }));
    try {
      exportSpatialRiskPDF(spatialPayload);
    } catch(e){}
  };

  // Sincronizar estado táctico global para evitar reseteos en useMapbox
  useEffect(() => {
    activeToolRef.current = activeTool;
    if (typeof window !== 'undefined') {
      (window as any)._activeTacticalTool = activeTool;
    }
  }, [activeTool]);

  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints]);

  useEffect(() => {
    measurePointsRef.current = measurePoints;
  }, [measurePoints]);

  useEffect(() => {
    isPolygonFinishedRef.current = isPolygonFinished;
  }, [isPolygonFinished]);

  // Función para mover capas neón tácticas al frente absoluto sobre edificaciones y terreno 3D
  const bringTacticalLayersToFront = React.useCallback(() => {
    if (!map) return;
    const layers = [
      'focus-mask-layer',
      'tactical-buffer-fill', 'tactical-buffer-line', 
      'tactical-polygon-fill', 'tactical-polygon-line-glow', 'tactical-polygon-line', 'tactical-polygon-points',
      'tactical-measure-line', 'tactical-measure-points'
    ];
    layers.forEach(id => {
      if (map.getLayer(id)) {
        try { map.moveLayer(id); } catch(e){}
      }
    });
  }, [map]);

  // Función para limpiar puntos duplicados consecutivos y evitar crash en turf.lineString
  const sanitizePoints = (pts: [number, number][]): [number, number][] => {
    return pts.filter((p, i) => {
      if (i === 0) return true;
      const prev = pts[i - 1];
      return Math.abs(p[0] - prev[0]) > 0.000001 || Math.abs(p[1] - prev[1]) > 0.000001;
    });
  };

  // Función para actualizar el círculo de cobertura en vivo y oscurecer el entorno
  const drawBufferCircle = React.useCallback((center: [number, number], radiusKm: number) => {
    if (!map) return;
    try {
      bufferCenterRef.current = center;
      const point = turf.point(center);
      const buffered = turf.buffer(point, radiusKm, { units: 'kilometers' });
      const src = map.getSource('tactical-buffer-source') as mapboxgl.GeoJSONSource;
      if (src && buffered) {
        src.setData({ type: 'FeatureCollection', features: [buffered] });
        applyFocusMask(buffered);
      }
      bringTacticalLayersToFront();
    } catch (e) {
      console.warn("Error dibujando radio de cobertura:", e);
    }
  }, [map, bringTacticalLayersToFront]);

  // Actualizar el círculo de cobertura cuando cambia el radio (0.5km, 1km, 3km, 5km, 10km)
  useEffect(() => {
    if (activeTool === 'buffer' && bufferCenterRef.current) {
      drawBufferCircle(bufferCenterRef.current, bufferRadius);
    }
  }, [bufferRadius, activeTool, drawBufferCircle]);

  // Inicializar o limpiar fuentes de herramientas tácticas en el mapa
  useEffect(() => {
    if (!map) return;

    const setupSources = () => {
      // 1. Fuente de medición
      if (!map.getSource('tactical-measure-source')) {
        map.addSource('tactical-measure-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-measure-line',
          type: 'line',
          source: 'tactical-measure-source',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 4.5
          }
        });
        map.addLayer({
          id: 'tactical-measure-points',
          type: 'circle',
          source: 'tactical-measure-source',
          paint: {
            'circle-radius': 6,
            'circle-color': '#38bdf8',
            'circle-stroke-width': 2.5,
            'circle-stroke-color': '#ffffff'
          }
        });
      }

      // 2. Fuente de buffer
      if (!map.getSource('tactical-buffer-source')) {
        map.addSource('tactical-buffer-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-buffer-fill',
          type: 'fill',
          source: 'tactical-buffer-source',
          paint: {
            'fill-color': '#a855f7',
            'fill-opacity': 0.25
          }
        });
        map.addLayer({
          id: 'tactical-buffer-line',
          type: 'line',
          source: 'tactical-buffer-source',
          paint: {
            'line-color': '#c084fc',
            'line-width': 3,
            'line-dasharray': [3, 2]
          }
        });
      }

      // 3. Fuente de polígono / área personalizada
      if (!map.getSource('tactical-polygon-source')) {
        map.addSource('tactical-polygon-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });
        map.addLayer({
          id: 'tactical-polygon-fill',
          type: 'fill',
          source: 'tactical-polygon-source',
          paint: {
            'fill-color': '#06b6d4',
            'fill-opacity': 0.15 // Relleno cian traslúcido elegante
          }
        });
        map.addLayer({
          id: 'tactical-polygon-line-glow',
          type: 'line',
          source: 'tactical-polygon-source',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#00ffff',
            'line-width': 12,
            'line-opacity': 0.8,
            'line-blur': 3
          }
        });
        map.addLayer({
          id: 'tactical-polygon-line',
          type: 'line',
          source: 'tactical-polygon-source',
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 4.5,
            'line-opacity': 1.0,
            'line-dasharray': [4, 2] // Rayas tácticas neón de alta visibilidad
          }
        });
        map.addLayer({
          id: 'tactical-polygon-points',
          type: 'circle',
          source: 'tactical-polygon-source',
          paint: {
            'circle-radius': 8,
            'circle-color': '#00ffff',
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff'
          }
        });
      }

      bringTacticalLayersToFront();
    };

    if (map.isStyleLoaded()) {
      setupSources();
    } else {
      map.once('load', setupSources);
    }
  }, [map, bringTacticalLayersToFront]);



  // Manejar mousemove y clics en el mapa según la herramienta activa
  useEffect(() => {
    if (!map || activeTool === 'none') return;

    if (activeTool === 'polygon' && map.doubleClickZoom) {
      map.doubleClickZoom.disable();
    }

    bringTacticalLayersToFront();

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const currentTool = activeToolRef.current;
      const currentPoints = polygonPointsRef.current;
      const finished = isPolygonFinishedRef.current;

      const mouseCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (currentTool === 'polygon' && currentPoints.length > 0 && !finished) {
        const rawLive = [...currentPoints, mouseCoords];
        const livePoints = sanitizePoints(rawLive);
        const pointFeatures = currentPoints.map(p => turf.point(p));
        pointFeatures.push(turf.point(mouseCoords));
        const features: any[] = [...pointFeatures];

        if (livePoints.length >= 2) {
          try {
            const line = turf.lineString(livePoints);
            features.push(line);
          } catch(e){}
        }

        if (livePoints.length >= 3) {
          try {
            const closedRing = [...livePoints, livePoints[0]];
            const poly = turf.polygon([closedRing]);
            const closedLine = turf.lineString(closedRing);
            features.push(poly);
            features.push(closedLine);
            const sqMeters = turf.area(poly);
            setTotalArea(sqMeters);
          } catch (err) { }
        }

        const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });

      } else if (currentTool === 'measure' && measurePointsRef.current.length > 0) {
        const rawLive = [...measurePointsRef.current, mouseCoords];
        const livePoints = sanitizePoints(rawLive);
        const pointFeatures = measurePointsRef.current.map(p => turf.point(p));
        pointFeatures.push(turf.point(mouseCoords));
        const features: any[] = [...pointFeatures];

        if (livePoints.length >= 2) {
          try {
            const line = turf.lineString(livePoints);
            features.push(line);
            const dist = turf.length(line, { units: 'kilometers' });
            setTotalDistance(dist);
          } catch(e){}
        }

        const src = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });
      }
    };

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      const currentTool = activeToolRef.current;
      const finished = isPolygonFinishedRef.current;

      if (currentTool === 'measure') {
        const rawNew = [...measurePointsRef.current, coords];
        const newPoints = sanitizePoints(rawNew);
        setMeasurePoints(newPoints);
        measurePointsRef.current = newPoints;

        const pointsFeatures = newPoints.map(p => turf.point(p));
        const features: any[] = [...pointsFeatures];

        if (newPoints.length >= 2) {
          try {
            const line = turf.lineString(newPoints);
            features.push(line);
            const dist = turf.length(line, { units: 'kilometers' });
            setTotalDistance(dist);
          } catch(e){}
        } else {
          setTotalDistance(0);
        }

        const src = map.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
        if (src) src.setData({ type: 'FeatureCollection', features });
        bringTacticalLayersToFront();

      } else if (currentTool === 'buffer') {
        drawBufferCircle(coords, bufferRadius);

      } else if (currentTool === 'polygon') {
        if (finished) {
          setPolygonPoints([coords]);
          polygonPointsRef.current = [coords];
          setIsPolygonFinished(false);
          isPolygonFinishedRef.current = false;
          setTotalArea(0);

          const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
          if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });

          const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features: [turf.point(coords)] });
        } else {
          const rawNew = [...polygonPointsRef.current, coords];
          const newPoints = sanitizePoints(rawNew);
          setPolygonPoints(newPoints);
          polygonPointsRef.current = newPoints;

          const pointFeatures = newPoints.map(p => turf.point(p));
          const features: any[] = [...pointFeatures];

          if (newPoints.length >= 2) {
            try {
              features.push(turf.lineString(newPoints));
            } catch(e){}
          }
          if (newPoints.length >= 3) {
            try {
              const closedRing = [...newPoints, newPoints[0]];
              const poly = turf.polygon([closedRing]);
              setTotalArea(turf.area(poly));
            } catch (e) {}
          }

          const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
          if (src) src.setData({ type: 'FeatureCollection', features });
        }
        bringTacticalLayersToFront();
      }
    };

    const finishPolygon = () => {
      const rawPoints = polygonPointsRef.current;
      const currentPoints = sanitizePoints(rawPoints);
      if (currentPoints.length < 3) return;
      setIsPolygonFinished(true);
      isPolygonFinishedRef.current = true;

      const closedRing = [...currentPoints, currentPoints[0]];
      const poly = turf.polygon([closedRing]);
      const line = turf.lineString(closedRing); // Perímetro neón cerrado
      const pointFeatures = currentPoints.map(p => turf.point(p));
      const features: any[] = [poly, ...pointFeatures, line]; // Relleno cian suave traslúcido + bordes neón

      const sqMeters = turf.area(poly);
      setTotalArea(sqMeters);

      const src = map.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
      if (src) src.setData({ type: 'FeatureCollection', features });

      applyFocusMask(poly);
      const bbox = turf.bbox(poly) as [number, number, number, number];
      const currentPitch = typeof map.getPitch === 'function' ? map.getPitch() : 0;
      map.fitBounds(bbox, { padding: 90, pitch: currentPitch, duration: 800 });
      bringTacticalLayersToFront();
    };

    const handleRightClick = (e: mapboxgl.MapMouseEvent) => {
      if (activeToolRef.current === 'polygon') {
        e.preventDefault();
        finishPolygon();
      }
    };

    const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
      if (activeToolRef.current === 'polygon') {
        e.preventDefault();
        finishPolygon();
      }
    };

    map.on('mousemove', handleMouseMove);
    map.on('click', handleMapClick);
    map.on('contextmenu', handleRightClick);
    map.on('dblclick', handleDblClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('mousemove', handleMouseMove);
      map.off('click', handleMapClick);
      map.off('contextmenu', handleRightClick);
      map.off('dblclick', handleDblClick);
      if (map.getCanvas()) map.getCanvas().style.cursor = '';
      if (map.doubleClickZoom) map.doubleClickZoom.enable();
    };
  }, [map, activeTool, bringTacticalLayersToFront, drawBufferCircle, bufferRadius]);

  // Si hay elementos seleccionados y la herramienta buffer está activa
  useEffect(() => {
    if (!map || activeTool !== 'buffer' || !selectedFeatures.length) return;
    const selected = selectedFeatures[0];
    if (selected?.geometry) {
      try {
        let center: any = null;
        if (selected.geometry.type === 'Point') {
          center = selected.geometry.coordinates;
        } else {
          const bbox = turf.bbox(selected);
          center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
        }
        if (center) {
          drawBufferCircle(center, bufferRadius);
        }
      } catch (e) {
        console.warn("Error generando cobertura:", e);
      }
    }
  }, [map, activeTool, bufferRadius, selectedFeatures, drawBufferCircle]);



  const downloadGeoJSON = () => {
    if (polygonPoints.length < 3) return;
    try {
      const closedRing = [...polygonPoints, polygonPoints[0]];
      const poly = turf.polygon([closedRing], {
        nombre: "Zona Táctica Trazada SOGNE",
        area_km2: Number((totalArea / 1000000).toFixed(2)),
        area_ha: Number((totalArea / 10000).toFixed(1)),
        vertices_count: polygonPoints.length,
        fecha_creacion: new Date().toISOString()
      });
      const geojsonObj = {
        type: "FeatureCollection",
        features: [poly]
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojsonObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `zona_tactica_${Date.now()}.geojson`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.warn("Error exportando GeoJSON:", e);
    }
  };

  const handleExportPDFReport = () => {
    exportPDFUtil(isExportingPDF, setIsExportingPDF);
  };

  const isLight = theme === 'light';
  const bufferArea = (Math.PI * Math.pow(bufferRadius, 2)).toFixed(2);

  return (
    <div className="absolute top-4 left-24 z-30 flex items-center gap-2 select-none flex-wrap max-w-[calc(100vw-120px)]">
      <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
        isLight ? 'bg-white/90 border-slate-300' : 'bg-slate-900/90 border-white/10'
      }`}>
        
        {/* Botón Medidor */}
        <button
          onClick={() => setActiveTool(activeTool === 'measure' ? 'none' : 'measure')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'measure'
              ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Regla de Medición de Distancia"
        >
          <Ruler size={14} />
          <span className="hidden md:inline">MEDIR</span>
        </button>

        {/* Botón Cobertura (Buffer) */}
        <button
          onClick={() => setActiveTool(activeTool === 'buffer' ? 'none' : 'buffer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'buffer'
              ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Radio de Cobertura / Anillo Táctico Circular"
        >
          <CircleDot size={14} />
          <span className="hidden md:inline">RADIO COBERTURA</span>
        </button>

        {/* Botón Trazar Polígono / Área */}
        <button
          onClick={() => setActiveTool(activeTool === 'polygon' ? 'none' : 'polygon')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            activeTool === 'polygon'
              ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)]'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title="Trazar Polígono y Calcular Área Personalizada"
        >
          <Shapes size={14} />
          <span className="hidden md:inline">TRAZAR ÁREA</span>
        </button>

        {/* Botón Mapa de Calor (Heatmap) */}
        <button
          onClick={toggleHeatmap}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            isHeatmapActive
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title={isHeatmapActive ? "Desactivar Mapa de Calor" : "Activar Mapa de Calor de Incidencias"}
        >
          <Flame size={14} className={isHeatmapActive ? "text-amber-300" : ""} />
          <span className="hidden md:inline">MAPA DE CALOR</span>
        </button>

        {/* Botón Vista 3D Táctica */}
        <button
          onClick={toggle3D}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
            is3DActive
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-black'
              : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-white/5')
          }`}
          title={is3DActive ? "Desactivar Perspectiva 3D" : "Activar Perspectiva 3D y Edificaciones"}
        >
          <Box size={14} className={is3DActive ? "text-slate-950" : "text-cyan-400"} />
          <span className="hidden md:inline">VISTA 3D</span>
        </button>

        {/* Botón Comando por Voz Directo */}
        <button
          onClick={toggleVoiceListener}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all cursor-pointer shadow-md ${
            isVoiceListening
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-pulse border border-rose-300'
              : 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40 hover:from-cyan-600/50 hover:to-blue-600/50'
          }`}
          title="Activar Dictado por Voz (Hablar directamente al micrófono)"
        >
          {isVoiceListening ? <MicOff size={14} className="animate-spin text-rose-200" /> : <Mic size={14} className="text-cyan-300 animate-bounce" />}
          <span>{isVoiceListening ? "ESCUCHANDO VOZ..." : "COMANDO DE VOZ"}</span>
        </button>

        {/* Botón Limpiar */}
        {(activeTool !== 'none' || measurePoints.length > 0 || polygonPoints.length > 0) && (
          <button
            onClick={handleClearAll}
            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Limpiar herramientas tácticas"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Info Flotante de Medición */}
      {activeTool === 'measure' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-lg text-[11px] font-mono font-bold animate-in fade-in slide-in-from-left-2 ${
          isLight ? 'bg-white/95 border-sky-300 text-sky-800' : 'bg-slate-900/95 border-sky-500/40 text-sky-400'
        }`}>
          <span>Distancia: {totalDistance < 1 ? `${(totalDistance * 1000).toFixed(0)} m` : `${totalDistance.toFixed(2)} km`}</span>
          {measurePoints.length > 0 && (
            <button onClick={() => {
              setMeasurePoints([]);
              setTotalDistance(0);
              const src = map?.getSource('tactical-measure-source') as mapboxgl.GeoJSONSource;
              if (src) src.setData({ type: 'FeatureCollection', features: [] });
            }} className="text-slate-400 hover:text-white ml-1 cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Selector de Radio de Cobertura */}
      {activeTool === 'buffer' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-lg text-[11px] font-bold animate-in fade-in slide-in-from-left-2 ${
          isLight ? 'bg-white/95 border-purple-300 text-purple-800' : 'bg-slate-900/95 border-purple-500/40 text-purple-300'
        }`}>
          <span>Radio:</span>
          {[0.5, 1, 3, 5, 10].map(r => (
            <button
              key={r}
              onClick={() => setBufferRadius(r)}
              className={`px-2 py-0.5 rounded-md text-[10px] transition-all cursor-pointer ${
                bufferRadius === r ? 'bg-purple-600 text-white font-bold' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {r} km
            </button>
          ))}
          <span className="text-[10px] opacity-80 border-l border-white/20 pl-2">Área: {bufferArea} km²</span>

          {bufferCenterRef.current && (
            <button
              onClick={() => {
                if (bufferCenterRef.current) {
                  const pt = turf.point(bufferCenterRef.current);
                  const buf = turf.buffer(pt, bufferRadius, { units: 'kilometers' });
                  evaluateAreaRiskWithAI(buf, `Radio de Cobertura (${bufferRadius} km)`, Number(bufferArea) * 1000000);
                }
              }}
              className="ml-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)] cursor-pointer flex items-center gap-1"
              title="Evaluar vulnerabilidad espacial de esta zona con SOGNE IA"
            >
              <ShieldAlert size={12} />
              <span>EVALUAR RIESGO IA</span>
            </button>
          )}
        </div>
      )}

      {/* Info Flotante de Trazado de Área (Polígono) */}
      {activeTool === 'polygon' && (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-xl shadow-2xl text-[11px] font-mono font-bold animate-in fade-in slide-in-from-left-2 flex-wrap ${
          isLight ? 'bg-white/95 border-emerald-300 text-emerald-800' : 'bg-slate-900/95 border-emerald-500/50 text-emerald-400'
        }`}>
          <span>
            {polygonPoints.length === 0
              ? 'Haz clic en el mapa para iniciar trazado'
              : isPolygonFinished
              ? `Área Cerrada (${polygonPoints.length} vértices): ${(totalArea / 1000000).toFixed(2)} km² (${(totalArea / 10000).toFixed(1)} ha)`
              : `Vértices: ${polygonPoints.length} | Área aprox: ${(totalArea / 1000000).toFixed(2)} km² (Clic derecho / Doble clic para cerrar)`}
          </span>

          {polygonPoints.length >= 3 && !isPolygonFinished && (
            <button 
              onClick={() => {
                if (!map || polygonPoints.length < 3) return;
                setIsPolygonFinished(true);
                const closedRing = [...polygonPoints, polygonPoints[0]];
                const poly = turf.polygon([closedRing]);
                const bbox = turf.bbox(poly) as [number, number, number, number];
                const currentPitch = typeof map.getPitch === 'function' ? map.getPitch() : 0;
                map.fitBounds(bbox, { padding: 90, pitch: currentPitch > 0 ? currentPitch : 45, duration: 1200 });

                const maskData = turf.mask(poly);
                const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
                if (maskSrc) maskSrc.setData(maskData);
              }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-pointer ml-1"
              title="Cerrar polígono y enfocar área"
            >
              CERRAR Y ENFOCAR
            </button>
          )}

          {polygonPoints.length >= 3 && (
            <div className="flex items-center gap-1.5 ml-1 border-l border-white/20 pl-2">
              <button
                onClick={() => {
                  const closedRing = [...polygonPoints, polygonPoints[0]];
                  const poly = turf.polygon([closedRing]);
                  evaluateAreaRiskWithAI(poly, "Polígono Trazado", totalArea);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)] cursor-pointer flex items-center gap-1"
                title="Evaluar vulnerabilidad espacial del área trazada con SOGNE IA"
              >
                <ShieldAlert size={12} />
                <span>EVALUAR RIESGO IA</span>
              </button>

              <button
                onClick={downloadGeoJSON}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1"
                title="Descargar datos trazados como archivo GeoJSON"
              >
                <FileJson size={12} />
                <span>Exportar GeoJSON</span>
              </button>

              <button
                onClick={handleExportPDFReport}
                disabled={isExportingPDF}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] cursor-pointer flex items-center gap-1"
                title="Descargar reporte PDF con captura del mapa"
              >
                <FileText size={12} />
                <span>{isExportingPDF ? 'Generando PDF...' : 'Reporte PDF'}</span>
              </button>
            </div>
          )}

          {polygonPoints.length > 0 && (
            <button onClick={() => {
              setPolygonPoints([]);
              setIsPolygonFinished(false);
              setTotalArea(0);
              const src = map?.getSource('tactical-polygon-source') as mapboxgl.GeoJSONSource;
              if (src) src.setData({ type: 'FeatureCollection', features: [] });
              const maskSrc = map?.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
              if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });
            }} className="text-slate-400 hover:text-white ml-1 cursor-pointer" title="Reiniciar polígono">
              <X size={12} />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
