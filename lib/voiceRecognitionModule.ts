/**
 * MÓDULO DE RECONOCIMIENTO DE VOZ Y COMANDOS TÁCTICOS - SISTEMA SOGNE
 * Tecnologías: Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * 
 * Requisitos Implementados:
 * - Modo continuo: continuous = true
 * - Normalización de texto: toLowerCase() + trim()
 * - Coincidencia tolerante (Fuzzy / Keyword Matching & RegExp)
 * - Reinicio automático y resistencia a fallos
 * - Mapeo de acciones tácticas
 */

export interface VoiceRule {
  intent: string;
  keywords: (string | RegExp)[];
  actionKey: string;
  description: string;
}

export class SogneVoiceController {
  private recognition: any = null;
  public isListening: boolean = false;
  private shouldKeepAlive: boolean = false;
  private rules: VoiceRule[] = [];
  private onCommandDetected?: (text: string, rule?: VoiceRule) => void;
  private onStatusChange?: (isListening: boolean, error?: string) => void;

  constructor(options?: {
    lang?: string;
    onCommandDetected?: (text: string, rule?: VoiceRule) => void;
    onStatusChange?: (isListening: boolean, error?: string) => void;
  }) {
    this.onCommandDetected = options?.onCommandDetected;
    this.onStatusChange = options?.onStatusChange;

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        // Requisito 1: Captura de audio continua
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = options?.lang || 'es-VE';

        this.initDefaultRules();
        this.bindEvents();
      } else {
        console.warn("Navegador no compatible con Web Speech API (SpeechRecognition).");
      }
    }
  }

  /**
   * Mapeo de reglas por defecto con coincidencia tolerante (Fuzzy/Keywords)
   */
  private initDefaultRules() {
    this.rules = [
      {
        intent: 'abrir_asistente',
        keywords: ['abrir panel', 'abrir ia', 'abrir asistente', 'sogne ia', 'abrir menu', /abrir\s*(panel|ia|asistente)/i],
        actionKey: 'open_ia_panel',
        description: 'Abre el panel flotante de SOGNE IA'
      },
      {
        intent: 'trazar_area',
        keywords: ['trazar area', 'trazar área', 'trazar poligono', 'trazar polígono', 'dibujar area', 'dibujar zona', 'trazar sector', /trazar\s*([aá]rea|pol[ií]gono|sector)/i],
        actionKey: 'activate_polygon',
        description: 'Activa la herramienta manual para trazar un área'
      },
      {
        intent: 'crear_radio',
        keywords: ['crear radio', 'radio de cobertura', 'crear buffer', 'activar radio', 'radio cobertura', /radio\s*(cobertura|buffer)/i],
        actionKey: 'activate_buffer',
        description: 'Activa el círculo o radio de cobertura'
      },
      {
        intent: 'limpiar_mapa',
        keywords: ['limpiar mapa', 'limpiar todo', 'borrar trazado', 'resetear mapa', 'limpiar herramientas', /limpiar\s*(mapa|todo|trazado)/i],
        actionKey: 'clear_tools',
        description: 'Limpia todos los polígonos, radios y trazos del mapa'
      },
      {
        intent: 'activar_salud',
        keywords: ['salud', 'hospitales', 'cdi', 'ambulatorios', 'capa salud', /activar\s*salud/i],
        actionKey: 'salud',
        description: 'Activa la capa de salud'
      },
      {
        intent: 'activar_electricidad',
        keywords: ['electricidad', 'subestaciones', 'corpoelec', 'capa electricidad', /activar\s*electricidad/i],
        actionKey: 'sistemas-electricos',
        description: 'Activa la capa eléctrica'
      },
      {
        intent: 'activar_cuadrantes',
        keywords: ['cuadrantes', 'cuadrantes de paz', 'policia', 'seguridad', /activar\s*cuadrantes/i],
        actionKey: 'cuadrantes',
        description: 'Activa la capa de Cuadrantes de Paz'
      },
      {
        intent: 'activar_telecom',
        keywords: ['telecomunicaciones', 'antenas', 'digitel', 'movistar', 'movilnet', /activar\s*telecom/i],
        actionKey: 'antenas',
        description: 'Activa la capa de telecomunicaciones'
      },
      {
        intent: 'activar_agua',
        keywords: ['agua', 'embalses', 'pozos', 'red hidrica', /activar\s*agua/i],
        actionKey: 'agua',
        description: 'Activa la capa de red hídrica'
      },
      {
        intent: 'activar_gas',
        keywords: ['gas', 'estaciones de gas', 'combustible', /activar\s*gas/i],
        actionKey: 'gas',
        description: 'Activa la capa de estaciones de gas'
      },
      {
        intent: 'activar_modulo_1',
        keywords: ['modulo 1', 'módulo 1', 'modulo uno', 'módulo uno', /m[oó]dulo\s*(1|uno)/i],
        actionKey: 'module_1',
        description: 'Activa Mapeo de Infraestructura Básica'
      },
      {
        intent: 'activar_modulo_2',
        keywords: ['modulo 2', 'módulo 2', 'modulo dos', 'módulo dos', /m[oó]dulo\s*(2|dos)/i],
        actionKey: 'module_2',
        description: 'Activa Red Asistencial de Salud'
      },
      {
        intent: 'activar_modulo_3',
        keywords: ['modulo 3', 'módulo 3', 'modulo tres', 'módulo tres', /m[oó]dulo\s*(3|tres)/i],
        actionKey: 'module_3',
        description: 'Activa Seguridad Ciudadana y Cuadrantes'
      },
      {
        intent: 'activar_modulo_4',
        keywords: ['modulo 4', 'módulo 4', 'modulo cuatro', 'módulo cuatro', /m[oó]dulo\s*(4|cuatro)/i],
        actionKey: 'module_4',
        description: 'Activa Red de Telecomunicaciones'
      },
      {
        intent: 'mapa_calor',
        keywords: ['calor', 'heatmap', 'incidencias', 'mapa de calor', /mapa\s*de\s*calor/i],
        actionKey: 'toggle_heatmap',
        description: 'Despliega mapa de calor'
      }
    ];
  }

  /**
   * Configuración de eventos de la Web Speech API con auto-reinicio y estabilidad
   */
  private bindEvents() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChange?.(true);
    };

    this.recognition.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const rawText = event.results[lastIndex][0]?.transcript || '';

      // Requisito 2: Normalización y limpieza del texto
      const cleanText = rawText.toLowerCase().trim();

      if (cleanText) {
        console.log(`[Voz Transcrita]: "${cleanText}"`);
        
        // Requisito 3 & 4: Coincidencia tolerante y ejecución de la acción
        const matchedRule = this.matchRule(cleanText);
        this.onCommandDetected?.(cleanText, matchedRule);
      }
    };

    // Requisito 5: Estabilidad y manejo de errores
    this.recognition.onerror = (event: any) => {
      console.warn("Error en captura por voz:", event.error);
      this.onStatusChange?.(this.isListening, event.error);
    };

    // Reinicio automático continuo si se detiene sin que el usuario lo apague
    this.recognition.onend = () => {
      if (this.shouldKeepAlive) {
        setTimeout(() => {
          if (this.shouldKeepAlive) {
            try {
              this.recognition.start();
            } catch (e) {
              console.warn("Intento de reinicio automático fallido:", e);
            }
          }
        }, 300);
      } else {
        this.isListening = false;
        this.onStatusChange?.(false);
      }
    };
  }

  /**
   * Coincidencia tolerante utilizando keywords (.includes) o expresiones regulares (RegExp)
   */
  public matchRule(cleanText: string): VoiceRule | undefined {
    return this.rules.find(rule => {
      return rule.keywords.some(keyword => {
        if (typeof keyword === 'string') {
          return cleanText.includes(keyword);
        } else if (keyword instanceof RegExp) {
          return keyword.test(cleanText);
        }
        return false;
      });
    });
  }

  /**
   * Iniciar la escucha continua
   */
  public start() {
    if (!this.recognition) return;
    this.shouldKeepAlive = true;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Micrófono ya activo.");
    }
  }

  /**
   * Detener la escucha por voz
   */
  public stop() {
    this.shouldKeepAlive = false;
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.onStatusChange?.(false);
  }
}
