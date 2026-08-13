const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'SISTEMAELECTRICONE.geojson');
if (fs.existsSync(filePath)) {
    const geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    geojson.features.forEach(f => {
        if (f.properties && f.properties.nombre) {
            f.properties.nombre = f.properties.nombre
                .replace(/^SUB\s*ESTACI[OÓ]N\s*/i, '')
                .replace(/^SUBESTAC[IÓ]N\s*/i, '')
                .replace(/^SUBESTAC\s*/i, '')
                .replace(/^S\/E\s*/i, '')
                .trim();
        }
    });
    fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2));
    console.log("Cleaned names in SISTEMAELECTRICONE.geojson");
}
