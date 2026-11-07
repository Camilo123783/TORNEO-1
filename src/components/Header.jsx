import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, ShieldCheck, Lock, LogOut, Sparkles } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  onOpenLogin, 
  onLogout 
}) {
  const [clickCount, setClickCount] = useState(0);

  // Secret triple click on the trophy opens admin login
  const handleTrophyClick = () => {
    if (isAdmin) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 3) {
      setClickCount(0);
      onOpenLogin();
    }
  };

  // Keyboard shortcut Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setActiveTab('admin');
        } else {
          onOpenLogin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, onOpenLogin, setActiveTab]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleTrophyClick}
              title={isAdmin ? "Administrador activo" : "Toca 3 veces para acceso secreto"}
              className="relative p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/60 transition-all cursor-pointer group active:scale-95 shadow-sm"
            >
              <Trophy className="w-7 h-7 text-emerald-600 group-hover:scale-110 transition-transform" />
              {isAdmin && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                  Torneo <span className="text-emerald-600">Microfútbol</span>
                </h1>
                <span className="hidden sm:inline-flex text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  12 Equipos
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>4 Grupos de 3</span>
                <span>•</span>
                <span>Fase de Grupos & Eliminatorias</span>
              </p>
            </div>
          </div>

          {/* Right section: Admin badge or subtle trigger */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Modo Admin
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Admin</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="opacity-20 hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Acceso"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 py-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tablas de Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Partidos y Resultados</span>
          </button>

          <button
            onClick={() => setActiveTab('playoffs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'playoffs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Fase Final (Playoffs)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ml-auto cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-400'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Panel de Control</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
