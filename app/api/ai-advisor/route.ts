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
    shapeType = 'Polígono Trazado'
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

  if (electricoCount > 0) {
    vulnerabilities.push(`Contiene ${electricoCount} nodo(s) de la red eléctrica. Un evento adverso en esta zona impactaría el suministro regional.`);
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
    recommendations.push(`Incrementar patrullaje del Cuadrante de Paz con frecuencia de recorrido cada 45 minutos.`);
  }

  if (vulnerabilities.length === 0) {
    vulnerabilities.push("Área de baja densidad de infraestructura crítica sin incidentes graves reportados.");
    recommendations.push("Mantener patrullaje de rutina e inspección visual periódica del perímetro.");
  }

  const summaryText = `La zona delimitada (${areaKm2.toFixed(2)} km²) contiene un total de ${totalCriticalAssets} infraestructura(s) crítica(s) y ${incidentesCount} punto(s) de atención de seguridad. El nivel de vulnerabilidad evaluado es ${riskLevel} (${score}/100).`;

  return {
    riskLevel,
    riskScore: score,
    badgeColor,
    shapeType,
    areaKm2: Number(areaKm2.toFixed(2)),
    totalCriticalAssets,
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

  // ── MÓDULOS DEL SISTEMA Y CAPAS GENERALES ─────────────────────────────────────
  if (text.includes('activar todos los modulos') || text.includes('activar todos los módulos') || text.includes('activar todas las capas') || text.includes('encender todo') || text.includes('activar todo')) {
    actions.push('turn_on_all');
    responseText += "Activando TODOS los módulos e infraestructuras del mapa. ";
  }

  if (text.includes('modulo 1') || text.includes('módulo 1') || text.includes('modulo uno') || text.includes('módulo uno') || text.includes('primer modulo') || text.includes('primer módulo')) {
    actions.push('sistemasElectricos', 'servicioAgua.embalses', 'servicioAgua.desalinizadoras', 'servicioAgua.tanques', 'estacionesGas', 'estacionesServicio');
    responseText += "Activando MÓDULO 1: Infraestructura y Servicios Críticos (Electricidad, Agua, Gas). ";
  }

  if (text.includes('modulo 2') || text.includes('módulo 2') || text.includes('modulo dos') || text.includes('módulo dos') || text.includes('segundo modulo') || text.includes('segundo módulo')) {
    actions.push('hospitales', 'cdi', 'ambulatorios', 'clinicas');
    responseText += "Activando MÓDULO 2: Red Asistencial de Salud (Hospitales, Clínicas, CDI, Ambulatorios). ";
  }

  if (text.includes('modulo 3') || text.includes('módulo 3') || text.includes('modulo tres') || text.includes('módulo tres') || text.includes('tercer modulo') || text.includes('tercer módulo')) {
    actions.push('cuadrantesPoligonos', 'cuadrantes', 'incidencias', 'delitosComunes');
    responseText += "Activando MÓDULO 3: Seguridad Ciudadana y Cuadrantes de Paz. ";
  }

  if (text.includes('modulo 4') || text.includes('módulo 4') || text.includes('modulo cuatro') || text.includes('módulo cuatro') || text.includes('cuarto modulo') || text.includes('cuarto módulo')) {
    actions.push('antenasDigitel', 'antenasMovistar', 'antenasMovilnet');
    responseText += "Activando MÓDULO 4: Red de Telecomunicaciones (Digitel, Movistar, Movilnet). ";
  }

  if (text.includes('desactivar todo') || text.includes('apagar todo') || text.includes('quitar todo') || text.includes('desactiva todo') || text.includes('limpiar todo') || text.includes('borrar todo')) {
    actions.push('turn_off_all', 'clear_tools');
    responseText += "Desactivando todas las capas e infraestructura del mapa. ";
  }

  // ── TRAZADO DE MUNICIPIOS Y SECTORES POR VOZ ──────────────────────────────
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
    if (text.includes(key) && (text.includes('trazar') || text.includes('área') || text.includes('area') || text.includes('municipio') || text.includes('analiz') || text.includes('sector'))) {
      const muniName = municipiosMap[key];
      actions.push(`trace_municipality:${muniName}`);
      responseText += `Delimitando y analizando automáticamente el Municipio ${muniName}. `;
    }
  });

  // Capas de Infraestructura y Seguridad individuales
  if (text.includes('subestación') || text.includes('subestaciones') || text.includes('eléctric') || text.includes('luz')) {
    if (!actions.includes('sistemasElectricos')) actions.push('sistemasElectricos');
    responseText += "Habilitando Red de Sistemas Eléctricos. ";
  }
  if (text.includes('antena') || text.includes('comunicación') || text.includes('telefonía') || text.includes('celular')) {
    if (!actions.includes('antenasDigitel')) actions.push('antenasDigitel', 'antenasMovistar', 'antenasMovilnet');
    responseText += "Activando antenas de telecomunicaciones (Digitel, Movistar, Movilnet). ";
  }
  if (text.includes('salud') || text.includes('hospital') || text.includes('cdi') || text.includes('clínica') || text.includes('médic')) {
    if (!actions.includes('hospitales')) actions.push('hospitales', 'cdi', 'ambulatorios', 'clinicas');
    responseText += "Desplegando Red de Salud Asistencial. ";
  }
  if (text.includes('cuadrante') || text.includes('cuadrantes') || text.includes('patrulla')) {
    if (!actions.includes('cuadrantesPoligonos')) actions.push('cuadrantesPoligonos', 'cuadrantes');
    responseText += "Mostrando Cuadrantes de Paz. ";
  }
  if (text.includes('agua') || text.includes('embalse') || text.includes('pozo') || text.includes('desalinizadora')) {
    actions.push('servicioAgua.embalses', 'servicioAgua.desalinizadoras', 'servicioAgua.tanques');
    responseText += "Cargando Red e Infraestructura de Agua. ";
  }
  if (text.includes('gas') || text.includes('combustible') || text.includes('gasolinera')) {
    actions.push('estacionesGas', 'estacionesServicio');
    responseText += "Mostrando Estaciones de Gas y Combustible. ";
  }
  if (text.includes('escuela') || text.includes('colegio') || text.includes('educación')) {
    actions.push('escuelas');
    responseText += "Habilitando Centros Educativos. ";
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
  if ((text.includes('trazar') || text.includes('área') || text.includes('zona') || text.includes('polígono')) && !actions.some(a => a.startsWith('trace_municipality:'))) {
    actions.push('activate_polygon');
    responseText += "Iniciando herramienta de Trazado de Área. ";
  }
  if (text.includes('limpiar') || text.includes('reset') || text.includes('borrar')) {
    actions.push('clear_tools');
    responseText += "Limpiando herramientas y filtros del mapa. ";
  }

  if (actions.length === 0) {
    responseText = `Comando interpretado: "${command}". Puedes dictar: "Activar Módulo 1", "Activar Módulo 2", "Activar Módulo 3", "Activar Módulo 4", "Desactivar todo", "Cambia a vista 3D" o "Traza un radio de cobertura".`;
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
  let diag = `Analizador SOGNE IA activo. Tienes ${activeCount} capa(s) habilitadas en el mapa actual.`;
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
