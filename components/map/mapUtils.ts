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

export const exportSpatialRiskPDF = async (spatialPayload: any) => {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Fondo slate-950
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    // Captura del mapa si está disponible
    const mapExportContainer = document.getElementById('map-export-container');
    const mapCanvas = mapExportContainer?.querySelector('canvas.mapboxgl-canvas') as HTMLCanvasElement;
    if (mapCanvas) {
      try {
        const imgData = mapCanvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 12, 45, pdfWidth - 24, 75, undefined, 'FAST');
      } catch (e) {}
    }

    // Header Banner
    pdf.setFillColor(6, 182, 212);
    pdf.rect(0, 0, pdfWidth, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(6, 182, 212);
    pdf.text('SOGNE IA • EVALUACIÓN ESPACIAL DE RIESGO', 12, 14);

    pdf.setFontSize(9);
    pdf.setTextColor(203, 213, 225);
    pdf.text(`INFORME DE VULNERABILIDAD Y COBERTURA TÁCTICA • ${new Date().toLocaleString('es-VE')}`, 12, 20);

    // Caja de Nivel de Riesgo
    const level = spatialPayload.shapeType || 'Área Analizada';
    const area = spatialPayload.areaKm2 ? `${spatialPayload.areaKm2.toFixed(2)} km²` : 'N/A';
    
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(12, 25, pdfWidth - 24, 16, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(245, 158, 11);
    pdf.text(`ZONA EVALUADA: ${level.toUpperCase()} (${area})`, 16, 32);

    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Activos de Infraestructura: ${spatialPayload.antenasCount + spatialPayload.saludCount + spatialPayload.electricoCount + spatialPayload.gasCount + spatialPayload.aguaCount} | Cuadrantes: ${spatialPayload.cuadrantesCount}`, 16, 37);

    // Tabla de Desglose de Infraestructuras
    let yPos = 125;
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(12, yPos, pdfWidth - 24, 42, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(56, 189, 248);
    pdf.text('DESGLOSE CUANTITATIVO DE INFRAESTRUCTURAS CONTENIDAS', 16, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`• Subestaciones Eléctricas: ${spatialPayload.electricoCount || 0}`, 16, yPos + 15);
    pdf.text(`• Centros de Salud (Hospitales/CDI): ${spatialPayload.saludCount || 0}`, 16, yPos + 22);
    pdf.text(`• Antenas Telecom (Digitel/Movistar/Movilnet): ${spatialPayload.antenasCount || 0}`, 16, yPos + 29);
    pdf.text(`• Estaciones de Gas y Combustible: ${spatialPayload.gasCount || 0}`, 105, yPos + 15);
    pdf.text(`• Sistemas de Agua e Hidrología: ${spatialPayload.aguaCount || 0}`, 105, yPos + 22);
    pdf.text(`• Puntos de Atención / Delitos: ${spatialPayload.incidentesCount || 0}`, 105, yPos + 29);

    // Sección de Rutas de Evacuación / Vías de Salida y Perímetro Exterior
    yPos = 172;
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(12, yPos, pdfWidth - 24, 38, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(251, 191, 36);
    pdf.text('VÍAS DE ESCAPE / SALIDA Y ZONA EXTERIOR DE INFLUENCIA (1-2 KM)', 16, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(226, 232, 240);
    
    const routesStr = (spatialPayload.exitRoutes && spatialPayload.exitRoutes.length > 0)
      ? spatialPayload.exitRoutes.slice(0, 5).join(' • ')
      : 'Arterias viales principales del perímetro';

    pdf.text(`• Arterias Viales e Intersecciones de Salida: ${routesStr}`, 16, yPos + 15, { maxWidth: pdfWidth - 32 });

    const ext = spatialPayload.externalAssets || {};
    pdf.text(`• Infraestructura Exterior de Respaldo (Perímetro 1-2 km): Salud: ${ext.salud || 0} | Electricidad: ${ext.electrico || 0} | Gas/Combustible: ${ext.gas || 0} | Antenas: ${ext.antenas || 0}`, 16, yPos + 27);

    // Diagnóstico Táctico Final
    yPos = 214;
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(12, yPos, pdfWidth - 24, 36, 2, 2, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(52, 211, 153);
    pdf.text('DIAGNÓSTICO Y RECOMENDACIONES DE DESPLIEGUE TÁCTICO', 16, yPos + 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(226, 232, 240);
    pdf.text('1. Control preventivo de la FANB/IAPOLEPNE en intersecciones viales y accesos de escape.', 16, yPos + 15);
    pdf.text('2. Mantener canal de comunicación directo con la red de salud asistencial interna y exterior.', 16, yPos + 22);
    pdf.text('3. Monitoreo constante de respaldo eléctrico y radiobases para evitar aislamientos tácticos.', 16, yPos + 29);

    pdf.save(`evaluacion_riesgo_sogne_${Date.now()}.pdf`);
  } catch (e: any) {
    console.error("Error al exportar PDF de riesgo:", e);
    alert("Fallo al exportar PDF de evaluación de riesgo: " + (e?.message || e));
  }
};