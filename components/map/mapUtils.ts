// mapUtils.ts
import mapboxgl from 'mapbox-gl';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { RESET_VIEW, MAP_PADDING } from './mapConstants';

export const filterClosePoints = (features: any[], minDistanceDegrees = 0.001): any[] => {
  const filtered: any[] = [];
  features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    let tooClose = false;
    for (const existing of filtered) {
      const exCoords = existing.geometry.coordinates;
      const dx = coords[0] - exCoords[0];
      const dy = coords[1] - exCoords[1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistanceDegrees) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) filtered.push(feature);
  });
  return filtered;
};

export const cleanPaint = (paintObj: any) => {
  if (!paintObj) return {};
  const clean = { ...paintObj };
  Object.keys(clean).forEach(key => {
    if (key.endsWith('-transition')) delete clean[key];
  });
  return clean;
};

export const toggleState = (map: mapboxgl.Map, feature: any, val: boolean) => {
  if (!map || (!feature.id && !feature.properties?.id)) return;
  const sourceId = feature.layer?.source || feature.source;
  if (!sourceId) return; // Si no hay source no se puede hacer nada
  const featureId = feature.id ?? feature.properties.id;
  const sourceLayer = feature.layer?.['source-layer'] || feature.sourceLayer;
  const params: any = { source: sourceId, id: featureId };
  if (sourceLayer) params.sourceLayer = sourceLayer;
  map.setFeatureState(params, { selected: val });
};

export const clearAndReset = (map: mapboxgl.Map, selectedFeatures: any[], setSelectedFeatures: React.Dispatch<React.SetStateAction<any[]>>) => {
  selectedFeatures.forEach(f => toggleState(map, f, false));
  setSelectedFeatures([]);
  
  // Limpiar la máscara de enfoque
  const maskSrc = map.getSource('focus-mask-source') as mapboxgl.GeoJSONSource;
  if (maskSrc) maskSrc.setData({ type: 'FeatureCollection', features: [] });

  map.flyTo({ ...RESET_VIEW, duration: 1500, essential: true, padding: MAP_PADDING });
};

export const exportPDF = async (isExporting: boolean, setIsExporting: React.Dispatch<React.SetStateAction<boolean>>) => {
  if (isExporting) return;
  setIsExporting(true);
  try {
    const mapExportContainer = document.getElementById('map-export-container');
    if (!mapExportContainer) throw new Error('Contenedor de mapa no encontrado');

    const mapCanvas = mapExportContainer.querySelector('canvas.mapboxgl-canvas') as HTMLCanvasElement;
    let imgData = '';

    // MÉTODO 1: Captura directa ultra-rápida y limpia del WebGL Canvas de Mapbox
    // Esto omite por completo el parser de CSS de html2canvas y sus errores con oklab/oklch/lab.
    if (mapCanvas) {
      try {
        imgData = mapCanvas.toDataURL('image/png');
      } catch (e) {
        console.warn("Fallo al obtener toDataURL del canvas de Mapbox:", e);
      }
    }

    // MÉTODO 2: Fallback con html2canvas omitiendo hojas de estilo externas si no hay canvas directo
    if (!imgData) {
      const legendElem = mapExportContainer.querySelector('.legend-glass') as HTMLElement;
      let originalFilter = '';
      if (legendElem) {
        originalFilter = legendElem.style.backdropFilter || '';
        legendElem.style.backdropFilter = 'none';
      }

      const canvas = await html2canvas(mapExportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
        ignoreElements: (el) => el.tagName === 'LINK' || el.tagName === 'STYLE'
      });

      if (legendElem) legendElem.style.backdropFilter = originalFilter;
      imgData = canvas.toDataURL('image/png');
    }

    if (!imgData) throw new Error('No se pudo generar la captura del mapa');

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Fondo azul marino táctico slate-950
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // Captura del mapa ajustada al área principal
    const headerHeight = 18;
    const availableHeight = pdfHeight - headerHeight;
    pdf.addImage(imgData, 'PNG', 0, headerHeight, pdfWidth, availableHeight, undefined, 'FAST');

    // Header Banner táctico superior con el logo institucional
    try {
      const loadImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = url;
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
        });
      const logoImg = await loadImage('/Municipios.png');
      
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pdfWidth, headerHeight, 'F');
      pdf.setFillColor(6, 182, 212); // Línea neón cyan
      pdf.rect(0, headerHeight - 0.8, pdfWidth, 0.8, 'F');

      pdf.setFillColor(6, 182, 212);
      pdf.circle(10, 9, 5.5, 'F');
      pdf.setFillColor(255, 255, 255);
      pdf.circle(10, 9, 4.5, 'F');
      pdf.addImage(logoImg, 'PNG', 7, 6, 6, 6);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('SOGNE REDIMAIN - MAPA TÁCTICO DE GEOINTELIGENCIA', 19, 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(186, 230, 253);
      pdf.text(`REPORTE DE COBERTURA Y ÁREA TÁCTICA • ${new Date().toLocaleString('es-VE')}`, 19, 14);
    } catch (e) {
      console.warn("Logo no disponible para PDF de mapa", e);
    }

    pdf.save(`reporte_tactico_sogne_${Date.now()}.pdf`);
  } catch (error: any) {
    console.error('Error al generar PDF:', error);
    alert('Fallo al exportar reporte PDF: ' + (error?.message || error));
  } finally {
    setIsExporting(false);
  }
};