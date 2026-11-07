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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Calendario de Partidos y Resultados
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Consulta los marcadores y la programación oficial del torneo
          </p>
        </div>

        {/* Phase selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterPhase('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterPhase === 'ALL'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPhase('groups')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterPhase === 'groups'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fase Grupos
            </button>
            <button
              onClick={() => setFilterPhase('playoffs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterPhase === 'playoffs'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Playoffs
            </button>
          </div>

          {/* Group sub-filter */}
          {filterPhase === 'groups' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              {['ALL', 'A', 'B', 'C', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    filterGroup === g
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g === 'ALL' ? 'Todos' : `Grp ${g}`}
                </button>
              ))}
            </div>
          )}

          {/* Status sub-filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'finished' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jugados
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'scheduled' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">No hay partidos con los filtros seleccionados.</p>
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
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                {/* Header row: round & status */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {m.round}
                    </span>
                    {m.group && (
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                        Grupo {m.group}
                      </span>
                    )}
                    {m.phase === 'playoffs' && (
                      <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-200">
                        Playoff
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {m.status === 'finished' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Finalizado
                      </span>
                    )}
                    {m.status === 'live' && (
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        EN VIVO
                      </span>
                    )}
                    {m.status === 'scheduled' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Clock className="w-3 h-3" />
                        Programado
                      </span>
                    )}

                    {/* Admin quick edit button */}
                    {isAdmin && (
                      <button
                        onClick={() => onEditMatch(m)}
                        title="Modificar marcador o fecha"
                        className="ml-1 p-1 rounded-md text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-300 transition-all cursor-pointer"
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
                        homeWon ? 'text-emerald-700 font-black' : 'text-slate-800'
                      }`}>
                        {home ? home.name : (m.home_label || 'Por definir')}
                      </span>
                      {home && (
                        <span className="text-[10px] text-slate-400 font-semibold block">Local</span>
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
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' 
                            : 'bg-slate-100 text-slate-800 border-slate-200 font-bold'
                        }`}>
                          {m.home_score}
                        </span>
                        <span className="text-slate-400 text-xs">-</span>
                        <span className={`px-2 py-0.5 rounded-lg border ${
                          awayWon 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' 
                            : 'bg-slate-100 text-slate-800 border-slate-200 font-bold'
                        }`}>
                          {m.away_score}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
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
                        awayWon ? 'text-emerald-700 font-black' : 'text-slate-800'
                      }`}>
                        {away ? away.name : (m.away_label || 'Por definir')}
                      </span>
                      {away && (
                        <span className="text-[10px] text-slate-400 font-semibold block">Visitante</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Match Metadata: Date and Court */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{m.date || 'Horario a confirmar'}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate ml-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
