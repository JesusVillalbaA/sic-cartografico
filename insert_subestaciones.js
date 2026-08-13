const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseKey = '';
envLocal.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});
const supabase = createClient(supabaseUrl, supabaseKey);

const parseCoordinate = (str) => {
    const regex = /(\d+)[°\s]+(\d+)['’\s]+([\d\.]+)/;
    const match = str.match(regex);
    if (match) {
        let val = parseInt(match[1]) + parseInt(match[2])/60 + parseFloat(match[3])/3600;
        if (str.includes('W') || str.includes('S')) val = -val;
        return val;
    }
    return 0;
};

const data = [
    {
        name: "SAN PEDRO DE COCHE",
        ubicacion: "Se encuentra ubicada en la población de Coche, Municipio Villalba",
        kv: "13.8 Kv",
        latRaw: "10° 47’ 26.1’’’ N",
        lonRaw: "63° 59’ 16.6’’ W",
        custodia: "Protección y Prevención. Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "JUAN BAUTISTA ARISMENDI",
        ubicacion: "Se encuentra ubicada en el sector El Guamache, vía principal a la planta de PDVSA-Guamache, municipio Tubores.",
        kv: "115/34.5/13.8 Kv",
        latRaw: "10° 52’ 47. 2800’’ N",
        lonRaw: "64° 01’ 57. 9720’’ W",
        custodia: "Guardia Nacional Bolivariana de Venezuela. Protección y Prevención. Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "LUISA CACERES DE ARISMENDI",
        ubicacion: "Se encuentra ubicada en el sector Macho Muerto, vía principal la Isleta, municipio Mariño.",
        kv: "115/34.5/13.8 Kv",
        latRaw: "10° 56' 22. 0480'' N",
        lonRaw: "63° 53' 17. 9880'' W",
        custodia: "Guardia Nacional Bolivariana de Venezuela. Protección y Prevención. Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "PORLAMAR",
        ubicacion: "Se encuentra ubicada en la calle Charaima del sector Genovés, a 75 metros de la Cámara de Comercio, municipio Mariño.",
        kv: "115/13.8 Kv",
        latRaw: "10° 57' 57. 8160\" N",
        lonRaw: "63° 50' 58. 4880\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA."
    },
    {
        name: "LOS ROBLES",
        ubicacion: "Se encuentra ubicada en la entrada del centro profesional Vector Verde, Sector los Olivos, a 250 mts de la Avenida Jóvito Villalba, Municipio Maneiro.",
        kv: "115/34.5/13.8 Kv",
        latRaw: "10° 59' 15. 2880\" N",
        lonRaw: "63° 50' 30. 8040\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "PAMPATAR",
        ubicacion: "Se encuentra ubicada en el sector Pampatar, calle principal, San Lorenzo a 250 mts del centro comercial SAMBIL, Municipio Maneiro.",
        kv: "115/34.5/13.8 Kv",
        latRaw: "10° 59' 47. 4720\" N",
        lonRaw: "63° 48' 34. 1640\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "LA ASUNCION",
        ubicacion: "Se encuentra ubicada en la avenida 31 de Julio, sector Cocheima, a 150 mts de la E/S PDV, Municipio Arismendi.",
        kv: "115/13.8 Kv",
        latRaw: "11° 02' 22. 5600\" N",
        lonRaw: "63° 51' 28. 6560\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "LOS MILLANES",
        ubicacion: "Se encuentra ubicada en la calle Santa Rita, sector Los Millanes, a 300 mts del estadio de Los Millanes, municipio Marcano.",
        kv: "115/34.5/13.8 Kv",
        latRaw: "11° 03' 49. 7520\" N",
        lonRaw: "63° 57' 04. 6440\" W",
        custodia: "Guardia Nacional Bolivariana"
    },
    {
        name: "CONEJERO",
        ubicacion: "Se encuentra ubicada en el sector El Piache, carretera principal El Piache, a 800 mts del antiguo vertedero de basura, municipio García.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 57' 36.0360\" N",
        lonRaw: "63° 52' 26.0760\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA."
    },
    {
        name: "MORROPO",
        ubicacion: "Se encuentra ubicada en el sector Costa Azul, avenida Francisco Esteban Gómez, a 500 mts de la avenida Bolívar, municipio Mariño.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 58' 19.7760\" N",
        lonRaw: "63° 49' 35.1480\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA"
    },
    {
        name: "ARICAGUA",
        ubicacion: "Se encuentra ubicada en la avenida 31 de Julio, Sector Aricagua, a 50 mts del Supermercado Del Campo, municipio Antolín del Campo.",
        kv: "34.5/13.8 Kv",
        latRaw: "11° 06' 54.1800\" N", 
        lonRaw: "63° 51' 07.0200\" W",
        custodia: "No se encuentra custodiada"
    },
    {
        name: "AEROPUERTO",
        ubicacion: "Se encuentra ubicada en la entrada principal del Aeropuerto Santiago Mariño, a 100 mts de la E/S PDVSA Aeropuerto, sector El Yaque, municipio Díaz.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 55' 04.5840\" N",
        lonRaw: "63° 58' 15.9600\" W",
        custodia: "No se encuentra custodiada"
    },
    {
        name: "LAS HERNANDEZ",
        ubicacion: "Se encuentra ubicada en la avenida Juan Bautista Arismendi, sector Las Hernández, a 200 mts del cruce de Boca de Río, municipio Tubores.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 55' 48.8280\" N",
        lonRaw: "64° 03' 33.2280\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA."
    },
    {
        name: "BOCA DE RIO",
        ubicacion: "Se encuentra ubicada en la avenida Juan Bautista Arismendi, sector Las Hernández, a 200 mts del cruce de Boca de Río, municipio Tubores.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 58' 34.1040\" N",
        lonRaw: "64° 10' 48.4320\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA."
    },
    {
        name: "EL MANGLILLO",
        ubicacion: "Se encuentra ubicada en la vía principal a Punta Arenas, a 2 km del sector El Manglillo, municipio Península de Macanao.",
        kv: "34.5/13.8 Kv",
        latRaw: "10° 57' 36.0720\" N",
        lonRaw: "64° 19' 46.4880\" W",
        custodia: "Compañía de Seguridad CORPOSERVICA"
    }
];

async function run() {
    console.log("Eliminando datos anteriores de SISTEMAELECTRICONE...");
    const { error: delError } = await supabase
        .from('capas_geograficas')
        .delete()
        .eq('nombre_capa', 'SISTEMAELECTRICONE');
    if (delError) {
        console.error("Error deleting:", delError);
        return;
    }

    console.log("Insertando nuevas subestaciones...");
    for (const item of data) {
        const lat = parseCoordinate(item.latRaw);
        const lon = parseCoordinate(item.lonRaw);
        
        let mun = "Nueva Esparta";
        if (item.ubicacion.includes("Villalba")) mun = "Villalba";
        else if (item.ubicacion.includes("Tubores")) mun = "Tubores";
        else if (item.ubicacion.includes("Mariño")) mun = "Mariño";
        else if (item.ubicacion.includes("Maneiro")) mun = "Maneiro";
        else if (item.ubicacion.includes("Arismendi")) mun = "Arismendi";
        else if (item.ubicacion.includes("Marcano")) mun = "Marcano";
        else if (item.ubicacion.includes("García")) mun = "García";
        else if (item.ubicacion.includes("Antolín del Campo")) mun = "Antolín del Campo";
        else if (item.ubicacion.includes("Díaz")) mun = "Díaz";
        else if (item.ubicacion.includes("Macanao")) mun = "Península de Macanao";

        const feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            },
            properties: {
                nombre: "S/E " + item.name,
                TENSION_ASOCIADA: item.kv,
                DESCRIPCION: item.ubicacion,
                CUSTODIA: item.custodia,
                categoria: "INFRAESTRUCTURA ELÉCTRICA",
                MUNICIPIO: mun,
                OPERADOR: "CORPOELEC"
            }
        };

        const { error } = await supabase.rpc('insert_geo_feature', {
            p_nombre_capa: 'SISTEMAELECTRICONE',
            p_propiedades: feature.properties,
            p_geom: feature.geometry
        });

        if (error) {
            console.error("Error insertando " + item.name + ":", error);
        } else {
            console.log("Insertado: " + item.name);
        }
    }
    console.log("Done.");
}

run();
