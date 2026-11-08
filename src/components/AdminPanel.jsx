import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Users, 
  Calendar, 
  Sparkles, 
  Edit3, 
  Check, 
  Key,
  UserCheck,
  Save,
  Plus,
  Minus,
  RotateCcw,
  ShieldAlert,
  Trash2
} from 'lucide-react';
import { calculateGroupStandings, isGroupCompleted, getResolvedPlayoffMatch } from '../tournamentData';
import { GoalAssignModal, MatchCardsModal, ConfirmModal } from './Modals';

export default function AdminPanel({ 
  teams, 
  matches, 
  setMatches, 
  cards = [],
  onSaveCard,
  onDeleteCard,
  onEditMatch, 
  onEditTeam,
  onResetTournament,
  onSaveSingleMatch,
  onUpdatePlayerGoals,
  adminCedula = '7530',
  adminPassword = '1590',
  onUpdateCredentials
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('matches'); // 'matches', 'cards', 'teams', 'settings'
  const [successMsg, setSuccessMsg] = useState('');
  const [goalModalData, setGoalModalData] = useState(null); // { match, team, teamType, mode: 'add'|'subtract' }
  const [editingCardsMatch, setEditingCardsMatch] = useState(null); // match for cards modal
  const [confirmConfig, setConfirmConfig] = useState(null); // In-app confirmation dialog

  // Custom credentials state (Cédula 7530, Clave 1590 sincronizadas en Supabase)
  const [customCedula, setCustomCedula] = useState(adminCedula);
  const [customPass, setCustomPass] = useState(adminPassword);

  React.useEffect(() => {
    setCustomCedula(adminCedula);
    setCustomPass(adminPassword);
  }, [adminCedula, adminPassword]);

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
      showNotification('⚠️ La cédula y la contraseña no pueden estar vacías.');
      return;
    }
    if (onUpdateCredentials) {
      onUpdateCredentials(customCedula.trim(), customPass.trim());
    }
    showNotification('¡Cédula y contraseña de administrador actualizadas en Supabase!');
  };

  // Automatic propagation notice
  const handleAutoSeedQuarterfinals = () => {
    const allCompleted = ['A', 'B', 'C', 'D'].every(grp => isGroupCompleted(matches, grp));
    if (!allCompleted) {
      showNotification('ℹ️ Clasificación automática activa: Cada grupo avanzará a Cuartos inmediatamente al completar sus 3 partidos.');
    } else {
      showNotification('✅ ¡Todos los grupos han completado sus 3 partidos y los clasificados ya están en Cuartos de Final!');
    }
  };

  // Quick score updater sin modal (para equipos TBD o sin plantilla)
  const handleDirectScoreChange = (matchId, teamType, delta) => {
    let updatedMatch = null;
    const now = Date.now();
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
          status: m.status === 'scheduled' ? 'live' : m.status,
          local_updated_at: now,
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

  // Clic en '+' para anotar gol: Abre modal para elegir jugador autor del gol
  const handlePlusScore = (match, team, teamType) => {
    if (!team || !team.players || team.players.length === 0) {
      handleDirectScoreChange(match.id, teamType, 1);
      return;
    }
    setGoalModalData({ match, team, teamType, mode: 'add' });
  };

  // Clic en '-' para restar gol: Abre modal para descontar a jugador
  const handleMinusScore = (match, team, teamType) => {
    const currentScore = teamType === 'home' ? match.home_score : match.away_score;
    if (!currentScore || currentScore <= 0) return;

    if (!team || !team.players || team.players.length === 0) {
      handleDirectScoreChange(match.id, teamType, -1);
      return;
    }
    setGoalModalData({ match, team, teamType, mode: 'subtract' });
  };

  // Confirmar gol desde el modal: suma al marcador y al jugador en tabla de goleadores
  const handleConfirmGoal = (playerId) => {
    if (!goalModalData) return;
    const { match, team, teamType, mode } = goalModalData;
    const delta = mode === 'add' ? 1 : -1;

    let currentHome = match.home_score !== null ? match.home_score : 0;
    let currentAway = match.away_score !== null ? match.away_score : 0;

    if (teamType === 'home') {
      currentHome = Math.max(0, currentHome + delta);
    } else {
      currentAway = Math.max(0, currentAway + delta);
    }

    const updatedMatch = {
      ...match,
      home_score: currentHome,
      away_score: currentAway,
      status: match.status === 'scheduled' ? 'live' : match.status,
      local_updated_at: Date.now(),
    };

    // Actualizar partido en memoria y en Supabase
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    if (onSaveSingleMatch) {
      onSaveSingleMatch(updatedMatch);
    }

    // Actualizar goles del jugador en memoria y en Supabase (tabla players y goleadores)
    if (playerId && team && onUpdatePlayerGoals) {
      onUpdatePlayerGoals(team.id, playerId, delta);
    }

    const playerName = playerId && team?.players
      ? team.players.find((p) => p.id === playerId)?.name
      : null;

    if (mode === 'add') {
      showNotification(
        playerName
          ? `⚽ ¡Gol validado a ${playerName}! (${team.name} ${currentHome} - ${currentAway})`
          : `⚽ ¡Gol sumado a ${team.name}! (${currentHome} - ${currentAway})`
      );
    } else {
      showNotification(
        playerName
          ? `⚠️ Gol descontado a ${playerName}. (${team.name} ${currentHome} - ${currentAway})`
          : `⚠️ Marcador ajustado para ${team.name}. (${currentHome} - ${currentAway})`
      );
    }

    setGoalModalData(null);
  };

  // Direct status updater
  const handleStatusChange = (matchId, newStatus) => {
    let updatedMatch = null;
    const now = Date.now();
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        updatedMatch = {
          ...m,
          status: newStatus,
          home_score: m.home_score !== null ? m.home_score : 0,
          away_score: m.away_score !== null ? m.away_score : 0,
          local_updated_at: now,
        };
        return updatedMatch;
      }
      return m;
    });

    setMatches(updated);
    if (updatedMatch && onSaveSingleMatch) {
      onSaveSingleMatch(updatedMatch);
    }
    const label = newStatus === 'finished' ? 'Finalizado' : newStatus === 'live' ? 'En Vivo' : 'Programado';
    showNotification(`Estado del partido actualizado a: ${label}`);
  };

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border border-emerald-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Sesión de Administrador
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Panel de Administración
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-medium mt-1">
              Carga marcadores, edita equipos y plantillas (5 a 12 jugadores).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setConfirmConfig({
                  title: '¿Reiniciar Torneo y Marcadores?',
                  message: 'Esta acción restablecerá todos los marcadores a 0-0 (programados), pondrá en cero los goles en la tabla de goleadores, limpiará las llaves de playoffs y eliminará las tarjetas registradas.\n\n¿Deseas continuar?',
                  confirmText: 'Reiniciar Todo',
                  isDanger: true,
                  onConfirm: () => {
                    if (onResetTournament) {
                      onResetTournament();
                      showNotification('¡Torneo y resultados reiniciados exitosamente!');
                    }
                  }
                });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
              title="Reiniciar todos los resultados y marcadores a cero"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Torneo (Resultados)</span>
            </button>

            <button
              onClick={handleAutoSeedQuarterfinals}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clasificar a Cuartos (Auto)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-emerald-200/60 dark:border-zinc-800">
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200/70 dark:border-zinc-800 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Equipos</span>
            <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white">{teams.length}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200/70 dark:border-zinc-800 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Partidos</span>
            <span className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-400">
              {finishedMatches} / {totalMatches}
            </span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200/70 dark:border-zinc-800 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Goles Totales</span>
            <span className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400">{totalGoals}</span>
          </div>
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200/70 dark:border-zinc-800 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 block font-semibold">Reglamento</span>
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-zinc-300">5 a 12 jug.</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('matches')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'matches'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Marcadores ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('cards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'cards'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Tarjetas ({cards.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('teams')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'teams'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Equipos ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Opciones</span>
        </button>
      </div>

      {/* TAB 1: MATCHES LIST WITH MOBILE-PERFECT QUICK SCORE INPUTS */}
      {activeAdminTab === 'matches' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Pulsa <b>+</b> y <b>-</b> para cambiar goles al instante o el lápiz para editar completo.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {matches.map((rawM) => {
              const m = rawM.phase === 'playoffs' ? getResolvedPlayoffMatch(rawM, teams, matches) : rawM;
              const home = m.resolvedHomeTeam || (m.home_team_id ? getTeam(m.home_team_id) : null);
              const away = m.resolvedAwayTeam || (m.away_team_id ? getTeam(m.away_team_id) : null);
              const matchCards = (cards || []).filter((c) => c.match_id === m.id);

              return (
                <div
                  key={m.id}
                  className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-3 sm:p-4 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-zinc-800 text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[170px] sm:max-w-none">
                      {m.round} {m.group ? `(Grupo ${m.group})` : `(${m.bracket_code || 'Playoff'})`}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Direct 1-Click Status Selector */}
                      <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(m.id, 'scheduled')}
                          title="Marcar como Programado"
                          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            m.status === 'scheduled'
                              ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          Próx
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(m.id, 'live')}
                          title="Marcar como En Juego"
                          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            m.status === 'live'
                              ? 'bg-red-600 text-white shadow-2xs font-extrabold animate-pulse'
                              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          🔴 Vivo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(m.id, 'finished')}
                          title="Marcar como Finalizado"
                          className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                            m.status === 'finished'
                              ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                          }`}
                        >
                          ✅ Final
                        </button>
                      </div>

                      {/* Botón de Tarjetas en este partido */}
                      <button
                        type="button"
                        onClick={() => setEditingCardsMatch(m)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer border ${
                          matchCards.length > 0
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:text-amber-600'
                        }`}
                        title="Gestionar tarjetas (Amarillas y Rojas) de este partido"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                        <span>Tarjetas ({matchCards.length})</span>
                      </button>

                      <button
                        onClick={() => onEditMatch(m)}
                        className="p-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar partido completo (equipos, fecha)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clean row-based score controller */}
                  <div className="space-y-2 py-1">
                    
                    {/* Home Team Row with Score Controls */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 gap-2">
                      <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                        <span className="text-base select-none shrink-0">{home ? home.logo : '🛡️'}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {home ? home.name : (m.home_label || 'Local')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMinusScore(m, home, 'home')}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-black text-xs flex items-center justify-center border border-slate-300 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-90"
                          title="Restar gol"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {m.home_score !== null ? m.home_score : 0}
                        </span>
                        <button
                          onClick={() => handlePlusScore(m, home, 'home')}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-2xs cursor-pointer active:scale-90"
                          title="Anotar gol (seleccionar jugador)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Away Team Row with Score Controls */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 gap-2">
                      <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                        <span className="text-base select-none shrink-0">{away ? away.logo : '🛡️'}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {away ? away.name : (m.away_label || 'Visitante')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMinusScore(m, away, 'away')}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-black text-xs flex items-center justify-center border border-slate-300 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-90"
                          title="Restar gol"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {m.away_score !== null ? m.away_score : 0}
                        </span>
                        <button
                          onClick={() => handlePlusScore(m, away, 'away')}
                          className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-2xs cursor-pointer active:scale-90"
                          title="Anotar gol (seleccionar jugador)"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: CARDS MANAGEMENT TAB */}
      {activeAdminTab === 'cards' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-300">
                Registro de Tarjetas & Sanciones Disciplinarias ({cards.length})
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                Para asignar una tarjeta a un jugador, ve a la pestaña <b>Marcadores</b> y pulsa en el botón <b>"Tarjetas"</b> de su partido.
              </p>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="py-10 text-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-sm">
              <span className="text-3xl block mb-2">🕊️</span>
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                No hay tarjetas registradas en el torneo
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Todas las amonestaciones asignadas desde los partidos aparecerán aquí con opción para eliminarlas si hubo error.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm space-y-2">
              {cards.map((c) => {
                const team = teams.find((t) => t.id === c.team_id);
                const player = team?.players?.find((p) => p.id === c.player_id);
                const match = matches.find((m) => m.id === c.match_id);
                const matchHome = teams.find((t) => t.id === match?.home_team_id);
                const matchAway = teams.find((t) => t.id === match?.away_team_id);
                const isDoubleYellow = c.card_type === 'double_yellow';
                const isRed = c.card_type === 'red';

                return (
                  <div
                    key={c.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border gap-2.5 ${
                      isRed || isDoubleYellow
                        ? 'border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20'
                        : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 font-mono font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 shadow-2xs">
                        #{player?.number || '?'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {player?.name || 'Jugador'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                            ({team?.logo} {team?.name})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
                          {match?.round || 'Partido'}: <span className="font-semibold">{matchHome?.name || 'Local'} vs {matchAway?.name || 'Visitante'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      {isDoubleYellow ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white">
                          🟨🟨 Doble Amarilla (Expulsado)
                        </span>
                      ) : isRed ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white">
                          🟥 Roja Directa (Expulsado)
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                          🟨 Tarjeta Amarilla
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmConfig({
                            title: '¿Eliminar Tarjeta?',
                            message: `¿Estás seguro de que deseas eliminar la tarjeta de ${player?.name || 'este jugador'}? Esta acción actualizará las estadísticas de inmediato.`,
                            confirmText: 'Eliminar Tarjeta',
                            isDanger: true,
                            onConfirm: () => {
                              onDeleteCard(c.id);
                              showNotification('Tarjeta eliminada correctamente.');
                            },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar tarjeta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAMS & ROSTERS MANAGEMENT */}
      {activeAdminTab === 'teams' && (
        <div className="space-y-3 sm:space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 font-medium">
            💡 Toca en <b>"Editar Nombre y Plantilla"</b> para cambiar el nombre del equipo, escudo o agregar jugadores (5 a 12).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {teams.map((t) => {
              const players = t.players || [];
              const isMinMet = players.length >= 5;

              return (
                <div
                  key={t.id}
                  className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 relative group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Grupo {t.group}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isMinMet ? 'bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {players.length} / 12 jug.
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 my-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xl shadow-inner shrink-0">
                        {t.logo || '⚽'}
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{t.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">
                          {players.length} inscritos
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onEditTeam(t)}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-zinc-800"
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
        <div className="space-y-4 sm:space-y-6">
          
          {/* Change Credentials Form (Solo Números) */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Personalizar Cédula y Clave</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mb-3">
              Cambia la cédula y la contraseña numéricas con las que ingresas en el modo oculto.
            </p>

            <form onSubmit={handleSaveCredentials} className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Cédula de Administrador
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={customCedula}
                    onChange={(e) => setCustomCedula(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="7530"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={customPass}
                    onChange={(e) => setCustomPass(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-bold font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="1590"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar Nuevas Credenciales
              </button>
            </form>
          </div>

          {/* Reset tournament */}
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm transition-colors">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1">Zona de Peligro</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Acciones irreversibles para reiniciar el torneo.</p>

            <div className="p-3.5 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-red-800 dark:text-red-300">Reiniciar Torneo a Estado Inicial</h4>
                <p className="text-[11px] text-red-600/90 dark:text-red-400 font-medium">
                  Restablece todos los marcadores y los 12 equipos a los valores iniciales.
                </p>
              </div>
              <button
                onClick={() => {
                  setConfirmConfig({
                    title: '¿Reiniciar Torneo a Estado Inicial?',
                    message: 'Se restablecerán todos los marcadores y los 12 equipos a los valores iniciales.\n\n¿Estás seguro?',
                    confirmText: 'Reiniciar Torneo',
                    isDanger: true,
                    onConfirm: () => {
                      onResetTournament();
                      showNotification('El torneo ha sido reiniciado.');
                    },
                  });
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer text-center"
              >
                Reiniciar Torneo
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Modal para Asignar Autor del Gol para Validar */}
      <GoalAssignModal
        isOpen={Boolean(goalModalData)}
        onClose={() => setGoalModalData(null)}
        match={goalModalData?.match}
        team={goalModalData?.team}
        teamType={goalModalData?.teamType}
        mode={goalModalData?.mode}
        onConfirmGoal={handleConfirmGoal}
      />

      {/* Modal para Gestión de Tarjetas Disciplinarias por Partido */}
      <MatchCardsModal
        isOpen={Boolean(editingCardsMatch)}
        onClose={() => setEditingCardsMatch(null)}
        match={editingCardsMatch}
        teams={teams}
        cards={cards}
        onSaveCard={onSaveCard}
        onDeleteCard={onDeleteCard}
      />

      {/* Modal de Confirmación Moderno (Directo en la App, sin ventanas del navegador) */}
      <ConfirmModal
        isOpen={Boolean(confirmConfig)}
        title={confirmConfig?.title}
        message={confirmConfig?.message}
        confirmText={confirmConfig?.confirmText || 'Confirmar'}
        cancelText="Cancelar"
        isDanger={confirmConfig?.isDanger !== false}
        onConfirm={() => {
          if (confirmConfig?.onConfirm) confirmConfig.onConfirm();
          setConfirmConfig(null);
        }}
        onClose={() => setConfirmConfig(null)}
      />

    </div>
  );
}
