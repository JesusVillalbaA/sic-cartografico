const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.geojson'));

files.forEach(f => {
    const data = JSON.parse(fs.readFileSync(path.join(publicDir, f), 'utf8'));
    if (!data.features) return;
    
    console.log(`\nFile: ${f} (${data.features.length} features)`);
    const names = data.features.slice(0, 10).map(feat => feat.properties?.name || feat.properties?.NAME || feat.properties?.nombre || feat.properties?.gpxx_Categ);
    console.log('Sample names:', names);
});
