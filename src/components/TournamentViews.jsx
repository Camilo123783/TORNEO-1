import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Edit3, 
  Sparkles, 
  Users, 
  Award, 
  Search, 
  AlertTriangle, 
  Minus, 
  Plus 
} from 'lucide-react';
import { 
  calculateGroupStandings, 
  isGroupCompleted, 
  getGroupStatus, 
  getResolvedPlayoffMatches, 
  getResolvedPlayoffMatch 
} from '../tournamentData';

// ============================================================================
// 1. GROUP STANDINGS (Tablas de Posiciones Grupos A, B, C, D)
// ============================================================================
export function GroupStandings({ teams, matches }) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const groups = ['A', 'B', 'C', 'D'];
  const liveMatches = matches.filter((m) => m.status === 'live');

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Live matches ticker banner if any match is in play */}
      {liveMatches.length > 0 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/40 dark:border-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="font-black text-xs sm:text-sm text-red-700 dark:text-red-300 uppercase tracking-wide">
              {liveMatches.length === 1 ? 'Partido En Vivo Ahora' : `${liveMatches.length} Partidos En Vivo Ahora`}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {liveMatches.map((m) => {
              const h = teams.find((t) => t.id === m.home_team_id);
              const a = teams.find((t) => t.id === m.away_team_id);
              return (
                <div key={m.id} className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs whitespace-nowrap text-xs">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{h ? h.name : 'Local'}</span>
                  <span className="font-mono font-black text-white bg-red-600 px-2 py-0.5 rounded-md text-xs">
                    {m.home_score !== null ? m.home_score : 0} - {m.away_score !== null ? m.away_score : 0}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{a ? a.name : 'Visitante'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Tablas de Posiciones</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            1º y 2º de cada grupo avanzan a Cuartos de Final (al completar los 3 PJ)
          </p>
        </div>

        {/* Group selector pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedGroup === 'ALL'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedGroup === grp
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grupo {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {groups
          .filter((grp) => selectedGroup === 'ALL' || selectedGroup === grp)
          .map((grp) => {
            const standings = calculateGroupStandings(teams, matches, grp);
            const status = getGroupStatus(matches, grp);
            const isCompleted = status.isCompleted;

            return (
              <div
                key={grp}
                className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden w-full max-w-full"
              >
                {/* Group Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-400 text-base sm:text-lg shadow-sm shrink-0">
                      {grp}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">Grupo {grp}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium">3 Equipos</p>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        Completado (3/3 PJ)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        En juego ({status.finished}/3 PJ)
                      </span>
                    )}
                  </div>
                </div>

                {/* Table with responsive horizontal scrolling container */}
                <div className="w-full overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[340px] text-left text-xs">
                    <thead>
                      <tr className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80">
                        <th className="py-2 px-1 text-center w-6">#</th>
                        <th className="py-2 px-2">Equipo</th>
                        <th className="py-2 px-1 text-center" title="Partidos Jugados">PJ</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Ganados">PG</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Empatados">PE</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Perdidos">PP</th>
                        <th className="py-2 px-1 text-center" title="Goles a Favor">GF</th>
                        <th className="py-2 px-1 text-center" title="Goles en Contra">GC</th>
                        <th className="py-2 px-1.5 text-center font-black" title="Diferencia de Gol">DG</th>
                        <th className="py-2 px-2 text-center font-black text-emerald-700 dark:text-emerald-400" title="Puntos">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {standings.map((row, idx) => {
                        const qualifies = idx < 2;
                        return (
                          <tr
                            key={row.team.id}
                            className={`transition-colors ${
                              qualifies 
                                ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 bg-white dark:bg-zinc-950' 
                                : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50 opacity-80'
                            }`}
                          >
                            <td className="py-2.5 px-1 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold ${
                                  idx === 0
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                    : idx === 1
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                    : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-transparent dark:border-zinc-800'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 font-bold text-slate-800 dark:text-zinc-100">
                              <div className="flex items-center gap-1.5 truncate max-w-[110px] sm:max-w-[160px]">
                                <span className="text-sm select-none shrink-0">{row.team.logo || '⚽'}</span>
                                <span className="truncate">{row.team.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-1 text-center text-slate-600 dark:text-zinc-300 font-semibold">{row.pj}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 dark:text-zinc-300 font-semibold hidden xs:table-cell">{row.pg}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 dark:text-zinc-300 font-semibold hidden xs:table-cell">{row.pe}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 dark:text-zinc-300 font-semibold hidden xs:table-cell">{row.pp}</td>
                            <td className="py-2.5 px-1 text-center text-slate-500 dark:text-zinc-400">{row.gf}</td>
                            <td className="py-2.5 px-1 text-center text-slate-500 dark:text-zinc-400">{row.gc}</td>
                            <td className={`py-2.5 px-1.5 text-center font-bold ${
                              row.dg > 0 ? 'text-emerald-600 dark:text-emerald-400' : row.dg < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-zinc-400'
                            }`}>
                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-sm text-emerald-700 dark:text-emerald-400">
                              <span className="bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                {row.pts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  {isCompleted ? (
                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>1º y 2º clasificados a Cuartos de Final</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Clasifican a Cuartos al finalizar los 3 PJ</span>
                    </div>
                  )}
                  <span>Victoria = 3 pts | Empate = 1 pt</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ============================================================================
// 2. MATCHES LIST (Partidos y Resultados de Fase de Grupos y Playoffs)
// ============================================================================
export function MatchesList({ teams, matches, isAdmin, onEditMatch }) {
  const [filterPhase, setFilterPhase] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  const filteredMatches = matches
    .map((m) => (m.phase === 'playoffs' ? getResolvedPlayoffMatch(m, teams, matches) : m))
    .filter((m) => {
      if (filterPhase !== 'ALL' && m.phase !== filterPhase) return false;
      if (m.phase === 'groups' && filterGroup !== 'ALL' && m.group !== filterGroup) return false;
      if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
      return true;
    });

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Partidos y Resultados</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Marcadores en vivo y programación oficial
          </p>
        </div>

        {/* Filters pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterPhase('ALL')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPhase('groups')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'groups'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grupos
            </button>
            <button
              onClick={() => setFilterPhase('playoffs')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'playoffs'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Playoffs
            </button>
          </div>

          {filterPhase === 'groups' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold">
              {['ALL', 'A', 'B', 'C', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    filterGroup === g
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {g === 'ALL' ? 'Todos' : `Grp ${g}`}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-slate-800 dark:bg-zinc-700 text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            {matches.some((m) => m.status === 'live') && (
              <button
                onClick={() => setFilterStatus('live')}
                className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 font-bold ${
                  filterStatus === 'live'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>En Vivo ({matches.filter((m) => m.status === 'live').length})</span>
              </button>
            )}
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'finished' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Jugados
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Calendar className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-slate-500 dark:text-zinc-400 font-medium text-xs sm:text-sm">No hay partidos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
          {filteredMatches.map((m) => {
            const home = m.resolvedHomeTeam || (m.home_team_id ? getTeam(m.home_team_id) : null);
            const away = m.resolvedAwayTeam || (m.away_team_id ? getTeam(m.away_team_id) : null);

            const homeWon = m.status === 'finished' && m.home_score > m.away_score;
            const awayWon = m.status === 'finished' && m.away_score > m.home_score;

            return (
              <div
                key={m.id}
                className={`bg-white dark:bg-zinc-950 border rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden w-full max-w-full ${
                  m.status === 'live'
                    ? 'border-red-500/80 dark:border-red-500/70 ring-2 ring-red-500/25 shadow-md shadow-red-500/10'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                {/* Header row: round & status */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-zinc-800/80 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {m.round}
                    </span>
                    {m.group && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 dark:border-emerald-800 shrink-0">
                        Grupo {m.group}
                      </span>
                    )}
                    {m.phase === 'playoffs' && (
                      <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-200 dark:border-amber-800 shrink-0">
                        Playoff
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.status === 'finished' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-transparent dark:border-zinc-800">
                        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Final
                      </span>
                    )}
                    {m.status === 'live' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500"></span>
                        VIVO
                      </span>
                    )}
                    {m.status === 'scheduled' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                        <Clock className="w-3 h-3" />
                        Próx
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onEditMatch(m)}
                        title="Modificar marcador o fecha"
                        className="ml-1 p-1 rounded-md text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scoreboard layout */}
                <div className="space-y-1.5 sm:space-y-2 py-1">
                  
                  {/* Home Team Row */}
                  <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    homeWon 
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-black' 
                      : 'bg-slate-50/60 dark:bg-zinc-900/70 font-semibold'
                  }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base select-none shrink-0">{home ? home.logo : '🛡️'}</span>
                      <span className={`text-xs sm:text-sm truncate ${
                        homeWon ? 'text-emerald-900 dark:text-emerald-300 font-black' : 'text-slate-800 dark:text-zinc-200'
                      }`}>
                        {home ? home.name : (m.home_label || 'Local')}
                      </span>
                    </div>
                    <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      m.status === 'finished' || m.status === 'live'
                        ? homeWon 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border-slate-200 dark:border-zinc-800'
                    }`}>
                      {m.status === 'finished' || m.status === 'live' ? m.home_score : '-'}
                    </span>
                  </div>

                  {/* Away Team Row */}
                  <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    awayWon 
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-black' 
                      : 'bg-slate-50/60 dark:bg-zinc-900/70 font-semibold'
                  }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base select-none shrink-0">{away ? away.logo : '🛡️'}</span>
                      <span className={`text-xs sm:text-sm truncate ${
                        awayWon ? 'text-emerald-900 dark:text-emerald-300 font-black' : 'text-slate-800 dark:text-zinc-200'
                      }`}>
                        {away ? away.name : (m.away_label || 'Visitante')}
                      </span>
                    </div>
                    <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      m.status === 'finished' || m.status === 'live'
                        ? awayWon 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border-slate-300 dark:border-zinc-700'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 border-slate-200 dark:border-zinc-800'
                    }`}>
                      {m.status === 'finished' || m.status === 'live' ? m.away_score : '-'}
                    </span>
                  </div>

                </div>

                {/* Match Metadata */}
                {m.date && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                      <span className="truncate">{m.date}</span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. PLAYOFF BRACKET (Cuartos, Semifinales, 3er Puesto y Gran Final)
// ==========================================
export function PlayoffBracket({ teams, matches, isAdmin, onEditMatch }) {
  const [mobileTab, setMobileTab] = useState('all'); // 'left', 'center', 'right', 'all'
  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  // Auto-resolve all playoff stages dynamically based on 3 completed matches per group
  const playoffMap = getResolvedPlayoffMatches(matches, teams);

  const qf1 = playoffMap['QF1'];
  const qf2 = playoffMap['QF2'];
  const qf3 = playoffMap['QF3'];
  const qf4 = playoffMap['QF4'];

  const sf1 = playoffMap['SF1'];
  const sf2 = playoffMap['SF2'];

  const finalMatch = playoffMap['FINAL'];
  const thirdMatch = playoffMap['3RD'];

  const champion = finalMatch && finalMatch.status === 'finished' && finalMatch.home_score !== null && finalMatch.away_score !== null
    ? finalMatch.home_score > finalMatch.away_score 
      ? (finalMatch.resolvedHomeTeam || getTeam(finalMatch.home_team_id))
      : finalMatch.away_score > finalMatch.home_score 
      ? (finalMatch.resolvedAwayTeam || getTeam(finalMatch.away_team_id))
      : null
    : null;

  useEffect(() => {
    if (champion) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [champion]);

  const renderBracketMatch = (m, label) => {
    if (!m || !m.id) return null;
    const home = m.resolvedHomeTeam || (m.home_team_id ? getTeam(m.home_team_id) : null);
    const away = m.resolvedAwayTeam || (m.away_team_id ? getTeam(m.away_team_id) : null);

    const homeWon = m.status === 'finished' && m.home_score !== null && m.away_score !== null && m.home_score > m.away_score;
    const awayWon = m.status === 'finished' && m.home_score !== null && m.away_score !== null && m.away_score > m.home_score;

    return (
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:shadow-md relative group transition-all w-full">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-2 pb-1.5 border-b border-slate-100 dark:border-zinc-800/80 gap-1.5">
          <span className="font-extrabold text-slate-800 dark:text-zinc-200 truncate">{label || m.round}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {m.status === 'finished' && (
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-transparent dark:border-emerald-800">Final</span>
            )}
            {m.status === 'live' && (
              <span className="text-[10px] text-red-600 dark:text-red-400 font-black bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded animate-pulse border border-red-200 dark:border-red-900">En Vivo</span>
            )}
            {m.status === 'scheduled' && (
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">Próx</span>
            )}
            {isAdmin && (
              <button
                onClick={() => onEditMatch(m)}
                title="Editar este partido de playoff"
                className="p-1 rounded text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Team 1 */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl text-xs transition-colors gap-2 ${
          homeWon 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : home ? 'text-slate-800 dark:text-zinc-200 font-semibold' : 'text-slate-400 dark:text-zinc-500 font-medium italic'
        }`}>
          <div className="flex items-center gap-2 truncate min-w-0 flex-1">
            <span className="text-base select-none shrink-0">{home ? home.logo : '🛡️'}</span>
            <span className="truncate">{home ? home.name : (m.home_label || 'Por definir')}</span>
          </div>
          <span className="font-mono font-black shrink-0 text-sm">
            {m.status === 'finished' || m.status === 'live' ? m.home_score : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-xl text-xs mt-1 transition-colors gap-2 ${
          awayWon 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : away ? 'text-slate-800 dark:text-zinc-200 font-semibold' : 'text-slate-400 dark:text-zinc-500 font-medium italic'
        }`}>
          <div className="flex items-center gap-2 truncate min-w-0 flex-1">
            <span className="text-base select-none shrink-0">{away ? away.logo : '🛡️'}</span>
            <span className="truncate">{away ? away.name : (m.away_label || 'Por definir')}</span>
          </div>
          <span className="font-mono font-black shrink-0 text-sm">
            {m.status === 'finished' || m.status === 'live' ? m.away_score : '-'}
          </span>
        </div>

        {m.date && (
          <div className="mt-2 text-[10px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-zinc-500 shrink-0" />
            <span>{m.date}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
          <span>Fase Final • Eliminación Directa</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
          2 Llaves a la Izquierda • La Gran Final en el Centro • 2 Llaves a la Derecha (clasificación automática al completar 3 PJ de grupo)
        </p>
      </div>

      {/* Champion Banner */}
      {champion && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 dark:from-amber-950/60 dark:via-yellow-950/40 dark:to-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 text-center shadow-lg animate-fadeIn">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl shadow-md mb-3 animate-bounce">
              🏆
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-900 dark:text-amber-300 mb-1">
              ¡CAMPEÓN DEL TORNEO!
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>{champion.logo}</span>
              <span>{champion.name}</span>
            </h3>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 mt-2 font-bold">
              Felicitaciones por coronarse en el Torneo de Microfútbol Tunja 2026
            </p>
          </div>
        </div>
      )}

      {/* 5-Column Desktop Bracket (2 Llaves a la Izquierda, Gran Final en el Centro, 2 Llaves a la Derecha) */}
      <div className="hidden lg:grid grid-cols-5 gap-3 xl:gap-4 items-stretch">
        
        {/* COL 1: Cuartos Izquierda (QF1 & QF2) */}
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 pb-1.5 border-b border-slate-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span>Cuartos (Izq)</span>
          </div>
          <div className="space-y-4 my-auto">
            {renderBracketMatch(qf1, 'Cuartos 1 (1A vs 2B)')}
            {renderBracketMatch(qf2, 'Cuartos 2 (1C vs 2D)')}
          </div>
        </div>

        {/* COL 2: Semifinal 1 (Avanza a la Gran Final ->) */}
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 pb-1.5 border-b border-slate-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            <span>Semifinal 1</span>
          </div>
          <div className="my-auto space-y-2">
            {renderBracketMatch(sf1, 'Semifinal 1')}
            <div className="flex items-center justify-end text-[10px] font-bold text-slate-400 dark:text-zinc-500 pr-1">
              <span>Avanza a la Gran Final ➔</span>
            </div>
          </div>
        </div>

        {/* COL 3: Centro (Gran Final & 3er Puesto) */}
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 pb-1.5 border-b border-slate-200 dark:border-zinc-800 text-center">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Gran Final & 3º Puesto</span>
          </div>

          <div className="my-auto space-y-4">
            {/* Gran Final */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 dark:from-amber-600 dark:via-yellow-600 dark:to-amber-600 shadow-md">
              {renderBracketMatch(finalMatch, '🏆 PARTIDO POR EL TÍTULO')}
            </div>

            {/* Tercer Puesto */}
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Tercer Puesto</span>
              </div>
              {renderBracketMatch(thirdMatch, 'Partido por el 3er Puesto')}
            </div>
          </div>
        </div>

        {/* COL 4: Semifinal 2 (<- Avanza a la Gran Final) */}
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 pb-1.5 border-b border-slate-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            <span>Semifinal 2</span>
          </div>
          <div className="my-auto space-y-2">
            {renderBracketMatch(sf2, 'Semifinal 2')}
            <div className="flex items-center justify-start text-[10px] font-bold text-slate-400 dark:text-zinc-500 pl-1">
              <span>🠔 Avanza a la Gran Final</span>
            </div>
          </div>
        </div>

        {/* COL 5: Cuartos Derecha (QF3 & QF4) */}
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 pb-1.5 border-b border-slate-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            <span>Cuartos (Der)</span>
          </div>
          <div className="space-y-4 my-auto">
            {renderBracketMatch(qf3, 'Cuartos 3 (1B vs 2A)')}
            {renderBracketMatch(qf4, 'Cuartos 4 (1D vs 2C)')}
          </div>
        </div>

      </div>

      {/* Mobile Bracket View: Segmented pill selector so nothing overflows mobile screens */}
      <div className="block lg:hidden space-y-4">
        <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setMobileTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mobileTab === 'all'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            Ver Todo
          </button>
          <button
            onClick={() => setMobileTab('left')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mobileTab === 'left'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            🔵 Lado Izquierdo
          </button>
          <button
            onClick={() => setMobileTab('center')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mobileTab === 'center'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            🏆 La Gran Final
          </button>
          <button
            onClick={() => setMobileTab('right')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mobileTab === 'right'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400'
            }`}
          >
            🔴 Lado Derecho
          </button>
        </div>

        {/* Section 1: Lado Izquierdo (Cuartos 1, 2 -> Semifinal 1) */}
        {(mobileTab === 'all' || mobileTab === 'left') && (
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
              <span>Lado Izquierdo: Cuartos 1 y 2 ➔ Semifinal 1</span>
            </div>
            {renderBracketMatch(qf1, 'Cuartos 1 (1A vs 2B)')}
            {renderBracketMatch(qf2, 'Cuartos 2 (1C vs 2D)')}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
              <span className="block text-[11px] font-black uppercase text-blue-700 dark:text-blue-400 mb-2">
                Semifinal 1 (Ganador QF1 vs Ganador QF2)
              </span>
              {renderBracketMatch(sf1, 'Semifinal 1')}
            </div>
          </div>
        )}

        {/* Section 2: Centro (La Gran Final & 3er Puesto) */}
        {(mobileTab === 'all' || mobileTab === 'center') && (
          <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-700 dark:text-amber-400">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Centro: La Gran Final & 3er Puesto</span>
            </div>
            <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 dark:from-amber-600 dark:via-yellow-600 dark:to-amber-600 shadow-md">
              {renderBracketMatch(finalMatch, '🏆 PARTIDO POR EL TÍTULO')}
            </div>
            <div className="pt-2">
              <span className="block text-[11px] font-extrabold uppercase text-slate-500 dark:text-zinc-400 mb-1.5">
                Partido por el 3er Puesto
              </span>
              {renderBracketMatch(thirdMatch, 'Partido por el 3er Puesto')}
            </div>
          </div>
        )}

        {/* Section 3: Lado Derecho (Cuartos 3, 4 -> Semifinal 2) */}
        {(mobileTab === 'all' || mobileTab === 'right') && (
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
              <span>Lado Derecho: Cuartos 3 y 4 ➔ Semifinal 2</span>
            </div>
            {renderBracketMatch(qf3, 'Cuartos 3 (1B vs 2A)')}
            {renderBracketMatch(qf4, 'Cuartos 4 (1D vs 2C)')}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
              <span className="block text-[11px] font-black uppercase text-blue-700 dark:text-blue-400 mb-2">
                Semifinal 2 (Ganador QF3 vs Ganador QF4)
              </span>
              {renderBracketMatch(sf2, 'Semifinal 2')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 4. TEAMS LIST (12 Equipos y Nóminas de 5 a 12 Jugadores)
// ============================================================================
export function TeamsList({ teams, onEditTeam, isAdmin }) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = teams.filter((t) => {
    if (selectedGroup !== 'ALL' && t.group !== selectedGroup) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchesTeam = t.name.toLowerCase().includes(term);
      const matchesPlayer = (t.players || []).some((p) => p.name.toLowerCase().includes(term));
      return matchesTeam || matchesPlayer;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Equipos y Plantillas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            5 a 12 jugadores por equipo
          </p>
        </div>

        {/* Group Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar equipo o jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold overflow-x-auto no-scrollbar shrink-0 justify-center">
            <button
              onClick={() => setSelectedGroup('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGroup === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            {['A', 'B', 'C', 'D'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedGroup === g
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Grp {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const players = team.players || [];
          const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
          const isMinMet = players.length >= 5;

          return (
            <div
              key={team.id}
              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl shadow-sm shrink-0">
                      {team.logo || '⚽'}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                        {team.name}
                      </h3>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Grupo {team.group}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onEditTeam(team)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Editar nombre y jugadores"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {/* Team Stats Summary */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase block">
                      Jugadores
                    </span>
                    <span className={`text-xs font-black flex items-center justify-center gap-1 ${
                      isMinMet ? 'text-slate-800 dark:text-zinc-200' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {players.length} / 12
                      {!isMinMet && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase block">
                      Goles Anotados
                    </span>
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                      {totalGoals} goles
                    </span>
                  </div>
                </div>

                {/* Players Roster list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                    Nómina de Jugadores:
                  </span>
                  
                  {players.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-2">Sin jugadores registrados.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-bold text-[11px] text-slate-500 dark:text-zinc-400 w-5">
                              #{p.number}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                              {p.name}
                            </span>
                          </div>
                          {p.goals > 0 && (
                            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                              ⚽ {p.goals}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="w-full py-2 bg-slate-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Gestionar Nómina ({players.length} jugadores)</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 5. TOP SCORERS (Bota de Oro y Tabla de Goleadores)
// ============================================================================
export function TopScorers({ teams, isAdmin, onUpdatePlayerGoals }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');

  const allScorers = [];
  teams.forEach((t) => {
    (t.players || []).forEach((p) => {
      allScorers.push({
        ...p,
        teamId: t.id,
        teamName: t.name,
        teamLogo: t.logo,
        teamGroup: t.group,
      });
    });
  });

  allScorers.sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const filteredScorers = allScorers.filter((player) => {
    if (selectedTeamFilter !== 'ALL' && player.teamId !== selectedTeamFilter) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchName = player.name.toLowerCase().includes(term);
      const matchTeam = player.teamName.toLowerCase().includes(term);
      return matchName || matchTeam;
    }
    return true;
  });

  const leader = allScorers[0];
  const second = allScorers[1];
  const third = allScorers[2];

  return (
    <div className="space-y-6">
      {/* Title & Podium Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <span>Tabla de Goleadores</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            Seguimiento de la Bota de Oro del torneo
          </p>
        </div>

        {/* Search & Team Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white font-bold focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="dark:bg-zinc-900 dark:text-white">
                {t.logo} {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Podium Cards (Top 3) */}
      {leader && leader.goals > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver */}
          {second && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3 relative order-2 md:order-1">
              <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-xl shrink-0 font-black">
                🥈
              </span>
              <div className="truncate flex-1">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 block tracking-wider">
                  2º Lugar
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  #{second.number} {second.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {second.teamLogo} {second.teamName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-800 dark:text-zinc-100 block">{second.goals}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Goles</span>
              </div>
            </div>
          )}

          {/* #1 Gold - Leader */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 shadow-md flex items-center gap-3 relative order-1 md:order-2">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shrink-0 font-black shadow-sm animate-pulse">
              🥇
            </span>
            <div className="truncate flex-1">
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 block tracking-wider">
                Líder de Goleo
              </span>
              <h4 className="font-black text-base text-slate-900 dark:text-white truncate">
                #{leader.number} {leader.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-300 font-semibold truncate">
                {leader.teamLogo} {leader.teamName}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">{leader.goals}</span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-extrabold uppercase">Goles</span>
            </div>
          </div>

          {/* #3 Bronze */}
          {third && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3 relative order-3 md:order-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-xl shrink-0 font-black">
                🥉
              </span>
              <div className="truncate flex-1">
                <span className="text-[10px] font-black uppercase text-amber-800/60 dark:text-amber-400/60 block tracking-wider">
                  3er Lugar
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  #{third.number} {third.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {third.teamLogo} {third.teamName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-800 dark:text-zinc-100 block">{third.goals}</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-bold">Goles</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scorers Table */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[340px] text-left text-xs">
            <thead>
              <tr className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-8 sm:w-12">#</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4">Jugador</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Equipo</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-center font-black text-emerald-800 dark:text-emerald-400" title="Goles anotados">
                  Goles
                </th>
                {isAdmin && (
                  <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-center">Goles (Admin)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredScorers.map((player, idx) => {
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-extrabold text-slate-600 dark:text-zinc-400">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700 text-[11px] sm:text-xs">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-[11px] sm:text-xs">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 text-[11px] sm:text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-xs">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-none truncate">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-[10px] sm:text-xs font-mono font-black flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-800">
                          {player.number}
                        </span>
                        <span className="truncate">{player.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-600 dark:text-zinc-300 font-semibold">
                      <div className="flex items-center gap-1 sm:gap-1.5 max-w-[100px] sm:max-w-none truncate">
                        <span className="shrink-0">{player.teamLogo}</span>
                        <span className="truncate">{player.teamName}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden xs:inline shrink-0">({player.teamGroup})</span>
                      </div>
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-center">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-black text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                        {player.goals}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200 dark:border-zinc-800">
                          <button
                            onClick={() => onUpdatePlayerGoals(player.teamId, player.id, -1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                            title="Restar 1 gol"
                          >
                            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <span className="w-5 sm:w-6 text-center font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
                            {player.goals}
                          </span>
                          <button
                            onClick={() => onUpdatePlayerGoals(player.teamId, player.id, 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                            title="Sumar 1 gol"
                          >
                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
