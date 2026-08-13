"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../map/supabaseClient';
import { X, ShieldAlert, Key, Clock, Copy, Check, Users, AlertTriangle } from 'lucide-react';

interface ModalGenerarCodigoProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalGenerarCodigo: React.FC<ModalGenerarCodigoProps> = ({ isOpen, onClose }) => {
  // Simulación del Despachador logueado
  const [despachadores, setDespachadores] = useState<any[]>([]);
  const [idDespachadorLogueado, setIdDespachadorLogueado] = useState<string>('');

  // Redes asignados a este despachador
  const [redesAsignados, setRedesAsignados] = useState<any[]>([]);
  const [idRedesSeleccionado, setIdRedesSeleccionado] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [tokenGenerado, setTokenGenerado] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // 1. Cargar Despachadores (Simulando sesión actual)
  useEffect(() => {
    if (!isOpen) return;
    const fetchDespachadores = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios_maestra')
          .select('id_usuario, nombre_completo, cargo, rol')
          .neq('rol', 'REDES'); // Traer los que NO son REDES (Central, Despachadores)
          
        if (!error && data) {
          setDespachadores(data);
        }
      } catch (err) {
        console.error("Error al cargar despachadores:", err);
      }
    };
    fetchDespachadores();
  }, [isOpen]);

  // 2. Cargar REDES asignados al despachador seleccionado
  useEffect(() => {
    if (!idDespachadorLogueado) {
      setRedesAsignados([]);
      setIdRedesSeleccionado('');
      return;
    }
    const fetchRedes = async () => {
      try {
        // Query a asignacion_redes_central haciendo join manual
        const { data: asignaciones, error: errorAsig } = await supabase
          .from('asignacion_redes_central')
          .select('id_usuario_redes')
          .eq('id_central_jefe', idDespachadorLogueado);

        if (errorAsig) throw errorAsig;

        if (asignaciones && asignaciones.length > 0) {
          const ids = asignaciones.map((a: any) => a.id_usuario_redes);
          const { data: usuariosRedes, error: errorUsr } = await supabase
            .from('usuarios_maestra')
            .select('id_usuario, nombre_completo, cedula')
            .in('id_usuario', ids);

          if (!errorUsr && usuariosRedes) {
            setRedesAsignados(usuariosRedes);
          }
        } else {
          setRedesAsignados([]);
        }
      } catch (err) {
        console.error("Error al cargar redes asignados:", err);
      }
    };
    fetchRedes();
  }, [idDespachadorLogueado]);

  // Manejar cuenta regresiva del token activo — lógica VERDADERO/FALSO
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // VERDADERO: Token existe y el tiempo es mayor a 0
    if (tokenGenerado && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } 
    // FALSO: Token existe pero el tiempo llegó a 0
    else if (tokenGenerado && timeLeft <= 0) {
      // Eliminar de la base de datos SIN PEROS
      supabase
        .from('tokens_seguridad')
        .delete()
        .eq('codigo', tokenGenerado)
        .then(() => {
          console.log(`[TOKEN] ${tokenGenerado} expirado y eliminado de la DB definitivamente.`);
        });
        
      setTokenGenerado('');
      setError('El token de seguridad ha expirado y fue eliminado de la base de datos.');
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft, tokenGenerado]);

  if (!isOpen) return null;

  // Generar código aleatorio
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SOG-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code.slice(0, 12);
  };

  const handleGenerarToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTokenGenerado('');

    if (!idDespachadorLogueado) {
      setError('Debes simular ser un Despachador (Central Jefe) primero.');
      setLoading(false);
      return;
    }

    if (!idRedesSeleccionado) {
      setError('Por favor selecciona un usuario de REDES asignado a tu cargo.');
      setLoading(false);
      return;
    }

    try {
      // Obtener la cédula del usuario REDES seleccionado
      const userRed = redesAsignados.find(r => r.id_usuario === idRedesSeleccionado);
      if (!userRed) throw new Error("Usuario REDES no encontrado");

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // +5 Minutos

      // 1. Limpieza preventiva (Keep database clean)
      await supabase
        .from('tokens_seguridad')
        .delete()
        .lt('fecha_expira', now.toISOString());

      // 2. Generar Código
      const secureCode = generateRandomCode();

      // 3. INSERTAR EN TABLA DE SUPABASE
      // ACTIVO = TRUE para que arranque funcionando
      const { data, error: insertError } = await supabase
        .from('tokens_seguridad')
        .insert([
          {
            codigo: secureCode,
            id_despachador: idDespachadorLogueado,
            cedula_red: userRed.cedula,
            tipo_permiso: 'REDES',
            fecha_expira: expiresAt.toISOString(),
            activo: true
          }
        ])
        .select();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setTokenGenerado(secureCode);
      setTimeLeft(300); // 5 Minutos (300 segundos)
      setCopied(false);
    } catch (err: any) {
      console.error("Error al generar token:", err);
      setError(`Error al guardar en base de datos: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenGenerado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-lg overflow-hidden backdrop-blur-2xl bg-slate-950/90 border border-cyan-500/30 rounded-[2.5rem] shadow-2xl p-8" onClick={(e) => e.stopPropagation()}>
        
        {/* Neon Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 blur-[90px] opacity-20 bg-cyan-500" />
        <div className="absolute bottom-0 left-0 w-36 h-36 blur-[90px] opacity-10 bg-blue-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Key size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Tokens de Seguridad</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Generar autorización para REDES</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all relative z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {tokenGenerado ? (
          /* PANTALLA DE TOKEN GENERADO */
          <div className="text-center py-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400">
              <Clock size={14} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider">Activo por {formatTime(timeLeft)}</span>
            </div>

            <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative max-w-sm mx-auto shadow-inner">
              <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-2">CÓDIGO GENERADO (ÚNICO)</span>
              <div className="text-3xl font-black font-mono tracking-widest text-cyan-400 select-all my-2">
                {tokenGenerado}
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase italic mt-2">
                El código es VERDADERO y está activo. Al llegar a 0, será FALSO y se eliminará de la base de datos sin peros.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Token'}
              </button>
              <button
                onClick={() => { setTokenGenerado(''); setTimeLeft(0); }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Generar Otro
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE GENERACIÓN */
          <form onSubmit={handleGenerarToken} className="space-y-4">
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 text-rose-400 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Alerta del Sistema</span>
                  <p className="opacity-95">{error}</p>
                </div>
              </div>
            )}

            {/* SIMULACIÓN: Seleccionar quién eres (Despachador) */}
            <div className="space-y-1.5 border-b border-white/10 pb-4 mb-4">
              <label className="text-[9px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert size={10} className="text-emerald-400" />
                Simular Sesión (Tú Eres:)
              </label>
              <select
                value={idDespachadorLogueado}
                onChange={e => setIdDespachadorLogueado(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-2xl px-4 py-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">-- Selecciona un Jefe/Despachador --</option>
                {despachadores.map(d => (
                  <option key={d.id_usuario} value={d.id_usuario}>
                    {d.nombre_completo} ({d.rol})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de REDES asignado a este despachador */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <Users size={10} className="text-cyan-400" />
                Usuario de REDES Asociado
              </label>
              <select
                value={idRedesSeleccionado}
                onChange={e => setIdRedesSeleccionado(e.target.value)}
                disabled={!idDespachadorLogueado || redesAsignados.length === 0}
                required
                className="w-full bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
              >
                <option value="">
                  {!idDespachadorLogueado 
                    ? '-- Esperando Despachador --' 
                    : redesAsignados.length === 0 
                      ? '-- Este despachador NO tiene usuarios REDES asignados --' 
                      : '-- Seleccionar Usuario REDES --'
                  }
                </option>
                {redesAsignados.map(r => (
                  <option key={r.id_usuario} value={r.id_usuario}>
                    {r.nombre_completo} (CI: {r.cedula})
                  </option>
                ))}
              </select>
            </div>

            {/* Aviso de Expiración */}
            <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl flex items-start gap-3 mt-4">
              <ShieldAlert size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-400 leading-normal">
                <span className="font-bold text-cyan-400 uppercase tracking-widest block mb-0.5">Seguridad Activa</span>
                Los tokens para usuarios de REDES asignados tienen validez de **5 minutos**. Se guardan como VERDADEROS y al llegar a 0 se eliminan de la base de datos definitivamente.
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading || !idRedesSeleccionado}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-cyan-500/15 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key size={14} />
                  Autorizar Usuario REDES
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
