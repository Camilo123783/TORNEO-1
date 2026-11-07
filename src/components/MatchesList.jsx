import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Play, Eye, Edit3, Shield } from 'lucide-react';

export default function MatchesList({ teams, matches, isAdmin, onEditMatch }) {
  const [filterPhase, setFilterPhase] = useState('ALL'); // 'ALL', 'groups', 'playoffs'
  const [filterGroup, setFilterGroup] = useState('ALL'); // 'ALL', 'A', 'B', 'C', 'D'
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'finished', 'scheduled', 'live'

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  const filteredMatches = matches.filter((m) => {
    if (filterPhase !== 'ALL' && m.phase !== filterPhase) return false;
    if (m.phase === 'groups' && filterGroup !== 'ALL' && m.group !== filterGroup) return false;
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            Calendario de Partidos y Resultados
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta los marcadores en tiempo real y la programación oficial
          </p>
        </div>

        {/* Phase selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterPhase('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPhase === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPhase('groups')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPhase === 'groups'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fase Grupos
            </button>
            <button
              onClick={() => setFilterPhase('playoffs')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterPhase === 'playoffs'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Playoffs
            </button>
          </div>

          {/* Group sub-filter */}
          {filterPhase === 'groups' && (
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'A', 'B', 'C', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterGroup === g
                      ? 'bg-slate-700 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g === 'ALL' ? 'Todos' : `Grp ${g}`}
                </button>
              ))}
            </div>
          )}

          {/* Status sub-filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estado
            </button>
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'finished' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Jugados
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterStatus === 'scheduled' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="py-16 text-center bg-[#0f172a]/50 border border-slate-800 rounded-3xl">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay partidos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((m) => {
            const home = m.home_team_id ? getTeam(m.home_team_id) : null;
            const away = m.away_team_id ? getTeam(m.away_team_id) : null;

            const homeWon = m.status === 'finished' && m.home_score > m.away_score;
            const awayWon = m.status === 'finished' && m.away_score > m.home_score;
            const isTie = m.status === 'finished' && m.home_score === m.away_score;

            return (
              <div
                key={m.id}
                className="bg-[#0f172a]/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg transition-all relative overflow-hidden group"
              >
                {/* Header row: round & status */}
                <div className="flex items-center justify-between text-xs text-slate-400 pb-3 mb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">
                      {m.round}
                    </span>
                    {m.group && (
                      <span className="bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-slate-700">
                        Grupo {m.group}
                      </span>
                    )}
                    {m.phase === 'playoffs' && (
                      <span className="bg-amber-500/10 text-amber-400 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-amber-500/20">
                        Playoff
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {m.status === 'finished' && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Finalizado
                      </span>
                    )}
                    {m.status === 'live' && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        EN VIVO
                      </span>
                    )}
                    {m.status === 'scheduled' && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        <Clock className="w-3 h-3" />
                        Programado
                      </span>
                    )}

                    {/* Admin quick edit button */}
                    {isAdmin && (
                      <button
                        onClick={() => onEditMatch(m)}
                        title="Modificar resultado / fecha"
                        className="ml-1 p-1 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Teams & Scoreboard */}
                <div className="grid grid-cols-12 items-center py-2 gap-2">
                  
                  {/* Home Team */}
                  <div className="col-span-5 flex items-center justify-end gap-2.5 text-right">
                    <div className="truncate">
                      <span className={`font-bold text-sm block truncate ${
                        homeWon ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {home ? home.name : (m.home_label || 'Por definir')}
                      </span>
                      {home && (
                        <span className="text-[10px] text-slate-500 block">Local</span>
                      )}
                    </div>
                    <span className="text-xl select-none shrink-0">
                      {home ? home.logo : '🛡️'}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    {m.status === 'finished' || m.status === 'live' ? (
                      <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl">
                        <span className={`px-2 py-0.5 rounded-lg border ${
                          homeWon 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}>
                          {m.home_score}
                        </span>
                        <span className="text-slate-500 text-xs">-</span>
                        <span className={`px-2 py-0.5 rounded-lg border ${
                          awayWon 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'bg-slate-800 text-white border-slate-700'
                        }`}>
                          {m.away_score}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/60">
                          VS
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="col-span-5 flex items-center justify-start gap-2.5 text-left">
                    <span className="text-xl select-none shrink-0">
                      {away ? away.logo : '🛡️'}
                    </span>
                    <div className="truncate">
                      <span className={`font-bold text-sm block truncate ${
                        awayWon ? 'text-emerald-400' : 'text-slate-200'
                      }`}>
                        {away ? away.name : (m.away_label || 'Por definir')}
                      </span>
                      {away && (
                        <span className="text-[10px] text-slate-500 block">Visitante</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Match Metadata: Date and Court */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{m.date || 'Horario a confirmar'}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate ml-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{m.court || 'Cancha Principal'}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
