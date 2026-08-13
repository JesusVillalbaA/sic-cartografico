const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'public', 'datos_combinados.geojson');
if (fs.existsSync(file)) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log("Total features in datos_combinados:", content.features.length);
    const categories = {};
    content.features.forEach(f => {
        const cat = f.properties.categoria || f.properties.gpxx_Categ || f.properties.wptx1_Cate || f.properties.tipo || 'SIN_CATEGORIA';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log("Categories in datos_combinados:", categories);
}
