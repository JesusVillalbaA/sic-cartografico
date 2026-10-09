const fs = require('fs');
const path = 'c:/Users/jesus/sic-sistema-cartografico/components/map/useMapbox.ts';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/message:\s*['"].*Iniciando motor.*['"]/g, "message: 'Iniciando motor cartográfico...'");
c = c.replace(/message:\s*['"].*satelital y simbolog.*['"]/g, "message: 'Cargando cartografía y componentes...'");
c = c.replace(/message:\s*['"].*Geointeligencia SOGNE lista.*['"]/g, "message: 'Sistema listo y operativo!'");

fs.writeFileSync(path, c, 'utf8');
