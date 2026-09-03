"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, FileCode, Table, Eye, ShieldAlert, CheckCircle2, 
  Layers, MapPin, Copy, Check, RefreshCw, AlertTriangle, Trash2,
  Save, FolderPlus, Database, Compass, Globe, Info, Minus, Maximize2, RotateCcw
} from 'lucide-react';
import { parseGisDocument, ParseResult } from '../map/gisParser';

interface ModalGeoJsonEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewOnMap: (geojson: any, bbox: number[] | null) => void;
  onModuleCreated: () => void;
  showExitoModal: (msg: string) => void;
  showErrorModal: (msg: string) => void;
}

const TACTICAL_COLORS = [
  { hex: '#06b6d4', name: 'Neón Cyan' },
  { hex: '#10b981', name: 'Esmeralda' },
  { hex: '#84cc16', name: 'Lima Táctico' },
  { hex: '#f59e0b', name: 'Ámbar Alerta' },
  { hex: '#f97316', name: 'Naranja Fuego' },
  { hex: '#ef4444', name: 'Rojo Carmesí' },
  { hex: '#ec4899', name: 'Rosa Neón' },
  { hex: '#d946ef', name: 'Magenta' },
  { hex: '#8b5cf6', name: 'Violeta Sigilo' },
  { hex: '#6366f1', name: 'Índigo Operativo' },
  { hex: '#3b82f6', name: 'Azul Naval' },
  { hex: '#14b8a6', name: 'Turquesa' },
  { hex: '#eab308', name: 'Dorado' },
  { hex: '#00f0ff', name: 'Cyan Eléctrico' },
  { hex: '#ffffff', name: 'Blanco Puro' },
  { hex: '#64748b', name: 'Gris Grafito' },
];

export const ModalGeoJsonEditor: React.FC<ModalGeoJsonEditorProps> = ({
  isOpen,
  onClose,
  onPreviewOnMap,
  onModuleCreated,
  showExitoModal,
  showErrorModal,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'map' | 'table' | 'code'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Estados de Doble Confirmación
  const [showStep1Modal, setShowStep1Modal] = useState<boolean>(false);
  const [showStep2Modal, setShowStep2Modal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Formulario del Módulo (Paso 1)
  const [moduleName, setModuleName] = useState<string>('');
  const [moduleCategory, setModuleCategory] = useState<string>('Módulo Principal');
  const [moduleColor, setModuleColor] = useState<string>('#06b6d4');
  const [moduleDescription, setModuleDescription] = useState<string>('');
  const [confirmCheckbox, setConfirmCheckbox] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setShowStep1Modal(false);
      setShowStep2Modal(false);
      setConfirmCheckbox(false);
      setIsMinimized(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── RESETEAR / LIMPIAR DATOS COMPLETAMENTE ──────────────────────────────
  const handleResetData = () => {
    setRawText('');
    setParsedData(null);
    setFileName('');
    setIsPreviewing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Ocultar capa del mapa
    onPreviewOnMap({ type: 'FeatureCollection', features: [] }, null);
    setActiveTab('upload');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFile(files[0]);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setFileName(file.name);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let result: ParseResult;

      if (ext === 'shp' || ext === 'zip') {
        const buffer = await file.arrayBuffer();
        result = await parseGisDocument(buffer, file.name);
      } else {
        const text = await file.text();
        setRawText(text);
        result = await parseGisDocument(text, file.name);
      }

      setParsedData(result);
      if (ext !== 'shp' && ext !== 'zip') {
        setRawText(JSON.stringify(result.geojson, null, 2));
      }
      setActiveTab('map');
      if (result.geojson?.features?.length > 0) {
        onPreviewOnMap(result.geojson, result.bbox);
        setIsPreviewing(true);
      }
    } catch (err: any) {
      showErrorModal(`Error al procesar archivo GIS: ${err.message || 'Formato inválido'}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleTextChange = async (val: string) => {
    setRawText(val);
    try {
      if (!val.trim()) {
        setParsedData(null);
        return;
      }
      const res = await parseGisDocument(val, fileName || 'custom.geojson');
      setParsedData(res);
    } catch (err) {
      // Ignorar errores parciales mientras escribe
    }
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(rawText);
      setRawText(JSON.stringify(obj, null, 2));
    } catch (e) {
      showErrorModal('No se pudo formatear: JSON no válido');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePreview = () => {
    if (!parsedData || !parsedData.geojson) return;
    if (isPreviewing) {
      onPreviewOnMap({ type: 'FeatureCollection', features: [] }, null);
      setIsPreviewing(false);
    } else {
      onPreviewOnMap(parsedData.geojson, parsedData.bbox);
      setIsPreviewing(true);
    }
  };

  const handleStartSave = () => {
    if (!parsedData || !parsedData.geojson || parsedData.geojson.features?.length === 0) {
      showErrorModal('No hay ninguna capa cargada para guardar.');
      return;
    }
    const defaultName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Nueva Capa GIS';
    setModuleName(defaultName.toUpperCase());
    setShowStep1Modal(true);
  };

  const handleProceedToStep2 = () => {
    if (!moduleName.trim()) {
      showErrorModal('Ingresa un nombre para el módulo.');
      return;
    }
    setShowStep1Modal(false);
    setShowStep2Modal(true);
    setConfirmCheckbox(false);
  };

  const handleConfirmAndSaveModule = async () => {
    if (!confirmCheckbox) {
      showErrorModal('Debes marcar la casilla de confirmación.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/map/custom-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: moduleName.trim(),
          category: moduleCategory,
          color: moduleColor,
          description: moduleDescription,
          geojson: parsedData?.geojson,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Error guardando módulo');

      showExitoModal(`¡Módulo "${moduleName}" guardado en el proyecto!`);
      setShowStep2Modal(false);
      onModuleCreated();
      onClose();
    } catch (err: any) {
      showErrorModal(`Error al registrar módulo: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const sampleGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [-63.855, 10.955] },
        properties: { name: "Punto Táctico Ejemplo", sector: "Porlamar Centro", estado: "Activo" }
      }
    ]
  };

  const loadSample = () => {
    const str = JSON.stringify(sampleGeoJson, null, 2);
    setFileName('ejemplo_tactico.geojson');
    handleTextChange(str);
    setActiveTab('map');
  };

  // WIDGET MINIMIZADO FLOTANTE
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex items-center gap-3 bg-slate-900/95 border border-cyan-500/50 p-2.5 px-3.5 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-xl text-white font-mono text-xs">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe size={16} className="animate-pulse" />
          </div>

          <div className="space-y-0.5 max-w-[170px]">
            <div className="font-black text-cyan-300 truncate uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <span>ESTACIÓN GIS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-300 truncate font-mono">
              {fileName ? fileName : 'Sin archivo'} ({parsedData?.stats?.totalFeatures || 0} elem)
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            {parsedData && parsedData.geojson?.features?.length > 0 && (
              <button
                onClick={handleTogglePreview}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isPreviewing
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
                title={isPreviewing ? 'Ocultar capa' : 'Ver capa en mapa'}
              >
                <Eye size={14} />
              </button>
            )}

            <button
              onClick={handleStartSave}
              disabled={!parsedData || !parsedData.geojson?.features?.length}
              className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold border border-cyan-300 transition-all cursor-pointer"
              title="Guardar Módulo"
            >
              <Save size={14} />
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all cursor-pointer"
              title="Maximizar"
            >
              <Maximize2 size={14} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-all cursor-pointer"
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] md:h-[85vh] bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100">
        
        {/* ANIMACIÓN DE CARGA / PARSING DE ARCHIVOS PESADOS */}
        {isParsing && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-cyan-400 font-mono text-xs animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.8)_360deg)] animate-spin" />
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center z-10 text-cyan-300">
                <Compass size={18} className="animate-pulse" />
              </div>
            </div>
            <div className="space-y-1 text-center px-4">
              <span className="font-black tracking-widest uppercase text-cyan-300 block text-xs">
                PROCESANDO DOCUMENTO CARTOGRÁFICO...
              </span>
              <span className="text-[10px] text-slate-400 block animate-pulse">
                Leyendo coordenadas y metadatos ({fileName})... Por favor espere...
              </span>
            </div>
          </div>
        )}

        {/* ENCABEZADO REORGANIZADO Y COMPACTO */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-widest uppercase text-white flex items-center gap-2">
                ESTACIÓN GIS • IMPORTADOR DE CAPAS
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                  SOGNE
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Importa GeoJSON, KML, SHP o CSV, visualízalos en mapa y guárdalos en el proyecto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Resetear / Limpiar datos */}
            {parsedData && (
              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold uppercase transition-all cursor-pointer"
                title="Limpiar datos y resetear visor"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Resetear</span>
              </button>
            )}

            {/* Botón Previsualizar en Mapa */}
            {parsedData && parsedData.geojson?.features?.length > 0 && (
              <button
                onClick={handleTogglePreview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isPreviewing 
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <Eye size={14} />
                <span>{isPreviewing ? 'Viendo Mapa' : 'Ver en Mapa'}</span>
              </button>
            )}

            {/* Botón Guardar Módulo */}
            <button
              onClick={handleStartSave}
              disabled={!parsedData || !parsedData.geojson?.features?.length}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Guardar Módulo</span>
            </button>

            {/* Botón Minimizar */}
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-cyan-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Minimizar estación GIS"
            >
              <Minus size={16} />
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BARRA DE PESTAÑAS RESPONSIVE */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-slate-950/50 border-b border-white/5 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === 'upload' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload size={13} />
              <span>1. Cargar Documento</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={13} />
              <span>2. Resumen & Mapa</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === 'table' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table size={13} />
              <span>3. Tabla ({parsedData?.stats?.totalFeatures || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === 'code' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode size={13} />
              <span>4. Editor GeoJSON</span>
            </button>
          </div>

          {/* Estadísticas */}
          {parsedData && (
            <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">
                Puntos: {parsedData.stats.pointsCount}
              </span>
              <span className="text-emerald-400 font-bold">
                Líneas: {parsedData.stats.linesCount}
              </span>
              <span className="text-amber-400 font-bold">
                Polígonos: {parsedData.stats.polygonsCount}
              </span>
            </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
        <div className="flex-1 overflow-y-auto relative p-4 sm:p-6 bg-slate-900/60">
          
          {/* TAB 1: CARGAR ARCHIVO */}
          {activeTab === 'upload' && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-5 my-auto">
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 sm:p-10 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-3xl bg-slate-950/40 hover:bg-cyan-950/20 transition-all cursor-pointer group flex flex-col items-center gap-3 shadow-xl"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".geojson,.json,.kml,.shp,.zip,.csv,.tsv,.gpx" 
                  className="hidden" 
                />
                
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white tracking-wide">
                    Arrastra y suelta tu archivo GIS aquí
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Soporta GeoJSON, KML, Shapefiles ESRI (.shp/.zip), CSV y GPX
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  {['.GeoJSON', '.JSON', '.KML', '.SHP / ZIP', '.CSV', '.GPX'].map((ext) => (
                    <span key={ext} className="text-[9px] font-mono font-bold bg-white/5 border border-white/10 text-cyan-300 px-2.5 py-0.5 rounded-full">
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] text-slate-500 font-mono">o prueba datos de demostración</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <button
                onClick={loadSample}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Database size={13} className="text-cyan-400" />
                <span>Cargar Ejemplo GeoJSON</span>
              </button>
            </div>
          )}

          {/* TAB 2: VISTA PREVIA Y MAPA */}
          {activeTab === 'map' && (
            <div className="h-full flex flex-col space-y-3">
              <div className="p-3 bg-slate-950 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between font-mono text-xs gap-2">
                <div className="space-y-0.5">
                  <span className="text-cyan-400 font-bold flex items-center gap-1.5 text-xs">
                    <Compass size={14} />
                    Resumen del Documento
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    {fileName ? `Archivo: ${fileName}` : 'Datos GeoJSON activos'} • Total: <strong className="text-white">{parsedData?.stats?.totalFeatures || 0} elementos</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePreview}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isPreviewing 
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    }`}
                  >
                    <Eye size={14} />
                    <span>{isPreviewing ? 'Visible en Mapa' : 'Ver en Mapa'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-3 max-w-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Documento procesado correctamente</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px]">Puntos</span>
                      <strong className="text-cyan-300 text-sm">{parsedData?.stats?.pointsCount || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px]">Líneas</span>
                      <strong className="text-emerald-300 text-sm">{parsedData?.stats?.linesCount || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px]">Polígonos</span>
                      <strong className="text-amber-300 text-sm">{parsedData?.stats?.polygonsCount || 0}</strong>
                    </div>
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-slate-400 block text-[9px]">Campos Atributos</span>
                      <strong className="text-purple-300 text-sm">{parsedData?.stats?.propertiesList?.length || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-4">
                  <button
                    onClick={handleResetData}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Descartar Capa</span>
                  </button>

                  <button
                    onClick={handleStartSave}
                    disabled={!parsedData || !parsedData.geojson?.features?.length}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Guardar Módulo →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TABLA DE ATRIBUTOS */}
          {activeTab === 'table' && (
            <div className="h-full overflow-auto rounded-2xl border border-white/10 bg-slate-950">
              {parsedData && parsedData.geojson?.features?.length > 0 ? (
                <table className="w-full text-left border-collapse text-[11px] font-mono">
                  <thead className="bg-slate-900 text-slate-300 sticky top-0 border-b border-white/10">
                    <tr>
                      <th className="p-2.5 border-r border-white/5">#</th>
                      <th className="p-2.5 border-r border-white/5">Geometría</th>
                      <th className="p-2.5 border-r border-white/5">Coordenadas</th>
                      {parsedData.stats.propertiesList.slice(0, 8).map(prop => (
                        <th key={prop} className="p-2.5 border-r border-white/5 uppercase text-cyan-400">{prop}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {parsedData.geojson.features.slice(0, 100).map((f: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-2.5 font-bold text-slate-500">{i + 1}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{f.geometry?.type || 'N/A'}</td>
                        <td className="p-2.5 text-cyan-300 text-[10px]">
                          {JSON.stringify(f.geometry?.coordinates).slice(0, 25)}...
                        </td>
                        {parsedData.stats.propertiesList.slice(0, 8).map(prop => (
                          <td key={prop} className="p-2.5 text-slate-200 truncate max-w-[150px]">
                            {String(f.properties?.[prop] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-500 font-mono text-xs">
                  <span>No hay datos cargados en la tabla.</span>
                  <button onClick={loadSample} className="text-cyan-400 hover:underline">Cargar GeoJSON de Ejemplo</button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EDITOR CÓDIGO GEOJSON */}
          {activeTab === 'code' && (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {fileName ? `Archivo: ${fileName}` : 'Editor GeoJSON'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormatJson}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-cyan-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
                  >
                    <RefreshCw size={11} />
                    <span>Formatear</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1"
                  >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Pega aquí tu GeoJSON o edita los datos..."
                className="flex-1 w-full bg-slate-950 text-cyan-300 font-mono text-xs p-3.5 rounded-2xl border border-white/10 focus:border-cyan-500/50 focus:outline-none resize-none shadow-inner leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* BARRA DE ESTADO INFERIOR */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Elementos: <strong className="text-white">{parsedData?.stats?.totalFeatures || 0}</strong></span>
            <span className="hidden sm:inline">BBOX: <strong className="text-cyan-300">{parsedData?.bbox ? parsedData.bbox.map(n => n.toFixed(2)).join(', ') : 'Global'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold text-[10px] uppercase">Motor GIS SOGNE</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL PASO 1: CONFIGURACIÓN COMPACTA DEL MÓDULO */}
      {/* ========================================================================= */}
      {showStep1Modal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                  <FolderPlus size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">
                    PASO 1: NOMBRAR MÓDULO
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Asigna nombre y color para registrar en el proyecto
                  </p>
                </div>
              </div>
              <button onClick={() => setShowStep1Modal(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* Nombre del Módulo */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block">Nombre del Módulo *</label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="EJ: RUTAS MARÍTIMAS PESQUERAS"
                  className="w-full bg-slate-950 text-white font-bold p-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Categoría o Submódulo */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block">Ubicación en Menú *</label>
                <select
                  value={moduleCategory}
                  onChange={(e) => setModuleCategory(e.target.value)}
                  className="w-full bg-slate-950 text-cyan-300 font-bold p-2.5 rounded-xl border border-white/10 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Módulo Principal">Módulo Principal (Personalizado)</option>
                  <option value="Infraestructura">Submódulo Infraestructura</option>
                  <option value="Zonas de Riesgo">Submódulo Zonas de Riesgo</option>
                  <option value="Servicios Básicos">Submódulo Servicios Básicos</option>
                  <option value="Transporte">Submódulo Transporte</option>
                  <option value="CONPPAS">Submódulo CONPPAS (Sector Pesquero)</option>
                </select>
              </div>

              {/* Paleta de 16 colores */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Color Táctico</span>
                  <span className="text-cyan-400">{TACTICAL_COLORS.find(c => c.hex === moduleColor)?.name || moduleColor}</span>
                </label>
                <div className="grid grid-cols-8 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-white/10">
                  {TACTICAL_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.name}
                      onClick={() => setModuleColor(col.hex)}
                      style={{ backgroundColor: col.hex }}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        moduleColor === col.hex ? 'scale-125 border-white shadow-[0_0_10px_rgba(255,255,255,0.9)] ring-2 ring-cyan-400' : 'border-transparent opacity-75 hover:opacity-100 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-3">
              <button
                onClick={() => setShowStep1Modal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleProceedToStep2}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Continuar →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PASO 2: DOBLE CONFIRMACIÓN DE SEGURIDAD */}
      {/* ========================================================================= */}
      {showStep2Modal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 space-y-5 shadow-[0_0_60px_rgba(245,158,11,0.3)] text-slate-100">
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-bounce">
                <ShieldAlert size={30} />
              </div>

              <h3 className="text-sm font-black uppercase text-amber-400 tracking-widest">
                DOBLE CONFIRMACIÓN DE SEGURIDAD
              </h3>

              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Guardar módulo <strong className="text-cyan-300">"{moduleName}"</strong> de forma permanente en el proyecto.
              </p>
            </div>

            <label className="flex items-start gap-3 p-3 bg-slate-950 border border-white/10 rounded-xl cursor-pointer hover:border-amber-400/50 transition-colors">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-white/20 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-300 leading-tight">
                Confirmo que deseo incorporar este Módulo al proyecto SOGNE.
              </span>
            </label>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => {
                  setShowStep2Modal(false);
                  setShowStep1Modal(true);
                }}
                disabled={isSaving}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                ← Volver
              </button>

              <button
                onClick={handleConfirmAndSaveModule}
                disabled={!confirmCheckbox || isSaving}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Confirmar y Crear</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
