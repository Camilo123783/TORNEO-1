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
// PLAYOFFS & QUALIFICATION HELPERS
// (Solo clasifican cuando se completan los 3 PJ del grupo)
// ==========================================
export function isGroupCompleted(matches, groupKey) {
  const grpMatches = matches.filter(m => m.phase === 'groups' && m.group === groupKey);
  return grpMatches.length === 3 && grpMatches.every(m => m.status === 'finished');
}

export function getGroupStatus(matches, groupKey) {
  const grpMatches = matches.filter(m => m.phase === 'groups' && m.group === groupKey);
  const finishedCount = grpMatches.filter(m => m.status === 'finished').length;
  return {
    total: 3,
    finished: finishedCount,
    isCompleted: grpMatches.length === 3 && finishedCount === 3
  };
}

export function getResolvedPlayoffMatches(matches, teams) {
  const getTeam = (id) => teams.find((t) => t.id === id) || null;

  // Top 2 de cada grupo ÚNICAMENTE cuando se hayan finalizado los 3 partidos del grupo
  const getTop2IfCompleted = (grp) => {
    if (!isGroupCompleted(matches, grp)) return { first: null, second: null };
    const standings = calculateGroupStandings(teams, matches, grp);
    return {
      first: standings[0]?.team || null,
      second: standings[1]?.team || null,
    };
  };

  const topA = getTop2IfCompleted('A');
  const topB = getTop2IfCompleted('B');
  const topC = getTop2IfCompleted('C');
  const topD = getTop2IfCompleted('D');

  const playoffMap = {};
  matches
    .filter((m) => m.phase === 'playoffs')
    .forEach((m) => {
      playoffMap[m.bracket_code] = { ...m };
    });

  // 1. Cuartos de Final (QF1..QF4)
  // QF1: 1A vs 2B
  if (playoffMap['QF1']) {
    const m = playoffMap['QF1'];
    m.home_team_id = topA.first ? topA.first.id : null;
    m.away_team_id = topB.second ? topB.second.id : null;
    m.resolvedHomeTeam = topA.first;
    m.resolvedAwayTeam = topB.second;
    m.home_label = topA.first ? topA.first.name : '1º Grupo A (Pendiente)';
    m.away_label = topB.second ? topB.second.name : '2º Grupo B (Pendiente)';
  }

  // QF2: 1C vs 2D
  if (playoffMap['QF2']) {
    const m = playoffMap['QF2'];
    m.home_team_id = topC.first ? topC.first.id : null;
    m.away_team_id = topD.second ? topD.second.id : null;
    m.resolvedHomeTeam = topC.first;
    m.resolvedAwayTeam = topD.second;
    m.home_label = topC.first ? topC.first.name : '1º Grupo C (Pendiente)';
    m.away_label = topD.second ? topD.second.name : '2º Grupo D (Pendiente)';
  }

  // QF3: 1B vs 2A
  if (playoffMap['QF3']) {
    const m = playoffMap['QF3'];
    m.home_team_id = topB.first ? topB.first.id : null;
    m.away_team_id = topA.second ? topA.second.id : null;
    m.resolvedHomeTeam = topB.first;
    m.resolvedAwayTeam = topA.second;
    m.home_label = topB.first ? topB.first.name : '1º Grupo B (Pendiente)';
    m.away_label = topA.second ? topA.second.name : '2º Grupo A (Pendiente)';
  }

  // QF4: 1D vs 2C
  if (playoffMap['QF4']) {
    const m = playoffMap['QF4'];
    m.home_team_id = topD.first ? topD.first.id : null;
    m.away_team_id = topC.second ? topC.second.id : null;
    m.resolvedHomeTeam = topD.first;
    m.resolvedAwayTeam = topC.second;
    m.home_label = topD.first ? topD.first.name : '1º Grupo D (Pendiente)';
    m.away_label = topC.second ? topC.second.name : '2º Grupo C (Pendiente)';
  }

  const getWinner = (bracketCode) => {
    const m = playoffMap[bracketCode];
    if (!m || m.status !== 'finished' || m.home_score === null || m.away_score === null) return null;
    if (m.home_score > m.away_score) return m.resolvedHomeTeam || getTeam(m.home_team_id);
    if (m.away_score > m.home_score) return m.resolvedAwayTeam || getTeam(m.away_team_id);
    return null;
  };

  const getLoser = (bracketCode) => {
    const m = playoffMap[bracketCode];
    if (!m || m.status !== 'finished' || m.home_score === null || m.away_score === null) return null;
    if (m.home_score < m.away_score) return m.resolvedHomeTeam || getTeam(m.home_team_id);
    if (m.away_score < m.home_score) return m.resolvedAwayTeam || getTeam(m.away_team_id);
    return null;
  };

  // 2. Semifinales (SF1, SF2)
  // SF1: Ganador QF1 vs Ganador QF2
  const wQF1 = getWinner('QF1');
  const wQF2 = getWinner('QF2');
  if (playoffMap['SF1']) {
    const m = playoffMap['SF1'];
    m.home_team_id = wQF1 ? wQF1.id : null;
    m.away_team_id = wQF2 ? wQF2.id : null;
    m.resolvedHomeTeam = wQF1;
    m.resolvedAwayTeam = wQF2;
    m.home_label = wQF1 ? wQF1.name : 'Ganador Cuartos 1';
    m.away_label = wQF2 ? wQF2.name : 'Ganador Cuartos 2';
  }

  // SF2: Ganador QF3 vs Ganador QF4
  const wQF3 = getWinner('QF3');
  const wQF4 = getWinner('QF4');
  if (playoffMap['SF2']) {
    const m = playoffMap['SF2'];
    m.home_team_id = wQF3 ? wQF3.id : null;
    m.away_team_id = wQF4 ? wQF4.id : null;
    m.resolvedHomeTeam = wQF3;
    m.resolvedAwayTeam = wQF4;
    m.home_label = wQF3 ? wQF3.name : 'Ganador Cuartos 3';
    m.away_label = wQF4 ? wQF4.name : 'Ganador Cuartos 4';
  }

  // 3. Final y 3er Puesto
  const wSF1 = getWinner('SF1');
  const wSF2 = getWinner('SF2');
  const lSF1 = getLoser('SF1');
  const lSF2 = getLoser('SF2');

  if (playoffMap['FINAL']) {
    const m = playoffMap['FINAL'];
    m.home_team_id = wSF1 ? wSF1.id : null;
    m.away_team_id = wSF2 ? wSF2.id : null;
    m.resolvedHomeTeam = wSF1;
    m.resolvedAwayTeam = wSF2;
    m.home_label = wSF1 ? wSF1.name : 'Ganador Semifinal 1';
    m.away_label = wSF2 ? wSF2.name : 'Ganador Semifinal 2';
  }

  if (playoffMap['3RD']) {
    const m = playoffMap['3RD'];
    m.home_team_id = lSF1 ? lSF1.id : null;
    m.away_team_id = lSF2 ? lSF2.id : null;
    m.resolvedHomeTeam = lSF1;
    m.resolvedAwayTeam = lSF2;
    m.home_label = lSF1 ? lSF1.name : 'Perdedor Semifinal 1';
    m.away_label = lSF2 ? lSF2.name : 'Perdedor Semifinal 2';
  }

  return playoffMap;
}

export function getResolvedPlayoffMatch(match, teams, matches) {
  if (!match || match.phase !== 'playoffs') return match;
  const playoffMap = getResolvedPlayoffMatches(matches, teams);
  return playoffMap[match.bracket_code] || match;
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
    date: '2026-11-10 18:00'
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
    date: '2026-11-12 18:00'
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
    date: '2026-11-14 18:00'
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
    date: '2026-11-10 19:00'
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
    date: '2026-11-12 19:00'
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
    date: '2026-11-14 19:00'
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
    date: '2026-11-11 18:00'
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
    date: '2026-11-13 18:00'
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
    date: '2026-11-15 18:00'
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
    date: '2026-11-11 19:00'
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
    date: '2026-11-13 19:00'
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
    date: '2026-11-15 19:00'
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
    date: '2026-11-17 18:00'
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
    date: '2026-11-17 19:15'
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
    date: '2026-11-18 18:00'
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
    date: '2026-11-18 19:15'
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
    date: '2026-11-20 18:30'
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
    date: '2026-11-20 19:45'
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
    date: '2026-11-22 17:30'
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
    date: '2026-11-22 19:00'
  },
];
