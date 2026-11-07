import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Save, AlertCircle, CheckCircle2, Shield, Shirt, Award } from 'lucide-react';

export default function TeamRosterModal({ isOpen, onClose, team, onSaveTeam }) {
  if (!isOpen || !team) return null;

  const [name, setName] = useState(team.name || '');
  const [logo, setLogo] = useState(team.logo || '⚽');
  const [group, setGroup] = useState(team.group || 'A');
  const [players, setPlayers] = useState(team.players || []);

  // Form for adding a new player
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

  // Add a player
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

    // Check duplicate number
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

  // Remove a player
  const handleRemovePlayer = (playerId) => {
    if (players.length <= 5) {
      if (!window.confirm('El reglamento exige mínimo 5 jugadores. ¿Deseas eliminarlo de todos modos?')) {
        return;
      }
    }
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  // Quick adjust goals
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

  // Save changes
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-sm shrink-0">
            {logo || '⚽'}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Editar Equipo & Plantilla
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Modifica el nombre del equipo y gestiona sus jugadores (Mínimo 5, Máximo 12)
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: TEAM BASIC INFO */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
              1. Datos del Equipo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                  placeholder="Ej: Los Galácticos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Escudo / Emoji
                </label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-emerald-500 shadow-xs"
                  placeholder="⚡, 🔥, 👑"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Grupo en el Torneo
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="A">Grupo A</option>
                <option value="B">Grupo B</option>
                <option value="C">Grupo C</option>
                <option value="D">Grupo D</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: ROSTER & PLAYERS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>2. Plantilla de Jugadores</span>
              </h3>
              
              {/* Player Count Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  playerCount < 5
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : playerCount > 12
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {playerCount} / 12 Jugadores {isMinMet ? '✅' : '⚠️'}
                </span>
              </div>
            </div>

            {/* Warnings */}
            {!isMinMet && (
              <p className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Faltan {5 - playerCount} jugador(es) para cumplir el mínimo reglamentario de 5.
              </p>
            )}

            {isMaxReached && (
              <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                ✓ Límite máximo de 12 jugadores alcanzado para este equipo.
              </p>
            )}

            {/* Form to add a player */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Registrar nuevo jugador:
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="number"
                  placeholder="Dorsal #"
                  min="0"
                  max="99"
                  disabled={isMaxReached}
                  value={newPlayerNumber}
                  onChange={(e) => setNewPlayerNumber(e.target.value)}
                  className="w-full sm:w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <input
                  type="text"
                  placeholder="Nombre y Apellido del jugador"
                  disabled={isMaxReached}
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full sm:flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
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
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  No hay jugadores inscritos en este equipo aún.
                </div>
              ) : (
                players.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-mono font-black text-xs flex items-center justify-center border border-slate-200 shrink-0">
                        {p.number}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {p.name}
                        </span>
                        {index < 5 && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Titular
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Goals counter */}
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleAdjustGoals(p.id, -1)}
                          className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 cursor-pointer"
                          title="Restar 1 gol"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-emerald-700 text-xs">
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
                        <span className="text-[10px] text-slate-400 font-bold ml-0.5">gol(es)</span>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
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
