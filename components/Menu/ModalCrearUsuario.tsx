import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ModalCrearUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
  onShowExito: (mensaje: string) => void;
  onShowError: (mensaje: string) => void;
  onShowCarga: (mensaje: string) => void;
  onHideCarga: () => void;
  userRol: string;
}

export const ModalCrearUsuario = ({ 
  isOpen, 
  onClose, 
  onUserCreated,
  onShowExito,
  onShowError,
  onShowCarga,
  onHideCarga,
  userRol
}: ModalCrearUsuarioProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    rol: 'DESPACHADOR',
    cargo: '',
    nombre_completo: '',
    cedula: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Verificar permisos al abrir el modal
  useEffect(() => {
    if (isOpen && userRol !== 'REDES') {
      onClose();
    }
  }, [isOpen, userRol, onClose]);

  // Función para validar campos
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es obligatorio';
    } else if (formData.nombre_completo.trim().length < 3) {
      newErrors.nombre_completo = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^[VEveJjGgPp]\d{6,8}$/.test(formData.cedula.trim())) {
      newErrors.cedula = 'Formato: V-12345678, E-12345678';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo es obligatorio';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.trim().length < 4) {
      newErrors.username = 'El usuario debe tener al menos 4 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo letras, números y guión bajo';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  };

  const checkUserExists = async (username: string, cedula: string) => {
    const { data, error } = await supabase
      .from('usuarios_maestra')
      .select('username, cedula')
      .or(`username.eq.${username},cedula.eq.${cedula}`);
    
    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      onShowError('Por favor, corrige los errores en el formulario');
      return;
    }
    
    onShowCarga('Validando información y creando usuario...');
    
    try {
      const existingUsers = await checkUserExists(formData.username, formData.cedula);
      
      if (existingUsers && existingUsers.length > 0) {
        const existing = existingUsers[0];
        onHideCarga();
        if (existing.username === formData.username) {
          onShowError(`El usuario "${formData.username}" ya está registrado`);
        } else if (existing.cedula === formData.cedula) {
          onShowError(`La cédula "${formData.cedula}" ya está registrada`);
        }
        return;
      }
      
      const hashedPassword = await hashPassword(formData.password);
      
      const { data, error } = await supabase
        .from('usuarios_maestra')
        .insert([{
          username: formData.username,
          password_hash: hashedPassword,
          rol: formData.rol,
          cargo: formData.cargo,
          nombre_completo: formData.nombre_completo,
          cedula: formData.cedula,
          estatus: 'ACTIVO'
        }])
        .select();

      if (error) throw error;

      onHideCarga();
      onShowExito(`Usuario "${formData.username}" creado exitosamente`);
      onClose();
      if (onUserCreated) onUserCreated();
      
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        rol: 'DESPACHADOR',
        cargo: '',
        nombre_completo: '',
        cedula: '',
      });
      setErrors({});
      
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      onHideCarga();
      
      if (error.message.includes('duplicate key')) {
        onShowError('El nombre de usuario o cédula ya existe en el sistema');
      } else {
        onShowError('Error al crear usuario: ' + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9998 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-linear-to-br from-slate-900 to-slate-950 border border-white/10 p-8 rounded-3xl w-137.5 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-white text-xl font-black tracking-widest mb-6 flex items-center gap-3 sticky top-0 bg-slate-900/95 py-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <img src="/usuario.png" className="w-5 h-5" alt="Usuario" />
          </div>
          REGISTRO DE FUNCIONARIO
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Nombre Completo <span className="text-red-400">*</span>
            </label>
            <input 
              className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                errors.nombre_completo ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="Ej: Juan Pérez González"
              value={formData.nombre_completo}
              onChange={(e) => {
                setFormData({...formData, nombre_completo: e.target.value});
                if (errors.nombre_completo) setErrors({...errors, nombre_completo: ''});
              }}
              required
            />
            {errors.nombre_completo && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nombre_completo}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
                Cédula <span className="text-red-400">*</span>
              </label>
              <input 
                className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                  errors.cedula ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="V-12345678"
                value={formData.cedula}
                onChange={(e) => {
                  setFormData({...formData, cedula: e.target.value});
                  if (errors.cedula) setErrors({...errors, cedula: ''});
                }}
                required
              />
              {errors.cedula && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cedula}
                </p>
              )}
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
                Cargo / Rango <span className="text-red-400">*</span>
              </label>
              <input 
                className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                  errors.cargo ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="Ej: Supervisor"
                value={formData.cargo}
                onChange={(e) => {
                  setFormData({...formData, cargo: e.target.value});
                  if (errors.cargo) setErrors({...errors, cargo: ''});
                }}
                required
              />
              {errors.cargo && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cargo}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Usuario (Login) <span className="text-red-400">*</span>
            </label>
            <input 
              className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                errors.username ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="nombre_usuario"
              value={formData.username}
              onChange={(e) => {
                setFormData({...formData, username: e.target.value});
                if (errors.username) setErrors({...errors, username: ''});
              }}
              required
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.username}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <input 
                type="password"
                className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                  errors.password ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="********"
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if (errors.password) setErrors({...errors, password: ''});
                  if (errors.confirmPassword && e.target.value === formData.confirmPassword) {
                    setErrors({...errors, confirmPassword: ''});
                  }
                }}
                required
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
                Confirmar Contraseña <span className="text-red-400">*</span>
              </label>
              <input 
                type="password"
                className={`w-full bg-slate-800/50 border rounded-xl p-3 text-white outline-none focus:border-emerald-500 focus:bg-slate-800 transition-all ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({...formData, confirmPassword: e.target.value});
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''});
                }}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">
              Rol en el Sistema <span className="text-red-400">*</span>
            </label>
            <select 
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 cursor-pointer"
              value={formData.rol}
              onChange={(e) => setFormData({...formData, rol: e.target.value})}
            >
              <option value="REDES">🌐 REDES</option>
            </select>
          </div>

          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 mt-4">
            <p className="text-emerald-400 text-xs flex items-center gap-2">
              <span className="text-lg">🔐</span> 
              La contraseña se encriptará automáticamente con bcrypt (10 rondas)
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-medium"
            >
              CANCELAR
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              CREAR USUARIO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};