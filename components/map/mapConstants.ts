// mapConstants.ts
export const MAP_PADDING = { top: 0, bottom: 0, left: 0, right: 0 };
export const BOUNDS: [number, number, number, number] = [-65.20, 10.30, -63.00, 11.70];
export const RESET_VIEW = {
  center: [-64.00, 10.98] as [number, number],
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

export const RECURSOS_SALUD = [
  { id: 'hospitales', label: 'Hospitales', src: '/api/map/capas?nombre=hospitales', color: '#1e3a8a', type: 'circle' },
  { id: 'clinicas', label: 'Clínicas', src: '/api/map/capas?nombre=clinicas', color: '#60a5fa', type: 'circle' },
  { id: 'ambulatorios', label: 'Ambulatorios', src: '/api/map/capas?nombre=ambulatorios', color: '#f472b6', type: 'circle' },
  { id: 'cdi', label: 'CDI', src: '/api/map/capas?nombre=cdi', color: '#a855f7', type: 'circle' }
  // IAPOLENE ya no está aquí – se maneja de forma independiente en useMapbox.ts
];

export const RECURSOS_INFRAESTRUCTURA = [
  { id: 'estacionesServicio', label: 'Estaciones de Servicio', src: '/api/map/capas?nombre=estacionservicio', color: '#f97316', type: 'circle' },
  { id: 'escuelas', label: 'Escuelas', src: '/api/map/capas?nombre=escuelas', color: '#d946ef', type: 'circle' }
];