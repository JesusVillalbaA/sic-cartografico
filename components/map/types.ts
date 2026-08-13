import mapboxgl from 'mapbox-gl';

export interface MapFeatureProperties {
  id?: string | number;
  nombre?: string;
  name?: string;
  NAME?: string;
  adm2_name?: string;
  adm3_name?: string;
  tipo?: string;
  type?: string;
  municipio?: string;
  municipality?: string;
  parroquia?: string;
  parish?: string;
  direccion?: string;
  address?: string;
  beds?: number;
  camas?: number;
  ambulances?: number;
  ambulancias?: number;
  [key: string]: any;
}

export interface MapFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: MapFeatureProperties;
  layer?: {
    id: string;
    type?: string;
  };
  source?: string;
  sourceLayer?: string;
}

export interface LayersVisibleState {
  municipios: boolean;
  parroquias: boolean;
  sectores: boolean;
  cuadrantes: boolean;
  cuadrantesPoligonos: boolean;
  compas: boolean;
  zonasDeRiesgo?: {
    delitosComunes: boolean;
    areaCibernetica: boolean;
    concentraciones: boolean;
  };
  geocalizaciones?: {
    drogas: boolean;
    actorInteres: boolean;
    puntoInteres: boolean;
  };
  bandasDelictivas?: boolean;
  hospitales: boolean;
  clinicas: boolean;
  ambulatorios: boolean;
  cdi: boolean;
  estaciones: boolean;
  escuelas: boolean;
  servicioAgua?: Record<string, boolean>;
  estacionesGas: boolean;
  sistemasElectricos: boolean;
  antenasDigitel: boolean;
  antenasMovistar: boolean;
  antenasMovilnet: boolean;
  paradasPasajeros?: boolean;
  terminales?: boolean;
  [key: string]: any;
}
