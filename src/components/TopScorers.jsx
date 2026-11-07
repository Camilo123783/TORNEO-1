import React, { useState } from 'react';
import { Award, Search, Trophy, Shield, Plus, Minus, UserCheck } from 'lucide-react';

export default function TopScorers({ teams, onUpdatePlayerGoals, isAdmin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');

  // Flatten all players with their team info
  const allScorers = [];
  teams.forEach((team) => {
    (team.players || []).forEach((player) => {
      allScorers.push({
        ...player,
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logo,
        teamGroup: team.group,
      });
    });
  });

  // Sort by goals descending, then by name
  allScorers.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return a.name.localeCompare(b.name);
  });

  // Filter
  const filteredScorers = allScorers.filter((player) => {
    if (selectedTeamFilter !== 'ALL' && player.teamId !== selectedTeamFilter) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        player.name.toLowerCase().includes(term) ||
        player.teamName.toLowerCase().includes(term) ||
        player.number.toString().includes(term)
      );
    }
    return true;
  });

  // Top 3 players
  const leader = allScorers[0];
  const second = allScorers[1];
  const third = allScorers[2];

  return (
    <div className="space-y-6">
      
      {/* Title & Podium Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Tabla de Goleadores (Bota de Oro)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Seguimiento oficial de los máximos anotadores del torneo
          </p>
        </div>

        {/* Search & Team Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
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
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[11px] font-black text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Jugador</th>
                <th className="py-3 px-3">Equipo</th>
                <th className="py-3 px-4 text-center font-black text-emerald-800" title="Goles anotados">
                  Goles
                </th>
                {isAdmin && (
                  <th className="py-3 px-4 text-center">Gestionar Goles (Admin)</th>
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
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-extrabold text-slate-600">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-300">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-200 text-slate-800 font-bold">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
                          3
                        </span>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </td>

                    {/* Player */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-black flex items-center justify-center shrink-0 border border-slate-200">
                          {player.number}
                        </span>
                        <span className="truncate">{player.name}</span>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3 text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{player.teamLogo}</span>
                        <span className="truncate">{player.teamName}</span>
                        <span className="text-[10px] text-slate-400">({player.teamGroup})</span>
                      </div>
                    </td>

                    {/* Goals */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black text-sm border border-emerald-200 shadow-2xs">
                        {player.goals}
                      </span>
                    </td>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => onUpdatePlayerGoals(player.teamId, player.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-xs cursor-pointer"
                            title="Restar 1 gol"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-slate-900 text-xs">
                            {player.goals}
                          </span>
                          <button
                            onClick={() => onUpdatePlayerGoals(player.teamId, player.id, 1)}
                            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-xs cursor-pointer"
                            title="Sumar 1 gol"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
