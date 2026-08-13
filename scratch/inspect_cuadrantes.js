const fs = require('fs');
const path = require('path');

const compasPath = path.join(__dirname, '..', 'public', 'compas.geojson');
const cuadrantesPath = path.join(__dirname, '..', 'public', 'cuadrantes.geojson');

const compas = JSON.parse(fs.readFileSync(compasPath, 'utf8'));
const cuadrantes = JSON.parse(fs.readFileSync(cuadrantesPath, 'utf8'));

console.log('====================================================');
console.log('ESTRUCTURA DE CUADRANTES DE PAZ EN EL SISTEMA SOGNE');
console.log('====================================================\n');

console.log(`1. CAPA PRINCIPAL ACTIVA EN MENÚ ("CUADRANTES" -> compas.geojson):`);
console.log(`   Total de Polígonos de Cuadrantes / Circuitos Comunales: ${compas.features.length}\n`);

const byMuniCompas = {};
compas.features.forEach(f => {
  const m = f.properties.municipio ? f.properties.municipio.trim().toUpperCase() : 'SIN MUNICIPIO';
  if (!byMuniCompas[m]) byMuniCompas[m] = [];
  byMuniCompas[m].push(f.properties);
});

for (const muni in byMuniCompas) {
  console.log(`Municipio ${muni} (${byMuniCompas[muni].length} Cuadrantes/Circuitos):`);
  byMuniCompas[muni].forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.name || c.comuna} | Cuadrante: ${c.cuadrante} | Tel: ${c.telefono || 'N/A'} | Vehículos: ${c.vehiculos || 'N/A'}`);
  });
  console.log('');
}

console.log('----------------------------------------------------');
console.log(`2. CAPA DE PUNTOS DE REFERENCIA (cuadrantes.geojson):`);
console.log(`   Total de Puntos de Cuadrantes: ${cuadrantes.features.length}\n`);

const byMuniPuntos = {};
cuadrantes.features.forEach(f => {
  const m = f.properties.municipio ? f.properties.municipio.trim().toUpperCase() : 'SIN MUNICIPIO';
  if (!byMuniPuntos[m]) byMuniPuntos[m] = [];
  byMuniPuntos[m].push(f.properties);
});

for (const muni in byMuniPuntos) {
  console.log(`Municipio ${muni} (${byMuniPuntos[muni].length} Puntos):`);
  byMuniPuntos[muni].forEach((c, idx) => {
    console.log(`   ${idx + 1}. ${c.comuna} | Cuadrante Nº: ${c.cuadrante} | Tel: ${c.telefono || 'N/A'}`);
  });
  console.log('');
}
