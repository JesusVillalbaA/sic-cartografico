"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Bot, X, RefreshCw, Send, CheckCircle2, 
  AlertTriangle, Lightbulb, PlusCircle, Layers, ChevronRight, MessageSquare, Zap,
  Mic, MicOff, ShieldAlert, Activity, FileCheck, Radio, Check
} from 'lucide-react';

import { exportLayerToPDF } from '@/app/lib/exportLayerPDF';
import { SogneVoiceController, VoiceRule } from '@/lib/voiceRecognitionModule';

interface AsistenteIAProps {
  layersVisible: any;
  selectedFeatures?: any[];
  onToggle: (layerKey: string) => void;
  theme?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AsistenteIA: React.FC<AsistenteIAProps> = ({
  layersVisible,
  selectedFeatures = [],
  onToggle,
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'chat' | 'risk'>('diagnostic');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [riskReportData, setRiskReportData] = useState<any>(null);
  
  // Voice control state
  const [isListening, setIsListening] = useState(false);
  const controllerRef = useRef<SogneVoiceController | null>(null);
  const recognitionRef = useRef<any>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy SOGNE IA, tu consejero de geointeligencia. Puedes dictarme comandos por voz (ej: "Muéstrame las subestaciones de Maneiro y traza un radio de 3 km"), preguntarme sobre la cartografía o solicitar una Evaluación de Riesgo Espacial.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Procesar comandos de voz y ejecutar acciones en el mapa
  const handleSendVoiceCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: `🎙️ "${commandText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceCommand: commandText,
          layersVisible,
          selectedFeatures
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.voiceActions && data.voiceActions.length > 0) {
          data.voiceActions.forEach((actionKey: string) => {
            if (actionKey === 'turn_off_all') {
              if (layersVisible) {
                Object.keys(layersVisible).forEach(k => {
                  if (typeof layersVisible[k] === 'boolean' && layersVisible[k]) {
                    onToggle(k);
                  } else if (typeof layersVisible[k] === 'object' && layersVisible[k] !== null) {
                    Object.keys(layersVisible[k]).forEach(subK => {
                      if (layersVisible[k][subK]) onToggle(`${k}.${subK}`);
                    });
                  }
                });
              }
            } else if (actionKey === 'turn_on_all') {
              if (layersVisible) {
                Object.keys(layersVisible).forEach(k => {
                  if (typeof layersVisible[k] === 'boolean' && !layersVisible[k]) {
                    onToggle(k);
                  } else if (typeof layersVisible[k] === 'object' && layersVisible[k] !== null) {
                    Object.keys(layersVisible[k]).forEach(subK => {
                      if (!layersVisible[k][subK]) onToggle(`${k}.${subK}`);
                    });
                  }
                });
              }
            } else if (actionKey.startsWith('export_pdf:')) {
              const layerToExport = actionKey.split(':')[1];
              try {
                exportLayerToPDF({ layerKey: layerToExport });
              } catch (e) {
                console.warn("Error al exportar PDF individual por voz:", e);
              }
            } else if (actionKey.startsWith('trace_municipality:')) {
              const muni = actionKey.split(':')[1];
              window.dispatchEvent(new CustomEvent('sogne_voice_trace_municipality', { detail: { municipality: muni } }));
            } else if (actionKey.startsWith('toggle_') || actionKey.startsWith('activate_') || actionKey === 'clear_tools') {
              window.dispatchEvent(new CustomEvent('sogne_voice_action', { detail: { action: actionKey } }));
            } else {
              if (layersVisible && !layersVisible[actionKey]) {
                onToggle(actionKey);
              }
            }
          });
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.response || `Comando ejecutado con éxito: "${commandText}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("Error procesando comando por voz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar SogneVoiceController para reconocimiento por voz en español (Modo Continuo y Tolerante)
  useEffect(() => {
    const controller = new SogneVoiceController({
      lang: 'es-VE',
      onStatusChange: (listening) => {
        setIsListening(listening);
      },
      onCommandDetected: (cleanText, matchedRule) => {
        if (cleanText) {
          handleSendVoiceCommand(cleanText);
        }
      }
    });

    controllerRef.current = controller;

    return () => {
      controller.stop();
    };
  }, [handleSendVoiceCommand]);

  const toggleListening = () => {
    if (!controllerRef.current) {
      alert("El reconocimiento por voz utiliza la API Web Speech. Por favor, asegúrate de otorgar permisos de micrófono en Google Chrome o Microsoft Edge.");
      return;
    }
    if (isListening) {
      controllerRef.current.stop();
    } else {
      controllerRef.current.start();
    }
  };

  const fetchRiskAssessment = React.useCallback(async (spatialPayload: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spatialPayload })
      });
      const data = await res.json();
      if (data.success) {
        setRiskReportData(data.riskReport);
      }
    } catch (e) {
      console.error("Error evaluando riesgo espacial:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar diagnóstico cuando cambian capas o características seleccionadas
  const fetchDiagnostic = React.useCallback(async (userMsg?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layersVisible,
          selectedFeatures,
          message: userMsg || ''
        })
      });

      const data = await res.json();
      if (data.success) {
        setDiagnosticData(data);

        if (userMsg) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'ai',
              text: data.response,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      }
    } catch (err) {
      console.error("Error obteniendo recomendación de SOGNE IA:", err);
    } finally {
      setIsLoading(false);
    }
  }, [layersVisible, selectedFeatures]);

  // Escuchar eventos globales para abrir evaluación de riesgo desde el mapa
  useEffect(() => {
    const handleRiskEvent = (e: any) => {
      if (e.detail?.spatialPayload) {
        setIsOpen(true);
        setActiveTab('risk');
        fetchRiskAssessment(e.detail.spatialPayload);
      }
    };
    window.addEventListener('sogne_open_risk_analysis', handleRiskEvent);
    return () => window.removeEventListener('sogne_open_risk_analysis', handleRiskEvent);
  }, [fetchRiskAssessment]);

  // Escuchar comando de voz directo enviado desde el botón de la barra de herramientas
  useEffect(() => {
    const handleVoiceText = (e: any) => {
      if (e.detail?.text) {
        setIsOpen(true);
        setActiveTab('chat');
        handleSendVoiceCommand(e.detail.text);
      }
    };
    window.addEventListener('sogne_send_voice_text', handleVoiceText);
    return () => window.removeEventListener('sogne_send_voice_text', handleVoiceText);
  }, [handleSendVoiceCommand]);

  useEffect(() => {
    if (isOpen && activeTab === 'diagnostic') {
      fetchDiagnostic();
    }
  }, [isOpen, activeTab, layersVisible, selectedFeatures]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');

    fetchDiagnostic(query);
  };

  const selectedName = selectedFeatures.length > 0
    ? (selectedFeatures[0]?.properties?.nombre || selectedFeatures[0]?.properties?.NAME || selectedFeatures[0]?.properties?.adm2_name || selectedFeatures[0]?.properties?.cuadrante)
    : null;

  return (
    <>
      {/* Botón Flotante para abrir la Mini IA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/95 hover:bg-cyan-950/95 text-cyan-400 border border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] backdrop-blur-xl px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 group cursor-pointer"
        title="Abrir Asistente Táctico SOGNE IA"
      >
        <div className="relative">
          <Sparkles size={16} className="text-cyan-400 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <span className="hidden sm:inline">SOGNE IA</span>
        <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-cyan-400/30">
          VOZ & RIESGO
        </span>
      </button>

      {/* Panel Deslizable de SOGNE IA */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-40 w-[420px] max-w-[calc(100vw-2rem)] h-[calc(100vh-5rem)] max-h-[680px] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-[0_0_45px_rgba(6,182,212,0.3)] backdrop-blur-2xl text-slate-200 animate-in fade-in slide-in-from-right-5 overflow-hidden">
          
          {/* Encabezado del Panel */}
          <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                  SOGNE IA TÁCTICO
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Consejero por Voz & Riesgo Espacial</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botón de Micrófono por Voz */}
              <button
                onClick={toggleListening}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.6)]'
                    : 'bg-slate-900 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950'
                }`}
                title={isListening ? "Detener micrófono" : "Dictar comando por voz en español"}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                <span className="hidden sm:inline">{isListening ? 'Escuchando...' : 'Voz'}</span>
              </button>

              <button
                onClick={() => fetchDiagnostic()}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Actualizar diagnóstico"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Pestañas de Navegación */}
          <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'diagnostic'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lightbulb size={13} />
              <span>Diagnóstico</span>
            </button>

            <button
              onClick={() => setActiveTab('risk')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'risk'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert size={13} className="text-amber-400" />
              <span>Riesgo Espacial</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={13} />
              <span>Voz & Chat</span>
            </button>
          </div>

          {/* Contenido del Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            
            {/* 📋 PESTAÑA: EVALUACIÓN DE RIESGO ESPACIAL POR IA */}
            {activeTab === 'risk' && (
              <div className="space-y-4">
                {riskReportData ? (
                  <>
                    {/* Header del Riesgo */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      riskReportData.riskLevel === 'CRÍTICO' ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' :
                      riskReportData.riskLevel === 'ALTO' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' :
                      riskReportData.riskLevel === 'MEDIO' ? 'bg-sky-950/40 border-sky-500/40 text-sky-300' :
                      'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    }`}>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest block opacity-80">Evaluación Táctica de Riesgo:</span>
                        <h4 className="text-lg font-black tracking-wider uppercase flex items-center gap-2">
                          {riskReportData.riskLevel}
                          <span className="text-xs font-mono font-normal">({riskReportData.riskScore}/100)</span>
                        </h4>
                        <span className="text-[10px] text-slate-300">{riskReportData.shapeType} • {riskReportData.areaKm2} km²</span>
                      </div>
                      <ShieldAlert size={36} className="opacity-90 shrink-0" />
                    </div>

                    {/* Resumen Cuantitativo de Activos Contenidos */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                        📊 Infraestructuras Identificadas ({riskReportData.totalCriticalAssets} totales):
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-cyan-400 font-bold text-sm">{riskReportData.breakdown.electrico}</span>
                          <span className="text-slate-400">Eléctrico</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-emerald-400 font-bold text-sm">{riskReportData.breakdown.salud}</span>
                          <span className="text-slate-400">Salud</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-sky-400 font-bold text-sm">{riskReportData.breakdown.antenas}</span>
                          <span className="text-slate-400">Antenas</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-purple-400 font-bold text-sm">{riskReportData.breakdown.gas}</span>
                          <span className="text-slate-400">Gas</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-blue-400 font-bold text-sm">{riskReportData.breakdown.agua}</span>
                          <span className="text-slate-400">Agua</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          <span className="block text-rose-400 font-bold text-sm">{riskReportData.breakdown.incidentes}</span>
                          <span className="text-slate-400">Incidentes</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumen Táctico de IA */}
                    <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 space-y-1 leading-relaxed">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono block">Diagnóstico Ejecutivo IA:</span>
                      <p className="text-slate-200 text-[11px]">{riskReportData.summaryText}</p>
                    </div>

                    {/* Vulnerabilidades Detectadas */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Puntos de Vulnerabilidad Crítica
                      </span>
                      <div className="space-y-1.5">
                        {riskReportData.vulnerabilities.map((v: string, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-900/90 border border-rose-500/30 rounded-xl text-slate-300 text-[11px] flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recomendaciones Operativas */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                        <FileCheck size={14} />
                        Recomendaciones de Despliegue Táctico
                      </span>
                      <div className="space-y-1.5">
                        {riskReportData.recommendations.map((r: string, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-slate-300 text-[11px] flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400">
                    <ShieldAlert size={32} className="mx-auto text-amber-400 opacity-60 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-slate-200 text-xs">Sin Evaluación de Riesgo Activa</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Utiliza el botón <strong>TRAZAR ÁREA</strong> o <strong>RADIO COBERTURA</strong> en el mapa y presiona <strong>EVALUAR RIESGO IA</strong> para generar un análisis cuantitativo de vulnerabilidad.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'diagnostic' && (
              <>
                {/* Banner de Entidad Seleccionada si aplica */}
                {selectedName && (
                  <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 flex items-center gap-3">
                    <Zap size={16} className="text-cyan-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="text-[10px] text-cyan-400 font-mono block uppercase tracking-wider">Foco Seleccionado:</span>
                      <span className="font-bold text-slate-100">{selectedName}</span>
                    </div>
                  </div>
                )}

                {/* 1. ¿Qué capas / datos faltan? */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      ¿Qué Capas / Datos te Faltan?
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal">Sugerencias inteligentes</span>
                  </div>

                  <div className="space-y-2">
                    {diagnosticData?.missingRecommendations?.map((rec: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="p-3 bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all flex flex-col gap-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                            <Layers size={13} className="text-amber-400" />
                            {rec.label}
                          </span>
                          <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono uppercase">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{rec.reason}</p>
                        
                        <button
                          onClick={() => onToggle(rec.id)}
                          className="self-start mt-1 flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          <PlusCircle size={12} />
                          <span>Activar esta capa ahora</span>
                        </button>
                      </div>
                    ))}

                    {(!diagnosticData?.missingRecommendations || diagnosticData?.missingRecommendations.length === 0) && (
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
                        <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-1" />
                        ¡Excelente configuración de capas activa! Tienes los datos clave visibles.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Consejos Tácticos de Geointeligencia */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    Consejos & Recomendaciones Operativas
                  </div>

                  <div className="space-y-2">
                    {diagnosticData?.tacticalAdvice?.map((tip: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
                        <h4 className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
                          <ChevronRight size={12} className="text-cyan-400" />
                          {tip.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Sugerencias de Próximos Pasos */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono block">
                    ⚡ Próximos Pasos Recomendados:
                  </span>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>Exportar Reporte Situacional en PDF desde el Menú de Herramientas.</li>
                    <li>Utilizar el Medidor de Distancia (Regla Táctica) entre incidentes y hospitales.</li>
                    <li>Generar Zona de Influencia (Buffer) alrededor de infraestructuras clave.</li>
                  </ul>
                </div>
              </>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3">
                {/* Controles de Voz Interactivos */}
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Radio size={13} className={isListening ? "animate-ping text-rose-400" : ""} />
                      Comandos por Voz Tácticos
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">Web Speech API</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Presiona el botón de voz para dictar comandos como: <em>"Muéstrame las subestaciones de Maneiro"</em> o <em>"Cambia a vista 3D"</em>.
                  </p>
                  <button
                    onClick={toggleListening}
                    className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    <span>{isListening ? 'DETENER MICRÓFONO' : 'DICTAR COMANDO POR VOZ'}</span>
                  </button>
                </div>

                {/* Preguntas Frecuentes Rápidas */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Preguntas sugeridas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Muéstrame las subestaciones eléctricas",
                      "Activa la red de salud",
                      "Cambia a vista 3D",
                      "¿Qué cuadrantes revisar primero?"
                    ].map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(promptText)}
                        className="text-[10px] bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Historial de Mensajes */}
                <div className="flex-1 space-y-2.5 min-h-[220px]">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">{m.timestamp}</span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input de Mensaje */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Hazle una consulta a SOGNE IA..."
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputQuery.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
};
