import React, { useState } from 'react';
import { Users, Edit3, Shield, Award, Search, Shirt, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TeamsList({ teams, onEditTeam, isAdmin }) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Equipos y Plantillas de Jugadores
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Consulta los 12 equipos y sus nóminas oficiales (mínimo 5, máximo 12 jugadores)
          </p>
        </div>

        {/* Group Selector & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar equipo o jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
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
                {/* Team Card Header */}
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
                      {players.map((p, idx) => (
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

              {/* Card Footer */}
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
