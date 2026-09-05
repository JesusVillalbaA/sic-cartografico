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
        intent: 'activar_modulo_1',
        keywords: ['modulo 1', 'módulo 1', 'modulo uno', 'módulo uno', 'primer modulo', 'primer módulo', /m[oó]dulo\s*(1|uno)/i],
        actionKey: 'module_1',
        description: 'Activa Mapeo de Infraestructura Básica (Electricidad, Agua, Gas)'
      },
      {
        intent: 'activar_modulo_2',
        keywords: ['modulo 2', 'módulo 2', 'modulo dos', 'módulo dos', 'segundo modulo', 'segundo módulo', /m[oó]dulo\s*(2|dos)/i],
        actionKey: 'module_2',
        description: 'Activa Red Asistencial de Salud (Hospitales, CDI, Clínicas)'
      },
      {
        intent: 'activar_modulo_3',
        keywords: ['modulo 3', 'módulo 3', 'modulo tres', 'módulo tres', 'tercer modulo', 'tercer módulo', /m[oó]dulo\s*(3|tres)/i],
        actionKey: 'module_3',
        description: 'Activa Seguridad Ciudadana y Cuadrantes de Paz'
      },
      {
        intent: 'activar_modulo_4',
        keywords: ['modulo 4', 'módulo 4', 'modulo cuatro', 'módulo cuatro', 'cuarto modulo', 'cuarto módulo', /m[oó]dulo\s*(4|cuatro)/i],
        actionKey: 'module_4',
        description: 'Activa Red de Telecomunicaciones (Digitel, Movistar, Movilnet)'
      },
      {
        intent: 'desactivar_todo',
        keywords: ['desactivar todo', 'apagar todo', 'quitar todo', 'desactiva todo', 'limpiar todo', 'borrar todo', /desactiv(ar|a)\s*todo/i],
        actionKey: 'turn_off_all',
        description: 'Apaga todas las capas del mapa'
      },
      {
        intent: 'vista_3d',
        keywords: ['3d', 'tres d', 'edificios', 'relieve', /vista\s*3d/i],
        actionKey: 'toggle_3d',
        description: 'Cambia a modo tridimensional'
      },
      {
        intent: 'mapa_calor',
        keywords: ['calor', 'heatmap', 'incidencias', 'mapa de calor', /mapa\s*de\s*calor/i],
        actionKey: 'toggle_heatmap',
        description: 'Despliega mapa de calor táctico'
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
