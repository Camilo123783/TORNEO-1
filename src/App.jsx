import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GroupStandings from './components/GroupStandings';
import MatchesList from './components/MatchesList';
import PlayoffBracket from './components/PlayoffBracket';
import AdminPanel from './components/AdminPanel';
import SecretAdminModal from './components/SecretAdminModal';
import EditMatchModal from './components/EditMatchModal';
import { INITIAL_TEAMS, INITIAL_MATCHES } from './data/initialData';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { Lock, Trophy, RefreshCw } from 'lucide-react';

export default function App() {
  const isConnected = isSupabaseConfigured();

  // State
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('torneo_microfutbol_teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('torneo_microfutbol_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [activeTab, setActiveTab] = useState('groups'); // 'groups', 'matches', 'playoffs', 'admin'
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('torneo_admin_logged') === 'true';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Sync to local fallback when not connected
  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem('torneo_microfutbol_teams', JSON.stringify(teams));
    }
  }, [teams, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      localStorage.setItem('torneo_microfutbol_matches', JSON.stringify(matches));
    }
  }, [matches, isConnected]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isConnected || !supabase) return;

    const fetchData = async () => {
      setSyncing(true);
      try {
        const { data: teamsData, error: teamsErr } = await supabase
          .from('teams')
          .select('*')
          .order('name');
        
        if (!teamsErr && teamsData && teamsData.length > 0) {
          setTeams(teamsData);
        }

        const { data: matchesData, error: matchesErr } = await supabase
          .from('matches')
          .select('*')
          .order('date');

        if (!matchesErr && matchesData && matchesData.length > 0) {
          setMatches(matchesData);
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Error al sincronizar datos:', err);
      } finally {
        setSyncing(false);
      }
    };

    fetchData();

    // Supabase Realtime subscription
    const matchesSubscription = supabase
      .channel('realtime_matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setMatches((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
        } else if (payload.eventType === 'INSERT') {
          setMatches((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchesSubscription);
    };
  }, [isConnected]);

  // Save single match to state + Supabase
  const handleSaveMatch = async (updatedMatch) => {
    setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));

    if (isConnected && supabase) {
      try {
        const { error } = await supabase
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

        if (error) throw error;
      } catch (err) {
        console.error('Error al guardar partido:', err);
      }
    }
  };

  // Save teams to state + Supabase
  const handleUpdateTeams = async (newTeams) => {
    setTeams(newTeams);
    if (isConnected && supabase) {
      try {
        for (const t of newTeams) {
          await supabase.from('teams').upsert(t);
        }
      } catch (err) {
        console.error('Error al guardar equipos:', err);
      }
    }
  };

  // Reset tournament
  const handleResetTournament = async () => {
    setTeams(INITIAL_TEAMS);
    setMatches(INITIAL_MATCHES);
    localStorage.removeItem('torneo_microfutbol_teams');
    localStorage.removeItem('torneo_microfutbol_matches');

    if (isConnected && supabase) {
      try {
        for (const t of INITIAL_TEAMS) {
          await supabase.from('teams').upsert(t);
        }
        for (const m of INITIAL_MATCHES) {
          await supabase.from('matches').upsert(m);
        }
      } catch (err) {
        console.error('Error al reiniciar base de datos:', err);
      }
    }
  };

  // Handle Login Success
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('torneo_admin_logged', 'true');
    setActiveTab('admin');
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsAdmin(false);
    localStorage.removeItem('torneo_admin_logged');
    if (isConnected && supabase) {
      await supabase.auth.signOut();
    }
    setActiveTab('groups');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Syncing spinner */}
        {syncing && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 py-1.5 px-4 rounded-full w-fit mx-auto animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Actualizando torneo...</span>
          </div>
        )}

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

        {/* Tab 4: Admin Panel */}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel
            teams={teams}
            setTeams={handleUpdateTeams}
            matches={matches}
            setMatches={setMatches}
            onSaveSingleMatch={handleSaveMatch}
            onEditMatch={(m) => setEditingMatch(m)}
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

      {/* Footer with Discreet Admin Secret Entry */}
      <footer className="mt-auto border-t border-slate-900 bg-[#060a14] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500/70" />
            <span className="font-semibold text-slate-400">Torneo de Microfútbol 2026</span>
            <span>•</span>
            <span>12 Equipos en 4 Grupos</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Secret Admin Button in Footer */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveTab('admin');
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              title="Acceso confidencial (Ctrl+Shift+A)"
              className="flex items-center gap-1.5 opacity-20 hover:opacity-80 transition-all hover:text-emerald-400 p-1.5 rounded cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px]">{isAdmin ? 'Panel' : 'Acceso'}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
