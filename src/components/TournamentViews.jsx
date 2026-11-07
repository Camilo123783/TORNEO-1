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
import { calculateGroupStandings } from '../tournamentData';

// ============================================================================
// 1. GROUP STANDINGS (Tablas de Posiciones Grupos A, B, C, D)
// ============================================================================
export function GroupStandings({ teams, matches }) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const groups = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>Tablas de Posiciones</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            1º y 2º de cada grupo avanzan a Cuartos de Final
          </p>
        </div>

        {/* Group selector pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedGroup === 'ALL'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
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

            return (
              <div
                key={grp}
                className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden w-full max-w-full"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>

                {/* Group Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-700 text-base sm:text-lg shadow-sm shrink-0">
                      {grp}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">Grupo {grp}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">3 Equipos</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    2 a Cuartos
                  </span>
                </div>

                {/* Table with responsive horizontal scrolling container */}
                <div className="w-full overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[340px] text-left text-xs">
                    <thead>
                      <tr className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/70">
                        <th className="py-2 px-1 text-center w-6">#</th>
                        <th className="py-2 px-2">Equipo</th>
                        <th className="py-2 px-1 text-center" title="Partidos Jugados">PJ</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Ganados">PG</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Empatados">PE</th>
                        <th className="py-2 px-1 text-center hidden xs:table-cell" title="Partidos Perdidos">PP</th>
                        <th className="py-2 px-1 text-center" title="Goles a Favor">GF</th>
                        <th className="py-2 px-1 text-center" title="Goles en Contra">GC</th>
                        <th className="py-2 px-1.5 text-center font-black" title="Diferencia de Gol">DG</th>
                        <th className="py-2 px-2 text-center font-black text-emerald-700" title="Puntos">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {standings.map((row, idx) => {
                        const qualifies = idx < 2;
                        return (
                          <tr
                            key={row.team.id}
                            className={`transition-colors ${
                              qualifies 
                                ? 'hover:bg-emerald-50/40 bg-white' 
                                : 'hover:bg-slate-50 opacity-80'
                            }`}
                          >
                            <td className="py-2.5 px-1 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold ${
                                  idx === 0
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : idx === 1
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 font-bold text-slate-800">
                              <div className="flex items-center gap-1.5 truncate max-w-[110px] sm:max-w-[160px]">
                                <span className="text-sm select-none shrink-0">{row.team.logo || '⚽'}</span>
                                <span className="truncate">{row.team.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-1 text-center text-slate-600 font-semibold">{row.pj}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 font-semibold hidden xs:table-cell">{row.pg}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 font-semibold hidden xs:table-cell">{row.pe}</td>
                            <td className="py-2.5 px-1 text-center text-slate-600 font-semibold hidden xs:table-cell">{row.pp}</td>
                            <td className="py-2.5 px-1 text-center text-slate-500">{row.gf}</td>
                            <td className="py-2.5 px-1 text-center text-slate-500">{row.gc}</td>
                            <td className={`py-2.5 px-1.5 text-center font-bold ${
                              row.dg > 0 ? 'text-emerald-600' : row.dg < 0 ? 'text-red-500' : 'text-slate-500'
                            }`}>
                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-sm text-emerald-700">
                              <span className="bg-emerald-100/70 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                {row.pts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Clasifican 1º y 2º</span>
                  </div>
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

  const filteredMatches = matches.filter((m) => {
    if (filterPhase !== 'ALL' && m.phase !== filterPhase) return false;
    if (m.phase === 'groups' && filterGroup !== 'ALL' && m.group !== filterGroup) return false;
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>Partidos y Resultados</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Marcadores en vivo y programación oficial
          </p>
        </div>

        {/* Filters pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterPhase('ALL')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'ALL'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterPhase('groups')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'groups'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grupos
            </button>
            <button
              onClick={() => setFilterPhase('playoffs')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterPhase === 'playoffs'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Playoffs
            </button>
          </div>

          {filterPhase === 'groups' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              {['ALL', 'A', 'B', 'C', 'D'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilterGroup(g)}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('finished')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'finished' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jugados
            </button>
            <button
              onClick={() => setFilterStatus('scheduled')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                filterStatus === 'scheduled' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Próximos
            </button>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="py-12 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 font-medium text-xs sm:text-sm">No hay partidos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
          {filteredMatches.map((m) => {
            const home = m.home_team_id ? getTeam(m.home_team_id) : null;
            const away = m.away_team_id ? getTeam(m.away_team_id) : null;

            const homeWon = m.status === 'finished' && m.home_score > m.away_score;
            const awayWon = m.status === 'finished' && m.away_score > m.home_score;

            return (
              <div
                key={m.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden w-full max-w-full"
              >
                {/* Header row: round & status */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 mb-2.5 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {m.round}
                    </span>
                    {m.group && (
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200 shrink-0">
                        Grupo {m.group}
                      </span>
                    )}
                    {m.phase === 'playoffs' && (
                      <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-200 shrink-0">
                        Playoff
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.status === 'finished' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Final
                      </span>
                    )}
                    {m.status === 'live' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                        VIVO
                      </span>
                    )}
                    {m.status === 'scheduled' && (
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Clock className="w-3 h-3" />
                        Próx
                      </span>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => onEditMatch(m)}
                        title="Modificar marcador o fecha"
                        className="ml-1 p-1 rounded-md text-emerald-700 hover:bg-emerald-50 border border-emerald-300 transition-all cursor-pointer"
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
                    homeWon ? 'bg-emerald-50/80 font-black' : 'bg-slate-50/60 font-semibold'
                  }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base select-none shrink-0">{home ? home.logo : '🛡️'}</span>
                      <span className={`text-xs sm:text-sm truncate ${homeWon ? 'text-emerald-900 font-black' : 'text-slate-800'}`}>
                        {home ? home.name : (m.home_label || 'Local')}
                      </span>
                    </div>
                    <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      m.status === 'finished' || m.status === 'live'
                        ? homeWon 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white text-slate-800 border-slate-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {m.status === 'finished' || m.status === 'live' ? m.home_score : '-'}
                    </span>
                  </div>

                  {/* Away Team Row */}
                  <div className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    awayWon ? 'bg-emerald-50/80 font-black' : 'bg-slate-50/60 font-semibold'
                  }`}>
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base select-none shrink-0">{away ? away.logo : '🛡️'}</span>
                      <span className={`text-xs sm:text-sm truncate ${awayWon ? 'text-emerald-900 font-black' : 'text-slate-800'}`}>
                        {away ? away.name : (m.away_label || 'Visitante')}
                      </span>
                    </div>
                    <span className={`font-mono text-sm sm:text-base font-black px-2.5 py-0.5 rounded-lg border ${
                      m.status === 'finished' || m.status === 'live'
                        ? awayWon 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white text-slate-800 border-slate-300'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {m.status === 'finished' || m.status === 'live' ? m.away_score : '-'}
                    </span>
                  </div>

                </div>

                {/* Match Metadata */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 truncate">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{m.date || 'TBD'}</span>
                  </span>
                  <span className="flex items-center gap-1 truncate ml-2">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{m.court || 'Cancha'}</span>
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

// ============================================================================
// 3. PLAYOFF BRACKET (Cuartos, Semifinales, 3er Puesto y Gran Final)
// ============================================================================
export function PlayoffBracket({ teams, matches, isAdmin, onEditMatch }) {
  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  const getMatchByBracketCode = (code) => {
    return matches.find((m) => m.bracket_code === code) || null;
  };

  const qf1 = getMatchByBracketCode('QF1');
  const qf2 = getMatchByBracketCode('QF2');
  const qf3 = getMatchByBracketCode('QF3');
  const qf4 = getMatchByBracketCode('QF4');

  const sf1 = getMatchByBracketCode('SF1');
  const sf2 = getMatchByBracketCode('SF2');

  const thirdMatch = getMatchByBracketCode('3RD');
  const finalMatch = getMatchByBracketCode('FINAL');

  const championId = finalMatch && finalMatch.status === 'finished'
    ? finalMatch.home_score > finalMatch.away_score 
      ? finalMatch.home_team_id 
      : finalMatch.away_score > finalMatch.home_score 
      ? finalMatch.away_team_id 
      : null
    : null;

  const champion = championId ? getTeam(championId) : null;

  useEffect(() => {
    if (champion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [champion]);

  const renderBracketMatch = (m, label) => {
    if (!m || !m.id) return null;
    const home = m.home_team_id ? getTeam(m.home_team_id) : null;
    const away = m.away_team_id ? getTeam(m.away_team_id) : null;

    const homeWon = m.status === 'finished' && m.home_score > m.away_score;
    const awayWon = m.status === 'finished' && m.away_score > m.home_score;

    return (
      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3 shadow-sm hover:shadow-md relative group transition-all">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 pb-1.5 border-b border-slate-100">
          <span className="font-extrabold text-slate-800">{label || m.round}</span>
          <div className="flex items-center gap-1.5">
            {m.status === 'finished' && (
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">Final</span>
            )}
            {m.status === 'live' && (
              <span className="text-[10px] text-red-600 font-black bg-red-50 px-1.5 py-0.2 rounded animate-pulse">En Vivo</span>
            )}
            {isAdmin && (
              <button
                onClick={() => onEditMatch(m)}
                title="Editar este partido de playoff"
                className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Team 1 */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors gap-2 ${
          homeWon ? 'bg-emerald-50 font-black text-emerald-800 border border-emerald-200' : 'text-slate-800 font-semibold'
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
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs mt-1 transition-colors gap-2 ${
          awayWon ? 'bg-emerald-50 font-black text-emerald-800 border border-emerald-200' : 'text-slate-800 font-semibold'
        }`}>
          <div className="flex items-center gap-2 truncate min-w-0 flex-1">
            <span className="text-base select-none shrink-0">{away ? away.logo : '🛡️'}</span>
            <span className="truncate">{away ? away.name : (m.away_label || 'Por definir')}</span>
          </div>
          <span className="font-mono font-black shrink-0 text-sm">
            {m.status === 'finished' || m.status === 'live' ? m.away_score : '-'}
          </span>
        </div>

        <div className="mt-2 text-[10px] text-slate-400 font-medium flex justify-between">
          <span>{m.date || 'TBD'}</span>
          <span>{m.court || 'Cancha'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
          <span>Fase Final • Eliminación Directa</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Clasifican 8 equipos (1º y 2º de cada grupo) • Cuartos, Semifinales y Gran Final
        </p>
      </div>

      {champion && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-lg animate-fadeIn">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl shadow-md mb-3 animate-bounce">
              🏆
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-900 mb-1">
              ¡CAMPEÓN DEL TORNEO!
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>{champion.logo}</span>
              <span>{champion.name}</span>
            </h3>
            <p className="text-xs text-amber-900/80 mt-2 font-bold">
              Felicitaciones por coronarse en el Torneo de Microfútbol 2026
            </p>
          </div>
        </div>
      )}

      {/* Bracket Tree */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
        {/* Column 1: Cuartos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Cuartos de Final (8 Equipos)
          </div>
          {renderBracketMatch(qf1, 'Cuartos 1 (1A vs 2B)')}
          {renderBracketMatch(qf2, 'Cuartos 2 (1C vs 2D)')}
          {renderBracketMatch(qf3, 'Cuartos 3 (1B vs 2A)')}
          {renderBracketMatch(qf4, 'Cuartos 4 (1D vs 2C)')}
        </div>

        {/* Column 2: Semifinales */}
        <div className="space-y-8 md:my-auto">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Semifinales (4 Equipos)
          </div>
          {renderBracketMatch(sf1, 'Semifinal 1')}
          {renderBracketMatch(sf2, 'Semifinal 2')}
        </div>

        {/* Column 3: Final & 3er Puesto */}
        <div className="space-y-6 md:my-auto">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            La Gran Final
          </div>

          <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 shadow-md">
            {renderBracketMatch(finalMatch, '🏆 PARTIDO POR EL TÍTULO')}
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              <Award className="w-3.5 h-3.5 text-slate-500" />
              Tercer Puesto
            </div>
            {renderBracketMatch(thirdMatch, 'Partido por el 3er Puesto')}
          </div>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>Equipos y Plantillas</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            12 equipos (5 a 12 jugadores por equipo)
          </p>
        </div>

        {/* Group Selector & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar equipo o jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto no-scrollbar shrink-0 justify-center">
            <button
              onClick={() => setSelectedGroup('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGroup === 'ALL'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
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
                    : 'text-slate-600 hover:text-slate-900'
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
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-sm shrink-0">
                      {team.logo || '⚽'}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">
                        {team.name}
                      </h3>
                      <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Grupo {team.group}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => onEditTeam(team)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Editar nombre y jugadores"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {/* Team Stats Summary */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Jugadores
                    </span>
                    <span className={`text-xs font-black flex items-center justify-center gap-1 ${
                      isMinMet ? 'text-slate-800' : 'text-amber-600'
                    }`}>
                      {players.length} / 12
                      {!isMinMet && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Goles Anotados
                    </span>
                    <span className="text-xs font-black text-emerald-700">
                      {totalGoals} goles
                    </span>
                  </div>
                </div>

                {/* Players Roster list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Nómina de Jugadores:
                  </span>
                  
                  {players.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Sin jugadores registrados.</p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 border border-slate-100"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-bold text-[11px] text-slate-500 w-5">
                              #{p.number}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              {p.name}
                            </span>
                          </div>
                          {p.goals > 0 && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
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
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="w-full py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <span>Tabla de Goleadores</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Seguimiento de la Bota de Oro del torneo
          </p>
        </div>

        {/* Search & Team Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
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
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 relative order-2 md:order-1">
              <span className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0 font-black">
                🥈
              </span>
              <div className="truncate flex-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  2º Lugar
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                  #{second.number} {second.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {second.teamLogo} {second.teamName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-800 block">{second.goals}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Goles</span>
              </div>
            </div>
          )}

          {/* #1 Gold - Leader */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-md flex items-center gap-3 relative order-1 md:order-2">
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shrink-0 font-black shadow-sm animate-pulse">
              🥇
            </span>
            <div className="truncate flex-1">
              <span className="text-[10px] font-black uppercase text-amber-700 block tracking-wider">
                Líder de Goleo
              </span>
              <h4 className="font-black text-base text-slate-900 truncate">
                #{leader.number} {leader.name}
              </h4>
              <p className="text-xs text-slate-600 font-semibold truncate">
                {leader.teamLogo} {leader.teamName}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-amber-600 block">{leader.goals}</span>
              <span className="text-[10px] text-amber-800 font-extrabold uppercase">Goles</span>
            </div>
          </div>

          {/* #3 Bronze */}
          {third && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3 relative order-3 md:order-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0 font-black">
                🥉
              </span>
              <div className="truncate flex-1">
                <span className="text-[10px] font-black uppercase text-amber-800/60 block tracking-wider">
                  3er Lugar
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                  #{third.number} {third.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {third.teamLogo} {third.teamName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-black text-slate-800 block">{third.goals}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Goles</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scorers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[340px] text-left text-xs">
            <thead>
              <tr className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center w-8 sm:w-12">#</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4">Jugador</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-3">Equipo</th>
                <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-center font-black text-emerald-800" title="Goles anotados">
                  Goles
                </th>
                {isAdmin && (
                  <th className="py-2.5 sm:py-3 px-2 sm:px-4 text-center">Goles (Admin)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScorers.map((player, idx) => {
                return (
                  <tr
                    key={player.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-extrabold text-slate-600">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-300 text-[11px] sm:text-xs">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-slate-200 text-slate-800 font-bold text-[11px] sm:text-xs">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px] sm:text-xs">
                          3
                        </span>
                      ) : (
                        <span className="text-xs">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5 sm:gap-2 max-w-[120px] sm:max-w-none truncate">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-mono font-black flex items-center justify-center shrink-0 border border-slate-200">
                          {player.number}
                        </span>
                        <span className="truncate">{player.name}</span>
                      </div>
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-600 font-semibold">
                      <div className="flex items-center gap-1 sm:gap-1.5 max-w-[100px] sm:max-w-none truncate">
                        <span className="shrink-0">{player.teamLogo}</span>
                        <span className="truncate">{player.teamName}</span>
                        <span className="text-[10px] text-slate-400 hidden xs:inline shrink-0">({player.teamGroup})</span>
                      </div>
                    </td>

                    <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-center">
                      <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-emerald-50 text-emerald-800 font-black text-xs sm:text-sm border border-emerald-200 shadow-2xs">
                        {player.goals}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-200">
                          <button
                            onClick={() => onUpdatePlayerGoals(player.teamId, player.id, -1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm flex items-center justify-center shadow-xs cursor-pointer active:scale-90"
                            title="Restar 1 gol"
                          >
                            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <span className="w-5 sm:w-6 text-center font-mono font-bold text-slate-900 text-xs">
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
