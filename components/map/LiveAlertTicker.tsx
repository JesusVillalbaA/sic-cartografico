"use client";
import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Zap, Activity, ChevronRight, Bell, X } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  category: 'seguridad' | 'electricidad' | 'salud' | 'general';
  municipio: string;
  time: string;
  coords: [number, number];
}

interface LiveAlertTickerProps {
  map: any;
  theme?: string;
  onSelectAlert?: (coords: [number, number]) => void;
}

export const LiveAlertTicker = ({ map, theme = 'dark', onSelectAlert }: LiveAlertTickerProps) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt_1',
      title: 'Monitoreo de Cuadrante Activo',
      category: 'seguridad',
      municipio: 'Arismendi',
      time: 'Hace 5 min',
      coords: [-63.8588, 11.0256]
    },
    {
      id: 'alt_2',
      title: 'Suministro Eléctrico Estable Subestación',
      category: 'electricidad',
      municipio: 'Maneiro',
      time: 'Hace 12 min',
      coords: [-63.8341, 10.9910]
    },
    {
      id: 'alt_3',
      title: 'Guardia Operativa Hospital David Espinoza',
      category: 'salud',
      municipio: 'Arismendi',
      time: 'Hace 20 min',
      coords: [-63.8533, 11.0509]
    },
    {
      id: 'alt_4',
      title: 'Despliegue Cuadrantes de Paz',
      category: 'seguridad',
      municipio: 'Mariño',
      time: 'Hace 35 min',
      coords: [-63.8477, 10.9605]
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isPaused || !isOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isOpen, alerts.length]);

  const currentAlert = alerts[currentIndex];

  const handleAlertClick = () => {
    if (!currentAlert || !map) return;
    map.flyTo({
      center: currentAlert.coords,
      zoom: 14,
      pitch: 45,
      duration: 1500
    });
    if (onSelectAlert) onSelectAlert(currentAlert.coords);
  };

  const getCategoryBadge = (cat: AlertItem['category']) => {
    switch (cat) {
      case 'seguridad':
        return { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
      case 'electricidad':
        return { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
      case 'salud':
        return { icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { icon: AlertTriangle, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Ver Centro de Alertas"
        className="absolute top-20 right-6 z-20 flex items-center gap-2 px-3 py-2 bg-slate-950/85 hover:bg-slate-900/95 text-cyan-400 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Bell size={13} className="animate-bounce" />
        <span className="text-[9px] font-black uppercase tracking-wider text-white">Alertas ({alerts.length})</span>
      </button>
    );
  }

  const badge = getCategoryBadge(currentAlert.category);
  const Icon = badge.icon;

  return (
    <div 
      className="absolute top-20 right-6 z-20 max-w-sm w-full select-none animate-in fade-in slide-in-from-top-4 duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-slate-950/90 backdrop-blur-2xl p-2.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-white/10 flex items-center justify-between gap-3">
        
        {/* Click para hacer zoom */}
        <div 
          onClick={handleAlertClick}
          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${badge.bg}`}>
            <Icon size={15} className={`${badge.color} group-hover:scale-110 transition-transform`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-black">
                {currentAlert.municipio}
              </span>
              <span className="text-[8px] font-mono text-slate-500">
                • {currentAlert.time}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate leading-tight">
              {currentAlert.title}
            </p>
          </div>

          <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>

        {/* Cerrar / Minimizar */}
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <X size={13} />
        </button>

      </div>
    </div>
  );
};
