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
    const element = document.getElementById('map-export-container');
    if (!element) throw new Error('Contenedor no encontrado');

    const legendElem = element.querySelector('.legend-glass') as HTMLElement;
    let originalFilter = '';
    if (legendElem) {
      originalFilter = legendElem.style.backdropFilter || '';
      legendElem.style.backdropFilter = 'none';
    }

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const sanitizeStyle = (style: CSSStyleDeclaration) => {
          try {
            const properties = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke'];
            for (const prop of properties) {
              const value = style.getPropertyValue(prop);
              if (value && (value.includes('oklab') || value.includes('oklch'))) {
                style.setProperty(prop, '#000000');
              }
            }
            const bgImage = style.getPropertyValue('background-image');
            if (bgImage && (bgImage.includes('oklab') || bgImage.includes('oklch'))) {
              style.setProperty('background-image', 'none');
            }
          } catch (e) { }
        };

        // Limpiar estilos de las hojas de estilo (código completo del original)
        try {
          const styleSheets = clonedDoc.styleSheets;
          for (let i = 0; i < styleSheets.length; i++) {
            try {
              const sheet = styleSheets[i];
              let rules: CSSRuleList | null = null;
              try {
                rules = sheet.cssRules || sheet.rules;
              } catch (e) { continue; }
              if (!rules) continue;
              for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.type === CSSRule.STYLE_RULE && (rule as CSSStyleRule).style) {
                  sanitizeStyle((rule as CSSStyleRule).style);
                }
                if (rule.type === CSSRule.MEDIA_RULE && (rule as CSSMediaRule).cssRules) {
                  const mediaRules = (rule as CSSMediaRule).cssRules;
                  for (let k = 0; k < mediaRules.length; k++) {
                    const childRule = mediaRules[k];
                    if (childRule.type === CSSRule.STYLE_RULE && (childRule as CSSStyleRule).style) {
                      sanitizeStyle((childRule as CSSStyleRule).style);
                    }
                  }
                }
              }
            } catch (e) { }
          }
        } catch (e) { }

        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el: any) => {
          const inlineStyle = el.getAttribute('style');
          if (inlineStyle && (inlineStyle.includes('oklab') || inlineStyle.includes('oklch'))) {
            const cleaned = inlineStyle.replace(/oklab\([^)]+\)/g, '#000').replace(/oklch\([^)]+\)/g, '#000');
            el.setAttribute('style', cleaned);
          }
          if (el.style) sanitizeStyle(el.style);
        });
      }
    });

    if (legendElem) legendElem.style.backdropFilter = originalFilter;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save('mapa_incidencias_ne.pdf');
  } catch (error) {
    console.error('Error al generar PDF:', error);
  } finally {
    setIsExporting(false);
  }
};