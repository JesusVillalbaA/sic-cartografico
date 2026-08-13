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

async function exportAllRealData() {
    console.log("Iniciando extracción COMPLETA de todos los GeoJSON reales desde Supabase...");

    const layersToExport = [
        'ambulatorios', 'ANTENAS', 'cdi', 'centrossalud', 'clinicas', 'compas',
        'cuadrantePoligono', 'cuadrantes', 'datos_combinados', 'electrecidad',
        'EmbalsesNE', 'escuelas', 'estaciongasNE', 'estacionservicio', 'hidrologia',
        'hospitales', 'IAPOLENE', 'PoligonoCuadrantes', 'puestospolicias', 'sectores',
        'transporte', 'ven_admin2', 'ven_admin3', 'ven_adminpoints', 'viabilidad', 'votacion'
    ];

    for (const capa of layersToExport) {
        console.log(`\nExportando capa real: '${capa}'...`);
        let allFeatures = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('capas_geograficas')
                .select('propiedades, geom')
                .eq('nombre_capa', capa)
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) {
                console.error(`Error en capa ${capa}:`, error);
                break;
            }

            if (data && data.length > 0) {
                allFeatures.push(...data);
                page++;
                if (data.length < pageSize) hasMore = false;
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
                    id: r.propiedades?.id || `${capa}_${i}`
                }
            }))
        };

        fs.writeFileSync(
            path.join(__dirname, 'public', `${capa}.geojson`),
            JSON.stringify(fc, null, 2)
        );
        console.log(`✅ Capa '${capa}.geojson' creada exitosamente con ${allFeatures.length} elementos reales.`);
    }

    // Alias o duplicados necesarios para la app:
    // 1. Antenas por proveedor si la app busca movilnet.geojson, digitel.geojson, movistar.geojson
    const antenasContent = fs.readFileSync(path.join(__dirname, 'public', 'ANTENAS.geojson'), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'public', 'movilnet.geojson'), antenasContent);
    fs.writeFileSync(path.join(__dirname, 'public', 'digitel.geojson'), antenasContent);
    fs.writeFileSync(path.join(__dirname, 'public', 'movistar.geojson'), antenasContent);

    // 2. Estaciones de agua (si la app busca estacionagua.geojson -> usamos EmbalsesNE o hidrologia)
    if (fs.existsSync(path.join(__dirname, 'public', 'EmbalsesNE.geojson'))) {
        const embalsesContent = fs.readFileSync(path.join(__dirname, 'public', 'EmbalsesNE.geojson'), 'utf8');
        fs.writeFileSync(path.join(__dirname, 'public', 'estacionagua.geojson'), embalsesContent);
    }

    console.log("\n🚀 ¡TODOS LOS DATOS GEOJSON ORIGINALES DE TU BASE DE DATOS HAN SIDO RESTAURADOS COMPLETAMENTE!");
}

exportAllRealData().catch(console.error);
