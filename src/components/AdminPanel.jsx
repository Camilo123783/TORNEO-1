import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Calendar, 
  Trophy, 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Check, 
  ArrowRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { calculateGroupStandings } from '../utils/standingsCalculator';

export default function AdminPanel({ 
  teams, 
  setTeams, 
  matches, 
  setMatches, 
  onEditMatch, 
  onResetTournament,
  onSaveSingleMatch
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('matches'); // 'matches', 'teams', 'settings'
  const [editingTeam, setEditingTeam] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Save team edition
  const handleSaveTeam = (e) => {
    e.preventDefault();
    if (!editingTeam) return;

    const updatedTeams = teams.map((t) => (t.id === editingTeam.id ? editingTeam : t));
    setTeams(updatedTeams);
    setEditingTeam(null);
    showNotification('Equipo actualizado correctamente');
  };

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sesión de Administrador Autorizada
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Panel de Administración del Torneo
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Carga resultados, actualiza marcadores en tiempo real, edita equipos y define las llaves eliminatorias de la fase final.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAutoSeedQuarterfinals}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clasificar a Cuartos (Auto)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Equipos</span>
            <span className="text-xl font-black text-white">{teams.length}</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Partidos Jugados</span>
            <span className="text-xl font-black text-emerald-400">
              {finishedMatches} / {totalMatches}
            </span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Goles Totales</span>
            <span className="text-xl font-black text-amber-400">{totalGoals}</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Formato</span>
            <span className="text-xs font-bold text-slate-300">4 Grupos x 3</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveAdminTab('matches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'matches'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Cargar Marcadores ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('teams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'teams'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestionar Equipos ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeAdminTab === 'settings'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Opciones / Reinicio</span>
        </button>
      </div>

      {/* TAB 1: MATCHES LIST WITH QUICK SCORE INPUTS */}
      {activeAdminTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Haz clic en los botones <b>+</b> y <b>-</b> para cambiar goles al instante o presiona el lápiz para editar completo.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const home = m.home_team_id ? getTeam(m.home_team_id) : null;
              const away = m.away_team_id ? getTeam(m.away_team_id) : null;

              return (
                <div
                  key={m.id}
                  className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                    <span className="font-bold text-slate-300">
                      {m.round} {m.group ? `(Grupo ${m.group})` : `(${m.bracket_code || 'Playoff'})`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        m.status === 'finished'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.status === 'live'
                          ? 'bg-red-500/20 text-red-300 animate-pulse'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {m.status === 'finished' ? 'Finalizado' : m.status === 'live' ? 'En Juego' : 'Programado'}
                      </span>
                      <button
                        onClick={() => onEditMatch(m)}
                        className="p-1 rounded-md text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Editar partido completo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Score Controller */}
                  <div className="grid grid-cols-12 items-center gap-2 py-2">
                    
                    {/* Home Team & Controls */}
                    <div className="col-span-5 flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="truncate text-xs font-bold text-slate-200 pr-1">
                        <span className="mr-1">{home ? home.logo : '🛡️'}</span>
                        <span>{home ? home.name : (m.home_label || 'Local')}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'home', -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-black text-emerald-400 text-sm">
                          {m.home_score !== null ? m.home_score : 0}
                        </span>
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'home', 1)}
                          className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="col-span-2 text-center text-xs font-bold text-slate-500">
                      VS
                    </div>

                    {/* Away Team & Controls */}
                    <div className="col-span-5 flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'away', -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-black text-emerald-400 text-sm">
                          {m.away_score !== null ? m.away_score : 0}
                        </span>
                        <button
                          onClick={() => handleQuickScoreChange(m.id, 'away', 1)}
                          className="w-6 h-6 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <div className="truncate text-xs font-bold text-slate-200 pl-1 text-right">
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

      {/* TAB 2: TEAMS MANAGEMENT */}
      {activeAdminTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 relative group hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    Grupo {t.group}
                  </span>
                  <button
                    onClick={() => setEditingTeam(t)}
                    className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {t.logo || '⚽'}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-white text-sm truncate">{t.name}</h4>
                    <p className="text-[11px] text-slate-400">ID: {t.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Team Modal */}
          {editingTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Editar Equipo</h3>
                <form onSubmit={handleSaveTeam} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.name}
                      onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Emoji / Logo</label>
                    <input
                      type="text"
                      value={editingTeam.logo}
                      onChange={(e) => setEditingTeam({ ...editingTeam, logo: e.target.value })}
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="⚽, 🔥, ⚡, 🦁"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Grupo Asignado</label>
                    <select
                      value={editingTeam.group}
                      onChange={(e) => setEditingTeam({ ...editingTeam, group: e.target.value })}
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="A">Grupo A</option>
                      <option value="B">Grupo B</option>
                      <option value="C">Grupo C</option>
                      <option value="D">Grupo D</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingTeam(null)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SETTINGS & RESET */}
      {activeAdminTab === 'settings' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Opciones Generales del Torneo</h3>
            <p className="text-xs text-slate-400">Acciones administrativas de control.</p>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-red-300">Reiniciar Torneo a Estado Inicial</h4>
              <p className="text-xs text-red-400/80">
                Restablece los 12 equipos y el fixture de partidos a los valores por defecto.
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
      )}

    </div>
  );
}
