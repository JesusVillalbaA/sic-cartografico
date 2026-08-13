"use client";
import React from 'react';
import { Phone, Shield, User, MapPin, ExternalLink } from 'lucide-react';

export const SaludCard = ({ feature, onClose }: any) => {
  if (!feature) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-red-500/30 p-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
        <p className="text-red-400 font-mono text-sm animate-pulse">
          &gt; ERROR: DATA_NOT_FOUND
        </p>
      </div>
    );
  }

  const p = feature.properties || {};
  const layerId = feature.layer?.id || "";
  
  const isHospital = layerId.includes('hospital') || p.tipo === 'hospital' || ['IV', 'III', 'II'].includes(p.tipo);
  const isClinica = layerId.includes('clinica') || p.tipo === 'clinica' || p.tipo === 'Clínica / Centro Médico';
  const isAmbulatorio = layerId.includes('ambulatorio') || p.tipo === 'ambulatorio';
  const isCDI = layerId.includes('cdi') || p.tipo === 'cdi';
  
  const getTheme = () => {
    if (isHospital) return { color: 'rose', icon: '/hospital.png', label: 'HOSPITAL' };
    if (isClinica) return { color: 'blue', icon: '/clinica.png', label: 'CLINICA' };
    if (isAmbulatorio) return { color: 'emerald', icon: '/ambulatorio.png', label: 'AMBULATORIO' };
    if (isCDI) return { color: 'purple', icon: '/dispensario.png', label: 'CENTRO DIAGNÓSTICO INTEGRAL' };
    return { color: 'slate', icon: '/centrosalud.png', label: 'RECURSO DE SALUD' };
  };

  const theme = getTheme();
  const accentColor = {
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-rose-500/20',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-blue-500/20',
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/20',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10 shadow-purple-500/20',
    slate: 'text-slate-400 border-slate-500/30 bg-slate-500/10 shadow-slate-500/20',
  }[theme.color];

  const getCleanPhone = (phoneStr: string) => {
    if (!phoneStr) return null;
    const clean = phoneStr.replace(/\D/g, '');
    return clean ? (clean.startsWith('58') ? clean : `58${clean}`) : null;
  };

  const cleanPhone = getCleanPhone(p.phone || p.telefono || p.telef);

  return (
    <div className="relative group animate-in fade-in zoom-in duration-300">
      <div className={`absolute -inset-0.5 rounded-[2.5rem] opacity-20 group-hover:opacity-40 transition duration-500 blur-xl ${theme.color === 'rose' ? 'bg-rose-500' : theme.color === 'blue' ? 'bg-blue-500' : 'bg-cyan-500'}`} />

      <div className="relative bg-slate-950/90 backdrop-blur-2xl rounded-4xl border border-white/10 p-6 overflow-hidden shadow-2xl">
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-0.5 bg-white/5 absolute top-0 animate-[scan_3s_linear_infinite]" />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <div className={`flex items-center gap-2 px-2 py-0.5 rounded-md border w-fit mb-1 ${accentColor}`}>
              <span className="text-xs animate-pulse">●</span>
              <span className="text-[10px] font-black tracking-widest uppercase">{theme.label}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Infraestructura de salud: {feature.id?.toString().slice(0, 8) || 'N/A'}</span>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 transition-all text-white/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex gap-4 items-center mb-6">
          <div className={`shrink-0 w-16 h-16 p-2 rounded-2xl bg-linear-to-br from-white/10 to-transparent border border-white/5 shadow-inner flex items-center justify-center`}>
            <img 
              src={theme.icon} 
              alt={theme.label} 
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              onError={(e) => {
                (e.target as any).src = 'https://cdn-icons-png.flaticon.com/512/684/684065.png';
              }}
            />
          </div>
          <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {p.name || p.nombre || p.establishment || 'Recurso de Salud'}
          </h4>
        </div>

        {/* Bloque Director y Cuadrante */}
        {(p.director || p.responsable || p.cuadrante) && (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 mb-4 space-y-2">
            {(p.director || p.responsable) && (
              <div className="flex items-center gap-2.5">
                <User size={14} className="text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Director / Responsable</span>
                  <span className="text-[11px] text-slate-200 font-black">{p.director || p.responsable}</span>
                </div>
              </div>
            )}
            {p.cuadrante && (
              <div className="flex items-center gap-2.5 pt-1.5 border-t border-white/5">
                <Shield size={14} className="text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Cuadrante Operativo</span>
                  <span className="text-[11px] text-amber-300 font-bold">{p.cuadrante}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid de Información Técnica */}
        <div className="grid grid-cols-1 gap-2.5 mb-4">
          {[
            { label: 'UBICACIÓN', val: p.municipio || p.municipality, icon: '📍' },
            { label: 'DIRECCIÓN', val: p.address || p.direccion || p.ubicacion, icon: '🛰️' },
            { label: 'CAPACIDAD', val: p.beds || p.camas ? `${p.beds || p.camas} UNIDADES` : null, icon: '🛏️' },
            { label: 'UNIDADES MÓVILES', val: p.ambulances || p.ambulancias, icon: '🚑' },
          ].map((item, i) => item.val && (
            <div key={i} className="flex flex-col p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors">
              <span className="text-[8px] text-cyan-500 font-bold tracking-tighter mb-1 uppercase opacity-70">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs">{item.icon}</span>
                <span className="text-[11px] text-slate-200 font-mono leading-tight">{item.val}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de Teléfono / WhatsApp */}
        {(p.phone || p.telefono || p.telef) && cleanPhone && (
          <div className="mb-4">
            <a
              href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`*SISTEMA SOGNE*\nContacto institucional con: ${p.name || p.nombre}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-emerald-600/90 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] group"
            >
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-white group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold font-mono">{p.phone || p.telefono || p.telef}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-lg">
                Contactar
              </span>
            </a>
          </div>
        )}

        {p.description || p.funcion ? (
          <div className="p-3 rounded-lg bg-linear-to-r from-transparent via-white/5 to-transparent border-y border-white/5">
            <p className="text-[11px] text-slate-400 italic leading-relaxed text-center">
              "{p.description || p.funcion}"
            </p>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          50% { opacity: 0.5; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};