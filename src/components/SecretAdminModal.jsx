import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, X, ShieldCheck, Hash } from 'lucide-react';

export default function SecretAdminModal({ isOpen, onClose, onLoginSuccess }) {
  const [adminCode, setAdminCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check saved credentials or defaults
    const validCodes = [
      localStorage.getItem('torneo_custom_admin_code')?.trim().toUpperCase(),
      'MICRO2026',
      'ADMIN'
    ].filter(Boolean);

    const validPasswords = [
      localStorage.getItem('torneo_custom_admin_password')?.trim(),
      'Torneo123',
      'Torneo123."123',
      'admin123'
    ].filter(Boolean);

    const inputCode = adminCode.trim().toUpperCase();
    const inputPass = password.trim();

    if (!validCodes.includes(inputCode)) {
      setError('Código de administrador incorrecto.');
      return;
    }

    if (!validPasswords.includes(inputPass)) {
      setError('Contraseña incorrecta.');
      return;
    }

    // Success: Persistent unlimited session
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-800">
        
        {/* Decorative corner accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-100 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Acceso de Administración
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Ingresa con tu código y contraseña
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Código de Administrador
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ej: MICRO2026 o ADMIN"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Quick Helper badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-emerald-700 block">🔑 Datos de acceso por defecto:</span>
            <div className="flex justify-between">
              <span>Código: <b className="font-mono text-slate-800">MICRO2026</b></span>
              <span>Clave: <b className="font-mono text-slate-800">Torneo123</b></span>
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              (Puedes cambiar este código y contraseña dentro del panel en cualquier momento).
            </span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Ingresar como Administrador
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400">
            Sesión permanente • Acceso exclusivo para el organizador
          </p>
        </div>
      </div>
    </div>
  );
}
