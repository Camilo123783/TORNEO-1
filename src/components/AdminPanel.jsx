import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Edit3, 
  Check, 
  Key,
  UserCheck,
  Save,
  AlertTriangle
} from 'lucide-react';
import { calculateGroupStandings } from '../utils/standingsCalculator';

export default function AdminPanel({ 
  teams, 
  matches, 
  setMatches, 
  onEditMatch, 
  onEditTeam,
  onResetTournament,
  onSaveSingleMatch
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('matches'); // 'matches', 'teams', 'settings'
  const [successMsg, setSuccessMsg] = useState('');

  // Custom credentials state (Cédula 7530, Clave 1590)
  const [customCedula, setCustomCedula] = useState(
    localStorage.getItem('torneo_admin_cedula') || '7530'
  );
  const [customPass, setCustomPass] = useState(
    localStorage.getItem('torneo_admin_password') || '1590'
  );

  // Quick stats
  const totalMatches = matches.length;
  const finishedMatches = matches.filter((m) => m.status === 'finished').length;
  const totalGoals = matches.reduce((acc, m) => {
    return acc + (m.home_score || 0) + (m.away_score || 0);
  }, 0);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Save new admin credentials
  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (!customCedula.trim() || !customPass.trim()) {
      alert('La cédula y la contraseña no pueden estar vacías.');
      return;
    }
    localStorage.setItem('torneo_admin_cedula', customCedula.trim());
    localStorage.setItem('torneo_admin_password', customPass.trim());
    showNotification('¡Cédula y contraseña de administrador actualizadas correctamente!');
  };

  // Automatic propagation of Group Stage 1st & 2nd places into Quarterfinals (QF1..QF4)
  const handleAutoSeedQuarterfinals = () => {
    const standingsA = calculateGroupStandings(teams, matches, 'A');
    const standingsB = calculateGroupStandings(teams, matches, 'B');
    const standingsC = calculateGroupStandings(teams, matches, 'C');
    const standingsD = calculateGroupStandings(teams, matches, 'D');

    if (!standingsA[0] || !standingsB[1] || !standingsC[0] || !standingsD[1]) {
      alert('Asegúrate de que haya equipos registrados en todos los grupos.');
      return;
    }

    const firstA = standingsA[0]?.team.id;
    const secondA = standingsA[1]?.team.id;

    const firstB = standingsB[0]?.team.id;
    const secondB = standingsB[1]?.team.id;

    const firstC = standingsC[0]?.team.id;
    const secondC = standingsC[1]?.team.id;

    const firstD = standingsD[0]?.team.id;
    const secondD = standingsD[1]?.team.id;

    const updatedMatches = matches.map((m) => {
      if (m.bracket_code === 'QF1') return { ...m, home_team_id: firstA, away_team_id: secondB };
      if (m.bracket_code === 'QF2') return { ...m, home_team_id: firstC, away_team_id: secondD };
      if (m.bracket_code === 'QF3') return { ...m, home_team_id: firstB, away_team_id: secondA };
      if (m.bracket_code === 'QF4') return { ...m, home_team_id: firstD, away_team_id: secondC };
      return m;
    });

    setMatches(updatedMatches);
    if (onSaveSingleMatch) {
      updatedMatches
        .filter((m) => m.bracket_code?.startsWith('QF'))
        .forEach((m) => onSaveSingleMatch(m));
    }
    showNotification('¡Cuartos de final asignados automáticamente según las posiciones de la fase de grupos!');
  };

  // Quick score updater
  const handleQuickScoreChange = (matchId, teamType, delta) => {
    let updatedMatch = null;
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        let currentHome = m.home_score !== null ? m.home_score : 0;
        let currentAway = m.away_score !== null ? m.away_score : 0;

        if (teamType === 'home') {
          currentHome = Math.max(0, currentHome + delta);
        } else {
          currentAway = Math.max(0, currentAway + delta);
        }

        updatedMatch = {
          ...m,
          home_score: currentHome,
          away_score: currentAway,
          status: 'finished',
        };
        return updatedMatch;
      }
      return m;
    });

    setMatches(updated);
    if (updatedMatch && onSaveSingleMatch) {
      onSaveSingleMatch(updatedMatch);
    }
  };

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sesión de Administrador Autorizada
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Panel de Administración del Torneo
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-1 max-w-xl">
              Carga resultados al instante, edita nombres de equipos, registra plantillas (mínimo 5, máximo 12) y gestiona llaves finales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoSeedQuarterfinals}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clasificar a Cuartos (Auto)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-200/60">
          <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
            <span className="text-[11px] text-slate-500 block font-semibold">Equipos</span>
            <span className="text-xl font-black text-slate-900">{teams.length}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
            <span className="text-[11px] text-slate-500 block font-semibold">Partidos Jugados</span>
            <span className="text-xl font-black text-emerald-700">
              {finishedMatches} / {totalMatches}
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
            <span className="text-[11px] text-slate-500 block font-semibold">Goles Totales</span>
            <span className="text-xl font-black text-amber-600">{totalGoals}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-200/70 shadow-sm">
            <span className="text-[11px] text-slate-500 block font-semibold">Reglamento</span>
            <span className="text-xs font-bold text-slate-700">5 a 12 jugadores</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2.5 animate-fadeIn shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveAdminTab('matches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'matches'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Cargar Marcadores ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'teams'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestionar Equipos y Jugadores ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Seguridad & Opciones</span>
        </button>
      </div>

      {/* TAB 1: MATCHES LIST WITH QUICK SCORE INPUTS */}
      {activeAdminTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Usa los botones <b>+</b> y <b>-</b> para cambiar goles al instante o haz clic en el lápiz para editar el partido completo.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const home = m.home_team_id ? getTeam(m.home_team_id) : null;
              const away = m.away_team_id ? getTeam(m.away_team_id) : null;

              return (
                <div
                  key={m.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
                    <span className="font-extrabold text-slate-800">
                      {m.round} {m.group ? `(Grupo ${m.group})` : `(${m.bracket_code || 'Playoff'})`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        m.status === 'finished'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'live'
                          ? 'bg-red-50 text-red-700 animate-pulse'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {m.status === 'finished' ? 'Finalizado' : m.status === 'live' ? 'En Juego' : 'Programado'}
                      </span>
                      <button
                        onClick={() => onEditMatch(m)}
                        className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Editar partido completo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Score Controller */}
                  <div className="grid grid-cols-12 items-center gap-2 py-2">
                    
                    {/* Home Team & Controls */}
                    <div className="col-span-5 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="truncate text-xs font-bold text-slate-800 pr-1">
                        <span className="mr-1">{home ? home.logo : '🛡️'}</span>
                        <span>{home ? home.name : (m.home_label || 'Local')}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'home', -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-black text-emerald-700 text-sm">
                          {m.home_score !== null ? m.home_score : 0}
                        </span>
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'home', 1)}
                          className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-center text-xs font-bold text-slate-400">
                      VS
                    </div>

                    {/* Away Team & Controls */}
                    <div className="col-span-5 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'away', -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center border border-slate-300 shadow-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-black text-emerald-700 text-sm">
                          {m.away_score !== null ? m.away_score : 0}
                        </span>
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'away', 1)}
                          className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="truncate text-xs font-bold text-slate-800 pl-1 text-right">
                        <span>{away ? away.name : (m.away_label || 'Visitante')}</span>
                        <span className="ml-1">{away ? away.logo : '🛡️'}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TEAMS & ROSTERS MANAGEMENT */}
      {activeAdminTab === 'teams' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium">
            💡 Haz clic en <b>"Editar Nombre y Plantilla"</b> en cualquier equipo para cambiar su nombre, escudo, o agregar/eliminar jugadores (mínimo 5, máximo 12).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((t) => {
              const players = t.players || [];
              const isMinMet = players.length >= 5;

              return (
                <div
                  key={t.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 relative group hover:border-emerald-400 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Grupo {t.group}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        isMinMet ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {players.length} / 12 jug.
                      </span>
                    </div>

                    <div className="flex items-center gap-3 my-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {t.logo || '⚽'}
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{t.name}</h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {players.length} inscritos
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditTeam(t)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Nombre y Plantilla</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & CUSTOM CREDENTIALS */}
      {activeAdminTab === 'settings' && (
        <div className="space-y-6">
          
          {/* Change Credentials Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">Personalizar Acceso de Administrador</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-4">
              Cambia la cédula y la contraseña con las que ingresas en el modo oculto.
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cédula de Administrador
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customCedula}
                    onChange={(e) => setCustomCedula(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="7530"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={customPass}
                    onChange={(e) => setCustomPass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                    placeholder="1590"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Nuevas Credenciales
              </button>
            </form>
          </div>

          {/* Reset tournament */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1">Zona de Peligro</h3>
            <p className="text-xs text-slate-500 mb-4">Acciones irreversibles para reiniciar el torneo.</p>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-red-800">Reiniciar Torneo a Estado Inicial</h4>
                <p className="text-xs text-red-600/90 font-medium">
                  Restablece todos los marcadores y los 12 equipos a los valores iniciales.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas restablecer los datos del torneo?')) {
                    onResetTournament();
                    showNotification('El torneo ha sido reiniciado.');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
              >
                Reiniciar Torneo
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
