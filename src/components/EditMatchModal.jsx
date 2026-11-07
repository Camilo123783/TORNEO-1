import React, { useState, useEffect } from 'react';
import { X, Save, Clock, MapPin, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

export default function EditMatchModal({ isOpen, onClose, match, teams, onSave }) {
  if (!isOpen || !match) return null;

  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id || '');
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id || '');
  const [homeScore, setHomeScore] = useState(match.home_score !== null ? match.home_score : '');
  const [awayScore, setAwayScore] = useState(match.away_score !== null ? match.away_score : '');
  const [status, setStatus] = useState(match.status || 'scheduled');
  const [date, setDate] = useState(match.date || '');
  const [court, setCourt] = useState(match.court || 'Cancha Principal');

  useEffect(() => {
    setHomeTeamId(match.home_team_id || '');
    setAwayTeamId(match.away_team_id || '');
    setHomeScore(match.home_score !== null ? match.home_score : '');
    setAwayScore(match.away_score !== null ? match.away_score : '');
    setStatus(match.status || 'scheduled');
    setDate(match.date || '');
    setCourt(match.court || 'Cancha Principal');
  }, [match]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedMatch = {
      ...match,
      home_team_id: homeTeamId || null,
      away_team_id: awayTeamId || null,
      home_score: homeScore !== '' ? parseInt(homeScore, 10) : null,
      away_score: awayScore !== '' ? parseInt(awayScore, 10) : null,
      status,
      date,
      court,
    };

    onSave(updatedMatch);
    onClose();
  };

  const getTeamName = (id, fallback) => {
    const t = teams.find((item) => item.id === id);
    return t ? `${t.logo} ${t.name}` : fallback;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            {match.round} {match.group ? `• Grupo ${match.group}` : '• Playoff'}
          </span>
          <h2 className="text-xl font-bold text-white">Editar Partido / Marcador</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Teams Selector (especially for Playoffs) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipo Local
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">{match.home_label || '-- Seleccionar Equipo --'}</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name} (Grp {t.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipo Visitante
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">{match.away_label || '-- Seleccionar Equipo --'}</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name} (Grp {t.group})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <label className="block text-xs font-bold text-slate-300 mb-3 text-center uppercase tracking-wider">
              Marcador (Goles)
            </label>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="block text-xs text-slate-400 mb-1 truncate max-w-[100px]">
                  {getTeamName(homeTeamId, match.home_label || 'Local')}
                </span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-16 h-14 bg-slate-800 border-2 border-slate-700 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <span className="text-xl font-bold text-slate-600 self-end pb-3">-</span>

              <div className="text-center">
                <span className="block text-xs text-slate-400 mb-1 truncate max-w-[100px]">
                  {getTeamName(awayTeamId, match.away_label || 'Visitante')}
                </span>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-16 h-14 bg-slate-800 border-2 border-slate-700 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estado del Partido
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  status === 'scheduled'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Programado
              </button>
              <button
                type="button"
                onClick={() => setStatus('live')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  status === 'live'
                    ? 'bg-red-500/20 text-red-300 border-red-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                🔴 En Juego
              </button>
              <button
                type="button"
                onClick={() => setStatus('finished')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  status === 'finished'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                ✅ Finalizado
              </button>
            </div>
          </div>

          {/* Date & Court */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha y Hora
              </label>
              <input
                type="text"
                placeholder="2026-11-15 18:00"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cancha / Sede
              </label>
              <input
                type="text"
                placeholder="Cancha Principal"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
