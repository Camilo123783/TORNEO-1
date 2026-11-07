import React, { useState, useEffect, useCallback } from 'react';
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

  // State: Teams and Matches (Loaded from localStorage or defaults)
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('torneo_microfutbol_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('torneo_microfutbol_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  // Navigation tab: 'groups', 'matches', 'playoffs', 'teams', 'scorers', 'admin'
  const [activeTab, setActiveTab] = useState('groups');
  
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

  // Sync to local storage always as instant cache
  useEffect(() => {
    localStorage.setItem('torneo_microfutbol_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('torneo_microfutbol_matches', JSON.stringify(matches));
  }, [matches]);

  // Fast fetch data function (used for initial load, polling, and manual refresh)
  const fetchData = useCallback(async (showLoading = false) => {
    if (!isConnected || !supabase) return;

    if (showLoading) setIsRefreshing(true);
    try {
      // 1. Fetch Teams
      const { data: teamsData, error: teamsErr } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (!teamsErr && teamsData && teamsData.length > 0) {
        setTeams((prevTeams) => {
          // Merge Supabase data with local players if players column isn't in DB yet
          return teamsData.map((remote) => {
            const local = prevTeams.find((t) => t.id === remote.id);
            return {
              ...remote,
              players: remote.players || (local ? local.players : [])
            };
          });
        });
      }

      // 2. Fetch Matches
      const { data: matchesData, error: matchesErr } = await supabase
        .from('matches')
        .select('*')
        .order('date');

      if (!matchesErr && matchesData && matchesData.length > 0) {
        setMatches(matchesData);
      }
    } catch (err) {
      console.error('Error al sincronizar datos:', err);
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  }, [isConnected]);

  // Initial load
  useEffect(() => {
    fetchData();

    // Fast background polling every 4 seconds to guarantee all devices update in real-time
    const interval = setInterval(() => {
      fetchData(false);
    }, 4000);

    // Supabase Realtime subscription
    let matchesSubscription = null;
    if (isConnected && supabase) {
      matchesSubscription = supabase
        .channel('realtime_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatches((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
          } else if (payload.eventType === 'INSERT') {
            setMatches((prev) => [...prev, payload.new]);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTeams((prev) => prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t)));
          }
        })
        .subscribe();
    }

    return () => {
      clearInterval(interval);
      if (matchesSubscription && supabase) {
        supabase.removeChannel(matchesSubscription);
      }
    };
  }, [isConnected, fetchData]);

  // Handle Save Single Match (0ms optimistic state update + Supabase sync)
  const handleSaveMatch = async (updatedMatch) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));

    if (isConnected && supabase) {
      try {
        await supabase
          .from('matches')
          .update({
            home_team_id: updatedMatch.home_team_id,
            away_team_id: updatedMatch.away_team_id,
            home_score: updatedMatch.home_score,
            away_score: updatedMatch.away_score,
            status: updatedMatch.status,
            date: updatedMatch.date,
            court: updatedMatch.court,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedMatch.id);
      } catch (err) {
        console.error('Error al guardar partido en Supabase:', err);
      }
    }
  };

  // Handle Save Team & Players (0ms optimistic state update + resilient Supabase sync)
  const handleSaveTeam = async (updatedTeam) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));

    if (isConnected && supabase) {
      try {
        // Try saving full object including players
        const { error } = await supabase.from('teams').upsert(updatedTeam);
        if (error) {
          // If players column is not in Supabase yet, save without players column to avoid error
          const cleanTeam = {
            id: updatedTeam.id,
            name: updatedTeam.name,
            group: updatedTeam.group,
            logo: updatedTeam.logo,
            color: updatedTeam.color,
          };
          await supabase.from('teams').upsert(cleanTeam);
        }
      } catch (err) {
        console.error('Error al guardar equipo en Supabase:', err);
      }
    }
  };

  // Update Player Goals directly (e.g. from Goleadores table)
  const handleUpdatePlayerGoals = (teamId, playerId, delta) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          const updatedPlayers = (team.players || []).map((p) => {
            if (p.id === playerId) {
              return { ...p, goals: Math.max(0, (p.goals || 0) + delta) };
            }
            return p;
          });
          const updatedTeam = { ...team, players: updatedPlayers };
          // Background sync
          handleSaveTeam(updatedTeam);
          return updatedTeam;
        }
        return team;
      })
    );
  };

  // Reset Tournament
  const handleResetTournament = async () => {
    setTeams(INITIAL_TEAMS);
    setMatches(INITIAL_MATCHES);
    localStorage.removeItem('torneo_microfutbol_teams');
    localStorage.removeItem('torneo_microfutbol_matches');

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
        }
        for (const m of INITIAL_MATCHES) {
          await supabase.from('matches').upsert(m);
        }
      } catch (err) {
        console.error('Error al reiniciar base de datos:', err);
      }
    }
  };

  // Handle Login / Logout
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('torneo_admin_logged', 'true');
    setActiveTab('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('torneo_admin_logged');
    setActiveTab('groups');
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
          />
        )}
      </main>

      {/* Modals */}
      <SecretAdminModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
