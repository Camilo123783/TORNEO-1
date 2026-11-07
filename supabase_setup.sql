-- ============================================================================
-- TORNEO DE MICROFÚTBOL TUNJA 2026 - CONFIGURACIÓN SUPABASE COMPLETA
-- Ejecuta este script en Supabase: SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. DESACTIVAR ROW LEVEL SECURITY (RLS) PARA PERMITIR GUARDADO DIRECTO
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teams DISABLE ROW LEVEL SECURITY;

-- 2. TABLA DE EQUIPOS CON COLUMNA DE JUGADORES (JSONB)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL,
  logo TEXT DEFAULT '⚽',
  color TEXT DEFAULT '#10B981',
  players JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar que la columna players existe si la tabla ya había sido creada antes
ALTER TABLE teams ADD COLUMN IF NOT EXISTS players JSONB DEFAULT '[]'::jsonb;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

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
  court TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- 4. TABLA DE CONFIGURACIÓN DEL TORNEO (Credenciales Admin, Ajustes)
CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tournament_settings DISABLE ROW LEVEL SECURITY;

-- Credenciales por defecto (Cédula: 7530, Clave: 1590)
INSERT INTO tournament_settings (key, value) VALUES
  ('admin_cedula', '7530'),
  ('admin_password', '1590')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. INSERTAR / ACTUALIZAR LOS 12 EQUIPOS CON SUS PLANTILLAS COMPLETAS (5 a 12 jugadores)
INSERT INTO teams (id, name, "group", logo, color, players) VALUES
  ('t1', 'Los Galácticos', 'A', '⚡', '#3B82F6', '[
    {"id":"p-1","name":"Camilo Rodríguez","number":10,"goals":3},
    {"id":"p-2","name":"Daniel Martínez","number":7,"goals":1},
    {"id":"p-3","name":"Andrés Gómez","number":1,"goals":0},
    {"id":"p-4","name":"Mateo López","number":8,"goals":0},
    {"id":"p-5","name":"Sebastián Castro","number":9,"goals":0}
  ]'::jsonb),
  ('t2', 'Furia Futsal', 'A', '🔥', '#EF4444', '[
    {"id":"p-6","name":"Felipe Vargas","number":11,"goals":2},
    {"id":"p-7","name":"Santiago Herrera","number":5,"goals":0},
    {"id":"p-8","name":"Julián Morales","number":1,"goals":0},
    {"id":"p-9","name":"David Peña","number":4,"goals":0},
    {"id":"p-10","name":"Kevin Ruiz","number":8,"goals":0}
  ]'::jsonb),
  ('t3', 'Atlético Barrio', 'A', '🛡️', '#10B981', '[
    {"id":"p-11","name":"Brayan Torres","number":10,"goals":0},
    {"id":"p-12","name":"Nicolás Silva","number":9,"goals":0},
    {"id":"p-13","name":"Alejandro Cárdenas","number":1,"goals":0},
    {"id":"p-14","name":"Diego Romero","number":6,"goals":0},
    {"id":"p-15","name":"Esteban Ortiz","number":3,"goals":0}
  ]'::jsonb),

  ('t4', 'Titanes FC', 'B', '👑', '#F59E0B', '[
    {"id":"p-16","name":"Cristian Pardo","number":9,"goals":2},
    {"id":"p-17","name":"Jhoan Medina","number":10,"goals":1},
    {"id":"p-18","name":"Víctor Rincón","number":1,"goals":0},
    {"id":"p-19","name":"Óscar Navarro","number":5,"goals":0},
    {"id":"p-20","name":"Miguel Salazar","number":2,"goals":0}
  ]'::jsonb),
  ('t5', 'La Vecindad', 'B', '🦁', '#8B5CF6', '[
    {"id":"p-21","name":"Jorge Benítez","number":7,"goals":2},
    {"id":"p-22","name":"Mauricio Díaz","number":11,"goals":1},
    {"id":"p-23","name":"Luis Mendoza","number":1,"goals":0},
    {"id":"p-24","name":"Samuel Rojas","number":4,"goals":0},
    {"id":"p-25","name":"Gabriel Ospina","number":8,"goals":0}
  ]'::jsonb),
  ('t6', 'Deportivo Unión', 'B', '⚽', '#06B6D4', '[
    {"id":"p-26","name":"Carlos Mario","number":10,"goals":0},
    {"id":"p-27","name":"Iván Duque","number":9,"goals":0},
    {"id":"p-28","name":"Pablo Gil","number":1,"goals":0},
    {"id":"p-29","name":"Lucas Valencia","number":3,"goals":0},
    {"id":"p-30","name":"Simón Parra","number":5,"goals":0}
  ]'::jsonb),

  ('t7', 'Relámpagos', 'C', '🌩️', '#EC4899', '[
    {"id":"p-31","name":"Álvaro Cruz","number":10,"goals":3},
    {"id":"p-32","name":"Fabián Meza","number":7,"goals":2},
    {"id":"p-33","name":"Rodrigo Reyes","number":1,"goals":0},
    {"id":"p-34","name":"Jonathan Lara","number":2,"goals":0},
    {"id":"p-35","name":"Martín Bernal","number":6,"goals":0}
  ]'::jsonb),
  ('t8', 'Inter Micro', 'C', '🌟', '#6366F1', '[
    {"id":"p-36","name":"Guillermo Paz","number":8,"goals":1},
    {"id":"p-37","name":"Ángel Suárez","number":9,"goals":0},
    {"id":"p-38","name":"Héctor Cabrera","number":1,"goals":0},
    {"id":"p-39","name":"Nelson Molina","number":4,"goals":0},
    {"id":"p-40","name":"Sergio Vega","number":5,"goals":0}
  ]'::jsonb),
  ('t9', 'Arsenal del Sur', 'C', '🎯', '#14B8A6', '[
    {"id":"p-41","name":"Javier Castillo","number":10,"goals":0},
    {"id":"p-42","name":"Ricardo Acosta","number":11,"goals":0},
    {"id":"p-43","name":"Jaime Lozano","number":1,"goals":0},
    {"id":"p-44","name":"Eduardo Ríos","number":3,"goals":0},
    {"id":"p-45","name":"Tomás Arias","number":7,"goals":0}
  ]'::jsonb),

  ('t10', 'Halcones', 'D', '🦅', '#84CC16', '[
    {"id":"p-46","name":"Manuel Beltrán","number":9,"goals":2},
    {"id":"p-47","name":"Hernán Nieto","number":10,"goals":0},
    {"id":"p-48","name":"Emilio Giraldo","number":1,"goals":0},
    {"id":"p-49","name":"César Duarte","number":8,"goals":0},
    {"id":"p-50","name":"Rubén Marín","number":2,"goals":0}
  ]'::jsonb),
  ('t11', 'Real Amistad', 'D', '🤝', '#F97316', '[
    {"id":"p-51","name":"Germán Franco","number":11,"goals":3},
    {"id":"p-52","name":"Félix Quintero","number":7,"goals":1},
    {"id":"p-53","name":"Gustavo Osorio","number":1,"goals":0},
    {"id":"p-54","name":"Mario Villalba","number":4,"goals":0},
    {"id":"p-55","name":"Hugo Restrepo","number":5,"goals":0}
  ]'::jsonb),
  ('t12', 'Gladiadores', 'D', '⚔️', '#D946EF', '[
    {"id":"p-56","name":"Adrián Salcedo","number":10,"goals":0},
    {"id":"p-57","name":"Bernardo Hoyos","number":9,"goals":0},
    {"id":"p-58","name":"René Zambrano","number":1,"goals":0},
    {"id":"p-59","name":"Leonel Carvajal","number":6,"goals":0},
    {"id":"p-60","name":"Fabrizio Bravo","number":3,"goals":0}
  ]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "group" = EXCLUDED."group",
  logo = EXCLUDED.logo,
  color = EXCLUDED.color,
  players = EXCLUDED.players;

-- 6. INSERTAR / ACTUALIZAR TODOS LOS PARTIDOS (Fase de Grupos y Playoffs)
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
