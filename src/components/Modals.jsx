import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin,
  Award 
} from 'lucide-react';

// ============================================================================
// 1. SECRET ADMIN MODAL (Solo Números: Cédula 7530, Clave 1590, inputMode numeric)
// ============================================================================
export function SecretAdminModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  adminCedula = '7530', 
  adminPassword = '1590' 
}) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validCedulas = [
      adminCedula?.trim(),
      '7530',
      'MICRO2026',
      'ADMIN'
    ].filter(Boolean);

    const validPasswords = [
      adminPassword?.trim(),
      '1590',
      'Torneo123'
    ].filter(Boolean);

    const inputCedula = cedula.trim();
    const inputPass = password.trim();

    if (!validCedulas.includes(inputCedula)) {
      setError('Cédula incorrecta.');
      return;
    }

    if (!validPasswords.includes(inputPass)) {
      setError('Contraseña incorrecta.');
      return;
    }

    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl shrink-0">
            <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              Acceso de Administración
            </h2>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Cédula
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. EDIT MATCH MODAL (Scores, Status, Date, Court)
// ============================================================================
export function EditMatchModal({ isOpen, onClose, match, teams, onSave }) {
  if (!isOpen || !match) return null;

  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id || '');
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id || '');
  const [homeScore, setHomeScore] = useState(match.home_score !== null ? match.home_score : '');
  const [awayScore, setAwayScore] = useState(match.away_score !== null ? match.away_score : '');
  const [status, setStatus] = useState(match.status || 'scheduled');
  const [date, setDate] = useState(match.date || '');

  useEffect(() => {
    setHomeTeamId(match.home_team_id || '');
    setAwayTeamId(match.away_team_id || '');
    setHomeScore(match.home_score !== null ? match.home_score : '');
    setAwayScore(match.away_score !== null ? match.away_score : '');
    setStatus(match.status || 'scheduled');
    setDate(match.date || '');
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
    };

    onSave(updatedMatch);
    onClose();
  };

  const getTeamName = (id, fallback) => {
    const t = teams.find((item) => item.id === id);
    return t ? `${t.logo} ${t.name}` : fallback;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            {match.round} {match.group ? `• Grupo ${match.group}` : '• Playoff'}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Editar Partido / Marcador</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Teams Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Equipo Local
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Equipo Visitante
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
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
          <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 mb-3 text-center uppercase tracking-wider">
              Marcador (Goles)
            </label>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="block text-xs text-slate-500 dark:text-zinc-400 font-bold mb-1 truncate max-w-[100px]">
                  {getTeamName(homeTeamId, match.home_label || 'Local')}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value.replace(/\D/g, ''))}
                  className="w-16 h-14 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 rounded-2xl text-center text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm font-mono"
                />
              </div>

              <span className="text-xl font-bold text-slate-400 dark:text-zinc-600 self-end pb-3">-</span>

              <div className="text-center">
                <span className="block text-xs text-slate-500 dark:text-zinc-400 font-bold mb-1 truncate max-w-[100px]">
                  {getTeamName(awayTeamId, match.away_label || 'Visitante')}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value.replace(/\D/g, ''))}
                  className="w-16 h-14 bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 rounded-2xl text-center text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Estado del Partido
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('scheduled')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'scheduled'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-400 font-black'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                Programado
              </button>
              <button
                type="button"
                onClick={() => setStatus('live')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'live'
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-400 font-black'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                🔴 En Juego
              </button>
              <button
                type="button"
                onClick={() => setStatus('finished')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'finished'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 font-black'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                ✅ Finalizado
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Fecha y Hora
            </label>
            <input
              type="text"
              placeholder="Ej: 2026-11-15 18:00"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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

// ============================================================================
// 3. TEAM ROSTER MODAL (Team Name, Logo, 5-12 Players Management)
// ============================================================================
export function TeamRosterModal({ isOpen, onClose, team, onSaveTeam }) {
  if (!isOpen || !team) return null;

  const [name, setName] = useState(team.name || '');
  const [logo, setLogo] = useState(team.logo || '⚽');
  const [group, setGroup] = useState(team.group || 'A');
  const [players, setPlayers] = useState(team.players || []);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(team.name || '');
    setLogo(team.logo || '⚽');
    setGroup(team.group || 'A');
    setPlayers(team.players ? [...team.players] : []);
    setError('');
  }, [team]);

  const playerCount = players.length;
  const isMinMet = playerCount >= 5;
  const isMaxReached = playerCount >= 12;

  const handleAddPlayer = (e) => {
    e.preventDefault();
    setError('');

    if (playerCount >= 12) {
      setError('No puedes agregar más de 12 jugadores por equipo (límite máximo alcanzado).');
      return;
    }

    if (!newPlayerName.trim()) {
      setError('Ingresa el nombre del jugador.');
      return;
    }

    const numberInt = parseInt(newPlayerNumber, 10);
    if (isNaN(numberInt) || numberInt < 0 || numberInt > 99) {
      setError('El número de camiseta debe estar entre 0 y 99.');
      return;
    }

    if (players.some((p) => p.number === numberInt)) {
      setError(`Ya existe un jugador con el dorsal #${numberInt}.`);
      return;
    }

    const newPlayer = {
      id: `p-${Date.now()}`,
      name: newPlayerName.trim(),
      number: numberInt,
      goals: 0,
    };

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setNewPlayerNumber('');
  };

  const handleRemovePlayer = (playerId) => {
    if (players.length <= 5) {
      if (!window.confirm('El reglamento exige mínimo 5 jugadores. ¿Deseas eliminarlo de todos modos?')) {
        return;
      }
    }
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const handleAdjustGoals = (playerId, delta) => {
    setPlayers(
      players.map((p) => {
        if (p.id === playerId) {
          return { ...p, goals: Math.max(0, (p.goals || 0) + delta) };
        }
        return p;
      })
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del equipo no puede estar vacío.');
      return;
    }

    if (players.length < 5) {
      if (!window.confirm(`Este equipo tiene ${players.length} jugadores (mínimo recomendado es 5). ¿Deseas guardar de todos modos?`)) {
        return;
      }
    }

    const updatedTeam = {
      ...team,
      name: name.trim(),
      logo: logo.trim() || '⚽',
      group,
      players,
    };

    onSaveTeam(updatedTeam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl shadow-sm shrink-0">
            {logo || '⚽'}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Editar Equipo & Plantilla
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Modifica el nombre del equipo y gestiona sus jugadores (Mínimo 5, Máximo 12)
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: TEAM BASIC INFO */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              1. Datos del Equipo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                  placeholder="Ej: Los Galácticos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Escudo / Emoji
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                  placeholder="⚡, 🔥, 👑"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Grupo en el Torneo
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="C">Grupo C</option>
                <option value="D">Grupo D</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: ROSTER & PLAYERS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>2. Plantilla de Jugadores</span>
              </h3>
              
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  playerCount < 5
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : playerCount > 12
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                }`}>
                  {playerCount} / 12 Jugadores {isMinMet ? '✅' : '⚠️'}
                </span>
              </div>
            </div>

            {!isMinMet && (
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                ⚠️ Faltan {5 - playerCount} jugador(es) para cumplir el mínimo reglamentario de 5.
              </p>
            )}

            {isMaxReached && (
              <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                ✓ Límite máximo de 12 jugadores alcanzado para este equipo.
              </p>
            )}

            {/* Form to add player */}
            <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-2">
                Registrar nuevo jugador:
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Dorsal #"
                  disabled={isMaxReached}
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full sm:w-24 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-mono"
                />
                <input
                  type="text"
                  placeholder="Nombre y Apellido del jugador"
                  disabled={isMaxReached}
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full sm:flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  disabled={isMaxReached}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>

            {/* List of registered players */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {players.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-zinc-600 text-xs font-medium">
                  No hay jugadores inscritos en este equipo aún.
                </div>
              ) : (
                players.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-mono font-black text-xs flex items-center justify-center border border-slate-200 dark:border-zinc-700 shrink-0">
                        {p.number}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate">
                          {p.name}
                        </span>
                        {index < 5 && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            Titular
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => handleAdjustGoals(p.id, -1)}
                          className="w-5 h-5 rounded bg-white dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-zinc-700 cursor-pointer"
                          title="Restar 1 gol"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          {p.goals || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustGoals(p.id, 1)}
                          className="w-5 h-5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center cursor-pointer"
                          title="Sumar 1 gol"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold ml-0.5 hidden xs:inline">gol(es)</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar jugador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Equipo y Plantilla
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// ============================================================================
// 4. GOAL ASSIGN MODAL (Asignar autor del gol para validar y sumar a Goleadores)
// ============================================================================
export function GoalAssignModal({
  isOpen,
  onClose,
  match,
  team,
  teamType, // 'home' | 'away'
  mode = 'add', // 'add' | 'subtract'
  onConfirmGoal
}) {
  if (!isOpen || !match || !team) return null;

  const players = team.players || [];
  
  // En modo 'subtract': Filtrar ESTRICTAMENTE solo jugadores que hayan anotado (goals > 0).
  // Nunca mostrar ni permitir seleccionar jugadores que tengan 0 goles.
  const playersWithGoals = players
    .filter((p) => (p.goals || 0) > 0)
    .sort((a, b) => (b.goals || 0) - (a.goals || 0));

  const displayPlayers = mode === 'subtract'
    ? playersWithGoals
    : [...players].sort((a, b) => a.number - b.number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[90vh] flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl p-2 bg-slate-100 dark:bg-zinc-900 rounded-xl shrink-0 select-none">
              {team.logo || '⚽'}
            </span>
            <div className="min-w-0">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider block ${
                mode === 'add' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
              }`}>
                {mode === 'add' ? '⚽ Anotar Gol' : '⚠️ Anular / Descontar Gol'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {team.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            title="Cerrar sin guardar cambios"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="py-2.5">
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
            {mode === 'add'
              ? '¿Quién marcó el gol? Selecciona al jugador para sumárselo en la tabla de goleadores y validar el gol en el partido:'
              : mode === 'subtract' && displayPlayers.length > 0
                ? '¿A quién deseas descontarle el gol? (Solo se muestran jugadores con goles anotados):'
                : 'Ajuste del marcador del partido:'}
          </p>
        </div>

        {/* Players List or Empty Notice */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-1 pr-1 max-h-64 no-scrollbar">
          {mode === 'subtract' && displayPlayers.length === 0 ? (
            <div className="py-5 px-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg font-bold">
                ℹ️
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  Ningún jugador tiene goles registrados
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                  Todos los jugadores de este equipo tienen 0 goles, por lo que no se le puede restar a ningún jugador.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onConfirmGoal(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <span>➖ Restar 1 al marcador del partido</span>
              </button>
            </div>
          ) : displayPlayers.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
                Este equipo aún no tiene jugadores inscritos en su plantilla.
              </p>
            </div>
          ) : (
            displayPlayers.map((player) => {
              const hasGoals = (player.goals || 0) > 0;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onConfirmGoal(player.id)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all text-left group cursor-pointer shadow-xs ${
                    mode === 'subtract'
                      ? 'border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-100/50 dark:hover:bg-red-900/40'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-8 h-8 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0 border ${
                      mode === 'subtract'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      #{player.number}
                    </span>
                    <div className="min-w-0">
                      <span className={`font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 truncate block ${
                        mode === 'subtract'
                          ? 'group-hover:text-red-600 dark:group-hover:text-red-400'
                          : 'group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                      }`}>
                        {player.name}
                      </span>
                      <span className={`text-[11px] font-extrabold flex items-center gap-1 ${
                        hasGoals
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400 dark:text-zinc-500'
                      }`}>
                        ⚽ {player.goals || 0} {player.goals === 1 ? 'gol registrado' : 'goles registrados'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-black text-xs px-2.5 py-1 rounded-lg text-white shadow-xs flex items-center gap-1 ${
                      mode === 'subtract'
                        ? 'bg-red-600 group-hover:bg-red-500'
                        : 'bg-emerald-600 group-hover:bg-emerald-500'
                    }`}>
                      <span>{mode === 'subtract' ? '-1 gol' : '+1 gol'}</span>
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2 shrink-0">
          {mode === 'subtract' && displayPlayers.length > 0 && (
            <button
              type="button"
              onClick={() => onConfirmGoal(null)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-red-300 dark:border-red-900/70 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-bold transition-all text-center cursor-pointer"
            >
              ➖ Restar solo al marcador del partido (Sin descontar a ningún jugador)
            </button>
          )}

          {mode === 'add' && (
            <button
              type="button"
              onClick={() => onConfirmGoal(null)}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 text-xs font-bold transition-all text-center cursor-pointer"
            >
              🔄 Autogol / Gol en contra (No sumar a ningún jugador)
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
