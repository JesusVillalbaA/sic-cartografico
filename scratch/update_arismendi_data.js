const fs = require('fs');
const path = require('path');

const arismendiSalud = [
  {
    id: "arismendi_hosp_david_espinoza",
    name: "Hospital Tipo 1 Dr. David Espinoza Rojas",
    tipo: "hospital",
    tipo_nivel: "Tipo I",
    address: "Sector Salamanca, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Anlix Narvaez",
    phone: "+58 424-8929499",
    cuadrante: "Fortín de Libertad (Luis Marcano)",
    coordinates: [-63.853375, 11.050981],
    description: "Hospital Tipo 1 especializado en diagnóstico, maternidad y atención general."
  },
  {
    id: "arismendi_cdi_juan_bautista",
    name: "CDI Juan Bautista Rosas Marcano",
    tipo: "cdi",
    tipo_nivel: "CDI",
    address: "Calle San Onofre, Camoruco, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Kuanlin Guitens",
    phone: "+58 426-2279617",
    cuadrante: "Agroturistica Guayatamo (Jhonatan González)",
    coordinates: [-63.8588, 11.0256],
    description: "Centro de Diagnóstico Integral que brinda servicios de medicina preventiva y atención primaria."
  },
  {
    id: "arismendi_hosp_manuel_narvaez",
    name: "Hospital Tipo 1 Dr. Manuel Antonio Narváez",
    tipo: "hospital",
    tipo_nivel: "Tipo I",
    address: "Vía La Sierra, La Portada, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Jairo Luna",
    phone: "+58 424-8485217",
    cuadrante: "Valle de Santa Lucía (Angel Monasterio)",
    coordinates: [-63.867219, 11.023706],
    description: "Hospital Tipo 1 dedicado a atención secundaria y estabilización de pacientes."
  },
  {
    id: "arismendi_cpt3_enrique_albornoz",
    name: "CPT3 Dr. Enrique Albornoz Larez",
    tipo: "ambulatorio",
    tipo_nivel: "CPT3",
    address: "Casco Central, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Marielba Lunar",
    phone: "Sin teléfono registrado",
    cuadrante: "Valle de Santa Lucía (Angel Monasterio)",
    coordinates: [-63.8631, 11.0336],
    description: "Consultorio Popular Tipo 3 en el Casco Central de La Asunción."
  },
  {
    id: "arismendi_cp3_otra_banda",
    name: "CP3 Casitas de la Otra Banda",
    tipo: "ambulatorio",
    tipo_nivel: "CP3",
    address: "San Martín de Porres, Las Casitas, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Mónica Dorante",
    phone: "04120586642",
    cuadrante: "Fortín de la Libertad (Luis Marcano)",
    coordinates: [-63.8525, 11.0289],
    description: "Centro Asistencial CP3 en el sector Las Casitas."
  },
  {
    id: "arismendi_cp3_santa_isabel",
    name: "CP3 Santa Isabel",
    tipo: "ambulatorio",
    tipo_nivel: "CP3",
    address: "Calle Santa Isabel, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Miguel Silva",
    phone: "04120938537",
    cuadrante: "Fortín de la Libertad (Luis Marcano)",
    coordinates: [-63.8685, 11.0360],
    description: "Centro Asistencial CP3 en el sector Santa Isabel."
  },
  {
    id: "arismendi_cp3_sabana_guacuco",
    name: "CP3 Sabana de Guacuco",
    tipo: "ambulatorio",
    tipo_nivel: "CP3",
    address: "Sabana de Guacuco, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Jesús Chacon",
    phone: "04248332489",
    cuadrante: "Batalla de Matasiete (Alexander Hernández)",
    coordinates: [-63.8242, 11.0375],
    description: "Centro de salud CP3 para la comunidad de Sabana de Guacuco."
  },
  {
    id: "arismendi_cp2_atamo_norte",
    name: "CP2 Átamo Norte",
    tipo: "ambulatorio",
    tipo_nivel: "CP2",
    address: "Callejón Villalba, sótano norte, Átamo Norte, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Elvismer Figueroa",
    phone: "Sin teléfono",
    cuadrante: "Batalla de Matasiete (Alexander Hernández)",
    coordinates: [-63.8340, 11.0180],
    description: "Consultorio Popular Tipo 2 en Átamo Norte."
  },
  {
    id: "arismendi_cp2_la_aguada",
    name: "CP2 La Aguada",
    tipo: "ambulatorio",
    tipo_nivel: "CP2",
    address: "Av. Fucho Tovar, La Aguada, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Francis Quijada",
    phone: "04121322570",
    cuadrante: "Manantial de la Resistencia (IAPOLEBNE y PNB)",
    coordinates: [-63.8745, 11.0020],
    description: "Consultorio Popular Tipo 2 en el corredor de La Aguada."
  },
  {
    id: "arismendi_cp2_atamo_sur",
    name: "CP2 Átamo Sur",
    tipo: "ambulatorio",
    tipo_nivel: "CP2",
    address: "Sacopana (1) Átamo Sur, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Yunilde Rojas",
    phone: "04140808530",
    cuadrante: "Agroturistica Guayatamo (Jhonatan González)",
    coordinates: [-63.8390, 11.0090],
    description: "Consultorio Popular Tipo 2 en Átamo Sur."
  },
  {
    id: "arismendi_ipasme",
    name: "IPASME La Asunción",
    tipo: "ambulatorio",
    tipo_nivel: "IPASME",
    address: "Av. Simón Bolívar, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Adennys Zabala",
    phone: "04121165724",
    cuadrante: "Valle de Santa Lucía (Angel Monasterio)",
    coordinates: [-63.8610, 11.0290],
    description: "Unidad médica asistencial de atención primaria del IPASME."
  },
  {
    id: "arismendi_hosp_nelson_sayago",
    name: "Hospital Militar Cnel. GNB Nelson Sayago Mora",
    tipo: "hospital",
    tipo_nivel: "Hospital Militar",
    address: "Calle Morillo, Sector Guatamare, La Asunción, Municipio Arismendi",
    municipio: "Arismendi",
    director: "Chitty Marcano",
    phone: "04121591075",
    cuadrante: "Batalla de Matasiete (Alexander Hernández)",
    coordinates: [-63.847708, 11.033824],
    description: "Hospital militar con servicio odontológico, traumatología y quirófano de respaldo."
  }
];

const arismendiEscuelas = [
  // Circuito Educativo "Luis Beltrán Prieto Figueroa"
  {
    name: "Liceo Juan Bautista Arismendi",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/PK89i7iJw8tQMWM46",
    coordinates: [-63.8623, 11.0321]
  },
  {
    name: "Liceo Nocturno Maestro Luis Beltrán Prieto Figueroa",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/PK89i7iJw8tQMWM46",
    coordinates: [-63.8623, 11.0321]
  },
  {
    name: "UEEE Petronila de La Concepción de Mata Romero",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/cRHm2ZzZVsyoBusJ7",
    coordinates: [-63.8590, 11.0365]
  },
  {
    name: "Cenda Jean Piaget",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/6C1uo1BFaTNxDW7L9",
    coordinates: [-63.8640, 11.0345]
  },
  {
    name: "Equipo de Integración Josefa Camejo",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/6C1uo1BFaTNxDW7L9",
    coordinates: [-63.8640, 11.0345]
  },
  {
    name: "Cecoprode Arismendi",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/8dahxWQrCxSDdSJq9",
    coordinates: [-63.8615, 11.0310]
  },
  {
    name: "Caidv Luis Brailler",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/shuqsesqz1abx8Q47",
    coordinates: [-63.8635, 11.0352]
  },
  {
    name: "UEE José Inocente Alfaro",
    circuito: "Luis Beltrán Prieto Figueroa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/bCBoH2YP56V8Smvy7",
    coordinates: [-63.8670, 11.0250]
  },

  // Circuito Educativo "Batalla de Matasiete"
  {
    name: "UEE Juan Cancio Rodríguez",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/zZpotZCMQBey8xLX6",
    coordinates: [-63.8255, 11.0459]
  },
  {
    name: "Colegio Guayamuri",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/jzYcHRnsoCvcTZ4M6",
    coordinates: [-63.8210, 11.0410]
  },
  {
    name: "UE Rafael Urdaneta",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/kBzwWH6iCgwhwxkD9",
    coordinates: [-63.8280, 11.0480]
  },
  {
    name: "UEE Julio Villarroel",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/n1QDHvnWzGY3VyLc6",
    coordinates: [-63.8315, 11.0435]
  },
  {
    name: "UE Nueva Cádiz",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/GXvcsomSNrDxu8iG7",
    coordinates: [-63.8245, 11.0495]
  },
  {
    name: "Colegio Domingo Savio",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.google.com/?cid=14822068156541882538&entry=gps",
    coordinates: [-63.8300, 11.0460]
  },
  {
    name: "Colegio Náutico Contralmirante José María García",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/eYa4is4dwwUpvf8g8",
    coordinates: [-63.8270, 11.0440]
  },
  {
    name: "UEE Andrés Eloy Blanco",
    circuito: "Batalla de Matasiete",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/WnoecE9XAwmrmAEj8",
    coordinates: [-63.8350, 11.0420]
  },

  // Circuito Educativo "Castillo Santa Rosa"
  {
    name: "UENB Luisa Cáceres de Arismendi",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/MyFWoRnkbwZw8ZTAA",
    coordinates: [-63.8612, 11.0378]
  },
  {
    name: "CEI Poeta Jesús Rosas Marcano",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/FmRUeG9BV1FcujKD6",
    coordinates: [-63.8655, 11.0305]
  },
  {
    name: "IEE Nueva Esparta",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/VCdZDXevNpsLPZz89",
    coordinates: [-63.8645, 11.0360]
  },
  {
    name: "Taller Laboral Marisol García",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/Z6zbspk9687Qma8V8",
    coordinates: [-63.8630, 11.0380]
  },
  {
    name: "UE Jhony Escobar OTILCA",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/6PxHbMpxwffpsJHUA",
    coordinates: [-63.8605, 11.0340]
  },
  {
    name: "UEE Encarnación Rojas",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/hW5n7UcbnTU9JNANA",
    coordinates: [-63.8580, 11.0390]
  },
  {
    name: "Escuela de Emprendimiento La Asunción",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/MyFWoRnkbwZw8ZTAA",
    coordinates: [-63.8612, 11.0378]
  },
  {
    name: "CAIPA Hugo Chávez",
    circuito: "Castillo Santa Rosa",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/VCdZDXevNpsLPZz89",
    coordinates: [-63.8645, 11.0360]
  },

  // Circuito Educativo "Fortín La Libertad"
  {
    name: "UEE Ramona Caraballo",
    circuito: "Fortín La Libertad",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/H2P65esjvtLcFxN7A",
    coordinates: [-63.8690, 11.0280]
  },
  {
    name: "UE Nuestra Señora De La Asunción",
    circuito: "Fortín La Libertad",
    municipio: "Arismendi",
    maps_url: "https://maps.google.com/?q=24QJ%2BPR7%2C+Calle+Girardot%2C+La+Asunci%C3%B3n+6311%2C+Nueva+Esparta",
    coordinates: [-63.8631, 11.0335]
  },
  {
    name: "UE Divino Niño I Y II",
    circuito: "Fortín La Libertad",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/ftipxzAbCRup1rhT7",
    coordinates: [-63.8675, 11.0315]
  },
  {
    name: "UE San Francisco de Asís",
    circuito: "Fortín La Libertad",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/EJpwVZDHY8MxVerN7",
    coordinates: [-63.8650, 11.0330]
  },
  {
    name: "CEI Margarita (Fedecene)",
    circuito: "Fortín La Libertad",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/Fm4dgVLBAwJiRdtT9",
    coordinates: [-63.8680, 11.0300]
  },

  // Circuito Educativo "Hugo Chávez"
  {
    name: "UENB Francisco Esteban Gómez",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/cBiVMvVXdxMvC1ue8",
    coordinates: [-63.8620, 11.0350]
  },
  {
    name: "CDI Simón Bolívar",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/R9muDAVH2n1KKBhX7",
    coordinates: [-63.8595, 11.0330]
  },
  {
    name: "CEEI Nuestra Señora del Carmen",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/5g26hey1DDEAuyFEA",
    coordinates: [-63.8640, 11.0310]
  },
  {
    name: "Liceo Francisco Antonio Risquez",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/oivq7GutPQgxJ4tp9",
    coordinates: [-63.8600, 11.0325]
  },
  {
    name: "UE Talentos Deportivos",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/sj9k3PZKs41rctNY7",
    coordinates: [-63.8550, 11.0300]
  },
  {
    name: "Escuela de Artes Plásticas",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/xadcYcaJTrLwj4DC9",
    coordinates: [-63.8638, 11.0348]
  },
  {
    name: "CEI Virgen La Milagrosa",
    circuito: "Hugo Chávez",
    municipio: "Arismendi",
    maps_url: "https://maps.app.goo.gl/wjEH5N9WA9vBr88z5",
    coordinates: [-63.8660, 11.0320]
  }
];

function updateTargetDirs(baseDir) {
  const publicDir = path.join(baseDir, 'public');
  if (!fs.existsSync(publicDir)) return;

  // 1. Actualizar hospitales.geojson
  const hospPath = path.join(publicDir, 'hospitales.geojson');
  if (fs.existsSync(hospPath)) {
    const hospGeo = JSON.parse(fs.readFileSync(hospPath, 'utf8'));
    arismendiSalud.filter(s => s.tipo === 'hospital').forEach(hs => {
      const match = hospGeo.features.find(f => 
        (f.properties?.name || '').toLowerCase().includes(hs.name.toLowerCase().split(' ')[2] || '___') ||
        (f.properties?.nombre || '').toLowerCase().includes(hs.name.toLowerCase().split(' ')[2] || '___')
      );
      if (match) {
        match.properties = { ...match.properties, ...hs };
      } else {
        hospGeo.features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: hs.coordinates },
          properties: hs
        });
      }
    });
    fs.writeFileSync(hospPath, JSON.stringify(hospGeo, null, 2), 'utf8');
    console.log(`Updated hospitales.geojson in ${baseDir}`);
  }

  // 2. Actualizar cdi.geojson
  const cdiPath = path.join(publicDir, 'cdi.geojson');
  if (fs.existsSync(cdiPath)) {
    const cdiGeo = JSON.parse(fs.readFileSync(cdiPath, 'utf8'));
    arismendiSalud.filter(s => s.tipo === 'cdi').forEach(cs => {
      const match = cdiGeo.features.find(f => 
        (f.properties?.name || '').toLowerCase().includes('camaruco') ||
        (f.properties?.name || '').toLowerCase().includes('camoruco') ||
        (f.properties?.name || '').toLowerCase().includes('juan bautista')
      );
      if (match) {
        match.properties = { ...match.properties, ...cs };
      } else {
        cdiGeo.features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: cs.coordinates },
          properties: cs
        });
      }
    });
    fs.writeFileSync(cdiPath, JSON.stringify(cdiGeo, null, 2), 'utf8');
    console.log(`Updated cdi.geojson in ${baseDir}`);
  }

  // 3. Actualizar ambulatorios.geojson
  const ambPath = path.join(publicDir, 'ambulatorios.geojson');
  if (fs.existsSync(ambPath)) {
    const ambGeo = JSON.parse(fs.readFileSync(ambPath, 'utf8'));
    arismendiSalud.filter(s => s.tipo === 'ambulatorio').forEach(as => {
      const match = ambGeo.features.find(f => 
        (f.properties?.name || '').toLowerCase().includes(as.name.toLowerCase())
      );
      if (match) {
        match.properties = { ...match.properties, ...as };
      } else {
        ambGeo.features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: as.coordinates },
          properties: as
        });
      }
    });
    fs.writeFileSync(ambPath, JSON.stringify(ambGeo, null, 2), 'utf8');
    console.log(`Updated ambulatorios.geojson in ${baseDir}`);
  }

  // 4. Actualizar escuelas.geojson
  const escPath = path.join(publicDir, 'escuelas.geojson');
  if (fs.existsSync(escPath)) {
    const escGeo = JSON.parse(fs.readFileSync(escPath, 'utf8'));
    arismendiEscuelas.forEach((esc, idx) => {
      const cleanName = esc.name.toLowerCase().replace(/^(ue|uee|uenb|ueee|cei|ceei|iee)\s+/i, '').trim();
      const match = escGeo.features.find(f => {
        const fn = (f.properties?.nombre || f.properties?.name || '').toLowerCase();
        return fn.includes(cleanName);
      });
      if (match) {
        match.properties = {
          ...match.properties,
          circuito: esc.circuito,
          circuito_educativo: esc.circuito,
          maps_url: esc.maps_url,
          municipio: "MP. ARISMENDI",
          parroquia: "LA ASUNCION"
        };
      } else {
        escGeo.features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: esc.coordinates },
          properties: {
            id: `escuelas_arismendi_${idx}`,
            nombre: esc.name,
            name: esc.name,
            estado: "Nueva Esparta",
            municipio: "MP. ARISMENDI",
            parroquia: "LA ASUNCION",
            circuito: esc.circuito,
            circuito_educativo: esc.circuito,
            maps_url: esc.maps_url
          }
        });
      }
    });
    fs.writeFileSync(escPath, JSON.stringify(escGeo, null, 2), 'utf8');
    console.log(`Updated escuelas.geojson in ${baseDir}`);
  }
}

updateTargetDirs('c:/Users/jesus/sistema-redimain');
updateTargetDirs('c:/Users/jesus/sistema-redimain-lite');
