import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Users, 
  Award, 
  RefreshCw,
  Moon,
  Sun
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  onOpenLogin, 
  onLogout,
  onRefresh,
  isRefreshing,
  isDarkMode,
  onToggleDarkMode
}) {
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const pressStartRef = useRef(0);

  // Unified Pointer events for 1-tap dark mode & 2-second hold for admin
  const handlePointerDown = (e) => {
    isLongPressRef.current = false;
    pressStartRef.current = Date.now();
    setIsHolding(true);

    if (!isAdmin) {
      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        setIsHolding(false);
        onOpenLogin();
      }, 2000);
    }
  };

  const handlePointerUp = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);

    // If it was NOT a 2-second hold, it's a single tap/click -> Toggle Dark Mode!
    const elapsed = Date.now() - pressStartRef.current;
    if (!isLongPressRef.current && elapsed < 1800) {
      if (onToggleDarkMode) {
        onToggleDarkMode();
      }
    }
    isLongPressRef.current = false;
  };

  const handlePointerCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);
    isLongPressRef.current = false;
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm select-none w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main top row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Tournament Logo: 1 tap = Dark Mode | 2s hold = Admin */}
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerCancel}
              onPointerCancel={handlePointerCancel}
              className={`relative cursor-pointer transition-transform select-none shrink-0 ${
                isHolding ? 'scale-95' : 'hover:scale-102 active:scale-95'
              }`}
              title="1 toque: Modo oscuro | Mantener presionado 2s: Acceso Admin"
            >
              <img
                src="/logo.jpg"
                alt="Logo Tunja"
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-contain drop-shadow-sm border border-slate-200 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900 shrink-0"
                draggable={false}
              />
              
              {/* Subtle indicator while holding */}
              {isHolding && (
                <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 animate-pulse bg-emerald-500/10 pointer-events-none"></div>
              )}

              {/* Dark mode badge indicator */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 dark:bg-zinc-800 text-[9px] text-white border border-slate-200 dark:border-zinc-700 shadow-xs pointer-events-none">
                {isDarkMode ? '🌙' : '☀️'}
              </span>

              {isAdmin && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Title */}
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase truncate">
                Microfútbol <span className="text-emerald-500">Tunja</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium truncate">
                4 Grupos • 5 a 12 jugadores
              </p>
            </div>
          </div>

          {/* Right section: Instant Refresh Button & Admin state */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualizar datos ahora"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-800 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl transition-all border border-slate-200 dark:border-zinc-800 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Cargando...' : 'Actualizar'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors border border-red-200 dark:border-red-900 cursor-pointer"
                title="Cerrar modo administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Scrollable on phone with smooth touch) */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 dark:border-zinc-800/80 py-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'groups'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Tablas</span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Partidos</span>
          </button>

          <button
            onClick={() => setActiveTab('playoffs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'playoffs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Playoffs</span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'teams'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Equipos</span>
          </button>

          <button
            onClick={() => setActiveTab('scorers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'scorers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Goleadores ⚽</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ml-auto cursor-pointer shrink-0 ${
                activeTab === 'admin'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 ring-2 ring-emerald-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Panel Admin</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
