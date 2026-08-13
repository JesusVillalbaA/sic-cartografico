const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// 1. HOSPITALES (copy of centrossalud.geojson)
const centrosSaludPath = path.join(publicDir, 'centrossalud.geojson');
if (fs.existsSync(centrosSaludPath)) {
    fs.copyFileSync(centrosSaludPath, path.join(publicDir, 'hospitales.geojson'));
    console.log('Created hospitales.geojson');
}

// 2. ANTENAS (copy to movilnet.geojson, digitel.geojson, movistar.geojson)
const antenasPath = path.join(publicDir, 'ANTENAS.geojson');
if (fs.existsSync(antenasPath)) {
    fs.copyFileSync(antenasPath, path.join(publicDir, 'movilnet.geojson'));
    fs.copyFileSync(antenasPath, path.join(publicDir, 'digitel.geojson'));
    fs.copyFileSync(antenasPath, path.join(publicDir, 'movistar.geojson'));
    console.log('Created movilnet.geojson, digitel.geojson, movistar.geojson');
}

// 3. ESCUELAS (create escuelas.geojson)
const escuelasFC = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8572, 10.9635] },
            properties: { id: "esc_1", nombre: "U.E. Colegio Guayamurí", tipo: "Privado", municipio: "Maneiro", nivel: "Primaria / Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8512, 10.9710] },
            properties: { id: "esc_2", nombre: "Liceo Bolivariano Francisco Antonio Rísquez", tipo: "Público", municipio: "Mariño", nivel: "Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8590, 11.0375] },
            properties: { id: "esc:3", nombre: "U.E. Estado Zulia (Porlamar)", tipo: "Público", municipio: "Mariño", nivel: "Primaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8640, 11.0280] },
            properties: { id: "esc_4", nombre: "U.E. Colegio Madre Guadalupe", tipo: "Subvencionado", municipio: "Arismendi", nivel: "Primaria / Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.9520, 11.0640] },
            properties: { id: "esc_5", nombre: "U.E. Licenciado Francisco Esteban Gómez", tipo: "Público", municipio: "Marcano", nivel: "Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8910, 10.9380] },
            properties: { id: "esc_6", nombre: "Universidad del Oriente - Núcleo Nueva Esparta (UDO)", tipo: "Público", municipio: "García", nivel: "Universitario" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8480, 10.9980] },
            properties: { id: "esc_7", nombre: "U.E. Colegio San Martín de Porres", tipo: "Privado", municipio: "Maneiro", nivel: "Primaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-64.0310, 10.8790] },
            properties: { id: "esc_8", nombre: "U.E. Tubores (El Guamache)", tipo: "Público", municipio: "Tubores", nivel: "Primaria / Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-64.1810, 10.9760] },
            properties: { id: "esc_9", nombre: "U.E. Licenciado Ismael González Ríos (Boca de Río)", tipo: "Público", municipio: "Península de Macanao", nivel: "Primaria / Secundaria" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.9880, 10.7910] },
            properties: { id: "esc_10", nombre: "U.E. Víctor Manuel Salazar (Coche)", tipo: "Público", municipio: "Villalba", nivel: "Primaria / Secundaria" }
        }
    ]
};
fs.writeFileSync(path.join(publicDir, 'escuelas.geojson'), JSON.stringify(escuelasFC, null, 2));
console.log('Created escuelas.geojson');

// 4. ESTACIONES DE GAS E HIDROCARBUROS (create estaciongasNE.geojson)
const gasFC = JSON.parse(fs.readFileSync(path.join(publicDir, 'estaciongasNE.geojson'), 'utf8'));
console.log('Verified estaciongasNE.geojson (' + gasFC.features.length + ' features)');

// 5. SERVICIO DE AGUA (create estacionagua.geojson)
const aguaFC = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8740, 11.0250] },
            properties: { id: "agua_1", name: "Dique Toma San Juan / Fuentidueño", subcategoria: "diques", type: "Dique Toma", municipality: "Díaz", institution: "HIDROCARIBE", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8580, 11.0390] },
            properties: { id: "agua_2", name: "Dique Toma La Asunción", subcategoria: "diques", type: "Dique Toma", municipality: "Arismendi", institution: "HIDROCARIBE", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.9050, 10.9410] },
            properties: { id: "agua_3", name: "Paral de Agua El Espinal", subcategoria: "parales", type: "Paral de Cisternas", municipality: "Díaz", institution: "HIDROCARIBE / Gobernación", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8880, 10.9390] },
            properties: { id: "agua_4", name: "Paral de Agua Macho Muerto", subcategoria: "parales", type: "Paral de Cisternas", municipality: "Mariño", institution: "HIDROCARIBE", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-64.0610, 10.8990] },
            properties: { id: "agua_5", name: "Paral de Agua Punta de Piedras", subcategoria: "parales", type: "Paral de Cisternas", municipality: "Tubores", institution: "HIDROCARIBE", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.9520, 11.0650] },
            properties: { id: "agua_6", name: "Paral de Agua Los Millanes", subcategoria: "parales", type: "Paral de Cisternas", municipality: "Marcano", institution: "HIDROCARIBE", status: "Operativo" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.8510, 10.9850] },
            properties: { id: "agua_7", name: "Embalse Guatamare", subcategoria: "embalses", type: "Reservorio", municipality: "García", institution: "HIDROCARIBE", status: "Reserva" }
        },
        {
            type: "Feature",
            geometry: { type: "Point", coordinates: [-63.9870, 10.7900] },
            properties: { id: "agua_8", name: "Planta Desalinizadora de Coche", subcategoria: "parales", type: "Desalinizadora", municipality: "Villalba", institution: "HIDROCARIBE / MPSA", status: "Operativo" }
        }
    ]
};
fs.writeFileSync(path.join(publicDir, 'estacionagua.geojson'), JSON.stringify(aguaFC, null, 2));
console.log('Created estacionagua.geojson');
