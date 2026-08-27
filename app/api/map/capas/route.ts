import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Memoria caché en el servidor con registro de mtime
const memoryCache = new Map<string, { data: any; mtime: number }>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  if (!nombre) {
    return NextResponse.json({ error: 'Falta el parámetro nombre' }, { status: 400 });
  }

  try {
    const publicDir = path.join(process.cwd(), 'public');
    
    // Mapeo exacto si difiere el nombre solicitado del nombre del archivo en disk
    let fileName = nombre;
    if (nombre === 'estacionagua' && !fs.existsSync(path.join(publicDir, 'estacionagua.geojson'))) {
      fileName = fs.existsSync(path.join(publicDir, 'EmbalsesNE.geojson')) ? 'EmbalsesNE' : 'hidrologia';
    }

    const geojsonPath = path.join(publicDir, `${fileName}.geojson`);
    const jsonPath = path.join(publicDir, `${fileName}.json`);

    const targetPath = fs.existsSync(geojsonPath) ? geojsonPath : (fs.existsSync(jsonPath) ? jsonPath : null);

    if (targetPath) {
      const stats = fs.statSync(targetPath);
      const mtime = stats.mtimeMs;

      // Servir desde caché solo si coincide exactamente el mtime del archivo
      const cached = memoryCache.get(nombre);
      if (cached && cached.mtime === mtime) {
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
        });
      }

      // Si fue modificado o no está en caché, leer directamente del disco
      const fileContent = fs.readFileSync(targetPath, 'utf8');
      const data = JSON.parse(fileContent);
      memoryCache.set(nombre, { data, mtime });

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
    } else {
      console.warn(`[SIGDI] Capa no encontrada: ${nombre} (${fileName})`);
      const emptyFC = { type: 'FeatureCollection', features: [] };
      return NextResponse.json(emptyFC, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (error: any) {
    console.error(`Error fetching layer ${nombre}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
