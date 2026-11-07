import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT & CONFIGURATION
// ==========================================
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
    supabaseAnonKey !== 'PEGA_AQUI_TU_ANON_KEY' &&
    supabaseAnonKey !== supabaseUrl &&
    supabaseUrl.startsWith('https://')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// STANDINGS CALCULATOR (MICROFÚTBOL RULES)
// 3 pts Win, 1 pt Draw, 0 pt Loss
// Tiebreakers: PTS > DG > GF > Fewest GC > Name
// ==========================================
export function calculateGroupStandings(teams, matches, groupKey) {
  const groupTeams = teams.filter(t => t.group === groupKey);

  const statsMap = {};
  groupTeams.forEach(t => {
    statsMap[t.id] = {
      team: t,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
      form: []
    };
  });

  const finishedGroupMatches = matches.filter(
    m => m.group === groupKey && 
         m.status === 'finished' && 
         m.home_score !== null && 
         m.away_score !== null &&
         statsMap[m.home_team_id] && 
         statsMap[m.away_team_id]
  );

  finishedGroupMatches.forEach(m => {
    const home = statsMap[m.home_team_id];
    const away = statsMap[m.away_team_id];

    home.pj += 1;
    away.pj += 1;
    home.gf += Number(m.home_score);
    home.gc += Number(m.away_score);
    away.gf += Number(m.away_score);
    away.gc += Number(m.home_score);

    if (m.home_score > m.away_score) {
      home.pg += 1;
      home.pts += 3;
      home.form.push('W');
      away.pp += 1;
      away.form.push('L');
    } else if (m.home_score < m.away_score) {
      away.pg += 1;
      away.pts += 3;
      away.form.push('W');
      home.pp += 1;
      home.form.push('L');
    } else {
      home.pe += 1;
      away.pe += 1;
      home.pts += 1;
      away.pts += 1;
      home.form.push('D');
      away.form.push('D');
    }
  });

  Object.values(statsMap).forEach(stat => {
    stat.dg = stat.gf - stat.gc;
  });

  const standings = Object.values(statsMap);
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (a.gc !== b.gc) return a.gc - b.gc;
    return a.team.name.localeCompare(b.team.name);
  });

  return standings;
}

// ==========================================
// 12 TEAMS (4 GROUPS OF 3, 5-12 PLAYERS)
// ==========================================
export const INITIAL_TEAMS = [
  // Grupo A
  { 
    id: 't1', 
    name: 'Los Galácticos', 
    group: 'A', 
    logo: '⚡', 
    color: '#3B82F6',
    players: [
      { id: 'p-1', name: 'Camilo Rodríguez', number: 10, goals: 3 },
      { id: 'p-2', name: 'Daniel Martínez', number: 7, goals: 1 },
      { id: 'p-3', name: 'Andrés Gómez', number: 1, goals: 0 },
      { id: 'p-4', name: 'Mateo López', number: 8, goals: 0 },
      { id: 'p-5', name: 'Sebastián Castro', number: 9, goals: 0 }
    ]
  },
  { 
    id: 't2', 
    name: 'Furia Futsal', 
    group: 'A', 
    logo: '🔥', 
    color: '#EF4444',
    players: [
      { id: 'p-6', name: 'Felipe Vargas', number: 11, goals: 2 },
      { id: 'p-7', name: 'Santiago Herrera', number: 5, goals: 0 },
      { id: 'p-8', name: 'Julián Morales', number: 1, goals: 0 },
      { id: 'p-9', name: 'David Peña', number: 4, goals: 0 },
      { id: 'p-10', name: 'Kevin Ruiz', number: 8, goals: 0 }
    ]
  },
  { 
    id: 't3', 
    name: 'Atlético Barrio', 
    group: 'A', 
    logo: '🛡️', 
    color: '#10B981',
    players: [
      { id: 'p-11', name: 'Brayan Torres', number: 10, goals: 0 },
      { id: 'p-12', name: 'Nicolás Silva', number: 9, goals: 0 },
      { id: 'p-13', name: 'Alejandro Cárdenas', number: 1, goals: 0 },
      { id: 'p-14', name: 'Diego Romero', number: 6, goals: 0 },
      { id: 'p-15', name: 'Esteban Ortiz', number: 3, goals: 0 }
    ]
  },

  // Grupo B
  { 
    id: 't4', 
    name: 'Titanes FC', 
    group: 'B', 
    logo: '👑', 
    color: '#F59E0B',
    players: [
      { id: 'p-16', name: 'Cristian Pardo', number: 9, goals: 2 },
      { id: 'p-17', name: 'Jhoan Medina', number: 10, goals: 1 },
      { id: 'p-18', name: 'Víctor Rincón', number: 1, goals: 0 },
      { id: 'p-19', name: 'Óscar Navarro', number: 5, goals: 0 },
      { id: 'p-20', name: 'Miguel Salazar', number: 2, goals: 0 }
    ]
  },
  { 
    id: 't5', 
    name: 'La Vecindad', 
    group: 'B', 
    logo: '🦁', 
    color: '#8B5CF6',
    players: [
      { id: 'p-21', name: 'Jorge Benítez', number: 7, goals: 2 },
      { id: 'p-22', name: 'Mauricio Díaz', number: 11, goals: 1 },
      { id: 'p-23', name: 'Luis Mendoza', number: 1, goals: 0 },
      { id: 'p-24', name: 'Samuel Rojas', number: 4, goals: 0 },
      { id: 'p-25', name: 'Gabriel Ospina', number: 8, goals: 0 }
    ]
  },
  { 
    id: 't6', 
    name: 'Deportivo Unión', 
    group: 'B', 
    logo: '⚽', 
    color: '#06B6D4',
    players: [
      { id: 'p-26', name: 'Carlos Mario', number: 10, goals: 0 },
      { id: 'p-27', name: 'Iván Duque', number: 9, goals: 0 },
      { id: 'p-28', name: 'Pablo Gil', number: 1, goals: 0 },
      { id: 'p-29', name: 'Lucas Valencia', number: 3, goals: 0 },
      { id: 'p-30', name: 'Simón Parra', number: 5, goals: 0 }
    ]
  },

  // Grupo C
  { 
    id: 't7', 
    name: 'Relámpagos', 
    group: 'C', 
    logo: '🌩️', 
    color: '#EC4899',
    players: [
      { id: 'p-31', name: 'Álvaro Cruz', number: 10, goals: 3 },
      { id: 'p-32', name: 'Fabián Meza', number: 7, goals: 2 },
      { id: 'p-33', name: 'Rodrigo Reyes', number: 1, goals: 0 },
      { id: 'p-34', name: 'Jonathan Lara', number: 2, goals: 0 },
      { id: 'p-35', name: 'Martín Bernal', number: 6, goals: 0 }
    ]
  },
  { 
    id: 't8', 
    name: 'Inter Micro', 
    group: 'C', 
    logo: '🌟', 
    color: '#6366F1',
    players: [
      { id: 'p-36', name: 'Guillermo Paz', number: 8, goals: 1 },
      { id: 'p-37', name: 'Ángel Suárez', number: 9, goals: 0 },
      { id: 'p-38', name: 'Héctor Cabrera', number: 1, goals: 0 },
      { id: 'p-39', name: 'Nelson Molina', number: 4, goals: 0 },
      { id: 'p-40', name: 'Sergio Vega', number: 5, goals: 0 }
    ]
  },
  { 
    id: 't9', 
    name: 'Arsenal del Sur', 
    group: 'C', 
    logo: '🎯', 
    color: '#14B8A6',
    players: [
      { id: 'p-41', name: 'Javier Castillo', number: 10, goals: 0 },
      { id: 'p-42', name: 'Ricardo Acosta', number: 11, goals: 0 },
      { id: 'p-43', name: 'Jaime Lozano', number: 1, goals: 0 },
      { id: 'p-44', name: 'Eduardo Ríos', number: 3, goals: 0 },
      { id: 'p-45', name: 'Tomás Arias', number: 7, goals: 0 }
    ]
  },

  // Grupo D
  { 
    id: 't10', 
    name: 'Halcones', 
    group: 'D', 
    logo: '🦅', 
    color: '#84CC16',
    players: [
      { id: 'p-46', name: 'Manuel Beltrán', number: 9, goals: 2 },
      { id: 'p-47', name: 'Hernán Nieto', number: 10, goals: 0 },
      { id: 'p-48', name: 'Emilio Giraldo', number: 1, goals: 0 },
      { id: 'p-49', name: 'César Duarte', number: 8, goals: 0 },
      { id: 'p-50', name: 'Rubén Marín', number: 2, goals: 0 }
    ]
  },
  { 
    id: 't11', 
    name: 'Real Amistad', 
    group: 'D', 
    logo: '🤝', 
    color: '#F97316',
    players: [
      { id: 'p-51', name: 'Germán Franco', number: 11, goals: 3 },
      { id: 'p-52', name: 'Félix Quintero', number: 7, goals: 1 },
      { id: 'p-53', name: 'Gustavo Osorio', number: 1, goals: 0 },
      { id: 'p-54', name: 'Mario Villalba', number: 4, goals: 0 },
      { id: 'p-55', name: 'Hugo Restrepo', number: 5, goals: 0 }
    ]
  },
  { 
    id: 't12', 
    name: 'Gladiadores', 
    group: 'D', 
    logo: '⚔️', 
    color: '#D946EF',
    players: [
      { id: 'p-56', name: 'Adrián Salcedo', number: 10, goals: 0 },
      { id: 'p-57', name: 'Bernardo Hoyos', number: 9, goals: 0 },
      { id: 'p-58', name: 'René Zambrano', number: 1, goals: 0 },
      { id: 'p-59', name: 'Leonel Carvajal', number: 6, goals: 0 },
      { id: 'p-60', name: 'Fabrizio Bravo', number: 3, goals: 0 }
    ]
  },
];

// ==========================================
// TOURNAMENT FIXTURES & MATCHES
// ==========================================
export const INITIAL_MATCHES = [
  // GRUPO A
  {
    id: 'm-a1',
    round: 'Fecha 1',
    phase: 'groups',
    group: 'A',
    home_team_id: 't1',
    away_team_id: 't2',
    home_score: 4,
    away_score: 2,
    status: 'finished',
    date: '2026-11-10 18:00',
    court: 'Cancha 1 - Principal'
  },
  {
    id: 'm-a2',
    round: 'Fecha 2',
    phase: 'groups',
    group: 'A',
    home_team_id: 't1',
    away_team_id: 't3',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-12 18:00',
    court: 'Cancha 1 - Principal'
  },
  {
    id: 'm-a3',
    round: 'Fecha 3',
    phase: 'groups',
    group: 'A',
    home_team_id: 't2',
    away_team_id: 't3',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-14 18:00',
    court: 'Cancha 1 - Principal'
  },

  // GRUPO B
  {
    id: 'm-b1',
    round: 'Fecha 1',
    phase: 'groups',
    group: 'B',
    home_team_id: 't4',
    away_team_id: 't5',
    home_score: 3,
    away_score: 3,
    status: 'finished',
    date: '2026-11-10 19:00',
    court: 'Cancha 1 - Principal'
  },
  {
    id: 'm-b2',
    round: 'Fecha 2',
    phase: 'groups',
    group: 'B',
    home_team_id: 't4',
    away_team_id: 't6',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-12 19:00',
    court: 'Cancha 1 - Principal'
  },
  {
    id: 'm-b3',
    round: 'Fecha 3',
    phase: 'groups',
    group: 'B',
    home_team_id: 't5',
    away_team_id: 't6',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-14 19:00',
    court: 'Cancha 1 - Principal'
  },

  // GRUPO C
  {
    id: 'm-c1',
    round: 'Fecha 1',
    phase: 'groups',
    group: 'C',
    home_team_id: 't7',
    away_team_id: 't8',
    home_score: 5,
    away_score: 1,
    status: 'finished',
    date: '2026-11-11 18:00',
    court: 'Cancha 2'
  },
  {
    id: 'm-c2',
    round: 'Fecha 2',
    phase: 'groups',
    group: 'C',
    home_team_id: 't7',
    away_team_id: 't9',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-13 18:00',
    court: 'Cancha 2'
  },
  {
    id: 'm-c3',
    round: 'Fecha 3',
    phase: 'groups',
    group: 'C',
    home_team_id: 't8',
    away_team_id: 't9',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-15 18:00',
    court: 'Cancha 2'
  },

  // GRUPO D
  {
    id: 'm-d1',
    round: 'Fecha 1',
    phase: 'groups',
    group: 'D',
    home_team_id: 't10',
    away_team_id: 't11',
    home_score: 2,
    away_score: 4,
    status: 'finished',
    date: '2026-11-11 19:00',
    court: 'Cancha 2'
  },
  {
    id: 'm-d2',
    round: 'Fecha 2',
    phase: 'groups',
    group: 'D',
    home_team_id: 't10',
    away_team_id: 't12',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-13 19:00',
    court: 'Cancha 2'
  },
  {
    id: 'm-d3',
    round: 'Fecha 3',
    phase: 'groups',
    group: 'D',
    home_team_id: 't11',
    away_team_id: 't12',
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-15 19:00',
    court: 'Cancha 2'
  },

  // CUARTOS DE FINAL
  {
    id: 'qf-1',
    round: 'Cuartos 1',
    phase: 'playoffs',
    bracket_code: 'QF1',
    home_label: '1º Grupo A',
    away_label: '2º Grupo B',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-17 18:00',
    court: 'Cancha Principal'
  },
  {
    id: 'qf-2',
    round: 'Cuartos 2',
    phase: 'playoffs',
    bracket_code: 'QF2',
    home_label: '1º Grupo C',
    away_label: '2º Grupo D',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-17 19:15',
    court: 'Cancha Principal'
  },
  {
    id: 'qf-3',
    round: 'Cuartos 3',
    phase: 'playoffs',
    bracket_code: 'QF3',
    home_label: '1º Grupo B',
    away_label: '2º Grupo A',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-18 18:00',
    court: 'Cancha Principal'
  },
  {
    id: 'qf-4',
    round: 'Cuartos 4',
    phase: 'playoffs',
    bracket_code: 'QF4',
    home_label: '1º Grupo D',
    away_label: '2º Grupo C',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-18 19:15',
    court: 'Cancha Principal'
  },

  // SEMIFINALES
  {
    id: 'sf-1',
    round: 'Semifinal 1',
    phase: 'playoffs',
    bracket_code: 'SF1',
    home_label: 'Ganador QF1',
    away_label: 'Ganador QF2',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-20 18:30',
    court: 'Cancha Principal'
  },
  {
    id: 'sf-2',
    round: 'Semifinal 2',
    phase: 'playoffs',
    bracket_code: 'SF2',
    home_label: 'Ganador QF3',
    away_label: 'Ganador QF4',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-20 19:45',
    court: 'Cancha Principal'
  },

  // 3ER PUESTO
  {
    id: 'third-place',
    round: 'Tercer Puesto',
    phase: 'playoffs',
    bracket_code: '3RD',
    home_label: 'Perdedor SF1',
    away_label: 'Perdedor SF2',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-22 17:30',
    court: 'Cancha Principal'
  },

  // GRAN FINAL
  {
    id: 'final-match',
    round: 'Gran Final',
    phase: 'playoffs',
    bracket_code: 'FINAL',
    home_label: 'Ganador SF1',
    away_label: 'Ganador SF2',
    home_team_id: null,
    away_team_id: null,
    home_score: null,
    away_score: null,
    status: 'scheduled',
    date: '2026-11-22 19:00',
    court: 'Cancha Principal'
  },
];
