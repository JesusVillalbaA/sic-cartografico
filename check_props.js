const fs = require('fs');
const path = require('path');

['datos_combinados.geojson', 'electrecidad.geojson', 'ANTENAS.geojson'].forEach(fname => {
    const file = path.join(__dirname, 'public', fname);
    if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`\n=== ${fname} ===`);
        console.log(content.features.slice(0, 5).map(f => f.properties));
    }
});
