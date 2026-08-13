export const MAP_LAYERS = {
  // --- CAPAS BASE ---
  municipios: {
    paint: {
      'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#22d3ee', '#2563eb'], // Azul para municipios
      'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 5, 1.5],
      'line-opacity': 0.8,
      'line-transition': { duration: 300 }
    }
  },
  sectores: {
    paint: {
      'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 12, 6],
      'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#00f2ff', '#10b981'],
      'circle-stroke-width': ['case', ['boolean', ['feature-state', 'selected'], false], 4, 2],
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.9,
      'circle-transition': { duration: 300 }
    }
  },

  // --- SECCIÓN: CUADRANTES ---
  cuadrantesPuntos: {
    paint: {
      'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 10, 5],
      'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#fbbf24', '#d97706'],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85
    }
  },

  cuadrantesPoligonos: {
    fill: {
      paint: {
        'fill-color': '#fbbf24',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          0.6, 
          0.25 
        ],
        'fill-outline-color': '#92400e'
      }
    },
    line: {
      paint: {
        'line-color': '#92400e',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          3, 
          1.5 
        ]
      }
    },
    label: {
      layout: {
        'text-field': ['get', 'name'], 
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-allow-overlap': false,
        'text-justify': 'center'
      },
      paint: {
        'text-color': '#92400e',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    }
  },

  // --- SECCIÓN: INCIDENTES (Nueva sección) ---
  incidentes: {
    glow: {
      paint: {
        'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 25, 18],
        'circle-color': '#ef4444',
        'circle-blur': 1.5,
        'circle-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.7, 0.4]
      }
    },
    icons: {
      layout: {
        // Puedes cambiar 'marker-15' o dejar un icono por defecto si usas un sprite, 
        // o puedes omitir 'icon-image' si solo requieres un punto de color (como está en MapaCentral)
        'icon-image': 'default_marker', 
        'icon-size': 1.2,
        'icon-allow-overlap': true,
        'text-field': ['get', 'descripcion'], // O la propiedad que traiga tu GeoJSON
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#b91c1c',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    }
  },

  // --- SECCIÓN: CENTROS DE SALUD ---
  salud: {
    glow: {
      paint: {
        'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 25, 18],
        'circle-color': '#06b6d4',
        'circle-blur': 1.5,
        'circle-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.7, 0.4]
      }
    },
    icons: {
      layout: {
        'icon-image': 'hospital-15',
        'icon-size': 1.2,
        'icon-allow-overlap': true,
        'text-field': ['get', 'nombre'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
    
    }

    
  }

  

};