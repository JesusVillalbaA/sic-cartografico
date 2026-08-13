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

async function run() {
    console.log("Obteniendo capas de Supabase para revertir a GeoJSON...");
    
    // Traer todos los nombres de capa únicos (para no saturar pidiendo todo de golpe si es muy grande)
    const { data: capasResult, error: err1 } = await supabase
        .from('capas_geograficas')
        .select('nombre_capa');
        
    if (err1) {
        console.error("Error trayendo capas:", err1);
        return;
    }
    
    const uniqueCapas = [...new Set(capasResult.map(c => c.nombre_capa))];
    console.log(`Encontradas ${uniqueCapas.length} capas en Supabase.`);

    for (const capa of uniqueCapas) {
        console.log(`Exportando capa ${capa}...`);
        
        // Paginamos para evitar timeouts
        let allFeatures = [];
        let from = 0;
        const limit = 5000;
        let hasMore = true;
        
        while(hasMore) {
            const { data, error } = await supabase
                .from('capas_geograficas')
                .select('propiedades, geom')
                .eq('nombre_capa', capa)
                .range(from, from + limit - 1);
                
            if (error) {
                console.error(`Error en capa ${capa}:`, error);
                break;
            }
            
            if (data && data.length > 0) {
                allFeatures.push(...data);
                from += limit;
            } else {
                hasMore = false;
            }
        }
        
        const fc = {
            type: "FeatureCollection",
            features: allFeatures.map((r, i) => ({
                type: "Feature",
                geometry: r.geom,
                properties: {
                    ...r.propiedades,
                    id: r.propiedades?.id || `feat_${i}`
                }
            }))
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'public', `${capa}.geojson`),
            JSON.stringify(fc, null, 2)
        );
        console.log(`Capa ${capa}.geojson creada (${allFeatures.length} elementos).`);
    }
    
    console.log("¡Todas las capas han sido revertidas a GeoJSON en la carpeta public!");
}

run();
