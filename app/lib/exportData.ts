/**
 * Utilidad de exportación directa a GeoJSON y CSV para elementos seleccionados o capas.
 * Compatible con QGIS, ArcGIS y hojas de cálculo.
 */

export function exportFeaturesToGeoJSON(features: any[], filename = 'sogne_export_geo.geojson') {
  if (!features || features.length === 0) return;

  const geojson = {
    type: 'FeatureCollection',
    features: features.map(f => ({
      type: 'Feature',
      geometry: f.geometry || null,
      properties: f.properties || {}
    }))
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportFeaturesToCSV(features: any[], filename = 'sogne_export_data.csv') {
  if (!features || features.length === 0) return;

  // Extraer todas las llaves de propiedades únicas
  const headersSet = new Set<string>();
  headersSet.add('longitud');
  headersSet.add('latitud');

  features.forEach(f => {
    if (f.properties) {
      Object.keys(f.properties).forEach(k => headersSet.add(k));
    }
  });

  const headers = Array.from(headersSet);
  const rows: string[] = [headers.join(',')];

  features.forEach(f => {
    const props = f.properties || {};
    let lng = '';
    let lat = '';

    if (f.geometry && f.geometry.coordinates) {
      if (f.geometry.type === 'Point') {
        lng = f.geometry.coordinates[0];
        lat = f.geometry.coordinates[1];
      } else if (f.geometry.coordinates[0]) {
        lng = f.geometry.coordinates[0][0]?.[0] || '';
        lat = f.geometry.coordinates[0][0]?.[1] || '';
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'longitud') return `"${lng}"`;
      if (h === 'latitud') return `"${lat}"`;
      const val = props[h];
      if (val === null || val === undefined) return '""';
      const cleanVal = String(val).replace(/"/g, '""');
      return `"${cleanVal}"`;
    });

    rows.push(rowValues.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(rows.join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
