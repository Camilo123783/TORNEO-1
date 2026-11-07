export const INITIAL_TEAMS = [
  // Grupo A
  { id: 't1', name: 'Los Galácticos', group: 'A', logo: '⚡', color: '#3B82F6' },
  { id: 't2', name: 'Furia Futsal', group: 'A', logo: '🔥', color: '#EF4444' },
  { id: 't3', name: 'Atlético Barrio', group: 'A', logo: '🛡️', color: '#10B981' },

  // Grupo B
  { id: 't4', name: 'Titanes FC', group: 'B', logo: '👑', color: '#F59E0B' },
  { id: 't5', name: 'La Vecindad', group: 'B', logo: '🦁', color: '#8B5CF6' },
  { id: 't6', name: 'Deportivo Unión', group: 'B', logo: '⚽', color: '#06B6D4' },

  // Grupo C
  { id: 't7', name: 'Relámpagos', group: 'C', logo: '🌩️', color: '#EC4899' },
  { id: 't8', name: 'Inter Micro', group: 'C', logo: '🌟', color: '#6366F1' },
  { id: 't9', name: 'Arsenal del Sur', group: 'C', logo: '🎯', color: '#14B8A6' },

  // Grupo D
  { id: 't10', name: 'Halcones', group: 'D', logo: '🦅', color: '#84CC16' },
  { id: 't11', name: 'Real Amistad', group: 'D', logo: '🤝', color: '#F97316' },
  { id: 't12', name: 'Gladiadores', group: 'D', logo: '⚔️', color: '#D946EF' },
];

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
    status: 'finished', // scheduled, live, finished
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

  // PLAYOFFS - CUARTOS DE FINAL (Top 2 de cada grupo)
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
