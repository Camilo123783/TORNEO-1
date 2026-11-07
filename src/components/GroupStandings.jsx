import React, { useState } from 'react';
import { calculateGroupStandings } from '../utils/standingsCalculator';
import { Trophy, ChevronRight, Award, Shield, CheckCircle2 } from 'lucide-react';

export default function GroupStandings({ teams, matches }) {
  const [selectedGroup, setSelectedGroup] = useState('ALL'); // 'ALL' or 'A', 'B', 'C', 'D'
  const groups = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-400" />
            Tablas de Posiciones por Grupo
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Los dos primeros de cada grupo (1º y 2º) clasifican a Cuartos de Final
          </p>
        </div>

        {/* Group selector pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGroup === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGroup === grp
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grupo {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups
          .filter((grp) => selectedGroup === 'ALL' || selectedGroup === grp)
          .map((grp) => {
            const standings = calculateGroupStandings(teams, matches, grp);

            return (
              <div
                key={grp}
                className="bg-[#0f172a]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-700/80"
              >
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Group Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-lg">
                      {grp}
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">Grupo {grp}</h3>
                      <p className="text-[11px] text-slate-400">3 Equipos en disputa</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400/90 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    2 avanzan a Cuartos
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <th className="py-2.5 px-2 text-center w-8">#</th>
                        <th className="py-2.5 px-3">Equipo</th>
                        <th className="py-2.5 px-2 text-center" title="Partidos Jugados">PJ</th>
                        <th className="py-2.5 px-2 text-center" title="Partidos Ganados">PG</th>
                        <th className="py-2.5 px-2 text-center" title="Partidos Empatados">PE</th>
                        <th className="py-2.5 px-2 text-center" title="Partidos Perdidos">PP</th>
                        <th className="py-2.5 px-2 text-center" title="Goles a Favor">GF</th>
                        <th className="py-2.5 px-2 text-center" title="Goles en Contra">GC</th>
                        <th className="py-2.5 px-2 text-center font-semibold" title="Diferencia de Gol">DG</th>
                        <th className="py-2.5 px-3 text-center font-black text-emerald-400" title="Puntos">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {standings.map((row, idx) => {
                        const qualifies = idx < 2; // Top 2 qualify
                        return (
                          <tr
                            key={row.team.id}
                            className={`transition-colors ${
                              qualifies 
                                ? 'hover:bg-emerald-500/5' 
                                : 'hover:bg-slate-800/40 opacity-75'
                            }`}
                          >
                            <td className="py-3 px-2 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${
                                  idx === 0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : idx === 1
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">
                              <div className="flex items-center gap-2.5">
                                <span className="text-base select-none">{row.team.logo || '⚽'}</span>
                                <div className="truncate max-w-[130px] sm:max-w-[180px]">
                                  <span className="block truncate">{row.team.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center text-slate-300 font-medium">{row.pj}</td>
                            <td className="py-3 px-2 text-center text-slate-300 font-medium">{row.pg}</td>
                            <td className="py-3 px-2 text-center text-slate-300 font-medium">{row.pe}</td>
                            <td className="py-3 px-2 text-center text-slate-300 font-medium">{row.pp}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.gf}</td>
                            <td className="py-3 px-2 text-center text-slate-400">{row.gc}</td>
                            <td className={`py-3 px-2 text-center font-bold ${
                              row.dg > 0 ? 'text-emerald-400' : row.dg < 0 ? 'text-red-400' : 'text-slate-400'
                            }`}>
                              {row.dg > 0 ? `+${row.dg}` : row.dg}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-sm text-emerald-400">
                              <span className="bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                {row.pts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400/80">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zona de Clasificación (1º y 2º)</span>
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
