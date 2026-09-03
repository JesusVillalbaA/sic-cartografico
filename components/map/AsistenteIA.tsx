"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Bot, X, RefreshCw, Send, CheckCircle2, 
  AlertTriangle, Lightbulb, PlusCircle, Layers, ChevronRight, MessageSquare, Zap 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'chat'>('diagnostic');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy SOGNE IA, tu asistente de geointeligencia táctica. Puedo recomendarte qué capas te faltan por activar, darte consejos de análisis situacional o responder tus dudas sobre el mapa.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Cargar diagnóstico cuando cambian capas o características seleccionadas
  const fetchDiagnostic = async (userMsg?: string) => {
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
  };

  useEffect(() => {
    if (isOpen) {
      fetchDiagnostic();
    }
  }, [isOpen, layersVisible, selectedFeatures]);

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
        className="fixed top-4 right-20 z-40 flex items-center gap-2 bg-slate-900/90 hover:bg-cyan-950/90 text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 group cursor-pointer"
        title="Abrir Asistente Táctico SOGNE IA"
      >
        <div className="relative">
          <Sparkles size={16} className="text-cyan-400 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <span className="hidden sm:inline">SOGNE IA</span>
        <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-cyan-400/30">
          CONSEJERO
        </span>
      </button>

      {/* Drawer / Panel Deslizable de la Mini IA */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] h-[calc(100vh-5rem)] max-h-[640px] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-2xl text-slate-200 animate-in fade-in slide-in-from-right-5 overflow-hidden">
          
          {/* Encabezado del Panel */}
          <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase flex items-center gap-2">
                  SOGNE IA
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Consejero de Geointeligencia</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchDiagnostic()}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Actualizar análisis"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
              <span>Diagnóstico & Consejos</span>
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
              <span>Preguntar a la IA</span>
            </button>
          </div>

          {/* Contenido del Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            
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
                {/* Preguntas Frecuentes Rápidas */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">Preguntas sugeridas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "¿Qué capas me falta activar?",
                      "¿Qué hacer si falla la red eléctrica?",
                      "¿Cómo exportar el informe PDF?",
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
