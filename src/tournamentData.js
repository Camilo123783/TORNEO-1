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
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  import.meta.env.VITE_SUPABASE_SECRET_KEY || 
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
// Tiebreakers: PTS > DG > GF > Fewest GC > Fair Play (Menor puntaje de tarjetas) > Name
// Fair Play: Amarilla = 1 pt penalización, Roja / Doble Amarilla = 3 pts penalización
// ==========================================
export function calculateGroupStandings(teams, matches, groupKey, cards = []) {
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
      form: [],
      yellowCards: 0,
      redCards: 0,
      fairPlayPoints: 0 // Menor puntaje = mejor comportamiento disciplinario
    };
  });

  const groupMatches = matches.filter(m => m.group === groupKey);
  const groupMatchIds = new Set(groupMatches.map(m => m.id));

  // Cómputo de tarjetas disciplinarias para Juego Limpio (Fair Play)
  if (Array.isArray(cards)) {
    cards.forEach(c => {
      if (groupMatchIds.has(c.match_id) && statsMap[c.team_id]) {
        if (c.card_type === 'yellow') {
          statsMap[c.team_id].yellowCards += 1;
          statsMap[c.team_id].fairPlayPoints += 1;
        } else if (c.card_type === 'red' || c.card_type === 'double_yellow') {
          statsMap[c.team_id].redCards += 1;
          statsMap[c.team_id].fairPlayPoints += 3;
        }
      }
    });
  }

  const finishedGroupMatches = groupMatches.filter(
    m => m.status === 'finished' && 
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
    // 1. Puntos
    if (b.pts !== a.pts) return b.pts - a.pts;
    // 2. Diferencia de Gol
    if (b.dg !== a.dg) return b.dg - a.dg;
    // 3. Goles a Favor
    if (b.gf !== a.gf) return b.gf - a.gf;
    // 4. Menor cantidad de Goles en Contra
    if (a.gc !== b.gc) return a.gc - b.gc;
    // 5. Criterio de Desempate: Juego Limpio / Fair Play (menos tarjetas = mejor)
    if (a.fairPlayPoints !== b.fairPlayPoints) return a.fairPlayPoints - b.fairPlayPoints;
    // 6. Alfabético por nombre
    return a.team.name.localeCompare(b.team.name);
  });

  return standings;
}

// ==========================================
// DISCIPLINARY / CARDS HELPERS
// ==========================================
export function getPlayerDisciplinaryStatus(playerId, teamId, targetMatchId, matches = [], cards = []) {
  const playerCards = (cards || []).filter(c => c.player_id === playerId);
  
  // 1. Tarjetas en el partido en curso (targetMatchId)
  const cardsInThisMatch = playerCards.filter(c => c.match_id === targetMatchId);
  const yellowsInThisMatch = cardsInThisMatch.filter(c => c.card_type === 'yellow').length;
  const redInThisMatch = cardsInThisMatch.some(c => c.card_type === 'red' || c.card_type === 'double_yellow');
  
  if (redInThisMatch || yellowsInThisMatch >= 2) {
    return {
      status: 'expelled',
      isExpelled: true,
      isSuspended: false,
      reason: yellowsInThisMatch >= 2 
        ? 'Expulsado por doble amarilla en este partido' 
        : 'Expulsado por tarjeta roja directa en este partido',
      yellowsInThisMatch,
      redInThisMatch: true
    };
  }
  
  // 2. Verificar si está suspendido por sanción en el partido anterior de su equipo
  const teamMatches = (matches || [])
    .filter(m => m.home_team_id === teamId || m.away_team_id === teamId)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    
  const currentMatchIndex = teamMatches.findIndex(m => m.id === targetMatchId);
  if (currentMatchIndex > 0) {
    const previousMatch = teamMatches[currentMatchIndex - 1];
    const prevMatchCards = playerCards.filter(c => c.match_id === previousMatch.id);
    const prevYellows = prevMatchCards.filter(c => c.card_type === 'yellow').length;
    const prevRed = prevMatchCards.some(c => c.card_type === 'red' || c.card_type === 'double_yellow');
    
    if (prevRed || prevYellows >= 2) {
      return {
        status: 'suspended',
        isExpelled: false,
        isSuspended: true,
        suspendedForMatchId: targetMatchId,
        sanctionMatch: previousMatch,
        reason: `Suspendido por ${prevYellows >= 2 ? 'doble amarilla (roja)' : 'tarjeta roja directa'} en ${previousMatch.round || 'la fecha anterior'}`,
        yellowsInThisMatch,
        redInThisMatch: false
      };
    }
  }
  
  return {
    status: 'active',
    isExpelled: false,
    isSuspended: false,
    reason: null,
    yellowsInThisMatch,
    redInThisMatch: false
  };
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
// 12 TEAMS (4 GROUPS OF 3, TEMPLATES LISTOS PARA PERSONALIZAR)
// ==========================================
export const INITIAL_TEAMS = [
  // Grupo A
  { 
    id: 't1', 
    name: 'Equipo 1', 
    group: 'A', 
    logo: '⚽', 
    color: '#3B82F6',
    players: []
  },
  { 
    id: 't2', 
    name: 'Equipo 2', 
    group: 'A', 
    logo: '⚽', 
    color: '#EF4444',
    players: []
  },
  { 
    id: 't3', 
    name: 'Equipo 3', 
    group: 'A', 
    logo: '⚽', 
    color: '#10B981',
    players: []
  },

  // Grupo B
  { 
    id: 't4', 
    name: 'Equipo 4', 
    group: 'B', 
    logo: '⚽', 
    color: '#F59E0B',
    players: []
  },
  { 
    id: 't5', 
    name: 'Equipo 5', 
    group: 'B', 
    logo: '⚽', 
    color: '#8B5CF6',
    players: []
  },
  { 
    id: 't6', 
    name: 'Equipo 6', 
    group: 'B', 
    logo: '⚽', 
    color: '#06B6D4',
    players: []
  },

  // Grupo C
  { 
    id: 't7', 
    name: 'Equipo 7', 
    group: 'C', 
    logo: '⚽', 
    color: '#EC4899',
    players: []
  },
  { 
    id: 't8', 
    name: 'Equipo 8', 
    group: 'C', 
    logo: '⚽', 
    color: '#6366F1',
    players: []
  },
  { 
    id: 't9', 
    name: 'Equipo 9', 
    group: 'C', 
    logo: '⚽', 
    color: '#14B8A6',
    players: []
  },

  // Grupo D
  { 
    id: 't10', 
    name: 'Equipo 10', 
    group: 'D', 
    logo: '⚽', 
    color: '#84CC16',
    players: []
  },
  { 
    id: 't11', 
    name: 'Equipo 11', 
    group: 'D', 
    logo: '⚽', 
    color: '#F97316',
    players: []
  },
  { 
    id: 't12', 
    name: 'Equipo 12', 
    group: 'D', 
    logo: '⚽', 
    color: '#D946EF',
    players: []
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
    home_score: null,
    away_score: null,
    status: 'scheduled',
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
    home_score: null,
    away_score: null,
    status: 'scheduled',
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
    home_score: null,
    away_score: null,
    status: 'scheduled',
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
    home_score: null,
    away_score: null,
    status: 'scheduled',
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
