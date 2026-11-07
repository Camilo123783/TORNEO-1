-- ============================================================================
-- TORNEO DE MICROFÚTBOL TUNJA 2026 - CONFIGURACIÓN SUPABASE COMPLETA
-- Ejecuta este script en Supabase: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. TABLA DE EQUIPOS
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL,
  logo TEXT DEFAULT '⚽',
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA INDEPENDIENTE DE JUGADORES (VISIBLE EN TABLE EDITOR)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL DEFAULT 10,
  goals INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE PARTIDOS
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  round TEXT NOT NULL,
  phase TEXT NOT NULL, -- 'groups' o 'playoffs'
  "group" TEXT, -- 'A', 'B', 'C', 'D' o NULL para playoffs
  bracket_code TEXT, -- 'QF1', 'QF2', 'QF3', 'QF4', 'SF1', 'SF2', '3RD', 'FINAL'
  home_label TEXT,
  away_label TEXT,
  home_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  home_score INTEGER,
  away_score INTEGER,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'finished'
  date TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE CONFIGURACIÓN DEL TORNEO (Credenciales Admin, Ajustes)
CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DESACTIVAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- Esto es fundamental para permitir que el administrador actualice marcadores, goles y estados sin ser bloqueado.
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS players DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tournament_settings DISABLE ROW LEVEL SECURITY;

-- 6. CREDENCIALES POR DEFECTO (Cédula: 7530, Clave: 1590)
INSERT INTO tournament_settings (key, value) VALUES
  ('admin_cedula', '7530'),
  ('admin_password', '1590')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 7. INSERTAR LOS 12 EQUIPOS
INSERT INTO teams (id, name, "group", logo, color) VALUES
  ('t1', 'Los Galácticos', 'A', '⚡', '#3B82F6'),
  ('t2', 'Furia Futsal', 'A', '🔥', '#EF4444'),
  ('t3', 'Atlético Barrio', 'A', '🛡️', '#10B981'),
  ('t4', 'Titanes FC', 'B', '👑', '#F59E0B'),
  ('t5', 'La Vecindad', 'B', '🦁', '#8B5CF6'),
  ('t6', 'Deportivo Unión', 'B', '⚽', '#06B6D4'),
  ('t7', 'Relámpagos', 'C', '🌩️', '#EC4899'),
  ('t8', 'Inter Micro', 'C', '🌟', '#6366F1'),
  ('t9', 'Arsenal del Sur', 'C', '🎯', '#14B8A6'),
  ('t10', 'Halcones', 'D', '🦅', '#84CC16'),
  ('t11', 'Real Amistad', 'D', '🤝', '#F97316'),
  ('t12', 'Gladiadores', 'D', '⚔️', '#D946EF')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "group" = EXCLUDED."group",
  logo = EXCLUDED.logo,
  color = EXCLUDED.color;

-- 8. INSERTAR TODOS LOS JUGADORES EN LA TABLA 'players'
INSERT INTO players (id, team_id, name, number, goals) VALUES
  -- Los Galácticos (t1)
  ('p-1', 't1', 'Camilo Rodríguez', 10, 3),
  ('p-2', 't1', 'Daniel Martínez', 7, 1),
  ('p-3', 't1', 'Andrés Gómez', 1, 0),
  ('p-4', 't1', 'Mateo López', 8, 0),
  ('p-5', 't1', 'Sebastián Castro', 9, 0),

  -- Furia Futsal (t2)
  ('p-6', 't2', 'Felipe Vargas', 11, 2),
  ('p-7', 't2', 'Santiago Herrera', 5, 0),
  ('p-8', 't2', 'Julián Morales', 1, 0),
  ('p-9', 't2', 'David Peña', 4, 0),
  ('p-10', 't2', 'Kevin Ruiz', 8, 0),

  -- Atlético Barrio (t3)
  ('p-11', 't3', 'Brayan Torres', 10, 0),
  ('p-12', 't3', 'Nicolás Silva', 9, 0),
  ('p-13', 't3', 'Alejandro Cárdenas', 1, 0),
  ('p-14', 't3', 'Diego Romero', 6, 0),
  ('p-15', 't3', 'Esteban Ortiz', 3, 0),

  -- Titanes FC (t4)
  ('p-16', 't4', 'Cristian Pardo', 9, 2),
  ('p-17', 't4', 'Jhoan Medina', 10, 1),
  ('p-18', 't4', 'Víctor Rincón', 1, 0),
  ('p-19', 't4', 'Óscar Navarro', 5, 0),
  ('p-20', 't4', 'Miguel Salazar', 2, 0),

  -- La Vecindad (t5)
  ('p-21', 't5', 'Jorge Benítez', 7, 2),
  ('p-22', 't5', 'Mauricio Díaz', 11, 1),
  ('p-23', 't5', 'Luis Mendoza', 1, 0),
  ('p-24', 't5', 'Samuel Rojas', 4, 0),
  ('p-25', 't5', 'Gabriel Ospina', 8, 0),

  -- Deportivo Unión (t6)
  ('p-26', 't6', 'Carlos Mario', 10, 0),
  ('p-27', 't6', 'Iván Duque', 9, 0),
  ('p-28', 't6', 'Pablo Gil', 1, 0),
  ('p-29', 't6', 'Lucas Valencia', 3, 0),
  ('p-30', 't6', 'Simón Parra', 5, 0),

  -- Relámpagos (t7)
  ('p-31', 't7', 'Álvaro Cruz', 10, 3),
  ('p-32', 't7', 'Fabián Meza', 7, 2),
  ('p-33', 't7', 'Rodrigo Reyes', 1, 0),
  ('p-34', 't7', 'Jonathan Lara', 2, 0),
  ('p-35', 't7', 'Martín Bernal', 6, 0),

  -- Inter Micro (t8)
  ('p-36', 't8', 'Guillermo Paz', 8, 1),
  ('p-37', 't8', 'Ángel Suárez', 9, 0),
  ('p-38', 't8', 'Héctor Cabrera', 1, 0),
  ('p-39', 't8', 'Nelson Molina', 4, 0),
  ('p-40', 't8', 'Sergio Vega', 5, 0),

  -- Arsenal del Sur (t9)
  ('p-41', 't9', 'Javier Castillo', 10, 0),
  ('p-42', 't9', 'Ricardo Acosta', 11, 0),
  ('p-43', 't9', 'Jaime Lozano', 1, 0),
  ('p-44', 't9', 'Eduardo Ríos', 3, 0),
  ('p-45', 't9', 'Tomás Arias', 7, 0),

  -- Halcones (t10)
  ('p-46', 't10', 'Manuel Beltrán', 9, 2),
  ('p-47', 't10', 'Hernán Nieto', 10, 0),
  ('p-48', 't10', 'Emilio Giraldo', 1, 0),
  ('p-49', 't10', 'César Duarte', 8, 0),
  ('p-50', 't10', 'Rubén Marín', 2, 0),

  -- Real Amistad (t11)
  ('p-51', 't11', 'Germán Franco', 11, 3),
  ('p-52', 't11', 'Félix Quintero', 7, 1),
  ('p-53', 't11', 'Gustavo Osorio', 1, 0),
  ('p-54', 't11', 'Mario Villalba', 4, 0),
  ('p-55', 't11', 'Hugo Restrepo', 5, 0),

  -- Gladiadores (t12)
  ('p-56', 't12', 'Adrián Salcedo', 10, 0),
  ('p-57', 't12', 'Bernardo Hoyos', 9, 0),
  ('p-58', 't12', 'René Zambrano', 1, 0),
  ('p-59', 't12', 'Leonel Carvajal', 6, 0),
  ('p-60', 't12', 'Fabrizio Bravo', 3, 0)
ON CONFLICT (id) DO UPDATE SET
  team_id = EXCLUDED.team_id,
  name = EXCLUDED.name,
  number = EXCLUDED.number,
  goals = EXCLUDED.goals;

-- 9. INSERTAR / ACTUALIZAR TODOS LOS PARTIDOS (Fase de Grupos y Playoffs)
INSERT INTO matches (id, round, phase, "group", bracket_code, home_team_id, away_team_id, home_score, away_score, status, date, home_label, away_label) VALUES
  -- GRUPO A
  ('m-a1', 'Fecha 1', 'groups', 'A', NULL, 't1', 't2', 4, 2, 'finished', '2026-11-10 18:00', NULL, NULL),
  ('m-a2', 'Fecha 2', 'groups', 'A', NULL, 't1', 't3', NULL, NULL, 'scheduled', '2026-11-12 18:00', NULL, NULL),
  ('m-a3', 'Fecha 3', 'groups', 'A', NULL, 't2', 't3', NULL, NULL, 'scheduled', '2026-11-14 18:00', NULL, NULL),

  -- GRUPO B
  ('m-b1', 'Fecha 1', 'groups', 'B', NULL, 't4', 't5', 3, 3, 'finished', '2026-11-10 19:00', NULL, NULL),
  ('m-b2', 'Fecha 2', 'groups', 'B', NULL, 't4', 't6', NULL, NULL, 'scheduled', '2026-11-12 19:00', NULL, NULL),
  ('m-b3', 'Fecha 3', 'groups', 'B', NULL, 't5', 't6', NULL, NULL, 'scheduled', '2026-11-14 19:00', NULL, NULL),

  -- GRUPO C
  ('m-c1', 'Fecha 1', 'groups', 'C', NULL, 't7', 't8', 5, 1, 'finished', '2026-11-11 18:00', NULL, NULL),
  ('m-c2', 'Fecha 2', 'groups', 'C', NULL, 't7', 't9', NULL, NULL, 'scheduled', '2026-11-13 18:00', NULL, NULL),
  ('m-c3', 'Fecha 3', 'groups', 'C', NULL, 't8', 't9', NULL, NULL, 'scheduled', '2026-11-15 18:00', NULL, NULL),

  -- GRUPO D
  ('m-d1', 'Fecha 1', 'groups', 'D', NULL, 't10', 't11', 2, 4, 'finished', '2026-11-11 19:00', NULL, NULL),
  ('m-d2', 'Fecha 2', 'groups', 'D', NULL, 't10', 't12', NULL, NULL, 'scheduled', '2026-11-13 19:00', NULL, NULL),
  ('m-d3', 'Fecha 3', 'groups', 'D', NULL, 't11', 't12', NULL, NULL, 'scheduled', '2026-11-15 19:00', NULL, NULL),

  -- CUARTOS DE FINAL (Dinámicos: los equipos se asignan al completar los 3 PJ del grupo)
  ('qf-1', 'Cuartos 1', 'playoffs', NULL, 'QF1', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-17 18:00', '1º Grupo A', '2º Grupo B'),
  ('qf-2', 'Cuartos 2', 'playoffs', NULL, 'QF2', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-17 19:15', '1º Grupo C', '2º Grupo D'),
  ('qf-3', 'Cuartos 3', 'playoffs', NULL, 'QF3', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-18 18:00', '1º Grupo B', '2º Grupo A'),
  ('qf-4', 'Cuartos 4', 'playoffs', NULL, 'QF4', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-18 19:15', '1º Grupo D', '2º Grupo C'),

  -- SEMIFINALES
  ('sf-1', 'Semifinal 1', 'playoffs', NULL, 'SF1', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-20 18:30', 'Ganador QF1', 'Ganador QF2'),
  ('sf-2', 'Semifinal 2', 'playoffs', NULL, 'SF2', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-20 19:45', 'Ganador QF3', 'Ganador QF4'),

  -- TERCER PUESTO
  ('third-place', 'Tercer Puesto', 'playoffs', NULL, '3RD', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-22 17:30', 'Perdedor SF1', 'Perdedor SF2'),

  -- GRAN FINAL
  ('final-match', 'Gran Final', 'playoffs', NULL, 'FINAL', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-22 19:00', 'Ganador SF1', 'Ganador SF2')
ON CONFLICT (id) DO UPDATE SET
  home_team_id = EXCLUDED.home_team_id,
  away_team_id = EXCLUDED.away_team_id,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  status = EXCLUDED.status,
  date = EXCLUDED.date;
