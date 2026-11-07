import React, { useEffect } from 'react';
import { Trophy, Award, Sparkles, Shield, ChevronRight, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PlayoffBracket({ teams, matches, isAdmin, onEditMatch }) {
  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  // Extract matches by bracket code
  const qf1 = matches.find((m) => m.bracket_code === 'QF1') || {};
  const qf2 = matches.find((m) => m.bracket_code === 'QF2') || {};
  const qf3 = matches.find((m) => m.bracket_code === 'QF3') || {};
  const qf4 = matches.find((m) => m.bracket_code === 'QF4') || {};

  const sf1 = matches.find((m) => m.bracket_code === 'SF1') || {};
  const sf2 = matches.find((m) => m.bracket_code === 'SF2') || {};

  const thirdMatch = matches.find((m) => m.bracket_code === '3RD') || {};
  const finalMatch = matches.find((m) => m.bracket_code === 'FINAL') || {};

  // Find tournament champion if final is finished
  let champion = null;
  if (finalMatch && finalMatch.status === 'finished') {
    if (finalMatch.home_score > finalMatch.away_score) {
      champion = getTeam(finalMatch.home_team_id);
    } else if (finalMatch.away_score > finalMatch.home_score) {
      champion = getTeam(finalMatch.away_team_id);
    }
  }

  // Trigger celebration confetti if champion is determined
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
      <div className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 rounded-2xl p-3 shadow-md relative group transition-all">
        {/* Match Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 pb-1.5 border-b border-slate-800">
          <span className="font-bold text-slate-300">{label || m.round}</span>
          <div className="flex items-center gap-1.5">
            {m.status === 'finished' && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">Final</span>
            )}
            {m.status === 'live' && (
              <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-1.5 py-0.2 rounded animate-pulse">En Vivo</span>
            )}
            {isAdmin && (
              <button
                onClick={() => onEditMatch(m)}
                title="Editar este partido de playoff"
                className="p-1 rounded text-emerald-400 hover:bg-emerald-500/20"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Team 1 */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-colors ${
          homeWon ? 'bg-emerald-500/15 font-bold text-emerald-300' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className="text-base select-none">{home ? home.logo : '🛡️'}</span>
            <span className="truncate">{home ? home.name : (m.home_label || 'Por definir')}</span>
          </div>
          <span className="font-mono font-bold ml-2">
            {m.status === 'finished' || m.status === 'live' ? m.home_score : '-'}
          </span>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs mt-1 transition-colors ${
          awayWon ? 'bg-emerald-500/15 font-bold text-emerald-300' : 'text-slate-300'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <span className="text-base select-none">{away ? away.logo : '🛡️'}</span>
            <span className="truncate">{away ? away.name : (m.away_label || 'Por definir')}</span>
          </div>
          <span className="font-mono font-bold ml-2">
            {m.status === 'finished' || m.status === 'live' ? m.away_score : '-'}
          </span>
        </div>

        {/* Date and Court footer */}
        <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
          <span>{m.date || 'TBD'}</span>
          <span>{m.court || 'Cancha'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Fase Final • Cuadro de Eliminación Directa
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Clasifican 8 equipos (1º y 2º de cada grupo) • Cuartos, Semifinales y Gran Final
        </p>
      </div>

      {/* Champion Banner if determined */}
      {champion && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-2 border-amber-400/60 rounded-3xl p-6 text-center shadow-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent)]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40 mb-3 animate-bounce">
              🏆
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 mb-1">
              ¡CAMPEÓN DEL TORNEO!
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{champion.logo}</span>
              <span>{champion.name}</span>
            </h3>
            <p className="text-xs text-amber-200/80 mt-2 font-medium">
              Felicitaciones por coronarse en el Torneo de Microfútbol 2026
            </p>
          </div>
        </div>
      )}

      {/* Bracket Tree Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
        
        {/* Column 1: Cuartos de Final (4 matches) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Cuartos de Final (8 Equipos)
          </div>
          {renderBracketMatch(qf1, 'Cuartos 1 (1A vs 2B)')}
          {renderBracketMatch(qf2, 'Cuartos 2 (1C vs 2D)')}
          {renderBracketMatch(qf3, 'Cuartos 3 (1B vs 2A)')}
          {renderBracketMatch(qf4, 'Cuartos 4 (1D vs 2C)')}
        </div>

        {/* Column 2: Semifinales (2 matches) */}
        <div className="space-y-8 md:my-auto">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Semifinales (4 Equipos)
          </div>
          {renderBracketMatch(sf1, 'Semifinal 1')}
          {renderBracketMatch(sf2, 'Semifinal 2')}
        </div>

        {/* Column 3: Gran Final & 3er Puesto */}
        <div className="space-y-6 md:my-auto">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            La Gran Final
          </div>

          {/* Gran Final Card */}
          <div className="p-1 rounded-2xl bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 shadow-xl shadow-amber-500/10">
            {renderBracketMatch(finalMatch, '🏆 PARTIDO POR EL TÍTULO')}
          </div>

          {/* 3er Puesto Card */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Tercer Puesto
            </div>
            {renderBracketMatch(thirdMatch, 'Partido por el 3er Puesto')}
          </div>
        </div>

      </div>
    </div>
  );
}
