import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import AdminPanel from './components/AdminPanel';
import { 
  GroupStandings, 
  MatchesList, 
  PlayoffBracket, 
  TeamsList, 
  TopScorers 
} from './components/TournamentViews';
import { 
  SecretAdminModal, 
  EditMatchModal, 
  TeamRosterModal 
} from './components/Modals';
import { 
  INITIAL_TEAMS, 
  INITIAL_MATCHES, 
  supabase, 
  isSupabaseConfigured 
} from './tournamentData';
import { Lock, Trophy, RefreshCw, X } from 'lucide-react';

export default function App() {
  const isConnected = isSupabaseConfigured();

  // State: Teams, Matches y Credenciales (Manejados 100% en Supabase sin localStorage)
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [adminCedula, setAdminCedula] = useState('7530');
  const [adminPassword, setAdminPassword] = useState('1590');
  const [isLoading, setIsLoading] = useState(true);

  // Navigation tab: 'groups', 'matches', 'playoffs', 'teams', 'scorers', 'admin'
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('torneo_active_tab');
    const isLogged = localStorage.getItem('torneo_admin_logged') === 'true';
    if (saved === 'admin' && !isLogged) return 'groups';
    if (saved) return saved;
    return isLogged ? 'admin' : 'groups';
  });

  useEffect(() => {
    localStorage.setItem('torneo_active_tab', activeTab);
  }, [activeTab]);
  
  // Permanent unlimited admin session
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('torneo_admin_logged') === 'true';
  });

  // Dark mode state: persisted in localStorage (active on single click on logo)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('torneo_dark_mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('torneo_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('torneo_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Limpieza inicial de cualquier rastro previo en localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('torneo_microfutbol_teams');
      localStorage.removeItem('torneo_microfutbol_matches');
    } catch (e) {}
  }, []);

  // Fetch data function directo desde tablas de Supabase
  const fetchData = useCallback(async (showLoading = false) => {
    if (!isConnected || !supabase) {
      setIsLoading(false);
      return;
    }

    if (showLoading) setIsRefreshing(true);
    try {
      // 1. Cargar Equipos y Plantillas directamente de Supabase
      const { data: teamsData, error: teamsErr } = await supabase
        .from('teams')
        .select('*')
        .order('id');

      // Intentar cargar de la tabla independiente 'players' si existe
      let playersData = null;
      try {
        const { data: pData } = await supabase
          .from('players')
          .select('*')
          .order('number');
        if (pData && pData.length > 0) {
          playersData = pData;
        }
      } catch (e) {}
      
      if (!teamsErr && teamsData && teamsData.length > 0) {
        setTeams(teamsData.map((remote) => {
          const fallbackTeam = INITIAL_TEAMS.find((t) => t.id === remote.id);
          const relatedPlayers = playersData
            ? playersData.filter((p) => p.team_id === remote.id)
            : null;

          return {
            ...remote,
            players: relatedPlayers && relatedPlayers.length > 0
              ? relatedPlayers
              : (Array.isArray(remote.players) && remote.players.length > 0
                  ? remote.players 
                  : (fallbackTeam ? fallbackTeam.players : []))
          };
        }));
      }

      // 2. Cargar Partidos y Resultados directamente de Supabase
      const { data: matchesData, error: matchesErr } = await supabase
        .from('matches')
        .select('*')
        .order('date');

      if (!matchesErr && matchesData && matchesData.length > 0) {
        setMatches(matchesData);
      }

      // 3. Cargar Credenciales de Administración desde tabla tournament_settings
      try {
        const { data: settingsData } = await supabase
          .from('tournament_settings')
          .select('*');
        if (settingsData && settingsData.length > 0) {
          const c = settingsData.find((s) => s.key === 'admin_cedula');
          const p = settingsData.find((s) => s.key === 'admin_password');
          if (c?.value) setAdminCedula(c.value);
          if (p?.value) setAdminPassword(p.value);
        }
      } catch (e) {}
    } catch (err) {
      console.error('Error al sincronizar datos desde Supabase:', err);
    } finally {
      setIsLoading(false);
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  }, [isConnected]);

  // Initial load y suscripción en tiempo real de Supabase
  useEffect(() => {
    fetchData();

    // Background polling cada 4 segundos como seguro adicional de sincronización
    const interval = setInterval(() => {
      fetchData(false);
    }, 4000);

    // Supabase Realtime subscription a nivel de base de datos
    let realtimeChannel = null;
    if (isConnected && supabase) {
      realtimeChannel = supabase
        .channel('db_sync_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatches((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
          } else if (payload.eventType === 'INSERT') {
            setMatches((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTeams((prev) => prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t)));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTeams((prev) =>
              prev.map((team) => {
                if (team.id === payload.new.team_id) {
                  const updatedPlayers = (team.players || []).map((p) =>
                    p.id === payload.new.id ? { ...p, ...payload.new } : p
                  );
                  return { ...team, players: updatedPlayers };
                }
                return team;
              })
            );
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_settings' }, (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            if (payload.new.key === 'admin_cedula') setAdminCedula(payload.new.value);
            if (payload.new.key === 'admin_password') setAdminPassword(payload.new.value);
          }
        })
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (realtimeChannel && supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [isConnected, fetchData]);

  // Guardar partido directamente en la tabla 'matches' de Supabase
  const handleSaveMatch = async (updatedMatch) => {
    const cleanMatch = {
      ...updatedMatch,
      home_score: updatedMatch.home_score !== '' && updatedMatch.home_score !== null && !isNaN(updatedMatch.home_score)
        ? Number(updatedMatch.home_score)
        : null,
      away_score: updatedMatch.away_score !== '' && updatedMatch.away_score !== null && !isNaN(updatedMatch.away_score)
        ? Number(updatedMatch.away_score)
        : null,
    };

    // Actualización inmediata en memoria para experiencia instantánea
    setMatches((prev) => prev.map((m) => (m.id === cleanMatch.id ? cleanMatch : m)));

    if (isConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('matches')
          .update({
            home_team_id: cleanMatch.home_team_id,
            away_team_id: cleanMatch.away_team_id,
            home_score: cleanMatch.home_score,
            away_score: cleanMatch.away_score,
            status: cleanMatch.status,
            date: cleanMatch.date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cleanMatch.id)
          .select();

        if (error) {
          console.error('Error al actualizar en Supabase:', error);
          alert('Error al guardar en Supabase: ' + error.message);
        } else if (!data || data.length === 0) {
          console.warn('Supabase no actualizó filas. Recuerda ejecutar supabase_setup.sql en el SQL Editor para desactivar RLS.');
        } else {
          setMatches((prev) => prev.map((m) => (m.id === data[0].id ? data[0] : m)));
        }
      } catch (err) {
        console.error('Error al guardar partido en Supabase:', err);
      }
    }
  };

  // Guardar equipo y jugadores directamente en las tablas 'teams' y 'players' de Supabase
  const handleSaveTeam = async (updatedTeam) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));

    if (isConnected && supabase) {
      try {
        await supabase
          .from('teams')
          .update({
            name: updatedTeam.name,
            group: updatedTeam.group,
            logo: updatedTeam.logo,
            color: updatedTeam.color,
            players: updatedTeam.players || [],
          })
          .eq('id', updatedTeam.id);

        // Guardar/actualizar jugadores individualmente en la tabla 'players'
        if (Array.isArray(updatedTeam.players) && updatedTeam.players.length > 0) {
          for (const p of updatedTeam.players) {
            try {
              await supabase.from('players').upsert({
                id: p.id,
                team_id: updatedTeam.id,
                name: p.name,
                number: p.number,
                goals: p.goals || 0,
              });
            } catch (err) {}
          }
        }
      } catch (err) {
        console.error('Error al guardar equipo en Supabase:', err);
      }
    }
  };

  // Guardar goles de jugadores directamente en Supabase (tabla 'players' y 'teams')
  const handleUpdatePlayerGoals = async (teamId, playerId, delta) => {
    let newGoals = 0;
    setTeams((prev) => {
      let updatedTeam = null;
      const nextTeams = prev.map((team) => {
        if (team.id === teamId) {
          const updatedPlayers = (team.players || []).map((p) => {
            if (p.id === playerId) {
              newGoals = Math.max(0, (p.goals || 0) + delta);
              return { ...p, goals: newGoals };
            }
            return p;
          });
          updatedTeam = { ...team, players: updatedPlayers };
          return updatedTeam;
        }
        return team;
      });

      if (updatedTeam) {
        handleSaveTeam(updatedTeam);
      }
      return nextTeams;
    });

    if (isConnected && supabase) {
      try {
        await supabase.from('players').update({ goals: newGoals }).eq('id', playerId);
      } catch (err) {}
    }
  };

  // Guardar credenciales de administración en tabla tournament_settings de Supabase
  const handleUpdateCredentials = async (newCedula, newPass) => {
    setAdminCedula(newCedula);
    setAdminPassword(newPass);
    if (isConnected && supabase) {
      try {
        await supabase.from('tournament_settings').upsert([
          { key: 'admin_cedula', value: newCedula },
          { key: 'admin_password', value: newPass }
        ]);
      } catch (err) {
        console.error('Error al actualizar credenciales en Supabase:', err);
      }
    }
  };

  // Reiniciar torneo directamente en tablas de Supabase
  const handleResetTournament = async () => {
    if (!confirm('¿Seguro que deseas reiniciar los marcadores y equipos a su estado original en Supabase?')) {
      return;
    }
    setTeams(INITIAL_TEAMS);
    setMatches(INITIAL_MATCHES);

    if (isConnected && supabase) {
      try {
        for (const t of INITIAL_TEAMS) {
          await supabase.from('teams').upsert({
            id: t.id,
            name: t.name,
            group: t.group,
            logo: t.logo,
            color: t.color,
          });
          if (Array.isArray(t.players)) {
            for (const p of t.players) {
              try {
                await supabase.from('players').upsert({
                  id: p.id,
                  team_id: t.id,
                  name: p.name,
                  number: p.number,
                  goals: p.goals || 0,
                });
              } catch (e) {}
            }
          }
        }
        for (const m of INITIAL_MATCHES) {
          await supabase.from('matches').upsert({
            id: m.id,
            round: m.round,
            phase: m.phase,
            group: m.group,
            bracket_code: m.bracket_code,
            home_label: m.home_label,
            away_label: m.away_label,
            home_team_id: m.home_team_id,
            away_team_id: m.away_team_id,
            home_score: m.home_score,
            away_score: m.away_score,
            status: m.status,
            date: m.date,
          });
        }
        fetchData(true);
      } catch (err) {
        console.error('Error al reiniciar base de datos en Supabase:', err);
      }
    }
  };

  // Handle Login / Logout
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('torneo_admin_logged', 'true');
    setActiveTab('admin');
    localStorage.setItem('torneo_active_tab', 'admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('torneo_admin_logged');
    setActiveTab('groups');
    localStorage.setItem('torneo_active_tab', 'groups');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-black text-slate-800 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* High-Visibility Admin Banner (Visible en todo momento en modo admin) */}
      {isAdmin && (
        <div className="bg-emerald-600 text-white font-extrabold text-xs sm:text-sm py-2 px-3 sm:px-4 shadow-sm flex items-center justify-between sticky top-0 z-50 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1 bg-white/20 rounded shrink-0">⚡</span>
            <span className="hidden sm:inline truncate">MODO ADMINISTRADOR ACTIVO — Puedes cambiar marcadores, nombres de equipos y jugadores</span>
            <span className="sm:hidden font-black truncate">ADMINISTRADOR ACTIVO</span>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-black/20 hover:bg-black/35 text-white text-xs font-bold px-2.5 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Salir</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with 1-tap Dark Mode & 2-sec hold for Admin */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Tab 1: Group Standings */}
        {activeTab === 'groups' && (
          <GroupStandings teams={teams} matches={matches} />
        )}

        {/* Tab 2: Matches & Fixtures */}
        {activeTab === 'matches' && (
          <MatchesList
            teams={teams}
            matches={matches}
            isAdmin={isAdmin}
            onEditMatch={(m) => setEditingMatch(m)}
          />
        )}

        {/* Tab 3: Playoffs Bracket */}
        {activeTab === 'playoffs' && (
          <PlayoffBracket
            teams={teams}
            matches={matches}
            isAdmin={isAdmin}
            onEditMatch={(m) => setEditingMatch(m)}
          />
        )}

        {/* Tab 4: Teams and Players List */}
        {activeTab === 'teams' && (
          <TeamsList
            teams={teams}
            isAdmin={isAdmin}
            onEditTeam={(team) => setEditingTeam(team)}
          />
        )}

        {/* Tab 5: Top Scorers (Goleadores) */}
        {activeTab === 'scorers' && (
          <TopScorers
            teams={teams}
            isAdmin={isAdmin}
            onUpdatePlayerGoals={handleUpdatePlayerGoals}
          />
        )}

        {/* Tab 6: Admin Panel */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            teams={teams}
            matches={matches}
            setMatches={setMatches}
            onSaveSingleMatch={handleSaveMatch}
            onEditMatch={(m) => setEditingMatch(m)}
            onEditTeam={(team) => setEditingTeam(team)}
            onResetTournament={handleResetTournament}
            adminCedula={adminCedula}
            adminPassword={adminPassword}
            onUpdateCredentials={handleUpdateCredentials}
          />
        )}
      </main>

      {/* Modals */}
      <SecretAdminModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        adminCedula={adminCedula}
        adminPassword={adminPassword}
      />

      <EditMatchModal
        isOpen={Boolean(editingMatch)}
        onClose={() => setEditingMatch(null)}
        match={editingMatch}
        teams={teams}
        onSave={handleSaveMatch}
      />

      <TeamRosterModal
        isOpen={Boolean(editingTeam)}
        onClose={() => setEditingTeam(null)}
        team={editingTeam}
        onSaveTeam={handleSaveTeam}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-black py-6 text-xs text-slate-500 dark:text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="w-5 h-5 rounded-full object-contain" />
            <span className="font-bold text-slate-700 dark:text-zinc-300">Torneo de Microfútbol Tunja 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
