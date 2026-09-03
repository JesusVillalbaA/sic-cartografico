import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { layersVisible, selectedFeatures, message } = body;

    // Análisis de estado de capas activas
    const activeLayersCount = countActiveLayers(layersVisible);
    const missingRecommendations = getMissingLayerRecommendations(layersVisible);
    const tacticalAdvice = getTacticalAdvice(layersVisible, selectedFeatures);

    let aiResponseText = "";

    if (message && message.trim().length > 0) {
      // Respuesta interactiva a pregunta del usuario
      aiResponseText = generateAnswerToUser(message, layersVisible, selectedFeatures);
    } else {
      // Diagnóstico general de la vista
      aiResponseText = generateGeneralDiagnostic(layersVisible, selectedFeatures, activeLayersCount);
    }

    return NextResponse.json({
      success: true,
      activeLayersCount,
      missingRecommendations,
      tacticalAdvice,
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
    diag += ` Sugerencia: Puedes hacer clic en un municipio o sector para recibir recomendaciones focalizadas.`;
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

  return `Entendido. Como consejero de geointeligencia SOGNE, te sugiero revisar las capas de infraestructura crítica y verificar si tienes algún sector o municipio seleccionado para hacer un diagnóstico detallado. ¿Deseas ayuda con alguna zona específica de Nueva Esparta?`;
}
