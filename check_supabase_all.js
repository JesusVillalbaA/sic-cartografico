const fs = require('fs');
const path = require('path');

// Let's check Supabase database directly for all tables or all distinct nombre_capa, or inspect any leftover tables!
const { createClient } = require('@supabase/supabase-js');
const envLocal = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envLocal.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
    console.log("Checking Supabase tables and layer names...");
    const { data, error } = await supabase.from('capas_geograficas').select('nombre_capa');
    if (data) {
        const counts = {};
        data.forEach(d => counts[d.nombre_capa] = (counts[d.nombre_capa] || 0) + 1);
        console.log("Capas in Supabase capas_geograficas:", counts);
    }
}
checkAll();
