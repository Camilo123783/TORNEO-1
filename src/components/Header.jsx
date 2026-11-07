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
    <header className="sticky top-0 z-40 bg-[#0c1427]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleTrophyClick}
              title={isAdmin ? "Administrador activo" : "Toca 3 veces para acceso secreto"}
              className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 hover:border-emerald-400 transition-all cursor-pointer group active:scale-95"
            >
              <Trophy className="w-7 h-7 text-emerald-400 group-hover:scale-110 transition-transform" />
              {isAdmin && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              )}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                  Torneo <span className="text-emerald-400">Microfútbol</span>
                </h1>
                <span className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  12 Equipos
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>4 Grupos de 3</span>
                <span>•</span>
                <span>Fase de Grupos & Playoffs</span>
              </p>
            </div>
          </div>

          {/* Right section: Admin badge or subtle trigger */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Admin Activo
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="opacity-20 hover:opacity-80 transition-opacity p-2 text-slate-400 hover:text-white rounded-lg"
                title="Acceso"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 py-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'groups'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tablas de Posiciones</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'matches'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Partidos y Resultados</span>
          </button>

          <button
            onClick={() => setActiveTab('playoffs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'playoffs'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Fase Final (Playoffs)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ml-auto ${
                activeTab === 'admin'
                  ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/25 ring-2 ring-emerald-300/40'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel de Control</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
