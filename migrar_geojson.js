const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envLocal.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});
const supabase = createClient(supabaseUrl, supabaseKey);

const publicDir = path.join(__dirname, 'public');

async function migrateAll() {
    console.log("Iniciando migración de GeoJSON a Supabase...");
    
    // Buscar todos los archivos .geojson y .json en la carpeta public
    const files = fs.readdirSync(publicDir)
                    .filter(f => f.endsWith('.geojson') || f.endsWith('.json'))
                    .filter(f => !f.includes('backup')); // ignorar backups
    
    for (const file of files) {
        const capaNombre = file.replace('.geojson', '').replace('.json', '');
        console.log(`\n========================================`);
        console.log(`📁 Procesando capa: ${capaNombre} (${file})`);
        
        const filePath = path.join(publicDir, file);
        let data;
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e) {
            console.error(`Error leyendo ${file}, saltando...`);
            continue;
        }

        const features = data.features;
        if (!features || !Array.isArray(features)) {
            console.log(`⚠️  ${file} no tiene 'features' válidos. Saltando.`);
            continue;
        }

        console.log(`   Encontrados ${features.length} elementos. Subiendo...`);

        // Subir en lotes para no saturar la base de datos (concurrencia manual)
        const CONCURRENCY = 20;
        let success = 0;
        let errors = 0;
        
        for (let i = 0; i < features.length; i += CONCURRENCY) {
            const batch = features.slice(i, i + CONCURRENCY);
            
            const promises = batch.map(async (feat) => {
                if (!feat.geometry) return;
                
                const { error } = await supabase.rpc('insert_geo_feature', {
                    p_nombre_capa: capaNombre,
                    p_propiedades: feat.properties || {},
                    p_geom: feat.geometry
                });

                if (error) {
                    // console.error(`Error en insert: ${error.message}`);
                    errors++;
                } else {
                    success++;
                }
            });

            await Promise.all(promises);
            
            if ((i + CONCURRENCY) % 1000 === 0 || i + CONCURRENCY >= features.length) {
                process.stdout.write(`\r   Progreso: ${Math.min(i + CONCURRENCY, features.length)} / ${features.length}`);
            }
        }
        console.log(`\n✅ ${capaNombre}: ${success} insertados, ${errors} errores.`);
    }
    
    console.log("\n🚀 ¡MIGRACIÓN COMPLETADA!");
}

migrateAll().catch(console.error);
