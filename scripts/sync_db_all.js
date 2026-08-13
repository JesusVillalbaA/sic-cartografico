const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('=')[1].trim();
    }
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncLayer(layerName, fileName) {
  const filePath = path.join(__dirname, '..', 'public', fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Archivo ${fileName} no encontrado.`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(raw);
  const features = geojson.features || [];

  console.log(`\nSincronizando capa '${layerName}' desde ${fileName} (${features.length} features)...`);

  // 1. Borrar registros viejos en Supabase
  const { error: delError } = await supabase
    .from('capas_geograficas')
    .delete()
    .eq('capa', layerName);

  if (delError) {
    console.error(`Error borrando ${layerName}:`, delError);
  } else {
    console.log(`Registros antiguos de '${layerName}' eliminados de Supabase.`);
  }

  // 2. Insertar registros nuevos limpios
  if (features.length > 0) {
    const records = features.map((f, i) => ({
      capa: layerName,
      nombre: f.properties.SECTOR ? `Antena ${f.properties.SECTOR}` : (f.properties.nombre || f.properties.NAME || `${layerName}_${i}`),
      descripcion: f.properties.DIRECCION || f.properties.descripcion || f.properties.ubicacion || '',
      categoria: f.properties.tipo || f.properties.gpxx_Categ || 'Infraestructura',
      estado: 'Nueva Esparta',
      municipio: f.properties.municipio || '',
      parroquia: f.properties.parroquia || '',
      geojson: f
    }));

    const { error: insError } = await supabase
      .from('capas_geograficas')
      .insert(records);

    if (insError) {
      console.error(`Error insertando en ${layerName}:`, insError);
    } else {
      console.log(`-> ${records.length} registros insertados en '${layerName}'.`);
    }
  }
}

async function run() {
  await syncLayer('estaciongasNE', 'estaciongasNE.geojson');
  await syncLayer('ANTENAS', 'ANTENAS.geojson');
  await syncLayer('movilnet', 'movilnet.geojson');
  await syncLayer('movistar', 'movistar.geojson');
  await syncLayer('digitel', 'digitel.geojson');
  console.log("\n¡Todas las capas de gas y antenas han sido purgadas y actualizadas con los datos exactos del usuario!");
}

run();
