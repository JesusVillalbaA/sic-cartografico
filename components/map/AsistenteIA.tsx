"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Bot, X, Send, Mic, MicOff, Radio, GripVertical 
} from 'lucide-react';

import { exportLayerToPDF } from '@/app/lib/exportLayerPDF';
import { SogneVoiceController } from '@/lib/voiceRecognitionModule';
import { APP_VERSION } from '@/lib/version';

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

const isLayerActive = (layers: any, key: string): boolean => {
  if (!layers) return false;
  if (key.includes('.')) {
    const [parent, child] = key.split('.');
    return !!layers[parent]?.[child];
  }
  if (typeof layers[key] === 'boolean') return layers[key];
  if (typeof layers[key] === 'object' && layers[key] !== null) {
    return Object.values(layers[key]).some(v => !!v);
  }
  return false;
};

export const AsistenteIA: React.FC<AsistenteIAProps> = ({
  layersVisible,
  selectedFeatures = [],
  onToggle,
  theme = 'dark'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Posición Arrastrable del BOTÓN de SOGNE IA por toda la pantalla
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingBtnRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const btnOffsetRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Voice control state
  const [isListening, setIsListening] = useState(false);
  const controllerRef = useRef<SogneVoiceController | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: '¡Hola! Soy SOG. Puedes dictarme comandos por voz para encender capas, trazar áreas o consultar la cartografía.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Manejador de Arrastre (Drag & Drop) del BOTÓN SOGNE IA
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    startPosRef.current = { x: e.clientX, y: e.clientY };
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    btnOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    isDraggingBtnRef.current = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = Math.abs(moveEvent.clientX - startPosRef.current.x);
      const dy = Math.abs(moveEvent.clientY - startPosRef.current.y);
      if (dx > 4 || dy > 4) {
        isDraggingBtnRef.current = true;
        const newX = Math.max(10, Math.min(window.innerWidth - 170, moveEvent.clientX - btnOffsetRef.current.x));
        const newY = Math.max(10, Math.min(window.innerHeight - 50, moveEvent.clientY - btnOffsetRef.current.y));
        setBtnPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isDraggingBtnRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(prev => !prev);
  };

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
            } else if (actionKey.startsWith('turn_off:')) {
              const layerKey = actionKey.split(':')[1];
              if (isLayerActive(layersVisible, layerKey)) {
                onToggle(layerKey);
              }
            } else if (actionKey.startsWith('turn_on:')) {
              const layerKey = actionKey.split(':')[1];
              if (!isLayerActive(layersVisible, layerKey)) {
                onToggle(layerKey);
              }
            } else if (actionKey.startsWith('export_pdf:')) {
              const layerToExport = actionKey.split(':')[1];
              try {
                exportLayerToPDF({ layerKey: layerToExport });
              } catch (e) {
                console.warn("Error al exportar PDF individual por voz:", e);
              }
            } else if (actionKey.startsWith('trace_place:')) {
              const parts = actionKey.split(':');
              const mode = parts[1];
              const radiusKm = parseInt(parts[2]) || 2;
              const placeName = parts.slice(3).join(':');
              window.dispatchEvent(new CustomEvent('sogne_voice_trace_place', { detail: { placeName, mode, radiusKm } }));
            } else if (actionKey.startsWith('trace_municipality:')) {
              const muni = actionKey.split(':')[1];
              window.dispatchEvent(new CustomEvent('sogne_voice_trace_municipality', { detail: { municipality: muni } }));
            } else if (actionKey.startsWith('open_feature:')) {
              const featName = actionKey.split(':')[1];
              window.dispatchEvent(new CustomEvent('sogne_voice_open_feature', { detail: { name: featName } }));
            } else if (actionKey === 'open_ia_panel') {
              setIsOpen(true);
            } else if (actionKey.startsWith('toggle_') || actionKey.startsWith('activate_') || actionKey === 'clear_tools') {
              window.dispatchEvent(new CustomEvent('sogne_voice_action', { detail: { action: actionKey } }));
            } else {
              if (layersVisible && !isLayerActive(layersVisible, actionKey)) {
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

  // Inicializar SogneVoiceController para reconocimiento por voz en español
  useEffect(() => {
    const controller = new SogneVoiceController({
      lang: 'es-VE',
      onStatusChange: (listening) => {
        setIsListening(listening);
      },
      onCommandDetected: (cleanText) => {
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
      alert("El reconocimiento por voz utiliza Web Speech API (disponible en Google Chrome o Microsoft Edge). Por favor revisa los permisos de micrófono.");
      return;
    }
    if (isListening) {
      controllerRef.current.stop();
    } else {
      controllerRef.current.start();
    }
  };

  // Obtener respuesta de SOGNE IA para preguntas de chat
  const fetchAIResponse = React.useCallback(async (userMsg: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layersVisible,
          selectedFeatures,
          message: userMsg
        })
      });

      const data = await res.json();
      if (data.success && data.response) {
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
    } catch (err) {
      console.error("Error obteniendo respuesta de SOGNE IA:", err);
    } finally {
      setIsLoading(false);
    }
  }, [layersVisible, selectedFeatures]);

  // Escuchar comando de voz directo enviado desde el botón de la barra de herramientas
  useEffect(() => {
    const handleVoiceText = (e: any) => {
      if (e.detail?.text) {
        setIsOpen(true);
        handleSendVoiceCommand(e.detail.text);
      }
    };
    window.addEventListener('sogne_send_voice_text', handleVoiceText);
    return () => window.removeEventListener('sogne_send_voice_text', handleVoiceText);
  }, [handleSendVoiceCommand]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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

    fetchAIResponse(query);
  };

  return (
    <>
      {/* Botón Flotante Arrastrable de SOGNE IA */}
      <div
        ref={buttonRef}
        onMouseDown={handleButtonMouseDown}
        onClick={handleButtonClick}
        style={btnPos ? { left: `${btnPos.x}px`, top: `${btnPos.y}px`, right: 'auto' } : undefined}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-slate-900/95 hover:bg-cyan-950/95 text-cyan-400 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-xl px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 group cursor-grab active:cursor-grabbing select-none"
        title="Arrastra para mover este botón por toda la pantalla | Haz clic para abrir SOG"
      >
        <GripVertical size={14} className="text-cyan-400/50 group-hover:text-cyan-300 shrink-0" />
        <div className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 shadow-[0_0_10px_rgba(255,255,255,0.8)] shrink-0 overflow-hidden">
          <img src="/logo.png" alt="SOG Logo" className="w-full h-full object-contain" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <span className="hidden sm:inline">SOG</span>
        <span className="bg-cyan-500/20 text-cyan-300 text-[8px] px-1 py-0.5 rounded font-mono border border-cyan-400/30">
          {APP_VERSION}
        </span>
      </div>

      {/* Panel Deslizable de SOG (Anclado al Botón o en Posición Superior) */}
      {isOpen && (
        <div
          style={
            btnPos
              ? {
                  left: `${Math.max(10, Math.min(window.innerWidth - 350, btnPos.x))}px`,
                  top: `${Math.min(window.innerHeight - 450, btnPos.y + 45)}px`,
                  right: 'auto'
                }
              : undefined
          }
          className="fixed top-16 right-4 z-40 w-[310px] sm:w-[340px] h-[430px] max-h-[500px] flex flex-col rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-[0_0_35px_rgba(6,182,212,0.3)] backdrop-blur-2xl text-slate-200 animate-in fade-in slide-in-from-right-5 overflow-hidden"
        >
          
          {/* Encabezado del Panel */}
          <div className="p-3 border-b border-cyan-500/20 bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 shadow-[0_0_12px_rgba(255,255,255,0.9)] border border-cyan-400/50 shrink-0 overflow-hidden">
                <img src="/logo.png" alt="SOG Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-cyan-300 uppercase flex items-center gap-1.5">
                  SOG TÁCTICO
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[9px] text-slate-400 font-mono">Asistente por Voz & Comandos</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botón de Micrófono por Voz */}
              <button
                onClick={toggleListening}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                    : 'bg-slate-900 text-cyan-400 border-cyan-500/40 hover:bg-cyan-950'
                }`}
                title={isListening ? "Detener micrófono" : "Dictar comando por voz en español"}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                <span className="hidden sm:inline text-[9px]">{isListening ? 'Escuchando' : 'Voz'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Contenido del Panel (Solo Voz & Chat) */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-2.5 text-xs">
            
            {/* Controles de Voz Interactivos */}
            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <Radio size={12} className={isListening ? "animate-ping text-rose-400" : ""} />
                  Comandos por Voz Tácticos
                </span>
                <span className="text-[8px] font-mono text-slate-500">Web Speech</span>
              </div>
              <button
                onClick={toggleListening}
                className={`w-full py-1.5 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(225,29,72,0.5)] animate-pulse'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                <span>{isListening ? 'DETENER MICRÓFONO' : 'DICTAR COMANDO POR VOZ'}</span>
              </button>
            </div>

            {/* Preguntas Frecuentes Rápidas */}
            <div className="shrink-0 space-y-1">
              <span className="text-[9px] font-mono text-slate-500">Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Subestaciones eléctricas",
                  "Red de salud",
                  "Cambia a vista 3D",
                  "Apagar todas las capas"
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(promptText)}
                    className="text-[9px] bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 px-2 py-0.5 rounded-md transition-all cursor-pointer text-left"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Historial de Mensajes */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-2.5 rounded-xl text-[11px] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input de Mensaje */}
            <div className="pt-2 border-t border-slate-800 flex gap-1.5 shrink-0">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un comando o consulta..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputQuery.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </div>

          </div>

        </div>
      )}
    </>
  );
};
