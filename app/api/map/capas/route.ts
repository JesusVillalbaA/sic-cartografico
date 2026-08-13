import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Memoria caché en el servidor para evitar lectura de disco repetida
const memoryCache = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get('nombre');

  if (!nombre) {
    return NextResponse.json({ error: 'Falta el parámetro nombre' }, { status: 400 });
  }

  // Respuesta ultra-rápida desde memoria caché si ya fue leído
  if (memoryCache.has(nombre)) {
    return NextResponse.json(memoryCache.get(nombre), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
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

    let fileContent = '';
    
    if (fs.existsSync(geojsonPath)) {
      fileContent = fs.readFileSync(geojsonPath, 'utf8');
    } else if (fs.existsSync(jsonPath)) {
      fileContent = fs.readFileSync(jsonPath, 'utf8');
    } else {
      console.warn(`[SIGDI] Capa no encontrada: ${nombre} (${fileName})`);
      const emptyFC = { type: 'FeatureCollection', features: [] };
      memoryCache.set(nombre, emptyFC);
      return NextResponse.json(emptyFC);
    }

    const data = JSON.parse(fileContent);
    memoryCache.set(nombre, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error(`Error fetching layer ${nombre}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
