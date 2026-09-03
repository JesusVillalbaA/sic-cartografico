import * as turf from '@turf/turf';

export interface GisStats {
  totalFeatures: number;
  pointsCount: number;
  linesCount: number;
  polygonsCount: number;
  geometryTypes: string[];
  propertiesList: string[];
}

export interface ParseResult {
  geojson: any;
  stats: GisStats;
  bbox: [number, number, number, number] | null;
}

/**
 * Convierte cualquier documento GIS cargado (JSON, GeoJSON, KML, Shapefile, CSV, GPX) a GeoJSON estandarizado.
 */
export async function parseGisDocument(
  fileContent: string | ArrayBuffer,
  fileName: string
): Promise<ParseResult> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let geojson: any = null;

  if (ext === 'json' || ext === 'geojson') {
    geojson = parseJsonOrGeoJson(fileContent as string);
  } else if (ext === 'kml') {
    geojson = parseKml(fileContent as string);
  } else if (ext === 'gpx') {
    geojson = parseGpx(fileContent as string);
  } else if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    geojson = parseCsv(fileContent as string, ext === 'tsv' ? '\t' : ',');
  } else if (ext === 'shp' || ext === 'zip') {
    geojson = parseShapefileBuffer(fileContent as ArrayBuffer);
  } else {
    // Intento de auto-detección por string si es texto
    if (typeof fileContent === 'string') {
      const trimmed = fileContent.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        geojson = parseJsonOrGeoJson(fileContent);
      } else if (trimmed.includes('<kml')) {
        geojson = parseKml(fileContent);
      } else if (trimmed.includes('<gpx')) {
        geojson = parseGpx(fileContent);
      } else {
        geojson = parseCsv(fileContent, ',');
      }
    }
  }

  if (!geojson || geojson.type !== 'FeatureCollection') {
    if (geojson && geojson.type === 'Feature') {
      geojson = { type: 'FeatureCollection', features: [geojson] };
    } else if (Array.isArray(geojson)) {
      geojson = { type: 'FeatureCollection', features: geojson };
    } else {
      geojson = { type: 'FeatureCollection', features: [] };
    }
  }

  // Filtrar y limpiar geometrías
  geojson.features = (geojson.features || []).filter((f: any) => f && f.geometry && f.geometry.coordinates);

  const stats = calculateStats(geojson);
  const bbox = calculateBBox(geojson);

  return { geojson, stats, bbox };
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSERS ESPECÍFICOS
// ─────────────────────────────────────────────────────────────────────────────

function parseJsonOrGeoJson(text: string): any {
  const data = JSON.parse(text);

  if (data.type === 'FeatureCollection') return data;
  if (data.type === 'Feature') return { type: 'FeatureCollection', features: [data] };

  if (Array.isArray(data)) {
    const features: any[] = [];
    data.forEach((item, idx) => {
      if (item.type === 'Feature') {
        features.push(item);
      } else {
        // Intentar extraer coordenadas lat/lng de objetos planos
        const lat = parseFloat(item.lat || item.latitude || item.latitud || item.y || 0);
        const lng = parseFloat(item.lng || item.lon || item.longitude || item.longitud || item.x || 0);
        if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
          features.push({
            type: 'Feature',
            id: item.id || `feat_${idx}`,
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: item
          });
        }
      }
    });
    return { type: 'FeatureCollection', features };
  }

  return { type: 'FeatureCollection', features: [] };
}

function parseKml(xmlString: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const features: any[] = [];

  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    const nameEl = pm.getElementsByTagName('name')[0];
    const descEl = pm.getElementsByTagName('description')[0];

    const properties: Record<string, any> = {
      name: nameEl?.textContent?.trim() || `Elemento ${i + 1}`,
      description: descEl?.textContent?.trim() || '',
    };

    // ExtendedData / SimpleData
    const simpleDatas = pm.getElementsByTagName('SimpleData');
    for (let s = 0; s < simpleDatas.length; s++) {
      const sd = simpleDatas[s];
      const key = sd.getAttribute('name');
      if (key) properties[key] = sd.textContent?.trim() || '';
    }

    const datas = pm.getElementsByTagName('Data');
    for (let d = 0; d < datas.length; d++) {
      const dataEl = datas[d];
      const key = dataEl.getAttribute('name');
      const valEl = dataEl.getElementsByTagName('value')[0];
      if (key) properties[key] = valEl?.textContent?.trim() || '';
    }

    let geometry: any = null;

    // Point
    const pointEl = pm.getElementsByTagName('Point')[0];
    if (pointEl) {
      const coordText = pointEl.getElementsByTagName('coordinates')[0]?.textContent?.trim();
      if (coordText) {
        const parts = coordText.split(',').map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          geometry = { type: 'Point', coordinates: [parts[0], parts[1]] };
        }
      }
    }

    // LineString
    const lineEl = pm.getElementsByTagName('LineString')[0];
    if (!geometry && lineEl) {
      const coordText = lineEl.getElementsByTagName('coordinates')[0]?.textContent?.trim();
      if (coordText) {
        const coords = parseCoordString(coordText);
        if (coords.length > 0) {
          geometry = { type: 'LineString', coordinates: coords };
        }
      }
    }

    // Polygon
    const polyEl = pm.getElementsByTagName('Polygon')[0];
    if (!geometry && polyEl) {
      const outerRing = polyEl.getElementsByTagName('outerBoundaryIs')[0];
      const coordText = outerRing?.getElementsByTagName('coordinates')[0]?.textContent?.trim();
      if (coordText) {
        const coords = parseCoordString(coordText);
        if (coords.length >= 3) {
          geometry = { type: 'Polygon', coordinates: [coords] };
        }
      }
    }

    if (geometry) {
      features.push({
        type: 'Feature',
        id: `kml_${i + 1}`,
        geometry,
        properties
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

function parseCoordString(text: string): number[][] {
  return text
    .split(/\s+/)
    .map(pt => pt.split(',').map(Number))
    .filter(parts => parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
    .map(parts => [parts[0], parts[1]]);
}

function parseGpx(xmlString: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const features: any[] = [];

  // Waypoints
  const waypoints = xmlDoc.getElementsByTagName('wpt');
  for (let i = 0; i < waypoints.length; i++) {
    const wpt = waypoints[i];
    const lat = parseFloat(wpt.getAttribute('lat') || '0');
    const lon = parseFloat(wpt.getAttribute('lon') || '0');
    const name = wpt.getElementsByTagName('name')[0]?.textContent || `Punto ${i + 1}`;
    const desc = wpt.getElementsByTagName('desc')[0]?.textContent || '';

    if (!isNaN(lat) && !isNaN(lon)) {
      features.push({
        type: 'Feature',
        id: `gpx_wpt_${i + 1}`,
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: { name, description: desc }
      });
    }
  }

  // Tracks
  const trkpts = xmlDoc.getElementsByTagName('trkpt');
  if (trkpts.length > 0) {
    const coords: number[][] = [];
    for (let i = 0; i < trkpts.length; i++) {
      const lat = parseFloat(trkpts[i].getAttribute('lat') || '0');
      const lon = parseFloat(trkpts[i].getAttribute('lon') || '0');
      if (!isNaN(lat) && !isNaN(lon)) {
        coords.push([lon, lat]);
      }
    }
    if (coords.length > 0) {
      features.push({
        type: 'Feature',
        id: 'gpx_track_1',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { name: 'Ruta GPX Track' }
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

function parseCsv(text: string, delimiter: string = ','): any {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return { type: 'FeatureCollection', features: [] };

  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const lowerHeaders = headers.map(h => h.toLowerCase());

  let latIdx = lowerHeaders.findIndex(h => ['lat', 'latitude', 'latitud', 'y'].includes(h));
  let lngIdx = lowerHeaders.findIndex(h => ['lng', 'lon', 'long', 'longitude', 'longitud', 'x'].includes(h));

  if (latIdx === -1) latIdx = lowerHeaders.findIndex(h => h.includes('lat'));
  if (lngIdx === -1) lngIdx = lowerHeaders.findIndex(h => h.includes('lon') || h.includes('lng'));

  if (latIdx === -1 || lngIdx === -1) {
    return { type: 'FeatureCollection', features: [] };
  }

  const features: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < headers.length) continue;

    const lat = parseFloat(cols[latIdx]);
    const lng = parseFloat(cols[lngIdx]);

    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      const properties: Record<string, any> = {};
      headers.forEach((h, idx) => {
        properties[h] = cols[idx] || '';
      });

      features.push({
        type: 'Feature',
        id: `csv_${i}`,
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties
      });
    }
  }

  return { type: 'FeatureCollection', features };
}

/**
 * Parser nativo binario para archivos ESRI Shapefile (.shp / .dbf en ArrayBuffer)
 */
function parseShapefileBuffer(buffer: ArrayBuffer): any {
  if (!buffer || buffer.byteLength < 100) return { type: 'FeatureCollection', features: [] };

  const view = new DataView(buffer);
  const fileCode = view.getInt32(0, false); // Big endian 9994

  if (fileCode !== 9994) {
    console.warn('FileCode de Shapefile no válido:', fileCode);
    return { type: 'FeatureCollection', features: [] };
  }

  const features: any[] = [];
  let offset = 100;

  let recId = 1;
  while (offset < view.byteLength) {
    if (offset + 8 > view.byteLength) break;
    const contentLength = view.getInt32(offset + 4, false) * 2; // Words to bytes
    offset += 8;

    if (offset + contentLength > view.byteLength) break;
    const type = view.getInt32(offset, true);

    if (type === 1) {
      // Point
      const x = view.getFloat64(offset + 4, true);
      const y = view.getFloat64(offset + 12, true);
      features.push({
        type: 'Feature',
        id: `shp_${recId}`,
        geometry: { type: 'Point', coordinates: [x, y] },
        properties: { id: recId, shapeType: 'Point' }
      });
    } else if (type === 3 || type === 5) {
      // PolyLine or Polygon
      const numParts = view.getInt32(offset + 36, true);
      const numPoints = view.getInt32(offset + 40, true);
      let partsOffset = offset + 44;

      const parts: number[] = [];
      for (let p = 0; p < numParts; p++) {
        parts.push(view.getInt32(partsOffset + p * 4, true));
      }

      let ptsOffset = partsOffset + numParts * 4;
      const pts: [number, number][] = [];
      for (let pt = 0; pt < numPoints; pt++) {
        const px = view.getFloat64(ptsOffset + pt * 16, true);
        const py = view.getFloat64(ptsOffset + pt * 16 + 8, true);
        pts.push([px, py]);
      }

      if (type === 3) {
        const rings: [number, number][][] = [];
        for (let p = 0; p < numParts; p++) {
          const start = parts[p];
          const end = (p < numParts - 1) ? parts[p + 1] : numPoints;
          rings.push(pts.slice(start, end));
        }
        features.push({
          type: 'Feature',
          id: `shp_${recId}`,
          geometry: {
            type: rings.length > 1 ? 'MultiLineString' : 'LineString',
            coordinates: rings.length > 1 ? rings : rings[0] || []
          },
          properties: { id: recId, shapeType: 'PolyLine' }
        });
      } else if (type === 5) {
        const rings: [number, number][][] = [];
        for (let p = 0; p < numParts; p++) {
          const start = parts[p];
          const end = (p < numParts - 1) ? parts[p + 1] : numPoints;
          rings.push(pts.slice(start, end));
        }
        features.push({
          type: 'Feature',
          id: `shp_${recId}`,
          geometry: { type: 'Polygon', coordinates: rings },
          properties: { id: recId, shapeType: 'Polygon' }
        });
      }
    }

    offset += contentLength;
    recId++;
  }

  return { type: 'FeatureCollection', features };
}

// ─────────────────────────────────────────────────────────────────────────────
// CÁLCULO DE ESTADÍSTICAS Y BOUNDING BOX
// ─────────────────────────────────────────────────────────────────────────────

function calculateStats(geojson: any): GisStats {
  const features = geojson.features || [];
  let pointsCount = 0;
  let linesCount = 0;
  let polygonsCount = 0;
  const geometryTypesSet = new Set<string>();
  const propertiesSet = new Set<string>();

  features.forEach((f: any) => {
    const type = f.geometry?.type;
    if (type) {
      geometryTypesSet.add(type);
      if (type === 'Point' || type === 'MultiPoint') pointsCount++;
      else if (type === 'LineString' || type === 'MultiLineString') linesCount++;
      else if (type === 'Polygon' || type === 'MultiPolygon') polygonsCount++;
    }
    if (f.properties && typeof f.properties === 'object') {
      Object.keys(f.properties).forEach(k => propertiesSet.add(k));
    }
  });

  return {
    totalFeatures: features.length,
    pointsCount,
    linesCount,
    polygonsCount,
    geometryTypes: Array.from(geometryTypesSet),
    propertiesList: Array.from(propertiesSet)
  };
}

function calculateBBox(geojson: any): [number, number, number, number] | null {
  try {
    if (!geojson.features || geojson.features.length === 0) return null;
    const bbox = turf.bbox(geojson);
    if (bbox && bbox.every(n => isFinite(n))) {
      return bbox as [number, number, number, number];
    }
  } catch (err) {
    console.warn('Error calculando BBox con turf:', err);
  }
  return null;
}
