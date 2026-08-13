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

async function inspectSupabaseFully() {
    console.log("Checking Supabase tables and all distinct values in capas_geograficas...");
    
    // Check if there are other tables by executing RPC or common table names
    const tables = ['capas_geograficas', 'capas', 'capa', 'geo_features', 'features', 'incidencias', 'estaciones', 'recursos'];
    for (const t of tables) {
        try {
            const { data, error } = await supabase.from(t).select('*').limit(3);
            if (data && data.length > 0) {
                console.log(`Table '${t}' exists! Sample count/row:`, data.length, Object.keys(data[0]));
            }
        } catch(e) {}
    }

    // Let's check capas_geograficas distinct values using RPC or fetching more rows
    let allNombreCapas = new Set();
    let page = 0;
    while (true) {
        const { data, error } = await supabase
            .from('capas_geograficas')
            .select('nombre_capa')
            .range(page * 1000, (page + 1) * 1000 - 1);
        if (error || !data || data.length === 0) break;
        data.forEach(d => allNombreCapas.add(d.nombre_capa));
        page++;
        if (data.length < 1000) break;
    }
    console.log(`Total distinct nombre_capa found across ALL pages (${page} pages):`, Array.from(allNombreCapas));
}

inspectSupabaseFully();
