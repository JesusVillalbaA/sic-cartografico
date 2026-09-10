import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface LayerExportOptions {
  layerKey: string;
  customTitle?: string;
  customFeatures?: any[];
}

/** Map of layer keys to their public file names and clean titles */
const LAYER_CONFIGS: Record<string, { fileName: string; title: string; entityLabel: string }> = {
  municipios: {
    fileName: 'ven_admin2',
    title: 'REGISTRO Y DELIMITACIÓN DE MUNICIPIOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'MUNICIPIO',
  },
  parroquias: {
    fileName: 'ven_admin3',
    title: 'REGISTRO DE PARROQUIAS TERRITORIALES - ESTADO NUEVA ESPARTA',
    entityLabel: 'PARROQUIA',
  },
  sectores: {
    fileName: 'sectores',
    title: 'REGISTRO DE SECTORES Y COMUNIDADES - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DEL SECTOR',
  },
  cuadrantes: {
    fileName: 'compas',
    title: 'REGISTRO DE CUADRANTES DE PAZ Y ORGANIZACIÓN TÁCTICA - ESTADO NUEVA ESPARTA',
    entityLabel: 'CUADRANTE DE PAZ',
  },
  cuadrantesPoligonos: {
    fileName: 'compas',
    title: 'REGISTRO DE CUADRANTES DE PAZ Y ORGANIZACIÓN TÁCTICA - ESTADO NUEVA ESPARTA',
    entityLabel: 'CUADRANTE DE PAZ',
  },
  compas: {
    fileName: 'compas',
    title: 'REGISTRO DE CUADRANTES DE PAZ Y ORGANIZACIÓN TÁCTICA - ESTADO NUEVA ESPARTA',
    entityLabel: 'CUADRANTE DE PAZ',
  },
  conppas: {
    fileName: 'conppas',
    title: 'REGISTRO DE CONPPAS Y SECTOR PESQUERO (52 PUERTOS) - ESTADO NUEVA ESPARTA',
    entityLabel: 'CONPPA PESQUERO',
  },
  incidencias: {
    fileName: 'incidencias',
    title: 'REPORTE ESTRATÉGICO DE INCIDENCIAS Y DELITOS COMUNES - ESTADO NUEVA ESPARTA',
    entityLabel: 'TIPO DE INCIDENCIA / DELITO',
  },
  delitos: {
    fileName: 'incidencias',
    title: 'REGISTRO DE DELITOS COMUNES Y FOCOS DE INSEGURIDAD - ESTADO NUEVA ESPARTA',
    entityLabel: 'REGISTRO DE DELITO',
  },
  cibernetica: {
    fileName: 'cibernetica',
    title: 'DIAGNÓSTICO TÁCTICO DE DELITOS CIBERNÉTICOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'INCIDENCIA CIBERNÉTICA',
  },
  concentraciones: {
    fileName: 'concentraciones',
    title: 'REGISTRO DE PUNTOS DE CONCENTRACIÓN Y EVENTOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'PUNTO DE CONCENTRACIÓN',
  },
  drogas: {
    fileName: 'drogas',
    title: 'REPORTE DE INCAUTACIÓN Y GEOLOCALIZACIÓN DE DROGAS - ESTADO NUEVA ESPARTA',
    entityLabel: 'PROCEDIMIENTO / INCAUTACIÓN',
  },
  actores: {
    fileName: 'actores',
    title: 'REGISTRO DE ACTORES Y PERSONAS DE INTERÉS - ESTADO NUEVA ESPARTA',
    entityLabel: 'ACTOR DE INTERÉS',
  },
  puntos: {
    fileName: 'puntos',
    title: 'REGISTRO DE LUGARES Y PUNTOS DE INTERÉS TÁCTICO - ESTADO NUEVA ESPARTA',
    entityLabel: 'PUNTO DE INTERÉS',
  },
  bandas: {
    fileName: 'bandas',
    title: 'DIAGNÓSTICO DE GRUPOS DELICTIVOS ORGANIZADOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'GRUPO / BANDA DELICTIVA',
  },
  hospitales: {
    fileName: 'hospitales',
    title: 'REGISTRO DE RED DE HOSPITALES - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DEL HOSPITAL',
  },
  clinicas: {
    fileName: 'clinicas',
    title: 'REGISTRO DE CLÍNICAS Y CENTROS PRIVADOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DE LA CLÍNICA',
  },
  ambulatorios: {
    fileName: 'ambulatorios',
    title: 'REGISTRO DE AMBULATORIOS Y CONSULTORIOS POPULARES (CPT) - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DEL AMBULATORIO',
  },
  cdi: {
    fileName: 'cdi',
    title: 'REGISTRO DE CENTROS DE DIAGNÓSTICO INTEGRAL (CDI) Y SRI - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DEL CDI',
  },
  salud: {
    fileName: 'centrossalud',
    title: 'REGISTRO GENERAL DE CENTROS DE SALUD - ESTADO NUEVA ESPARTA',
    entityLabel: 'CENTRO DE SALUD',
  },
  escuelas: {
    fileName: 'escuelas',
    title: 'REGISTRO DE INSTITUCIONES EDUCATIVAS Y CIRCUITOS ESCOLARES - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DEL CENTRO EDUCATIVO',
  },
  centrosvotacion: {
    fileName: 'centrosvotacion',
    title: 'REGISTRO DE CENTROS DE VOTACIÓN Y ELECTORALES - ESTADO NUEVA ESPARTA',
    entityLabel: 'CENTRO DE VOTACIÓN',
  },
  estaciongas: {
    fileName: 'estaciongasNE',
    title: 'REGISTRO DE ESTACIONES DE GAS, GASODUCTOS Y EMR - ESTADO NUEVA ESPARTA',
    entityLabel: 'INSTALACIÓN DE GAS',
  },
  gas: {
    fileName: 'estaciongasNE',
    title: 'REGISTRO DE ESTACIONES DE GAS Y GASODUCTOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'INSTALACIÓN DE GAS',
  },
  electricidad: {
    fileName: 'SISTEMAELECTRICONE',
    title: 'REGISTRO DE SISTEMA ELÉCTRICO Y SUBESTACIONES - ESTADO NUEVA ESPARTA',
    entityLabel: 'SUBESTACIÓN / INSTALACIÓN ELÉCTRICA',
  },
  subestaciones: {
    fileName: 'SISTEMAELECTRICONE',
    title: 'REGISTRO DE SUBESTACIONES ELÉCTRICAS - ESTADO NUEVA ESPARTA',
    entityLabel: 'SUBESTACIÓN ELÉCTRICA',
  },
  electrico: {
    fileName: 'SISTEMAELECTRICONE',
    title: 'REGISTRO DE INFRAESTRUCTURA DEL SISTEMA ELÉCTRICO - ESTADO NUEVA ESPARTA',
    entityLabel: 'INSTALACIÓN ELÉCTRICA',
  },
  agua: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE SERVICIOS DE AGUA, EMBALSES Y POZOS - ESTADO NUEVA ESPARTA',
    entityLabel: 'INSTALACIÓN HÍDRICA',
  },
  estacionagua: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE ESTACIONES Y EMBALSES DE AGUA POTABLE - ESTADO NUEVA ESPARTA',
    entityLabel: 'INSTALACIÓN DE AGUA',
  },
  desalinizadoras: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE PLANTAS DESALINIZADORAS DE AGUA - ESTADO NUEVA ESPARTA',
    entityLabel: 'PLANTA DESALINIZADORA',
  },
  tanques: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE TANQUES Y ALMACENAMIENTO DE AGUA - ESTADO NUEVA ESPARTA',
    entityLabel: 'TANQUE DE AGUA',
  },
  pozos: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE POZOS DE AGUA POTABLE - ESTADO NUEVA ESPARTA',
    entityLabel: 'POZO DE AGUA',
  },
  tratamiento: {
    fileName: 'estacionagua',
    title: 'REGISTRO DE PLANTAS DE TRATAMIENTO DE AGUA - ESTADO NUEVA ESPARTA',
    entityLabel: 'PLANTA DE TRATAMIENTO',
  },
  embalses: {
    fileName: 'EmbalsesNE',
    title: 'REGISTRO DE EMBALSES Y FUENTES HÍDRICAS - ESTADO NUEVA ESPARTA',
    entityLabel: 'EMBALSE / FUENTE DE AGUA',
  },
  antenas: {
    fileName: 'ANTENAS',
    title: 'REGISTRO DE INFRAESTRUCTURA DE TELECOMUNICACIONES Y ANTENAS - ESTADO NUEVA ESPARTA',
    entityLabel: 'NOMBRE DE RADIOBASE / ANTENA',
  },
  digitel: {
    fileName: 'digitel',
    title: 'REGISTRO DE RADIOBASES Y ANTENAS DIGITEL 4G - ESTADO NUEVA ESPARTA',
    entityLabel: 'ANTENA DIGITEL',
  },
  movilnet: {
    fileName: 'movilnet',
    title: 'REGISTRO DE RADIOBASES Y ANTENAS MOVILNET - ESTADO NUEVA ESPARTA',
    entityLabel: 'ANTENA MOVILNET',
  },
  movistar: {
    fileName: 'movistar',
    title: 'REGISTRO DE RADIOBASES Y ANTENAS MOVISTAR 4G - ESTADO NUEVA ESPARTA',
    entityLabel: 'ANTENA MOVISTAR',
  },
  estacionesservicio: {
    fileName: 'estacionservicio',
    title: 'REGISTRO DE ESTACIONES DE SERVICIO DE COMBUSTIBLE - ESTADO NUEVA ESPARTA',
    entityLabel: 'ESTACIÓN DE SERVICIO (E/S)',
  },
  estaciones_combustible: {
    fileName: 'estacionservicio',
    title: 'REGISTRO DE ESTACIONES DE SERVICIO Y COMBUSTIBLE - ESTADO NUEVA ESPARTA',
    entityLabel: 'ESTACIÓN DE SERVICIO (E/S)',
  },
  transporte: {
    fileName: 'transporte',
    title: 'REGISTRO DE RED DE TRANSPORTE Y RUTAS - ESTADO NUEVA ESPARTA',
    entityLabel: 'UNIDAD / RUTA DE TRANSPORTE',
  },
  terminales: {
    fileName: 'transporte',
    title: 'REGISTRO DE TERMINALES DE PASAJEROS - ESTADO NUEVA ESPARTA',
    entityLabel: 'TERMINAL DE PASAJEROS',
  },
};

/** Convert decimal lat/lng to DMS format string */
export function convertToDMS(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return 'Coordenadas N/D';

  const formatComponent = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    const abs = Math.abs(val);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = Math.floor(minFloat);
    const sec = ((minFloat - min) * 60).toFixed(2);
    return `${deg}°${min.toString().padStart(2, '0')}'${sec.toString().padStart(5, '0')}"${dir}`;
  };

  return `${formatComponent(lat, true)} ${formatComponent(lng, false)}`;
}

/** Extract DMS coordinates string from feature */
export function getCoordinatesDMS(feature: any): string {
  const p = feature.properties || {};

  if (p.coordenadas_dms && typeof p.coordenadas_dms === 'string' && p.coordenadas_dms.trim() !== '') {
    return p.coordenadas_dms.replace(/\n/g, ' ').trim();
  }
  if (p.COORDENADAS && typeof p.COORDENADAS === 'string' && p.COORDENADAS.trim() !== '') {
    return p.COORDENADAS.replace(/\n/g, ' ').trim();
  }
  if (p.coordenadas && typeof p.coordenadas === 'string' && p.coordenadas.trim() !== '') {
    return p.coordenadas.replace(/\n/g, ' ').trim();
  }

  let lat: number | null = p.latitud !== undefined ? parseFloat(p.latitud) : null;
  let lng: number | null = p.longitud !== undefined ? parseFloat(p.longitud) : null;

  if ((lat === null || lng === null || isNaN(lat) || isNaN(lng)) && feature.geometry && feature.geometry.coordinates) {
    const coords = feature.geometry.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      lng = parseFloat(coords[0]);
      lat = parseFloat(coords[1]);
    }
  }

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    return convertToDMS(lat, lng);
  }

  return p.ubicacion || p.address || 'N/D';
}

export interface ActiveColumn {
  id: string;
  header: string;
  align: 'center' | 'left' | 'right';
  getValue: (featOrProp: any, idx: number) => string;
}

/**
 * Filter columns dynamically to include ONLY fields that actually contain non-empty data
 */
export function getActiveColumns(features: any[], entityLabel: string): ActiveColumn[] {
  const allCandidateColumns: ActiveColumn[] = [
    {
      id: 'nro',
      header: 'N°',
      align: 'center',
      getValue: (p, idx) => String(p.nro || p.N || idx + 1),
    },
    {
      id: 'estado',
      header: 'ESTADO',
      align: 'center',
      getValue: (p) => (p.estado || p.RegionName || 'NUEVA ESPARTA').toString().toUpperCase(),
    },
    {
      id: 'mcpio',
      header: 'MCPIO',
      align: 'left',
      getValue: (p) => (p.municipio || p.MCPIO || p.CityName || p.MUNICIPIO || '').toString().toUpperCase().replace(/^MP\.\s*/i, ''),
    },
    {
      id: 'pquia',
      header: 'PQUIA.',
      align: 'left',
      getValue: (p) => (p.parroquia || p.PQUIA || p.PARROQUIA || '').toString().toUpperCase().replace(/^CM\.\s*/i, ''),
    },
    {
      id: 'comunidad',
      header: 'COMUNIDAD / SECTOR',
      align: 'left',
      getValue: (p) => (p.comunidad || p.sector || p.SECTOR || p.address || p.ubicacion || '').toString().toUpperCase(),
    },
    {
      id: 'nombre',
      header: entityLabel,
      align: 'left',
      getValue: (p) => (p.nombre_conppa || p.nombre || p.NAME || p.instalacion || p.nombre_sitio || p.NOMBRE || '').toString().toUpperCase(),
    },
    {
      id: 'vocero',
      header: 'VOCERO / RESPONSABLE',
      align: 'left',
      getValue: (p) => (p.vocero || p.responsable || p.CUSTODIA || p.OPERADOR || p.operadora || p.OPERADORA || p.director || '').toString().toUpperCase(),
    },
    {
      id: 'cedula',
      header: 'N° CÉDULA',
      align: 'center',
      getValue: (p) => (p.cedula || p.ci || '').toString().trim(),
    },
    {
      id: 'telefono',
      header: 'TELÉFONO',
      align: 'center',
      getValue: (p) => (p.telefono || p.tlf || p.Phone || '').toString().trim(),
    },
    {
      id: 'coordenadas',
      header: 'COORDENADAS',
      align: 'center',
      getValue: (feat) => getCoordinatesDMS(feat),
    },
  ];

  return allCandidateColumns.filter((col) => {
    if (col.id === 'nro' || col.id === 'nombre') return true;

    return features.some((feat, idx) => {
      const p = feat.properties || {};
      const val = col.id === 'coordenadas' ? col.getValue(feat, idx) : col.getValue(p, idx);
      if (!val) return false;
      const clean = String(val).trim().toUpperCase();
      return (
        clean !== '' &&
        clean !== '-' &&
        clean !== 'N/D' &&
        clean !== 'COORDENADAS N/D' &&
        clean !== 'RESPONSABLE INSTITUCIONAL' &&
        clean !== '0'
      );
    });
  });
}

/** Helper to fetch features for layer */
async function fetchLayerFeatures(options: LayerExportOptions, config: any): Promise<any[]> {
  if (options.customFeatures && options.customFeatures.length > 0) {
    return options.customFeatures;
  }
  try {
    const res = await fetch(`/api/map/capas?nombre=${config.fileName}`);
    if (res.ok) {
      const data = await res.json();
      return data.features || [];
    }
  } catch (err) {
    console.warn(`Error fetching layer ${config.fileName}:`, err);
  }
  return [];
}

/**
 * Main export function to generate a beautifully formatted PDF report, including ONLY active non-empty columns.
 */
export async function exportLayerToPDF(options: LayerExportOptions): Promise<void> {
  const key = options.layerKey.toLowerCase();
  const config = LAYER_CONFIGS[key] || {
    fileName: key,
    title: options.customTitle || `REGISTRO DE DATA DE ${key.toUpperCase()} - ESTADO NUEVA ESPARTA 2026`,
    entityLabel: 'NOMBRE DE LA INSTALACIÓN',
  };

  const features = await fetchLayerFeatures(options, config);
  if (features.length === 0) {
    throw new Error(`No se encontraron registros para la capa "${key}".`);
  }

  // Determine active columns that actually contain data
  const activeCols = getActiveColumns(features, config.entityLabel);

  // Create A4 Landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // Load loading animation logo (/Municipios.png)
  let logoImg: HTMLImageElement | null = null;
  try {
    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
    logoImg = await loadImage('/Municipios.png');
  } catch (e) {
    console.warn('Logo de carga no disponible para PDF');
  }

  // Header Banner
  doc.setFillColor(15, 23, 42); // Deep slate/navy #0f172a
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Draw Loading Animation Logo Badge if available
  let titleX = 14;
  if (logoImg) {
    doc.setFillColor(6, 182, 212); // Cyan ring
    doc.circle(21, 12, 9, 'F');
    doc.setFillColor(255, 255, 255); // White circle
    doc.circle(21, 12, 8, 'F');
    doc.addImage(logoImg, 'PNG', 15.5, 6.5, 11, 11);
    titleX = 33;
  }

  // Accent Line
  doc.setFillColor(14, 165, 233); // Cyan accent #0ea5e9
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('SOGNE REDIMAIN - GEOPORTAL ESTRATÉGICO', titleX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(186, 230, 253);
  doc.text('SISTEMA DE ORIENTACIÓN DE GEOINTELIGENCIA DEL ESTADO NUEVA ESPARTA', titleX, 17.5);

  // Classification & Timestamp Right Tag
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(239, 68, 68); // Red tag
  doc.text('CONFIDENCIAL / USO INSTITUCIONAL', pageWidth - 14, 10, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha: ${dateStr} - ${timeStr}`, pageWidth - 14, 16, { align: 'right' });

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(config.title, 14, 33);

  // Subtitle / Metrics
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total de registros: ${features.length} instalaciones / voceros registrados (Columnas activas: ${activeCols.length})`, 14, 38.5);

  // Build headers & body dynamically from active columns
  const head = [activeCols.map((c) => c.header)];
  const body = features.map((feat: any, idx: number) => {
    const p = feat.properties || {};
    return activeCols.map((c) => (c.id === 'coordenadas' ? c.getValue(feat, idx) : c.getValue(p, idx) || '-'));
  });

  const columnStyles: Record<number, { halign: 'center' | 'left' | 'right' }> = {};
  activeCols.forEach((col, i) => {
    columnStyles[i] = { halign: col.align };
  });

  // Render Table using autoTable
  autoTable(doc, {
    startY: 42,
    margin: { left: 14, right: 14 },
    head: head,
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Navy blue #1e3a8a
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #f8fafc
    },
    columnStyles: columnStyles,
    styles: {
      overflow: 'linebreak',
    },
    didDrawPage: (data) => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      doc.text(
        `Página ${data.pageNumber} de ${pageCount} - SOGNE REDIMAIN (Dirección de Geointeligencia)`,
        14,
        pageHeight - 8
      );
      doc.text(
        `Documento Oficial SOGNE - Nueva Esparta`,
        pageWidth - 14,
        pageHeight - 8,
        { align: 'right' }
      );
    },
  });

  const sanitizedTitle = config.title.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
  doc.save(`Reporte_SOGNE_${sanitizedTitle}_${Date.now()}.pdf`);
}

/**
 * Main export function to generate a beautifully formatted Excel (.xls) file for any layer,
 * including ONLY active non-empty columns.
 */
export async function exportLayerToExcel(options: LayerExportOptions): Promise<void> {
  const key = options.layerKey.toLowerCase();
  const config = LAYER_CONFIGS[key] || {
    fileName: key,
    title: options.customTitle || `REGISTRO DE DATA DE ${key.toUpperCase()} - ESTADO NUEVA ESPARTA 2026`,
    entityLabel: 'NOMBRE DE LA INSTALACIÓN',
  };

  const features = await fetchLayerFeatures(options, config);
  if (features.length === 0) {
    throw new Error(`No se encontraron registros para la capa "${key}".`);
  }

  const activeCols = getActiveColumns(features, config.entityLabel);

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-VE');
  const timeStr = now.toLocaleTimeString('es-VE');

  const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"/>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Data SOGNE</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  body { font-family: Calibri, Helvetica, Arial, sans-serif; }
  .title { font-size: 14pt; font-weight: bold; color: #0f172a; background-color: #f1f5f9; padding: 10px; }
  .meta { font-size: 9pt; color: #475569; padding: 5px; }
  th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
  td { border: 1px solid #e2e8f0; font-size: 9.5pt; padding: 6px; color: #1e293b; vertical-align: middle; }
  .center { text-align: center; }
  .left { text-align: left; }
</style>
</head>
<body>
<table>
  <tr><td colspan="${activeCols.length}" class="title">${config.title}</td></tr>
  <tr><td colspan="${activeCols.length}" class="meta">SOGNE REDIMAIN • Total registros: ${features.length} • Fecha: ${dateStr} ${timeStr}</td></tr>
  <tr></tr>
  <tr>
    ${activeCols.map((col) => `<th>${col.header}</th>`).join('')}
  </tr>
  ${features
    .map((feat, idx) => {
      const p = feat.properties || {};
      return `<tr>
      ${activeCols
        .map((col) => {
          const val = col.id === 'coordenadas' ? col.getValue(feat, idx) : col.getValue(p, idx);
          return `<td class="${col.align}">${val || '-'}</td>`;
        })
        .join('')}
    </tr>`;
    })
    .join('')}
</table>
</body>
</html>`;

  const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sanitizedTitle = config.title.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
  a.download = `Reporte_SOGNE_${sanitizedTitle}_${Date.now()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
