import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { layersVisible, selectedFeatures, message, spatialPayload, voiceCommand } = body;

    // 1. Si es una solicitud de Evaluación de Riesgo Espacial por IA
    if (spatialPayload) {
      const riskReport = generateSpatialRiskAssessment(spatialPayload);
      return NextResponse.json({
        success: true,
        riskReport,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Si es un Comando por Voz
    let voiceActions: string[] = [];
    let voiceResponseText = "";
    if (voiceCommand && voiceCommand.trim().length > 0) {
      const voiceResult = parseVoiceCommand(voiceCommand);
      voiceActions = voiceResult.actions;
      voiceResponseText = voiceResult.responseText;
    }

    // Análisis de estado de capas activas
    const activeLayersCount = countActiveLayers(layersVisible);
    const missingRecommendations = getMissingLayerRecommendations(layersVisible);
    const tacticalAdvice = getTacticalAdvice(layersVisible, selectedFeatures);

    let aiResponseText = voiceResponseText;

    if (!aiResponseText) {
      if (message && message.trim().length > 0) {
        aiResponseText = generateAnswerToUser(message, layersVisible, selectedFeatures);
      } else {
        aiResponseText = generateGeneralDiagnostic(layersVisible, selectedFeatures, activeLayersCount);
      }
    }

    return NextResponse.json({
      success: true,
      activeLayersCount,
      missingRecommendations,
      tacticalAdvice,
      voiceActions,
      response: aiResponseText,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error en API ai-advisor:", error);
    return NextResponse.json(
      { success: false, error: "No se pudo procesar el análisis táctico de IA." },
      { status: 500 }
    );
  }
}

// ── MOTOR DE EVALUACIÓN DE RIESGO Y VULNERABILIDAD ESPACIAL POR IA ──────────
function generateSpatialRiskAssessment(payload: any) {
  const { 
    antenasCount = 0, 
    saludCount = 0, 
    electricoCount = 0, 
    gasCount = 0, 
    aguaCount = 0, 
    cuadrantesCount = 0, 
    conppasCount = 0, 
    incidentesCount = 0, 
    areaKm2 = 0,
    shapeType = 'Polígono Trazado',
    exitRoutes = [],
    externalAssets = { salud: 0, electrico: 0, gas: 0, agua: 0, antenas: 0 },
    internalDetails = []
  } = payload;

  const totalCriticalAssets = antenasCount + saludCount + electricoCount + gasCount + aguaCount;
  
  // Cálculo cuantitativo de riesgo (Score 1 a 100)
  let score = 15; // Base
  score += Math.min(35, totalCriticalAssets * 7);
  score += Math.min(30, incidentesCount * 10);
  if (electricoCount > 0 && aguaCount > 0) score += 10;
  if (saludCount === 0 && totalCriticalAssets > 3) score += 15; // Vulnerabilidad por falta de salud en zona crítica

  let riskLevel: 'BAJO' | 'MEDIO' | 'ALTO' | 'CRÍTICO' = 'BAJO';
  let badgeColor = 'emerald';
  if (score >= 75) {
    riskLevel = 'CRÍTICO';
    badgeColor = 'rose';
  } else if (score >= 50) {
    riskLevel = 'ALTO';
    badgeColor = 'amber';
  } else if (score >= 30) {
    riskLevel = 'MEDIO';
    badgeColor = 'sky';
  }

  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  // Rutas de evacuación y salidas detectadas
  if (exitRoutes && exitRoutes.length > 0) {
    recommendations.push(`Vías de salida y arterias de evacuación identificadas: ${exitRoutes.slice(0, 6).join(', ')}.`);
  } else {
    recommendations.push("Establecer señalización y punto de control en las arterias viales perimetrales.");
  }

  // Activos externos a 1-2 km (Zona de influencia exterior)
  if (externalAssets.salud > 0) {
    recommendations.push(`Respaldo asistencial exterior (1-2 km): ${externalAssets.salud} centro(s) de salud detectado(s) fuera del perímetro directo.`);
  } else if (saludCount === 0) {
    vulnerabilities.push("Inexistencia de centro asistencial interno ni apoyo médico inmediato en el perímetro exterior de 1-2 km.");
  }

  if (externalAssets.electrico > 0) {
    recommendations.push(`Infraestructura eléctrica exterior de respaldo: ${externalAssets.electrico} nodo(s) a menos de 2 km.`);
  }

  if (electricoCount > 0) {
    vulnerabilities.push(`Contiene ${electricoCount} nodo(s) de la red eléctrica. Un evento adverso en esta zona impactaría la transmisión regional.`);
    recommendations.push("Establecer punto de control preventivo de la FANB/IAPOLEPNE en accesos a instalaciones eléctricas.");
  }

  if (saludCount === 0 && totalCriticalAssets > 2) {
    vulnerabilities.push("Inexistencia de centro de salud de respuesta rápida (Hospital/CDI) dentro del perímetro delimitado.");
    recommendations.push("Definir ruta de evacuación médica prioritaria hacia el centro asistencial más cercano.");
  } else if (saludCount > 0) {
    recommendations.push(`Asegurar línea de comunicaciones directa con los ${saludCount} centro(s) asistenciales dentro de la zona.`);
  }

  if (antenasCount > 0) {
    vulnerabilities.push(`Infraestructura de telecomunicaciones detectada (${antenasCount} antena/s). Riesgo de incomunicación táctica en caso de falla eléctrica.`);
  }

  if (incidentesCount > 0) {
    vulnerabilities.push(`Histórico de ${incidentesCount} incidente(s) o zona de concentración delictiva registrada dentro del área.`);
    recommendations.push(`Incrementar patrullaje del Cuadrante de Paz en arterias de salida con frecuencia cada 30-45 minutos.`);
  }

  if (vulnerabilities.length === 0) {
    vulnerabilities.push("Área de baja densidad de infraestructura crítica sin incidentes graves reportados.");
    recommendations.push("Mantener patrullaje de rutina e inspección visual periódica del perímetro.");
  }

  const summaryText = `La zona delimitada (${areaKm2.toFixed(2)} km²) contiene un total de ${totalCriticalAssets} infraestructuras críticas internas, ${incidentesCount} incidencias registradas, ${exitRoutes.length} vías/rutas de salida perimetrales y ${externalAssets.salud + externalAssets.electrico + externalAssets.gas} activos de respaldo en la zona exterior de 1-2 km. Nivel de vulnerabilidad evaluado: ${riskLevel} (${score}/100).`;

  return {
    riskLevel,
    riskScore: score,
    badgeColor,
    shapeType,
    areaKm2: Number(areaKm2.toFixed(2)),
    totalCriticalAssets,
    exitRoutes,
    externalAssets,
    internalDetails,
    breakdown: {
      antenas: antenasCount,
      salud: saludCount,
      electrico: electricoCount,
      gas: gasCount,
      agua: aguaCount,
      cuadrantes: cuadrantesCount,
      conppas: conppasCount,
      incidentes: incidentesCount
    },
    summaryText,
    vulnerabilities,
    recommendations
  };
}

// ── PARSER DE COMANDOS DE VOZ EN ESPAÑOL ─────────────────────────────────────
function parseVoiceCommand(command: string) {
  const text = command.toLowerCase();
  const actions: string[] = [];
  let responseText = `Comando procesado: "${command}". `;

  // Detectar intención: ACTIVAR vs DESACTIVAR
  const isDeactivate = text.includes('desactivar') || text.includes('apagar') || text.includes('ocultar') || text.includes('quitar') || text.includes('borrar') || text.includes('eliminar') || text.includes('desactiva') || text.includes('apaga') || text.includes('oculta') || text.includes('quita');
  
  const turnPrefix = isDeactivate ? 'turn_off:' : 'turn_on:';
  const verbLabel = isDeactivate ? 'Desactivando' : 'Activando';

  const toggleLayer = (layerKey: string, friendlyName: string) => {
    actions.push(`${turnPrefix}${layerKey}`);
    responseText += `${verbLabel} ${friendlyName}. `;
  };

  // ── 1. MÓDULOS DEL SISTEMA Y CAPAS GENERALES ─────────────────────────────────────
  if (text.includes('activar todos los modulos') || text.includes('activar todos los módulos') || text.includes('activar todas las capas') || text.includes('encender todo') || text.includes('activar todo')) {
    actions.push('turn_on_all');
    responseText += "Activando TODOS los módulos e infraestructuras del mapa. ";
  } else if (text.includes('desactivar todo') || text.includes('apagar todo') || text.includes('quitar todo') || text.includes('desactiva todo') || text.includes('limpiar todo') || text.includes('borrar todo')) {
    actions.push('turn_off_all', 'clear_tools');
    responseText += "Desactivando todas las capas e infraestructura del mapa. ";
  }

  // MÓDULO 1: Infraestructura y Servicios Críticos (Electricidad, Agua, Gas, Estaciones de Servicio)
  if (text.includes('modulo 1') || text.includes('módulo 1') || text.includes('modulo uno') || text.includes('módulo uno') || text.includes('primer modulo') || text.includes('primer módulo')) {
    const mod1Layers = [
      'sistemasElectricos', 
      'servicioAgua.embalses', 
      'servicioAgua.desalinizadoras', 
      'servicioAgua.tanques', 
      'servicioAgua.tratamiento',
      'servicioAgua.pozos',
      'estacionesGas', 
      'estaciones'
    ];
    mod1Layers.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 1: Infraestructura y Servicios Críticos (Electricidad, Agua, Gas, Combustible). `;
  }

  // MÓDULO 2: Red Asistencial de Salud y Educación (Hospitales, Clínicas, CDI, Ambulatorios, Escuelas)
  if (text.includes('modulo 2') || text.includes('módulo 2') || text.includes('modulo dos') || text.includes('módulo dos') || text.includes('segundo modulo') || text.includes('segundo módulo')) {
    const mod2Layers = ['hospitales', 'cdi', 'ambulatorios', 'clinicas', 'escuelas'];
    mod2Layers.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 2: Red Asistencial de Salud y Educación. `;
  }

  // MÓDULO 3: Seguridad Ciudadana y Cuadrantes de Paz (Cuadrantes, COMPAS, Delitos, Bandas)
  if (text.includes('modulo 3') || text.includes('módulo 3') || text.includes('modulo tres') || text.includes('módulo tres') || text.includes('tercer modulo') || text.includes('tercer módulo')) {
    const mod3Layers = ['cuadrantesPoligonos', 'cuadrantes', 'compas', 'zonasDeRiesgo.delitosComunes', 'bandasDelictivas'];
    mod3Layers.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 3: Seguridad Ciudadana y Cuadrantes de Paz. `;
  }

  // MÓDULO 4: Red de Telecomunicaciones (Digitel, Movistar, Movilnet)
  if (text.includes('modulo 4') || text.includes('módulo 4') || text.includes('modulo cuatro') || text.includes('módulo cuatro') || text.includes('cuarto modulo') || text.includes('cuarto módulo')) {
    const mod4Layers = ['antenasDigitel', 'antenasMovistar', 'antenasMovilnet'];
    mod4Layers.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 4: Red de Telecomunicaciones. `;
  }

  // ── DETECCIÓN AVANZADA DE RADIOS Y TRAZADOS EN LUGARES ESPECÍFICOS ──────────
  const radioRegex = /(?:realizar|crear|trazar|hacer|pon|poner)\s+(?:un\s+)?radio\s+(?:de\s+(\d+)\s*km\s+)?(?:en|sobre|de|del|de la)\s+(.+)/i;
  const radioMatch = text.match(radioRegex);
  if (radioMatch) {
    const radiusKm = radioMatch[1] ? parseInt(radioMatch[1]) : 2;
    const placeName = radioMatch[2].trim();
    actions.push(`trace_place:buffer:${radiusKm}:${placeName}`);
    responseText += `Creando radio de cobertura de ${radiusKm} km en "${placeName}", analizando riesgo espacial y descargando reporte PDF. `;
  }

  const traceRegex = /(?:trazar|traza|analizar|analiza|realizar|hacer)\s+(?:un\s+)?(?:área|area|polígono|poligono|análisis|analisis)\s+(?:en|sobre|de|del|de la)\s+(.+)/i;
  const traceMatch = text.match(traceRegex);
  if (traceMatch && !radioMatch) {
    const placeName = traceMatch[1].trim();
    actions.push(`trace_place:polygon:0:${placeName}`);
    responseText += `Trazando área en "${placeName}", realizando diagnóstico de vulnerabilidad y generando reporte PDF. `;
  }

  const municipiosMap: Record<string, string> = {
    'maneiro': 'Maneiro',
    'mariño': 'Mariño',
    'marino': 'Mariño',
    'arismendi': 'Arismendi',
    'tubores': 'Tubores',
    'marcano': 'Marcano',
    'antolin': 'Antolín del Campo',
    'antolín': 'Antolín del Campo',
    'gomez': 'Gómez',
    'gómez': 'Gómez',
    'diaz': 'Díaz',
    'díaz': 'Díaz',
    'garcia': 'García',
    'garcía': 'García',
    'villalba': 'Villalba',
    'macanao': 'Península de Macanao'
  };

  Object.keys(municipiosMap).forEach(key => {
    if (text.includes(key) && !radioMatch && !traceMatch && (text.includes('trazar') || text.includes('área') || text.includes('area') || text.includes('municipio') || text.includes('analiz') || text.includes('sector'))) {
      const muniName = municipiosMap[key];
      actions.push(`trace_municipality:${muniName}`);
      responseText += `Delimitando y analizando automáticamente el Municipio ${muniName}. `;
    }
  });

  // ── ABRIR PANELES DE MUNICIPIOS, SECTORES Y ENTIDADES POR VOZ ───────────────────
  const openRegex = /(?:abrir|abre|ábreme|abreme|panel|ficha|ver|mostrar)\s+(?:el\s+)?(?:panel\s+de\s+|ficha\s+de\s+|municipio\s+|sector\s+)?(.+)/i;
  const openMatch = text.match(openRegex);
  if (openMatch && !radioMatch && !traceMatch && !text.includes('reporte') && !text.includes('pdf') && !text.includes('activar') && !text.includes('desactivar') && !text.includes('trazar') && !text.includes('crear')) {
    const targetName = openMatch[1].trim();
    if (targetName.length > 1 && !['todo', 'todas', '3d', 'mapa', 'calor'].includes(targetName)) {
      actions.push(`open_feature:${targetName}`);
      responseText += `Abriendo panel situacional e indicadores de "${targetName}". `;
    }
  }

  Object.keys(municipiosMap).forEach(key => {
    if (text.includes(key) && (text.includes('abre') || text.includes('abrir') || text.includes('ver') || text.includes('panel') || text.includes('ficha'))) {
      const muniName = municipiosMap[key];
      if (!actions.some(a => a.startsWith('open_feature:'))) {
        actions.push(`open_feature:${muniName}`);
        responseText += `Abriendo panel situacional del Municipio ${muniName}. `;
      }
    }
  });

  // ── CAPAS INDIVIDUALES UNO POR UNO ─────────────────────────────────────────
  // Capas Territoriales
  if (text.includes('municipio') || text.includes('municipios')) {
    if (!actions.some(a => a.startsWith('trace_municipality:'))) {
      toggleLayer('municipios', 'Municipios');
    }
  }
  if (text.includes('parroquia') || text.includes('parroquias')) {
    toggleLayer('parroquias', 'Parroquias');
  }
  if (text.includes('sector') || text.includes('sectores')) {
    toggleLayer('sectores', 'Sectores');
  }
  if (text.includes('cuadrante') || text.includes('cuadrantes') || text.includes('patrulla') || text.includes('compa') || text.includes('compas') || text.includes('comité de paz') || text.includes('comités de paz') || text.includes('comite de paz')) {
    actions.push(`${turnPrefix}cuadrantesPoligonos`, `${turnPrefix}compas`);
    responseText += `${verbLabel} Cuadrantes de Paz (Polígonos detallados). `;
  }

  // Zonas de Riesgo e Inteligencia
  if (text.includes('incidencia') || text.includes('incidencias') || text.includes('delito') || text.includes('delitos') || text.includes('comunes') || text.includes('delitos comunes')) {
    toggleLayer('zonasDeRiesgo.delitosComunes', 'Delitos Comunes e Incidencias');
  }
  if (text.includes('cibernetica') || text.includes('cibernética') || text.includes('ciberneticas') || text.includes('cibernéticas') || text.includes('hacker')) {
    toggleLayer('zonasDeRiesgo.areaCibernetica', 'Área Cibernética');
  }
  if (text.includes('concentracion') || text.includes('concentraciones')) {
    toggleLayer('zonasDeRiesgo.concentraciones', 'Puntos de Concentración');
  }
  if (text.includes('droga') || text.includes('drogas') || text.includes('tráfico de drogas')) {
    toggleLayer('geocalizaciones.drogas', 'Geolocalización de Drogas');
  }
  if (text.includes('persona de interés') || text.includes('personas de interés') || text.includes('personas de interes') || text.includes('persona de interes') || text.includes('actor') || text.includes('actores')) {
    toggleLayer('geocalizaciones.actorInteres', 'Actores y Personas de Interés');
  }
  if (text.includes('lugar de interés') || text.includes('lugares de interés') || text.includes('lugares de interes') || text.includes('punto de interés') || text.includes('puntos de interés') || text.includes('punto de interes')) {
    toggleLayer('geocalizaciones.puntoInteres', 'Puntos y Lugares de Interés');
  }
  if (text.includes('banda') || text.includes('bandas') || text.includes('grupo delictivo') || text.includes('grupos delictivos')) {
    toggleLayer('bandasDelictivas', 'Grupos Delictivos Organizados');
  }

  // Salud y Educación
  if (text.includes('hospital') || text.includes('hospitales')) {
    toggleLayer('hospitales', 'Red de Hospitales');
  }
  if (text.includes('clínica') || text.includes('clinica') || text.includes('clínicas') || text.includes('clinicas')) {
    toggleLayer('clinicas', 'Red de Clínicas Privadas');
  }
  if (text.includes('ambulatorio') || text.includes('ambulatorios')) {
    toggleLayer('ambulatorios', 'Ambulatorios');
  }
  if (text.includes('cdi') || text.includes('dispensario') || text.includes('diagnóstico')) {
    toggleLayer('cdi', 'Centros CDI');
  }
  if (text.includes('escuela') || text.includes('escuelas') || text.includes('colegio') || text.includes('educación')) {
    toggleLayer('escuelas', 'Centros Educativos');
  }
  if (text.includes('centro de votación') || text.includes('centros de votacion') || text.includes('electoral') || text.includes('votación')) {
    toggleLayer('centrosVotacion', 'Centros de Votación');
  }
  if (text.includes('gasolinera') || text.includes('gasolineras') || text.includes('estación de servicio') || text.includes('estaciones de servicio') || text.includes('combustible')) {
    toggleLayer('estaciones', 'Estaciones de Servicio');
  }

  // Servicios Básicos (Electricidad, Gas, Agua Toda o Cada Una)
  if (text.includes('subestación') || text.includes('subestaciones') || text.includes('eléctric') || text.includes('electricidad') || text.includes('luz')) {
    toggleLayer('sistemasElectricos', 'Sistemas Eléctricos');
  }
  if (text.includes('gasoducto') || text.includes('estación de gas') || text.includes('estaciones de gas') || text.includes('gas')) {
    toggleLayer('estacionesGas', 'Estaciones de Gas');
  }

  // Agua: CADA UNA O TODA LA RED
  const isAguaAll = (text.includes('toda el agua') || text.includes('todas las de agua') || text.includes('red de agua') || text.includes('servicio de agua') || text.includes('servicios de agua') || (text.includes('agua') && !text.includes('desalinizadora') && !text.includes('tanque') && !text.includes('pozo') && !text.includes('tratamiento') && !text.includes('embalse') && !text.includes('dique')));

  if (isAguaAll) {
    const waterAll = [
      'servicioAgua.desalinizadoras',
      'servicioAgua.tratamiento',
      'servicioAgua.bombeoServidas',
      'servicioAgua.bombeoPotable',
      'servicioAgua.tanques',
      'servicioAgua.diques',
      'servicioAgua.pozos',
      'servicioAgua.clorado',
      'servicioAgua.parales',
      'servicioAgua.embalses'
    ];
    waterAll.forEach(w => actions.push(`${turnPrefix}${w}`));
    responseText += `${verbLabel} TODA la Red de Servicio de Agua (Desalinizadoras, Tanques, Pozos, Embalses, Tratamiento). `;
  } else {
    if (text.includes('desalinizadora') || text.includes('desalinizadoras')) {
      toggleLayer('servicioAgua.desalinizadoras', 'Plantas Desalinizadoras');
    }
    if (text.includes('tratamiento') || text.includes('planta de tratamiento')) {
      toggleLayer('servicioAgua.tratamiento', 'Plantas de Tratamiento de Agua');
    }
    if (text.includes('tanque') || text.includes('tanques')) {
      toggleLayer('servicioAgua.tanques', 'Tanques de Agua');
    }
    if (text.includes('pozo') || text.includes('pozos')) {
      toggleLayer('servicioAgua.pozos', 'Pozos de Agua Potable');
    }
    if (text.includes('dique') || text.includes('diques')) {
      toggleLayer('servicioAgua.diques', 'Diques');
    }
    if (text.includes('embalse') || text.includes('embalses')) {
      toggleLayer('servicioAgua.embalses', 'Embalses');
    }
    if (text.includes('clorado')) {
      toggleLayer('servicioAgua.clorado', 'Sistemas de Clorado');
    }
    if (text.includes('paral') || text.includes('parales')) {
      toggleLayer('servicioAgua.parales', 'Parales de Agua');
    }
    if (text.includes('aguas servidas') || text.includes('bombeo servidas')) {
      toggleLayer('servicioAgua.bombeoServidas', 'Bombeo de Aguas Servidas');
    }
    if (text.includes('agua potable') || text.includes('bombeo potable')) {
      toggleLayer('servicioAgua.bombeoPotable', 'Bombeo de Agua Potable');
    }
  }

  // Telecomunicaciones
  if (text.includes('digitel')) {
    toggleLayer('antenasDigitel', 'Antenas Digitel');
  }
  if (text.includes('movistar')) {
    toggleLayer('antenasMovistar', 'Antenas Movistar');
  }
  if (text.includes('movilnet')) {
    toggleLayer('antenasMovilnet', 'Antenas Movilnet');
  }
  if (text.includes('antena') || text.includes('antenas') || text.includes('telecomunicación')) {
    if (!text.includes('digitel') && !text.includes('movistar') && !text.includes('movilnet')) {
      actions.push(`${turnPrefix}antenasDigitel`, `${turnPrefix}antenasMovistar`, `${turnPrefix}antenasMovilnet`);
      responseText += `${verbLabel} Red de Telecomunicaciones (Digitel, Movistar, Movilnet). `;
    }
  }

  // Transporte & Terminales
  if (text.includes('transporte') || text.includes('rutas')) {
    toggleLayer('transporteGeneral', 'Red de Transporte');
  }
  if (text.includes('terminal') || text.includes('terminales')) {
    toggleLayer('terminales', 'Terminales de Pasajeros');
  }
  if (text.includes('parada') || text.includes('paradas')) {
    toggleLayer('paradasPasajeros', 'Paradas de Pasajeros');
  }
  if (text.includes('bus') || text.includes('buses')) {
    toggleLayer('recorridoBusesPublicos', 'Rutas de Transporte Público');
  }
  if (text.includes('mototaxi') || text.includes('mototaxis')) {
    toggleLayer('mototaxis', 'Fuerza Mototaxis');
  }
  if (text.includes('taxi') || text.includes('taxis')) {
    toggleLayer('taxis', 'Líneas de Taxis');
  }
  if (text.includes('conppa') || text.includes('conppas') || text.includes('pesca') || text.includes('pesquero') || text.includes('puerto pesquero') || text.includes('pescadores')) {
    toggleLayer('conppas', 'CONPPAS y Sector Pesquero (52 Puertos)');
  }

  // Modos del Mapa
  if (text.includes('3d') || text.includes('tres d') || text.includes('edificio') || text.includes('relieve')) {
    actions.push('toggle_3d');
    responseText += "Activando Perspectiva y Edificaciones 3D. ";
  }
  if (text.includes('calor') || text.includes('heatmap') || text.includes('incidencia') || text.includes('delito')) {
    actions.push('toggle_heatmap');
    responseText += "Desplegando Mapa de Calor Táctico. ";
  }
  if (text.includes('radio') || text.includes('cobertura') || text.includes('buffer')) {
    actions.push('activate_buffer');
    responseText += "Activando herramienta de Radio de Cobertura. ";
  }
  if ((text.includes('trazar') || text.includes('área') || text.includes('zona') || text.includes('polígono')) && !actions.some(a => a.startsWith('trace_municipality:')) && !radioMatch && !traceMatch) {
    actions.push('activate_polygon');
    responseText += "Iniciando herramienta de Trazado de Área. ";
  }
  if (text.includes('limpiar') || text.includes('reset') || (text.includes('borrar') && !isDeactivate)) {
    actions.push('clear_tools');
    responseText += "Limpiando herramientas y filtros del mapa. ";
  }

  // ── GENERACIÓN DE REPORTES PDF INDIVIDUALES POR VOZ (PARA CADA UNA DE LAS CAPAS) ──
  if (text.includes('reporte') || text.includes('pdf') || text.includes('descargar') || text.includes('exportar') || text.includes('imprimir')) {
    if (text.includes('municipio') || text.includes('municipios')) actions.push('export_pdf:municipios');
    else if (text.includes('parroquia') || text.includes('parroquias')) actions.push('export_pdf:parroquias');
    else if (text.includes('sector') || text.includes('sectores')) actions.push('export_pdf:sectores');
    else if (text.includes('cuadrante') || text.includes('cuadrantes')) actions.push('export_pdf:cuadrantes');
    else if (text.includes('compa') || text.includes('compas')) actions.push('export_pdf:compas');
    else if (text.includes('incidencia') || text.includes('incidencias')) actions.push('export_pdf:incidencias');
    else if (text.includes('concentración') || text.includes('concentraciones')) actions.push('export_pdf:concentraciones');
    else if (text.includes('digitel')) actions.push('export_pdf:digitel');
    else if (text.includes('movistar')) actions.push('export_pdf:movistar');
    else if (text.includes('movilnet')) actions.push('export_pdf:movilnet');
    else if (text.includes('antena') || text.includes('antenas') || text.includes('telecomunicación')) actions.push('export_pdf:antenas');
    else if (text.includes('delito') || text.includes('delitos') || text.includes('comunes')) actions.push('export_pdf:delitos');
    else if (text.includes('banda') || text.includes('bandas') || text.includes('delictivo')) actions.push('export_pdf:bandas');
    else if (text.includes('droga') || text.includes('drogas')) actions.push('export_pdf:drogas');
    else if (text.includes('actor') || text.includes('actores') || text.includes('persona')) actions.push('export_pdf:actores');
    else if (text.includes('punto') || text.includes('puntos') || text.includes('lugar')) actions.push('export_pdf:puntos');
    else if (text.includes('hospital') || text.includes('hospitales')) actions.push('export_pdf:hospitales');
    else if (text.includes('clínica') || text.includes('clinica') || text.includes('clínicas')) actions.push('export_pdf:clinicas');
    else if (text.includes('ambulatorio') || text.includes('ambulatorios')) actions.push('export_pdf:ambulatorios');
    else if (text.includes('cdi')) actions.push('export_pdf:cdi');
    else if (text.includes('salud')) actions.push('export_pdf:salud');
    else if (text.includes('escuela') || text.includes('escuelas') || text.includes('colegio') || text.includes('educación')) actions.push('export_pdf:escuelas');
    else if (text.includes('votación') || text.includes('votacion') || text.includes('electoral')) actions.push('export_pdf:centrosvotacion');
    else if (text.includes('subestación') || text.includes('subestaciones') || text.includes('eléctric') || text.includes('electricidad') || text.includes('luz')) actions.push('export_pdf:electricidad');
    else if (text.includes('gas') || text.includes('gasoducto')) actions.push('export_pdf:estaciongas');
    else if (text.includes('gasolinera') || text.includes('gasolineras') || text.includes('combustible') || text.includes('estación de servicio')) actions.push('export_pdf:estaciones_combustible');
    else if (text.includes('desalinizadora') || text.includes('desalinizadoras')) actions.push('export_pdf:desalinizadoras');
    else if (text.includes('tanque') || text.includes('tanques')) actions.push('export_pdf:tanques');
    else if (text.includes('pozo') || text.includes('pozos')) actions.push('export_pdf:pozos');
    else if (text.includes('embalse') || text.includes('embalses')) actions.push('export_pdf:embalses');
    else if (text.includes('agua')) actions.push('export_pdf:agua');
    else if (text.includes('antena') || text.includes('antenas') || text.includes('digitel') || text.includes('movistar') || text.includes('movilnet') || text.includes('telecomunicación')) actions.push('export_pdf:antenas');
    else if (text.includes('terminal') || text.includes('terminales')) actions.push('export_pdf:terminales');
    else if (text.includes('transporte')) actions.push('export_pdf:transporte');
    else if (text.includes('conppa') || text.includes('conppas') || text.includes('pesca') || text.includes('pesquero')) actions.push('export_pdf:conppas');

    responseText += "Generando y descargando Reporte PDF Individual. ";
  }

  if (actions.length === 0) {
    responseText = `Comando interpretado: "${command}". Puedes dictar: "Activar municipios", "Desactivar cuadrantes", "Activar hospitales", "Desactivar agua", "Activar desalinizadoras", "Generar reporte de escuelas", "Desactivar todo" o "Vista 3D".`;
  }

  return { actions, responseText };
}

function countActiveLayers(layers: any): number {
  if (!layers) return 0;
  let count = 0;
  Object.keys(layers).forEach(k => {
    if (typeof layers[k] === 'boolean' && layers[k]) count++;
    else if (typeof layers[k] === 'object' && layers[k] !== null) {
      Object.keys(layers[k]).forEach(subK => {
        if (layers[k][subK]) count++;
      });
    }
  });
  return count;
}

function getMissingLayerRecommendations(layers: any) {
  const recommendations: { id: string; label: string; reason: string; category: string }[] = [];

  const isZonasRiesgoActive = layers?.zonasDeRiesgo?.delitosComunes || layers?.zonasDeRiesgo?.concentraciones || layers?.bandasDelictivas;
  const isSaludActive = layers?.hospitales || layers?.clinicas || layers?.ambulatorios || layers?.cdi;
  const isCuadrantesActive = layers?.cuadrantes || layers?.cuadrantesPoligonos;
  const isElectricoActive = layers?.sistemasElectricos;
  const isGasActive = layers?.estacionesGas;
  const isAguaActive = Object.values(layers?.servicioAgua || {}).some(v => v);
  const isAntenasActive = layers?.antenasDigitel || layers?.antenasMovistar || layers?.antenasMovilnet;

  if (isZonasRiesgoActive && !isCuadrantesActive) {
    recommendations.push({
      id: 'cuadrantes',
      label: 'Cuadrantes de Paz',
      reason: 'Tienes zonas de delito o incidencias activas. Activa Cuadrantes para ver el sector de patrullaje asignado.',
      category: 'Seguridad'
    });
  }

  if (isZonasRiesgoActive && !isSaludActive) {
    recommendations.push({
      id: 'hospitales',
      label: 'Red de Salud (Hospitales/CDI)',
      reason: 'Recomendado para evaluar tiempos de evacuación y respuesta médica rápida ante emergencias.',
      category: 'Salud'
    });
  }

  if (isElectricoActive && !isGasActive) {
    recommendations.push({
      id: 'estacionesGas',
      label: 'Estaciones y Gasoductos',
      reason: 'Permite hacer un análisis combinado de contingencia en servicios energéticos del estado.',
      category: 'Servicios'
    });
  }

  if ((isElectricoActive || isAguaActive) && !isAntenasActive) {
    recommendations.push({
      id: 'antenasDigitel',
      label: 'Telecomunicaciones (Antenas)',
      reason: 'Verifica la cobertura de telefonía sobre infraestructuras críticas para asegurar comunicaciones de respaldo.',
      category: 'Comunicaciones'
    });
  }

  if (!isZonasRiesgoActive && !isCuadrantesActive) {
    recommendations.push({
      id: 'cuadrantes',
      label: 'Cuadrantes de Paz',
      reason: 'Se recomienda activar Cuadrantes como capa base de análisis territorial.',
      category: 'Seguridad'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'conppas',
      label: 'Sectores Pesqueros (CONPPAS)',
      reason: 'Complementa la visión costera e insular del estado Nueva Esparta.',
      category: 'Marítimo'
    });
  }

  return recommendations;
}

function getTacticalAdvice(layers: any, selectedFeatures: any[]) {
  const tips: { title: string; desc: string; type: 'info' | 'warning' | 'success' }[] = [];

  if (selectedFeatures && selectedFeatures.length > 0) {
    const main = selectedFeatures[0];
    const props = main.properties || {};
    const name = props.nombre || props.NAME || props.adm2_name || props.cuadrante || "Elemento seleccionado";
    
    tips.push({
      title: `Análisis Focalizado: ${name}`,
      desc: `Has seleccionado '${name}'. Revisa las métricas asociadas en el panel lateral de análisis. Puedes generar el reporte en PDF de este sector.`,
      type: 'info'
    });
  }

  const isZonasRiesgoActive = layers?.zonasDeRiesgo?.delitosComunes || layers?.zonasDeRiesgo?.concentraciones;
  if (isZonasRiesgoActive) {
    tips.push({
      title: 'Monitoreo de Incidencias Operativo',
      desc: 'Zonas de riesgo visibles. Se sugiere habilitar la herramienta de Mapa de Calor (Heatmap) en la barra inferior para identificar hotspots de concentración.',
      type: 'warning'
    });
  }

  if (layers?.sistemasElectricos || Object.values(layers?.servicioAgua || {}).some(v => v)) {
    tips.push({
      title: 'Red de Servicios Críticos',
      desc: 'Estás monitoreando servicios básicos. Utiliza el botón "Ver Diagrama Unifilar" para inspeccionar las subestaciones y enlaces de transmisión.',
      type: 'success'
    });
  }

  if (tips.length === 0) {
    tips.push({
      title: 'Vista Táctica Inicial',
      desc: 'Selecciona cualquier municipio o cuadrante en el mapa para desplegar su ficha situacional e indicadores estratégicos.',
      type: 'info'
    });
  }

  return tips;
}

function generateGeneralDiagnostic(layers: any, selectedFeatures: any[], activeCount: number): string {
  let diag = `Analizador SOG activo. Tienes ${activeCount} capa(s) habilitadas en el mapa actual.`;
  if (selectedFeatures && selectedFeatures.length > 0) {
    diag += ` Se está analizando la entidad: ${selectedFeatures[0]?.properties?.nombre || selectedFeatures[0]?.properties?.NAME || 'Elemento'}.`;
  } else {
    diag += ` Sugerencia: Puedes dictar comandos por voz con el botón del micrófono o evaluar una zona trazada.`;
  }
  return diag;
}

function generateAnswerToUser(query: string, layers: any, selectedFeatures: any[]): string {
  const q = query.toLowerCase();

  if (q.includes('capa') || q.includes('falta') || q.includes('agregar') || q.includes('recomiendas')) {
    return "Te sugiero mantener activos los **Cuadrantes de Paz** y la **Red de Salud** combinados con las **Subestaciones Eléctricas**. Esto te dará una visibilidad completa entre seguridad, capacidad de atención y estabilidad energética.";
  }
  if (q.includes('riesgo') || q.includes('delito') || q.includes('seguridad')) {
    return "Para análisis de seguridad: Activa 'Delitos Comunes' o 'Bandas Delictivas', luego abre el botón de **Calor Táctico (Heatmap)** en la barra inferior. No olvides verificar qué comisaría o punto de atención está más cercano.";
  }
  if (q.includes('agua') || q.includes('luz') || q.includes('electr') || q.includes('servicio')) {
    return "En cuanto a Servicios Básicos: Puedes presionar el botón **Ver Diagrama Unifilar** para entender la red eléctrica de Nueva Esparta, o activar la capa de **Desalinizadoras y Embalses** para seguimiento hídrico.";
  }
  if (q.includes('pdf') || q.includes('reporte') || q.includes('imprimir')) {
    return "Para exportar tu informe: Haz clic en el botón de **Reporte PDF** en el menú de herramientas. La IA incluirá las métricas de las capas actualmente visibles.";
  }

  return `Entendido. Como consejero de geointeligencia SOGNE, te sugiero revisar las capas de infraestructura crítica o dictar comandos por voz para controlar la cartografía.`;
}
