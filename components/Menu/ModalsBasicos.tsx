import React from 'react';
import { CheckCircle, XCircle, Loader2, ShieldAlert } from 'lucide-react';

// Modal de Éxito
export const ModalExito = ({ isOpen, onClose, mensaje }: { isOpen: boolean; onClose: () => void; mensaje: string }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 p-8 rounded-3xl w-100 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </div>
        <h3 className="text-white text-2xl font-black mb-2">¡ÉXITO!</h3>
        <p className="text-slate-300 mb-6">{mensaje}</p>
        <button 
          onClick={onClose}
          className="w-full bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all"
        >
          ACEPTAR
        </button>
      </div>
    </div>
  );
};

// Modal de Error
export const ModalError = ({ isOpen, onClose, mensaje }: { isOpen: boolean; onClose: () => void; mensaje: string }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-red-900/20 to-slate-900 border border-red-500/30 p-8 rounded-3xl w-100 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h3 className="text-white text-2xl font-black mb-2">¡ERROR!</h3>
        <p className="text-slate-300 mb-6">{mensaje}</p>
        <button 
          onClick={onClose}
          className="w-full bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
};

// Modal de Carga
export const ModalCarga = ({ isOpen, mensaje }: { isOpen: boolean; mensaje: string }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 p-8 rounded-3xl w-87.5 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        </div>
        <h3 className="text-white text-xl font-black mb-2">PROCESANDO</h3>
        <p className="text-slate-400">{mensaje}</p>
      </div>
    </div>
  );
};

// Modal de Acceso Denegado
export const ModalAccesoDenegado = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-red-900/20 to-slate-900 border border-red-500/30 p-8 rounded-3xl w-100 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h3 className="text-white text-2xl font-black mb-2">ACCESO DENEGADO</h3>
        <p className="text-slate-300 mb-6">
          Solo los usuarios con rol <span className="text-red-400 font-bold">REDES</span> pueden crear nuevos usuarios.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3 rounded-xl transition-all"
        >
          ENTENDIDO
        </button>
      </div>
    </div>
  );
};