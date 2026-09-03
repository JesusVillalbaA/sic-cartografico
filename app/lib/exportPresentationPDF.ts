import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { convertToDMS } from './exportLayerPDF';

export interface PresentationCategoryConfig {
  key: string;
  title: string;
  entityLabel: string;
  fileName: string;
  iconPath: string;
  color: string;
}

export const PRESENTATION_CATEGORIES: PresentationCategoryConfig[] = [
  {
    key: 'hospitales',
    title: 'RED HOSPITALARIA (TIPO I - IV)',
    entityLabel: 'NOMBRE DEL HOSPITAL',
    fileName: 'hospitales',
    iconPath: '/hospital.png',
    color: '#ef4444',
  },
  {
    key: 'cdi',
    title: 'CENTROS DE DIAGNÓSTICO INTEGRAL (CDI Y SRI)',
    entityLabel: 'NOMBRE DEL CDI / SRI',
    fileName: 'cdi',
    iconPath: '/centrosalud.png',
    color: '#a855f7',
  },
  {
    key: 'clinicas',
    title: 'CLÍNICAS Y CENTROS DE SALUD PRIVADOS',
    entityLabel: 'NOMBRE DE LA CLÍNICA',
    fileName: 'clinicas',
    iconPath: '/clinica.png',
    color: '#3b82f6',
  },
  {
    key: 'ambulatorios',
    title: 'AMBULATORIOS Y CONSULTORIOS POPULARES (CPT)',
    entityLabel: 'NOMBRE DEL AMBULATORIO',
    fileName: 'ambulatorios',
    iconPath: '/ambulatorio.png',
    color: '#ec4899',
  },
  {
    key: 'escuelas',
    title: 'INSTITUCIONES EDUCATIVAS Y CIRCUITOS ESCOLARES',
    entityLabel: 'CENTRO EDUCATIVO',
    fileName: 'escuelas',
    iconPath: '/social.png',
    color: '#d946ef',
  },
  {
    key: 'estaciones_combustible',
    title: 'ESTACIONES DE SERVICIO (COMBUSTIBLE)',
    entityLabel: 'ESTACIÓN DE SERVICIO (E/S)',
    fileName: 'estacionservicio',
    iconPath: '/bombagasolina.png',
    color: '#10b981',
  },
  {
    key: 'estaciongas',
    title: 'ESTACIONES DE GAS, GASODUCTOS Y EMR',
    entityLabel: 'INSTALACIÓN DE GAS',
    fileName: 'estaciongasNE',
    iconPath: '/gasolinera.png',
    color: '#f97316',
  },
  {
    key: 'electricidad',
    title: 'SISTEMA Y SUBESTACIONES ELÉCTRICAS',
    entityLabel: 'SUBESTACIÓN ELÉCTRICA',
    fileName: 'SISTEMAELECTRICONE',
    iconPath: '/electricidad.png',
    color: '#eab308',
  },
  {
    key: 'agua',
    title: 'INFRAESTRUCTURA HÍDRICA Y SERVICIOS DE AGUA',
    entityLabel: 'INSTALACIÓN DE AGUA',
    fileName: 'estacionagua',
    iconPath: '/agua.png',
    color: '#06b6d4',
  },
  {
    key: 'antenas',
    title: 'TELECOMUNICACIONES Y RADIOBASES (DIGITEL/MOVISTAR/MOVILNET)',
    entityLabel: 'NOMBRE DE RADIOBASE / ANTENA',
    fileName: 'ANTENAS',
    iconPath: '/antena.png',
    color: '#8b5cf6',
  },
  {
    key: 'conppas',
    title: 'CONPPAS Y PUERTOS PESQUEROS REGISTRADOS',
    entityLabel: 'NOMBRE DEL CONPPA / PUERTO',
    fileName: 'conppas',
    iconPath: '/conppa.png',
    color: '#0284c7',
  },
];

const cacheFeatures: Record<string, any[]> = {};

async function loadCategoryFeatures(config: PresentationCategoryConfig): Promise<any[]> {
  if (cacheFeatures[config.key]) return cacheFeatures[config.key];
  try {
    const res = await fetch(`/${config.fileName}.geojson`);
    if (!res.ok) return [];
    const data = await res.json();
    const features = data.features || [];
    cacheFeatures[config.key] = features;
    return features;
  } catch (err) {
    console.warn(`Error cargando GeoJSON para ${config.key}:`, err);
    return [];
  }
}

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });

export interface ProgressCallbackData {
  currentStep: number;
  totalSteps: number;
  categoryTitle: string;
}

export async function exportCompletePresentationPDF({
  mapElement,
  onToggleCategory,
  onProgress,
}: {
  mapElement?: HTMLElement | null;
  onToggleCategory?: (categoryKey: string) => Promise<void> | void;
  onProgress?: (progress: ProgressCallbackData) => void;
}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // Cargar Logos
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage('/Municipios.png');
  } catch (e) {
    console.warn('Logo municipios no disponible');
  }

  // Pre-cargar todos los GeoJSON para obtener estadísticas generales
  const totalCategories = PRESENTATION_CATEGORIES.length;
  let totalFeaturesCount = 0;
  const categoryDataList: { config: PresentationCategoryConfig; features: any[] }[] = [];

  for (let i = 0; i < totalCategories; i++) {
    const cat = PRESENTATION_CATEGORIES[i];
    if (onProgress) {
      onProgress({
        currentStep: i + 1,
        totalSteps: totalCategories + 1,
        categoryTitle: `Cargando datos de ${cat.title}...`,
      });
    }
    const feats = await loadCategoryFeatures(cat);
    totalFeaturesCount += feats.length;
    categoryDataList.push({ config: cat, features: feats });
  }

  // ==========================================
  // DIAPOSITIVA 1: PORTADA PRINCIPAL OFICIAL
  // ==========================================
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Marco Decorativo Táctico en Portada
  doc.setDrawColor(14, 165, 233); // Cyan
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Insignia de Logo Central
  if (logoImg) {
    doc.setFillColor(6, 182, 212);
    doc.circle(pageWidth / 2, 45, 18, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(pageWidth / 2, 45, 16, 'F');
    doc.addImage(logoImg, 'PNG', pageWidth / 2 - 12, 33, 24, 24);
  }

  // Título de la Portada
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SOGNE REDIMAIN', pageWidth / 2, 75, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(14, 165, 233);
  doc.text('DOSSIER ESTRATÉGICO DE GEOINTELIGENCIA POR CAPAS DE INFRAESTRUCTURA', pageWidth / 2, 85, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(186, 230, 253);
  doc.text('REPORTE SECTORIZADO POR CAPAS TÁCTICAS • ESTADO NUEVA ESPARTA', pageWidth / 2, 93, { align: 'center' });

  // Cuadro de Resumen Estadístico en Portada
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(40, 108, pageWidth - 80, 50, 4, 4, 'F');
  doc.setDrawColor(51, 65, 85);
  doc.roundedRect(40, 108, pageWidth - 80, 50, 4, 4, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('RESUMEN OPERATIVO DEL DOSSIER GEOESPACIAL', pageWidth / 2, 118, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`• Total de Capas Analizadas: ${totalCategories} Categorías Tácticas`, 50, 128);
  doc.text(`• Total de Instalaciones Registradas: ${totalFeaturesCount} Puntos Geo-localizados`, 50, 136);
  doc.text(`• Cobertura Territorial: 11 Municipios del Estado Nueva Esparta`, 50, 144);
  doc.text(`• Formato del Reporte: Presentación de Capturas de Mapa + Fichas Tabuladas`, 50, 152);

  // Sello de Confidencialidad y Fecha Footer Portada
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(239, 68, 68);
  doc.text('DOCUMENTO CONFIDENCIAL • USO EXCLUSIVO DE GEOINTELIGENCIA Y DEFENSA', pageWidth / 2, 175, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Emitido el: ${dateStr} a las ${timeStr} | REDIMAIN - Nueva Esparta`, pageWidth / 2, 183, { align: 'center' });

  // =========================================================
  // DIAPOSITIVAS SECUENCIALES: UNA POR CADA CAPA/CATEGORÍA
  // =========================================================
  for (let idx = 0; idx < categoryDataList.length; idx++) {
    const { config, features } = categoryDataList[idx];

    if (onProgress) {
      onProgress({
        currentStep: idx + 1,
        totalSteps: totalCategories,
        categoryTitle: `Procesando Diapositiva ${idx + 1}/${totalCategories}: ${config.title}`,
      });
    }

    // Obtener la instancia activa de Mapbox de forma robusta
    const mapInstance =
      (typeof window !== 'undefined' ? (window as any)._mapboxMapInstance : null) ||
      (mapElement as any)?._mapboxMap ||
      (mapElement as any)?.getMap?.();

    // Calcular la envolvente geográfica (Bounding Box) de los puntos de esta categoría
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    let validCoordsCount = 0;

    features.forEach((feat: any) => {
      const coords = feat.geometry?.coordinates;
      if (coords && Array.isArray(coords) && coords.length >= 2) {
        let lng: number | null = null;
        let lat: number | null = null;

        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
          lng = coords[0];
          lat = coords[1];
        } else if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
          lng = coords[0][0];
          lat = coords[0][1];
        }

        if (lng !== null && lat !== null && !isNaN(lng) && !isNaN(lat)) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
          validCoordsCount++;
        }
      }
    });

    // Ajustar el Zoom y la Cámara de Mapbox enfocado a los puntos específicos de esta categoría
    if (mapInstance && typeof mapInstance.fitBounds === 'function' && validCoordsCount > 0) {
      try {
        if (validCoordsCount === 1 || (minLng === maxLng && minLat === maxLat)) {
          mapInstance.flyTo({
            center: [minLng, minLat],
            zoom: 13.5,
            duration: 0,
            essential: true,
          });
        } else {
          mapInstance.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            {
              padding: { top: 70, bottom: 70, left: 80, right: 80 },
              maxZoom: 14.5,
              duration: 0,
              linear: true,
            }
          );
        }
      } catch (err) {
        console.warn(`Error al encuadrar vista para ${config.key}:`, err);
      }
    }

    // Activar la capa en el mapa si la función callback está presente
    if (onToggleCategory) {
      try {
        await onToggleCategory(config.key);
      } catch (err) {
        console.warn('Error alternando capa en el mapa:', err);
      }
    }

    // Esperar 650ms para que Mapbox renderice los azulejos de la vista enfocada y la simbología táctica limpia
    await new Promise((resolve) => setTimeout(resolve, 650));

    // Capturar el mapa de Mapbox enfocado
    let mapCanvasImg: string | null = null;
    if (mapElement) {
      try {
        const mapboxCanvas = mapElement.querySelector('.mapboxgl-canvas') as HTMLCanvasElement;
        if (mapboxCanvas) {
          mapCanvasImg = mapboxCanvas.toDataURL('image/png');
        }
      } catch (e) {
        console.warn('No se pudo capturar canvas de Mapbox para', config.key);
      }
    }

    // Agregar nueva diapositiva (Página Horizontal)
    doc.addPage('a4', 'landscape');

    // Header Banner
    doc.setFillColor(15, 23, 42); // Navy Slate
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setFillColor(14, 165, 233); // Cyan line
    doc.rect(0, 22, pageWidth, 1.2, 'F');

    // Logo Insignia en Header
    let titleX = 12;
    if (logoImg) {
      doc.setFillColor(6, 182, 212);
      doc.circle(18, 11, 7.5, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(18, 11, 6.5, 'F');
      doc.addImage(logoImg, 'PNG', 13.5, 6.5, 9, 9);
      titleX = 29;
    }

    // Título de la Diapositiva
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`SOGNE REDIMAIN • ${config.title}`, titleX, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(186, 230, 253);
    doc.text(`DIAPOSITIVA ${idx + 1} DE ${totalCategories} • CAPA TÁCTICA DE INFRAESTRUCTURA`, titleX, 16.5);

    // Tag Confidencialidad Derecha
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    doc.text('CONFIDENCIAL', pageWidth - 12, 9, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Registros: ${features.length} Puntos`, pageWidth - 12, 15, { align: 'right' });

    // ---------------------------------------------------------
    // VISTA DE LA CAPTURA DEL MAPA (MÁS ANCHA Y PROMINENTE)
    // ---------------------------------------------------------
    const mapY = 24;
    const mapHeight = 78;
    const mapWidth = 273; // Ancho máximo optimizado (273 mm)
    const mapX = (pageWidth - mapWidth) / 2; // 12 mm (margen lateral impecable)

    // Fondo para la ventana del mapa
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.rect(mapX, mapY, mapWidth, mapHeight, 'F');

    // Cargar la captura oficial pre-renderizada de la capa si está disponible en public/map_captures
    let categoryMapImg: HTMLImageElement | null = null;
    try {
      categoryMapImg = await loadImage(`/map_captures/${config.key}.png`);
    } catch (e) {
      console.warn(`Captura oficial no disponible para ${config.key}`);
    }

    if (categoryMapImg) {
      doc.addImage(categoryMapImg, 'PNG', mapX, mapY, mapWidth, mapHeight, undefined, 'FAST');
    } else if (mapCanvasImg) {
      doc.addImage(mapCanvasImg, 'PNG', mapX, mapY, mapWidth, mapHeight, undefined, 'FAST');
    } else {
      // Si no hay captura activa de Mapbox ni estática, dibujar esquema del mapa
      doc.setFillColor(15, 23, 42);
      doc.rect(mapX, mapY, mapWidth, mapHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(56, 189, 248);
      doc.text(`[ VISTA GEOESPACIAL DE CAPA - ${config.title} ]`, pageWidth / 2, mapY + 35, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Ubicaciones activas proyectadas sobre la Isla de Margarita, Coche y Cubagua`, pageWidth / 2, mapY + 43, { align: 'center' });
    }

    // Borde Cyan en la ventana del mapa
    doc.setDrawColor(14, 165, 233);
    doc.setLineWidth(0.7);
    doc.rect(mapX, mapY, mapWidth, mapHeight);

    // Etiqueta distintiva sobre el mapa
    doc.setFillColor(15, 23, 42);
    doc.rect(mapX + 2, mapY + 2, 85, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(56, 189, 248);
    doc.text(`VISTA GEOESPACIAL OFICIAL: ${config.title}`, mapX + 4, mapY + 6);

    // ---------------------------------------------------------
    // TABLA DE PUNTOS DETALLADA ABAJO DEL MAPA (SIN CAMPOS EN BLANCO)
    // ---------------------------------------------------------
    const tableStartY = mapY + mapHeight + 3; // 105 mm

    // Helper para garantizar que ningún campo quede en blanco
    const getCleanField = (val: any, fallback: string): string => {
      if (val === null || val === undefined) return fallback;
      const str = String(val).trim();
      if (str === '' || str === '-' || str === 'null' || str === 'undefined' || str === 'N/D') return fallback;
      return str.toUpperCase();
    };

    // Preparar filas de la tabla sin campos vacíos
    const tableHead = [['N°', config.entityLabel, 'MUNICIPIO', 'PARROQUIA / SECTOR', 'CATEGORÍA / ESTATUS', 'COORDENADAS (DMS)']];

    const tableBody = features.map((feat: any, fIdx: number) => {
      const p = feat.properties || {};
      const coords = feat.geometry?.coordinates || [];
      const lng = coords[0] ?? null;
      const lat = coords[1] ?? null;
      const dmsStr = convertToDMS(lat, lng);

      const nombre = getCleanField(
        p.nombre || p.NOMBRE || p.Nombre || p.nombre_conppa || p.nombre_sitio || p.NAME || p.hospital || p.escuela || p.conppa || p.estacion || p.subestacion || p.antena,
        `${config.entityLabel} N° ${fIdx + 1}`
      );

      const municipio = getCleanField(
        p.municipio || p.MUNICIPIO || p.Municipio || p.CityName || p.mcpio,
        'NUEVA ESPARTA'
      ).replace(/^MP\.\s*/i, '');

      const parroquia = getCleanField(
        p.parroquia || p.PARROQUIA || p.sector || p.SECTOR || p.comunidad || p.address || p.ubicacion || p.direccion,
        'SECTOR GENERAL'
      ).replace(/^CM\.\s*/i, '');

      const categoria = getCleanField(
        p.categoria || p.tipo || p.TIPO || p.TIPO_SERVICIO || p.subcategoria || p.estatus || p.estado,
        'INSTALACIÓN OPERATIVA'
      );

      return [fIdx + 1, nombre, municipio, parroquia, categoria, dmsStr];
    });

    autoTable(doc, {
      startY: tableStartY,
      margin: { left: 12, right: 12 },
      head: tableHead,
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // Navy blue #1e3a8a
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 6.2,
        textColor: [30, 41, 59],
        cellPadding: 1.5,
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'left', cellWidth: 70 },
        2: { halign: 'center', cellWidth: 40 },
        3: { halign: 'left', cellWidth: 55 },
        4: { halign: 'center', cellWidth: 45 },
        5: { halign: 'center', cellWidth: 53 },
      },
      styles: {
        overflow: 'linebreak',
      },
      didDrawPage: (data) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);

        doc.text(
          `Página ${data.pageNumber} de ${pageCount} • Dossier Táctico SOGNE REDIMAIN`,
          12,
          pageHeight - 6
        );
        doc.text(
          `Capa: ${config.title} (${features.length} registros)`,
          pageWidth - 12,
          pageHeight - 6,
          { align: 'right' }
        );
      },
    });
  }

  // Restaurar vista general de la cámara en Mapbox al terminar la generación
  const finalMapInstance = typeof window !== 'undefined' ? (window as any)._mapboxMapInstance : null;
  if (finalMapInstance && typeof finalMapInstance.flyTo === 'function') {
    try {
      finalMapInstance.flyTo({
        center: [-63.85, 10.98],
        zoom: 9.8,
        duration: 1000,
      });
    } catch (e) {}
  }

  // Guardar archivo descargable
  doc.save(`Dossier_Presentacion_SOGNE_REDIMAIN_${Date.now()}.pdf`);
}
