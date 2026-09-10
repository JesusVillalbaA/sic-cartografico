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

// ── PARSER DE COMANDOS DE VOZ EN ESPAÑOL (MÁS DE 100 COMANDOS SOPORTADOS) ──────
function parseVoiceCommand(command: string) {
  const text = command.toLowerCase().trim();
  const actions: string[] = [];
  let responseText = `Comando procesado: "${command}". `;

  // Detectar intención global: DESACTIVAR / APAGAR vs ACTIVAR / ENCENDER
  const isDeactivate = text.includes('desactivar') || text.includes('apagar') || text.includes('ocultar') || text.includes('quitar') || text.includes('borrar') || text.includes('eliminar') || text.includes('desactiva') || text.includes('apaga') || text.includes('oculta') || text.includes('quita');
  
  const turnPrefix = isDeactivate ? 'turn_off:' : 'turn_on:';
  const verbLabel = isDeactivate ? 'Desactivando' : 'Activando';

  const toggleLayer = (layerKey: string, friendlyName: string) => {
    actions.push(`${turnPrefix}${layerKey}`);
    responseText += `${verbLabel} ${friendlyName}. `;
  };

  // ── 1. COMANDOS GLOBALES DE MÓDULOS Y MAPA ─────────────────────────────────────────
  if (text.includes('activar todos los modulos') || text.includes('activar todos los módulos') || text.includes('activar todas las capas') || text.includes('encender todo') || text.includes('activar todo') || text.includes('mostrar todo')) {
    actions.push('turn_on_all');
    responseText += "Activando TODOS los módulos e infraestructuras del mapa. ";
  } else if (text.includes('desactivar todo') || text.includes('apagar todo') || text.includes('quitar todo') || text.includes('desactiva todo') || text.includes('limpiar todo') || text.includes('borrar todo')) {
    actions.push('turn_off_all', 'clear_tools');
    responseText += "Desactivando todas las capas e infraestructura del mapa. ";
  }

  // MÓDULOS NUMÉRICOS (Módulo 1, 2, 3, 4)
  if (text.includes('modulo 1') || text.includes('módulo 1') || text.includes('primer modulo') || text.includes('infraestructura critica')) {
    const mod1 = ['sistemasElectricos', 'servicioAgua.embalses', 'servicioAgua.desalinizadoras', 'servicioAgua.tanques', 'servicioAgua.tratamiento', 'servicioAgua.pozos', 'estacionesGas', 'estaciones'];
    mod1.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 1: Servicios Básicos e Infraestructura Energética. `;
  }
  if (text.includes('modulo 2') || text.includes('módulo 2') || text.includes('segundo modulo') || text.includes('red de salud')) {
    const mod2 = ['hospitales', 'cdi', 'ambulatorios', 'clinicas', 'escuelas'];
    mod2.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 2: Red Asistencial de Salud y Educación. `;
  }
  if (text.includes('modulo 3') || text.includes('módulo 3') || text.includes('tercer modulo') || text.includes('seguridad ciudadana')) {
    const mod3 = ['cuadrantesPoligonos', 'cuadrantes', 'compas', 'zonasDeRiesgo.delitosComunes', 'bandasDelictivas'];
    mod3.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 3: Seguridad Ciudadana y Cuadrantes de Paz. `;
  }
  if (text.includes('modulo 4') || text.includes('módulo 4') || text.includes('cuarto modulo') || text.includes('telecomunicaciones')) {
    const mod4 = ['antenasDigitel', 'antenasMovistar', 'antenasMovilnet'];
    mod4.forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} MÓDULO 4: Red de Telecomunicaciones. `;
  }

  // ── 2. GENERACIÓN Y DESCARGA DE REPORTES PDF INDIVIDUALES POR VOZ ───────────────────
  if (text.includes('reporte') || text.includes('pdf') || text.includes('descargar') || text.includes('exportar') || text.includes('imprimir') || text.includes('generar')) {
    let pdfExecuted = false;
    if ((text.includes('conppa') || text.includes('conppas') || text.includes('conpas') || text.includes('compas') || text.includes('comppa') || text.includes('pesca') || text.includes('pesquero') || text.includes('puerto pesquero') || text.includes('pescadores')) && !text.includes('cuadrante') && !text.includes('cuadrantes')) {
      actions.push('export_pdf:conppas');
      pdfExecuted = true;
    } else if (text.includes('cuadrante') || text.includes('cuadrantes') || text.includes('poligono de paz') || text.includes('paz')) {
      actions.push('export_pdf:compas');
      pdfExecuted = true;
    } else if (text.includes('municipio')) { actions.push('export_pdf:municipios'); pdfExecuted = true; }
    else if (text.includes('parroquia')) { actions.push('export_pdf:parroquias'); pdfExecuted = true; }
    else if (text.includes('sector')) { actions.push('export_pdf:sectores'); pdfExecuted = true; }
    else if (text.includes('digitel')) { actions.push('export_pdf:digitel'); pdfExecuted = true; }
    else if (text.includes('movistar')) { actions.push('export_pdf:movistar'); pdfExecuted = true; }
    else if (text.includes('movilnet')) { actions.push('export_pdf:movilnet'); pdfExecuted = true; }
    else if (text.includes('antena') || text.includes('telecom')) { actions.push('export_pdf:antenas'); pdfExecuted = true; }
    else if (text.includes('hospital')) { actions.push('export_pdf:hospitales'); pdfExecuted = true; }
    else if (text.includes('clinica') || text.includes('clínica')) { actions.push('export_pdf:clinicas'); pdfExecuted = true; }
    else if (text.includes('ambulatorio')) { actions.push('export_pdf:ambulatorios'); pdfExecuted = true; }
    else if (text.includes('cdi')) { actions.push('export_pdf:cdi'); pdfExecuted = true; }
    else if (text.includes('salud')) { actions.push('export_pdf:salud'); pdfExecuted = true; }
    else if (text.includes('electricidad') || text.includes('subestacion') || text.includes('luz')) { actions.push('export_pdf:electricidad'); pdfExecuted = true; }
    else if (text.includes('gas')) { actions.push('export_pdf:estaciongas'); pdfExecuted = true; }
    else if (text.includes('gasolinera') || text.includes('combustible') || text.includes('estacion de servicio')) { actions.push('export_pdf:estaciones_combustible'); pdfExecuted = true; }
    else if (text.includes('desalinizadora')) { actions.push('export_pdf:desalinizadoras'); pdfExecuted = true; }
    else if (text.includes('tanque')) { actions.push('export_pdf:tanques'); pdfExecuted = true; }
    else if (text.includes('pozo')) { actions.push('export_pdf:pozos'); pdfExecuted = true; }
    else if (text.includes('embalse')) { actions.push('export_pdf:embalses'); pdfExecuted = true; }
    else if (text.includes('agua')) { actions.push('export_pdf:agua'); pdfExecuted = true; }
    else if (text.includes('escuela') || text.includes('colegio')) { actions.push('export_pdf:escuelas'); pdfExecuted = true; }
    else if (text.includes('votacion') || text.includes('electoral')) { actions.push('export_pdf:centrosvotacion'); pdfExecuted = true; }
    else if (text.includes('delito') || text.includes('incidencia')) { actions.push('export_pdf:delitos'); pdfExecuted = true; }
    else if (text.includes('banda') || text.includes('grupo delictivo')) { actions.push('export_pdf:bandas'); pdfExecuted = true; }
    else if (text.includes('droga')) { actions.push('export_pdf:drogas'); pdfExecuted = true; }
    else if (text.includes('transporte') || text.includes('terminal')) { actions.push('export_pdf:transporte'); pdfExecuted = true; }
    else {
      actions.push('export_pdf:auto');
      pdfExecuted = true;
    }

    if (pdfExecuted) {
      responseText += "Generando y descargando automáticamente el Reporte PDF en formato oficial A4. ";
    }
  }

  // ── 3. ABRIR PANELES Y FICHAS SITUACIONALES POR VOZ ──────────────────────────────
  const openRegex = /(?:abrir|abre|ábreme|abreme|panel|ficha|ver|mostrar)\s+(?:el\s+)?(?:panel\s+de\s+|ficha\s+de\s+|municipio\s+|sector\s+)?(.+)/i;
  const openMatch = text.match(openRegex);
  if (openMatch && !text.includes('reporte') && !text.includes('pdf') && !text.includes('activar') && !text.includes('desactivar') && !text.includes('trazar') && !text.includes('crear')) {
    const rawTarget = openMatch[1].trim();
    if (rawTarget.length > 1 && !['todo', 'todas', '3d', 'mapa', 'calor'].includes(rawTarget)) {
      actions.push(`open_feature:${rawTarget}`);
      responseText += `Abriendo panel situacional e indicadores de "${rawTarget}". `;
    }
  }

  const municipiosMap: Record<string, string> = {
    'macanao': 'Península de Macanao',
    'peninsula de macanao': 'Península de Macanao',
    'mariño': 'Mariño',
    'marino': 'Mariño',
    'porlamar': 'Mariño',
    'maneiro': 'Maneiro',
    'pampatar': 'Maneiro',
    'arismendi': 'Arismendi',
    'la asuncion': 'Arismendi',
    'asuncion': 'Arismendi',
    'marcano': 'Marcano',
    'juan griego': 'Marcano',
    'tubores': 'Tubores',
    'punta de piedras': 'Tubores',
    'antolin': 'Antolín del Campo',
    'antolín': 'Antolín del Campo',
    'gomez': 'Gómez',
    'gómez': 'Gómez',
    'san juan': 'Díaz',
    'diaz': 'Díaz',
    'díaz': 'Díaz',
    'garcia': 'García',
    'garcía': 'García',
    'villalba': 'Villalba',
    'coche': 'Villalba'
  };

  Object.keys(municipiosMap).forEach(key => {
    if (text.includes(key) && (text.includes('abre') || text.includes('abrir') || text.includes('ver') || text.includes('panel') || text.includes('ficha'))) {
      const muniName = municipiosMap[key];
      if (!actions.some(a => a.startsWith('open_feature:'))) {
        actions.push(`open_feature:${muniName}`);
        responseText += `Abriendo panel situacional del Municipio ${muniName}. `;
      }
    }
  });

  // ── 4. ACTIVAR / DESACTIVAR CONPPAS SECTOR PESQUERO (conppas.geojson) ─────────────
  // "compas" o "conppas" activa CONPPAS (conppas.geojson)
  const isConppasCommand = (
    text.includes('conppa') || text.includes('conppas') || text.includes('conpas') || 
    text.includes('comppa') || text.includes('compas') || text.includes('compa') ||
    text.includes('pesca') || text.includes('pesquero') || text.includes('puerto pesquero') || 
    text.includes('puertos pesqueros') || text.includes('pescadores') || text.includes('52 puertos')
  ) && !text.includes('cuadrante') && !text.includes('cuadrantes');

  if (isConppasCommand) {
    if (!text.includes('reporte') && !text.includes('pdf')) {
      toggleLayer('conppas', 'CONPPAS y Sector Pesquero (conppas.geojson)');
    }
  }

  // ── 5. ACTIVAR / DESACTIVAR CUADRANTES DE PAZ (compas.geojson) ─────────────────────
  // "cuadrantes" o "cuadrantes de paz" activa Cuadrantes (compas.geojson)
  const isCuadrantesCommand = (
    text.includes('cuadrante') || text.includes('cuadrantes') || 
    text.includes('cuadrante de paz') || text.includes('cuadrantes de paz') ||
    text.includes('poligono de paz') || text.includes('polígonos de paz') ||
    text.includes('comite de paz') || text.includes('comités de paz') ||
    text.includes('patrullaje') || text.includes('cuadrantes de seguridad')
  );

  if (isCuadrantesCommand) {
    if (!text.includes('reporte') && !text.includes('pdf')) {
      actions.push(`${turnPrefix}compas`, `${turnPrefix}cuadrantesPoligonos`, `${turnPrefix}cuadrantes`);
      responseText += `${verbLabel} Cuadrantes de Paz (compas.geojson). `;
    }
  }

  // ── 6. TELECOMUNICACIONES (DIGITEL, MOVISTAR, MOVILNET, TODAS) ───────────────────
  if (text.includes('digitel')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('antenasDigitel', 'Antenas Digitel');
  }
  if (text.includes('movistar')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('antenasMovistar', 'Antenas Movistar');
  }
  if (text.includes('movilnet')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('antenasMovilnet', 'Antenas Movilnet');
  }
  if ((text.includes('antena') || text.includes('antenas') || text.includes('telecomunicacion') || text.includes('telecomunicaciones')) && !text.includes('digitel') && !text.includes('movistar') && !text.includes('movilnet')) {
    if (!text.includes('reporte') && !text.includes('pdf')) {
      actions.push(`${turnPrefix}antenasDigitel`, `${turnPrefix}antenasMovistar`, `${turnPrefix}antenasMovilnet`);
      responseText += `${verbLabel} Red Completa de Telecomunicaciones (Digitel, Movistar, Movilnet). `;
    }
  }

  // ── 7. SERVICIOS BÁSICOS (ELECTRICIDAD, GAS, AGUA, COMBUSTIBLE) ───────────────────
  if (text.includes('subestacion') || text.includes('subestaciones') || text.includes('electric') || text.includes('electricidad') || text.includes('luz')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('sistemasElectricos', 'Red y Subestaciones Eléctricas');
  }
  if (text.includes('gasoducto') || text.includes('estacion de gas') || text.includes('estaciones de gas') || (text.includes('gas') && !text.includes('gasolinera'))) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('estacionesGas', 'Estaciones de Gas y Gasoductos');
  }
  if (text.includes('gasolinera') || text.includes('gasolineras') || text.includes('estacion de servicio') || text.includes('estaciones de servicio') || text.includes('combustible')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('estaciones', 'Estaciones de Servicio de Combustible');
  }

  // SERVICIO DE AGUA COMPLETO O INDIVIDUALIZADO
  const isAguaGlobal = (text.includes('toda el agua') || text.includes('red de agua') || text.includes('servicio de agua') || (text.includes('agua') && !text.includes('desalinizadora') && !text.includes('tanque') && !text.includes('pozo') && !text.includes('tratamiento') && !text.includes('embalse') && !text.includes('dique') && !text.includes('clorado') && !text.includes('reporte') && !text.includes('pdf')));
  if (isAguaGlobal) {
    const waterLayers = ['servicioAgua.desalinizadoras', 'servicioAgua.tratamiento', 'servicioAgua.bombeoServidas', 'servicioAgua.bombeoPotable', 'servicioAgua.tanques', 'servicioAgua.diques', 'servicioAgua.pozos', 'servicioAgua.clorado', 'servicioAgua.parales', 'servicioAgua.embalses'];
    waterLayers.forEach(w => actions.push(`${turnPrefix}${w}`));
    responseText += `${verbLabel} Red Completa de Agua Potable y Servidas. `;
  } else {
    if (text.includes('desalinizadora') || text.includes('desalinizadoras')) toggleLayer('servicioAgua.desalinizadoras', 'Plantas Desalinizadoras');
    if (text.includes('tratamiento') || text.includes('planta de tratamiento')) toggleLayer('servicioAgua.tratamiento', 'Plantas de Tratamiento');
    if (text.includes('tanque') || text.includes('tanques')) toggleLayer('servicioAgua.tanques', 'Tanques de Agua');
    if (text.includes('pozo') || text.includes('pozos')) toggleLayer('servicioAgua.pozos', 'Pozos de Agua Potable');
    if (text.includes('dique') || text.includes('diques')) toggleLayer('servicioAgua.diques', 'Diques');
    if (text.includes('embalse') || text.includes('embalses')) toggleLayer('servicioAgua.embalses', 'Embalses');
    if (text.includes('clorado')) toggleLayer('servicioAgua.clorado', 'Sistemas de Clorado');
    if (text.includes('paral') || text.includes('parales')) toggleLayer('servicioAgua.parales', 'Parales de Agua');
  }

  // ── 8. RED DE SALUD Y EDUCACIÓN ───────────────────────────────────────────────────
  if (text.includes('hospital') || text.includes('hospitales')) toggleLayer('hospitales', 'Red de Hospitales');
  if (text.includes('clinica') || text.includes('clínica') || text.includes('clinicas') || text.includes('clínicas')) toggleLayer('clinicas', 'Clínicas Privadas');
  if (text.includes('ambulatorio') || text.includes('ambulatorios')) toggleLayer('ambulatorios', 'Ambulatorios y CPT');
  if (text.includes('cdi') || text.includes('dispensario')) toggleLayer('cdi', 'Centros CDI');
  if (text.includes('salud') && !text.includes('hospital') && !text.includes('clinica') && !text.includes('ambulatorio') && !text.includes('cdi') && !text.includes('reporte') && !text.includes('pdf')) {
    ['hospitales', 'clinicas', 'ambulatorios', 'cdi'].forEach(l => actions.push(`${turnPrefix}${l}`));
    responseText += `${verbLabel} Red Integrada de Salud. `;
  }
  if (text.includes('escuela') || text.includes('escuelas') || text.includes('colegio') || text.includes('educacion')) toggleLayer('escuelas', 'Centros Educativos');
  if (text.includes('votacion') || text.includes('votación') || text.includes('electoral')) toggleLayer('centrosVotacion', 'Centros de Votación');

  // ── 9. DIVISIÓN POLÍTICO TERRITORIAL ─────────────────────────────────────────────
  if (text.includes('municipio') || text.includes('municipios')) {
    if (!actions.some(a => a.startsWith('trace_municipality:')) && !actions.some(a => a.startsWith('open_feature:')) && !text.includes('reporte') && !text.includes('pdf')) {
      toggleLayer('municipios', 'Municipios');
    }
  }
  if (text.includes('parroquia') || text.includes('parroquias')) toggleLayer('parroquias', 'Parroquias');
  if (text.includes('sector') || text.includes('sectores')) {
    if (!actions.some(a => a.startsWith('open_feature:')) && !text.includes('reporte') && !text.includes('pdf')) toggleLayer('sectores', 'Sectores y Comunidades');
  }

  // ── 10. ZONAS DE RIESGO E INTELIGENCIA ───────────────────────────────────────────
  if (text.includes('delito') || text.includes('delitos') || text.includes('incidencia') || text.includes('incidencias')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('zonasDeRiesgo.delitosComunes', 'Delitos Comunes e Incidencias');
  }
  if (text.includes('cibernetica') || text.includes('cibernética') || text.includes('hacker')) toggleLayer('zonasDeRiesgo.areaCibernetica', 'Área Cibernética');
  if (text.includes('concentracion') || text.includes('concentraciones')) toggleLayer('zonasDeRiesgo.concentraciones', 'Puntos de Concentración');
  if (text.includes('droga') || text.includes('drogas') || text.includes('incautacion')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('geocalizaciones.drogas', 'Geolocalización de Drogas');
  }
  if (text.includes('actor') || text.includes('actores') || text.includes('persona de interes')) toggleLayer('geocalizaciones.actorInteres', 'Actores y Personas de Interés');
  if (text.includes('punto de interes') || text.includes('lugar de interes')) toggleLayer('geocalizaciones.puntoInteres', 'Puntos de Interés Táctico');
  if (text.includes('banda') || text.includes('bandas') || text.includes('grupo delictivo')) {
    if (!text.includes('reporte') && !text.includes('pdf')) toggleLayer('bandasDelictivas', 'Grupos Delictivos Organizados');
  }

  // ── 11. RED DE TRANSPORTE Y MOVILIDAD ───────────────────────────────────────────
  if (text.includes('transporte') || text.includes('rutas')) toggleLayer('transporteGeneral', 'Red de Transporte');
  if (text.includes('terminal') || text.includes('terminales')) toggleLayer('terminales', 'Terminales de Pasajeros');
  if (text.includes('parada') || text.includes('paradas')) toggleLayer('paradasPasajeros', 'Paradas de Pasajeros');
  if (text.includes('bus') || text.includes('buses')) toggleLayer('recorridoBusesPublicos', 'Rutas de Buses Públicos');
  if (text.includes('mototaxi') || text.includes('mototaxis')) toggleLayer('mototaxis', 'Fuerza Mototaxis');
  if (text.includes('taxi') || text.includes('taxis')) toggleLayer('taxis', 'Líneas de Taxis');

  // ── 12. HERRAMIENTAS DE TRAZADO Y MODOS DEL MAPA ────────────────────────────────
  const radioRegex = /(?:realizar|crear|trazar|hacer|pon|poner)\s+(?:un\s+)?radio\s+(?:de\s+(\d+)\s*km\s+)?(?:en|sobre|de|del|de la)\s+(.+)/i;
  const radioMatch = text.match(radioRegex);
  if (radioMatch) {
    const radiusKm = radioMatch[1] ? parseInt(radioMatch[1]) : 2;
    const placeName = radioMatch[2].trim();
    actions.push(`trace_place:buffer:${radiusKm}:${placeName}`);
    responseText += `Creando radio de cobertura de ${radiusKm} km en "${placeName}". `;
  }

  const traceRegex = /(?:trazar|traza|analizar|analiza|realizar|hacer)\s+(?:un\s+)?(?:área|area|polígono|poligono|análisis|analisis)\s+(?:en|sobre|de|del|de la)\s+(.+)/i;
  const traceMatch = text.match(traceRegex);
  if (traceMatch && !radioMatch) {
    const placeName = traceMatch[1].trim();
    actions.push(`trace_place:polygon:0:${placeName}`);
    responseText += `Trazando área y analizando vulnerabilidad en "${placeName}". `;
  }

  if (text.includes('3d') || text.includes('tres d') || text.includes('relieve')) {
    actions.push('toggle_3d');
    responseText += "Activando Perspectiva 3D. ";
  }
  if (text.includes('calor') || text.includes('heatmap')) {
    actions.push('toggle_heatmap');
    responseText += "Desplegando Mapa de Calor Táctico. ";
  }
  if (text.includes('herramienta de radio') || text.includes('buffer')) {
    actions.push('activate_buffer');
    responseText += "Activando herramienta de Radio de Cobertura. ";
  }
  if ((text.includes('trazar area') || text.includes('trazar polígono') || text.includes('herramienta de trazado')) && !radioMatch && !traceMatch) {
    actions.push('activate_polygon');
    responseText += "Iniciando herramienta de Trazado de Polígono. ";
  }

  if (actions.length === 0) {
    responseText = `Comando interpretado: "${command}". Puedes dictar: "Activar cuadrantes de paz", "Desactivar conppas", "Activar digitel", "Desactivar movistar", "Generar reporte de salud", "Abrir Macanao", "Activar todo" o "Vista 3D".`;
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
