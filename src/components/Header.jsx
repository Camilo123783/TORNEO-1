import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Calendar, ShieldCheck, LogOut, Sparkles, Users, Award, RefreshCw } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  onOpenLogin, 
  onLogout,
  onRefresh,
  isRefreshing
}) {
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef(null);

  // Long-press detection (2 seconds = 2000ms) on the logo
  const startPress = () => {
    if (isAdmin) return;
    setIsHolding(true);
    timerRef.current = setTimeout(() => {
      setIsHolding(false);
      onOpenLogin();
    }, 2000);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm select-none w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main top row */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Tournament Logo with 2-second Long Press */}
            <div
              onMouseDown={startPress}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={startPress}
              onTouchEnd={cancelPress}
              onTouchCancel={cancelPress}
              className={`relative cursor-pointer transition-transform select-none shrink-0 ${
                isHolding ? 'scale-95' : 'hover:scale-102'
              }`}
              title="Mantén presionado 2s para entrar a admin"
            >
              <img
                src="/logo.jpg"
                alt="Logo Tunja"
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-contain drop-shadow-sm border border-slate-200 p-0.5 bg-white shrink-0"
                draggable={false}
              />
              
              {/* Subtle indicator while holding */}
              {isHolding && (
                <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500 animate-pulse bg-emerald-500/10 pointer-events-none"></div>
              )}

              {isAdmin && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase truncate">
                  Microfútbol <span className="text-emerald-600">Tunja</span>
                </h1>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase px-1.5 sm:px-2.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  12 Eq.
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all border border-slate-200 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Cargando...' : 'Actualizar'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200 cursor-pointer"
                title="Cerrar modo administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Scrollable on phone with smooth touch) */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 py-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'groups'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Equipos (12)</span>
          </button>

          <button
            onClick={() => setActiveTab('scorers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activeTab === 'scorers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Panel Admin</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
