const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));

files.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(path.join(publicDir, file), 'utf8'));
        if (content.type === 'FeatureCollection' && Array.isArray(content.features)) {
            console.log(`\n=== ${file} (${content.features.length} features) ===`);
            const sampleProps = content.features.slice(0, 3).map(f => f.properties);
            console.log('Sample properties:', JSON.stringify(sampleProps, null, 2));
            
            // Check categories if any
            const categories = new Set();
            content.features.forEach(f => {
                const p = f.properties || {};
                if (p.categoria) categories.add(p.categoria);
                if (p.gpxx_Categ) categories.add(p.gpxx_Categ);
                if (p.TIPO_SERVICIO) categories.add(p.TIPO_SERVICIO);
                if (p.operadora) categories.add(p.operadora);
                if (p.OPERADOR) categories.add(p.OPERADOR);
                if (p.type) categories.add(p.type);
            });
            if (categories.size > 0) {
                console.log('Categories/Types found:', Array.from(categories));
            }
        }
    } catch (e) {
        // ignore invalid json
    }
});
