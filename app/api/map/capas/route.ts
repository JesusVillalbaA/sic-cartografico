import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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

    let fileContent = '';
    
    if (fs.existsSync(geojsonPath)) {
      fileContent = fs.readFileSync(geojsonPath, 'utf8');
    } else if (fs.existsSync(jsonPath)) {
      fileContent = fs.readFileSync(jsonPath, 'utf8');
    } else {
      console.warn(`[SIGDI] Capa no encontrada: ${nombre} (${fileName})`);
      return NextResponse.json({ type: 'FeatureCollection', features: [] });
    }

    const data = JSON.parse(fileContent);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error(`Error fetching layer ${nombre}:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
