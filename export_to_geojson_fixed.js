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
    
    // Obtener todas las filas para extraer los nombres (con paginación)
    let allNames = [];
    let from = 0;
    const limit = 5000;
    let hasMoreNames = true;
    
    while(hasMoreNames) {
        const { data, error } = await supabase
            .from('capas_geograficas')
            .select('nombre_capa')
            .range(from, from + limit - 1);
            
        if (error) {
            console.error("Error trayendo nombres de capas:", error);
            break;
        }
        
        if (data && data.length > 0) {
            allNames.push(...data.map(d => d.nombre_capa));
            from += limit;
        } else {
            hasMoreNames = false;
        }
    }
    
    const uniqueCapas = [...new Set(allNames)];
    console.log(`Encontradas ${uniqueCapas.length} capas en Supabase:`, uniqueCapas);

    for (const capa of uniqueCapas) {
        console.log(`Exportando capa ${capa}...`);
        
        // Paginamos para evitar timeouts
        let allFeatures = [];
        let featFrom = 0;
        const featLimit = 5000;
        let hasMore = true;
        
        while(hasMore) {
            const { data, error } = await supabase
                .from('capas_geograficas')
                .select('propiedades, geom')
                .eq('nombre_capa', capa)
                .range(featFrom, featFrom + featLimit - 1);
                
            if (error) {
                console.error(`Error en capa ${capa}:`, error);
                break;
            }
            
            if (data && data.length > 0) {
                allFeatures.push(...data);
                featFrom += featLimit;
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
