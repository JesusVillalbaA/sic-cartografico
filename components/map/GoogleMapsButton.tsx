"use client";

import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

/**
 * Helper to extract or generate Google Maps URL for any GeoJSON feature or location object
 */
export function getGoogleMapsUrl(feature: any): string | null {
  if (!feature) return null;
  const p = feature.properties || {};

  // 1. Try to find numeric lat and lng from properties
  let lat: number | null = null;
  let lng: number | null = null;

  const latKeys = ['latitud', 'lat', 'LATITUD', 'LAT', 'latitude', 'Latitude', 'coord_lat', 'y', 'Y'];
  const lngKeys = ['longitud', 'lng', 'LONGITUD', 'LNG', 'longitude', 'Longitude', 'coord_lng', 'x', 'X'];

  for (const k of latKeys) {
    if (p[k] !== undefined && p[k] !== null && !isNaN(parseFloat(p[k]))) {
      lat = parseFloat(p[k]);
      break;
    }
  }
  for (const k of lngKeys) {
    if (p[k] !== undefined && p[k] !== null && !isNaN(parseFloat(p[k]))) {
      lng = parseFloat(p[k]);
      break;
    }
  }

  // 2. Extract coordinates from GeoJSON geometry
  if ((lat === null || lng === null) && feature.geometry && feature.geometry.coordinates) {
    const coords = feature.geometry.coordinates;
    const type = feature.geometry.type;

    if (type === 'Point' && Array.isArray(coords) && coords.length >= 2) {
      lng = parseFloat(coords[0]);
      lat = parseFloat(coords[1]);
    } else if (['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString'].includes(type)) {
      const points: [number, number][] = [];
      const extractPoints = (arr: any) => {
        if (Array.isArray(arr) && arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
          points.push([arr[0], arr[1]]);
        } else if (Array.isArray(arr)) {
          arr.forEach(extractPoints);
        }
      };
      extractPoints(coords);

      if (points.length > 0) {
        let sumLng = 0;
        let sumLat = 0;
        points.forEach(([ptLng, ptLat]) => {
          sumLng += ptLng;
          sumLat += ptLat;
        });
        lng = sumLng / points.length;
        lat = sumLat / points.length;
      }
    }
  }

  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  // 3. Fallback: text search query using name, address or municipality
  const nameStr =
    p.nombre_conppa ||
    p.nombre_sitio ||
    p.nombre ||
    p.NAME ||
    p.instalacion ||
    p.sector ||
    p.SECTOR ||
    p.municipio ||
    p.MUNICIPIO ||
    p.parroquia ||
    p.PARROQUIA ||
    p.address ||
    p.ubicacion;

  if (nameStr && typeof nameStr === 'string' && nameStr.trim() !== '') {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nameStr.trim() + ', Nueva Esparta, Venezuela')}`;
  }

  return null;
}

interface GoogleMapsButtonProps {
  theme?: 'dark' | 'light';
  label?: string;
  feature?: any;
  lat?: number | null;
  lng?: number | null;
  query?: string;
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
}

export const GoogleMapsButton: React.FC<GoogleMapsButtonProps> = ({
  theme = 'dark',
  label,
  feature,
  lat,
  lng,
  query,
  className = '',
  variant = 'full',
}) => {
  let url: string | null = null;

  if (lat !== undefined && lat !== null && lng !== undefined && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else if (query && query.trim() !== '') {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', Nueva Esparta, Venezuela')}`;
  } else if (feature) {
    url = getGoogleMapsUrl(feature);
  }

  if (!url) return null;

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:text-white transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer ${className}`}
        title="Ver ubicaciÃ³n en Google Maps"
      >
        <MapPin size={14} className="text-blue-400" />
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 hover:text-white rounded-lg font-bold text-[8.5px] uppercase tracking-wider border border-blue-500/30 hover:border-blue-400 transition-all duration-200 active:scale-95 cursor-pointer ${className}`}
      >
        <MapPin size={11} className="text-blue-400 shrink-0" />
        <span>Maps</span>
        <ExternalLink size={9} className="text-blue-400/70 shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 hover:text-white rounded-xl font-bold text-[9px] uppercase tracking-wider border border-blue-500/30 hover:border-blue-400 shadow-md transition-all duration-200 active:scale-95 cursor-pointer ${className}`}
    >
      <MapPin size={12} className="text-blue-400 shrink-0" />
      <span>{label || "Ver en Google Maps"}</span>
      <ExternalLink size={10} className="text-blue-400/70 shrink-0 ml-0.5" />
    </a>
  );
};
