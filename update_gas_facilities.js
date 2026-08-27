const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.split('=')[1].trim();
    }
  });
}

// 7 Instalaciones críticas oficiales del reporte de inteligencia CEO / DIRC. CONJUNTA PROTECCIÓN DE INSTALACIONES CRÍTICAS + 1 Oficina Administrativa
const gasGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.8957222, 10.7434167]
      },
      properties: {
        id: "emr_bm22",
        nombre: "Estación de Medición y Regulación BM-22",
        instalacion: "ESTACIÓN DE MEDICIÓN Y REGULACIÓN BM-22.",
        tipo: "Estación de Medición y Regulación (Gasoducto)",
        estado: "Nueva Esparta",
        municipio: "Villalba",
        parroquia: "San Pedro de Coche",
        sector: "Sector El Bichar",
        ubicacion: "Isla de Coche, Municipio Villalba, Sector El Bichar",
        coordenadas_dms: "10° 44´ 36,3´´ N; 063° 53´ 44,6´´ W",
        responsable: "ING. ALCIDES FIGUERA",
        telefono: "0416-7825132",
        empresa: "PDVSA Gas",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Estación de Medición y Regulación (EMR) BM-22 para control, medición de flujo y regulación de presión de la red de gasoducto en la Isla de Coche.",
        fotos: [
          "/gas/bm22_1.png",
          "/gas/bm22_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.8859750, 10.9381056]
      },
      properties: {
        id: "emr_bm30",
        nombre: "Estación de Medición y Regulación BM-30",
        instalacion: "ESTACIÓN DE MEDICIÓN Y REGULACIÓN BM-30.",
        tipo: "Estación de Medición y Regulación (Gasoducto)",
        estado: "Nueva Esparta",
        municipio: "Mariño",
        parroquia: "Mariño",
        sector: "Sector Macho Muerto",
        ubicacion: "Sector Macho Muerto frente a la Urb. Luisa Cáceres de Arismendi, vía principal hacia La Isleta I, Parroquia Mariño Municipio Mariño.",
        coordenadas_dms: "10° 56´ 17,18´´ N; 063° 53´ 9,51´´ W",
        responsable: "ING. ALCIDES FIGUERA",
        telefono: "0416-7825132",
        empresa: "PDVSA Gas",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Estación de Medición y Regulación (EMR) BM-30 para control y suministro del sistema de distribución de gas en el Municipio Mariño.",
        fotos: [
          "/gas/bm30_1.png",
          "/gas/bm30_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-64.0322167, 10.8751583]
      },
      properties: {
        id: "emr_bm50",
        nombre: "Estación de Medición y Regulación BM-50",
        instalacion: "ESTACIÓN DE MEDICIÓN Y REGULACIÓN BM-50.",
        tipo: "Estación de Medición y Regulación (Gasoducto)",
        estado: "Nueva Esparta",
        municipio: "Tubores",
        parroquia: "Los Barales",
        sector: "Sector El Guamache",
        ubicacion: "Sector El Guamache a 500 mtrs de la Planta de Distribución PDVSA El Guamache, Parroquia Los Barales Municipio Tubores.",
        coordenadas_dms: "10° 52´ 30,57´´ N; 064° 1´ 55,98´´ W",
        responsable: "ING. ALCIDES FIGUERA",
        telefono: "0416-7825132",
        empresa: "PDVSA Gas",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Estación de Medición y Regulación (EMR) BM-50 encargada de la regulación de gasoducto hacia las instalaciones y complejo del Sector El Guamache.",
        fotos: [
          "/gas/bm50_1.png",
          "/gas/bm50_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-64.0239722, 10.8779583]
      },
      properties: {
        id: "planta_pdvsa_guamache",
        nombre: "Planta de Almacenamiento y Distribución PDVSA El Guamache",
        instalacion: "PLANTA DE ALMACENAMIENTO Y DISTRIBUCIÓN PDVSA EL GUAMACHE.",
        tipo: "Planta de Almacenamiento y Distribución de Hidrocarburos / Combustible / GLP",
        estado: "Nueva Esparta",
        municipio: "Tubores",
        parroquia: "Los Barales",
        sector: "Sector El Guamache",
        ubicacion: "Sector El Guamache a 500 mtrs de la Planta Termoeléctrica Juan Bautista Arismendi, Parroquia Los Barales Municipio Tubores.",
        coordenadas_dms: "10° 52´ 40,65´´ N; 064° 1´ 26,3´´ W",
        responsable: "ING. JESUS CENTENO",
        telefono: "0424-9613698",
        empresa: "PDVSA",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Infraestructura estratégica de almacenamiento y distribución masiva de hidrocarburos, combustible líquido y GLP para el Estado Nueva Esparta.",
        fotos: [
          "/gas/guamache_1.png",
          "/gas/guamache_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.9167750, 10.9478722]
      },
      properties: {
        id: "planta_glp_manuela_saenz",
        nombre: "Planta de Llenado y Distribución de GLP Manuela Sáenz",
        instalacion: "PLANTA DE LLENADO Y DISTRIBUCIÓN DE GLP MANUELA SÁENZ.",
        tipo: "Planta de Llenado y Distribución de GLP Comunal",
        estado: "Nueva Esparta",
        municipio: "Mariño",
        parroquia: "Mariño",
        sector: "Avenida Juan Bautista Arismendi",
        ubicacion: "Av. Juan Bautista Arismendi a 50 mtrs del Internado Judicial, Parroquia Mariño Municipio Mariño.",
        coordenadas_dms: "10° 56´ 52,34´´ N; 063° 55´ 0,39´´ W",
        responsable: "ING. HERMES MORENO",
        telefono: "0412-5908702",
        empresa: "PDVSA Gas Comunal / DINFRA",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Planta de llenado de bombonas y distribución directa comunal de gas GLP para abastecimiento residencial, comercial y de servicios.",
        fotos: [
          "/gas/manuela_saenz_1.png",
          "/gas/manuela_saenz_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.9727444, 10.9556556]
      },
      properties: {
        id: "planta_glp_tricada_gas",
        nombre: "Planta de Llenado y Distribución de GLP Tricada Gas",
        instalacion: "PLANTA DE LLENADO Y DISTRIBUCIÓN DE GLP TRICADA GAS.",
        tipo: "Planta de Llenado y Distribución de GLP (Comercial / Privada)",
        estado: "Nueva Esparta",
        municipio: "Díaz",
        parroquia: "San Juan Bautista",
        sector: "Avenida Juan Bautista Arismendi, San Juan Bautista",
        ubicacion: "Av. Juan Bautista Arismendi sentido Punta de Piedras a 700 mtrs de la Encrucijada, Parroquia San Juan Bautista Municipio Díaz.",
        coordenadas_dms: "10° 57´ 20,36´´ N; 063° 58´ 21,88´´ W",
        responsable: "ING. SERRANO",
        telefono: "0426-3866502",
        empresa: "Tricada Gas",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Planta privada comercial para el trasvasado, llenado de cilindros y distribución a granel de GLP.",
        fotos: [
          "/gas/tricada_gas_1.png",
          "/gas/tricada_gas_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-64.1932417, 10.9602833]
      },
      properties: {
        id: "planta_glp_indio_macanao",
        nombre: "Planta de Llenado y Distribución de GLP Indio Macanao",
        instalacion: "PLANTA DE LLENADO Y DISTRIBUCIÓN DE GLP INDIO MACANAO.",
        tipo: "Planta de Llenado y Distribución de GLP Comunal",
        estado: "Nueva Esparta",
        municipio: "Península de Macanao",
        parroquia: "Boca del Río",
        sector: "Sector La Yegua",
        ubicacion: "Sector La Yegua, vía principal hacia el sector Guayacancito, Parroquia Boca del Río Municipio Península de Macanao.",
        coordenadas_dms: "10° 57´ 37,02´´ N; 064° 11´ 35,67´´ W",
        responsable: "ING. HERMES MORENO",
        telefono: "0412-5908702",
        empresa: "PDVSA Gas Comunal / DINFRA",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Planta estratégica de llenado, distribución y suministro continuo de gas GLP para las comunidades de la Península de Macanao y zona oeste.",
        fotos: [
          "/gas/indio_macanao_1.png",
          "/gas/indio_macanao_2.png"
        ]
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.8498535, 10.9695491]
      },
      properties: {
        id: "pdvsa_gas_adm",
        nombre: "PDVSA Gas - Oficina de la Administración",
        instalacion: "PDVSA GAS - OFICINA DE LA ADMINISTRACIÓN",
        tipo: "Oficina Administrativa / Comercial GLP",
        estado: "Nueva Esparta",
        municipio: "Mariño",
        parroquia: "Mariño",
        sector: "Av. Llano Adentro, Porlamar",
        ubicacion: "Av. Llano Adentro, C.C. Terranova Plaza, Local Nº B23, Porlamar, Parroquia Mariño Municipio Mariño.",
        coordenadas_dms: "10° 58´ 10,38´´ N; 063° 50´ 59,47´´ W",
        responsable: "ADMINISTRACIÓN PDVSA GAS COMUNAL",
        telefono: "0800-BOMBONA (2662662)",
        empresa: "PDVSA Gas Comunal",
        estatus: "Operativa",
        organismo: "PDVSA Gas Comunal",
        descripcion: "Oficina de la administración para gestiones, trámites contractuales y atención comercial de gas comunal en Nueva Esparta."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        crs: {
          type: "name",
          properties: { name: "EPSG:4326" }
        },
        coordinates: [-63.86886065824805, 10.633519724374162]
      },
      properties: {
        id: "emr_bm21",
        nombre: "Estación de Válvula de Medición y Regulación BM-21 (EVA Araya)",
        instalacion: "ESTACIÓN DE VÁLVULA DE MEDICIÓN Y REGULACIÓN BM-21 (EVA ARAYA).",
        tipo: "Estación de Válvula de Medición y Regulación (Enlace Tierra Firme)",
        estado: "Sucre",
        municipio: "Cruz Salmerón Acosta",
        parroquia: "Chacopata / Araya",
        sector: "Península de Araya - Enlace Tierra Firme",
        ubicacion: "Península de Araya, Estado Sucre - Punto de Enlace de Tierra Firme al Tramo Submarino (51,8 km) del Gasoducto Nororiental GJ. José Francisco Bermúdez hacia Isla de Coche y Nueva Esparta.",
        coordenadas_dms: "10° 38′ 0.67″ N; 063° 52′ 7.90″ W",
        responsable: "ING. ALCIDES FIGUERA",
        telefono: "0416-7825132",
        empresa: "PDVSA Gas",
        estatus: "Operativa",
        organismo: "CEO - Dirección Conjunta de Protección de Instalaciones Críticas",
        descripcion: "Estación de Válvula de Medición y Regulación BM-21 (EVA Araya). Punto estratégico de enlace de tierra firme (Sucre) hacia el tramo submarino de 51,8 km del Gasoducto Nororiental GJ. José Francisco Bermúdez que alimenta a Coche y Nueva Esparta."
      }
    }
  ]
};

async function execute() {
  console.log("1. Escribiendo GeoJSON local en public/estaciongasNE.geojson...");
  const publicPath = path.join(__dirname, 'public', 'estaciongasNE.geojson');
  fs.writeFileSync(publicPath, JSON.stringify(gasGeoJSON, null, 2), 'utf8');
  console.log("   -> GeoJSON escrito con éxito (" + gasGeoJSON.features.length + " instalaciones)");

  if (supabaseUrl && supabaseKey) {
    console.log("2. Sincronizando con Supabase (capas_geograficas)...");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Borramos los registros anteriores de estaciongasNE para insertar el dataset limpio y completo
    const { error: delError } = await supabase
      .from('capas_geograficas')
      .delete()
      .eq('nombre_capa', 'estaciongasNE');

    if (delError) {
      console.warn("   [Aviso Supabase] Error borrando registros previos:", delError.message);
    } else {
      console.log("   -> Registros anteriores limpiados correctamente");
    }

    const rowsToInsert = gasGeoJSON.features.map(feat => ({
      nombre_capa: 'estaciongasNE',
      propiedades: feat.properties,
      geom: feat.geometry
    }));

    const { data: insData, error: insError } = await supabase
      .from('capas_geograficas')
      .insert(rowsToInsert)
      .select();

    if (insError) {
      console.error("   [Error Supabase] Fallo al insertar registros:", insError.message);
    } else {
      console.log("   -> " + (insData ? insData.length : rowsToInsert.length) + " registros insertados con éxito en Supabase");
    }
  } else {
    console.log("Supabase credentials not found, only local GeoJSON updated.");
  }
}

execute();
