const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. Inspect ANTENAS.geojson
const antenasPath = path.join(publicDir, 'ANTENAS.geojson');
if (fs.existsSync(antenasPath)) {
    const antenas = JSON.parse(fs.readFileSync(antenasPath, 'utf8'));
    console.log("=== ANTENAS.geojson ===");
    console.log("Total antenas:", antenas.features.length);
    antenas.features.forEach((f, i) => {
        const p = f.properties || {};
        console.log(`${i}: ${p.NAME || p.name} | Cat: ${p.gpxx_Categ || p.wptx1_Cate || p.categoria || p.operadora}`);
    });
}

// 2. Search for Escuelas, Gas, Agua across all geojson files
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.geojson'));
console.log("\n=== Searching for Escuelas, Gas, Agua in all files ===");

files.forEach(file => {
    const content = JSON.parse(fs.readFileSync(path.join(publicDir, file), 'utf8'));
    if (!content.features) return;
    
    let escuelas = 0, gas = 0, agua = 0, hospitales = 0;
    content.features.forEach(f => {
        const str = JSON.stringify(f.properties || {}).toLowerCase();
        if (str.includes('escuela') || str.includes('colegio') || str.includes('liceo') || str.includes('u.e') || str.includes('unidad educativa')) escuelas++;
        if (str.includes('gas') || str.includes('pdvsa gas') || str.includes('glp')) gas++;
        if (str.includes('agua') || str.includes('hidro') || str.includes('estacion de agua') || str.includes('paral') || str.includes('dique') || str.includes('embalse')) agua++;
        if (str.includes('hosp') || str.includes('salud') || str.includes('ambulatorio') || str.includes('clinica')) hospitales++;
    });
    
    if (escuelas || gas || agua || hospitales) {
        console.log(`${file} -> Escuelas: ${escuelas}, Gas: ${gas}, Agua: ${agua}, Hospitales: ${hospitales}`);
    }
});
