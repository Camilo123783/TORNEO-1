-- =========================================================
-- TORNEO DE MICROFÚTBOL 2026 - ESQUEMA Y DATOS INICIALES
-- (Versión con acceso por Código/Clave: permite edición autorizada por frontend)
-- =========================================================

-- 1. TABLA DE EQUIPOS
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL,
  logo TEXT DEFAULT '⚽',
  color TEXT DEFAULT '#10B981',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE PARTIDOS
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  round TEXT NOT NULL,
  phase TEXT NOT NULL, -- 'groups' o 'playoffs'
  "group" TEXT, -- 'A', 'B', 'C', 'D' o NULL para playoffs
  bracket_code TEXT, -- 'QF1', 'QF2', 'SF1', 'SF2', '3RD', 'FINAL'
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

-- 3. HABILITAR SEGURIDAD POR FILA (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR POLÍTICAS PREVIAS SI YA EXISTEN
DROP POLICY IF EXISTS "Public read teams" ON teams;
DROP POLICY IF EXISTS "Public read matches" ON matches;
DROP POLICY IF EXISTS "Auth write teams" ON teams;
DROP POLICY IF EXISTS "Auth write matches" ON matches;
DROP POLICY IF EXISTS "Auth modify teams" ON teams;
DROP POLICY IF EXISTS "Auth modify matches" ON matches;
DROP POLICY IF EXISTS "Public write teams" ON teams;
DROP POLICY IF EXISTS "Public write matches" ON matches;

-- 5. CREAR POLÍTICAS DE ACCESO
-- Todo el público puede consultar resultados y tablas (SELECT)
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);

-- Permite actualizar partidos y equipos desde el frontend (protegido por Código y Clave en la app)
CREATE POLICY "Public write teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public write matches" ON matches FOR ALL USING (true) WITH CHECK (true);

-- 6. INSERTAR LOS 12 EQUIPOS (4 Grupos de 3)
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

-- 7. INSERTAR PARTIDOS DE FASE DE GRUPOS Y PLAYOFFS
INSERT INTO matches (id, round, phase, "group", bracket_code, home_team_id, away_team_id, home_score, away_score, status, date, court, home_label, away_label) VALUES
  -- GRUPO A
  ('m-a1', 'Fecha 1', 'groups', 'A', NULL, 't1', 't2', 4, 2, 'finished', '2026-11-10 18:00', 'Cancha 1 - Principal', NULL, NULL),
  ('m-a2', 'Fecha 2', 'groups', 'A', NULL, 't1', 't3', NULL, NULL, 'scheduled', '2026-11-12 18:00', 'Cancha 1 - Principal', NULL, NULL),
  ('m-a3', 'Fecha 3', 'groups', 'A', NULL, 't2', 't3', NULL, NULL, 'scheduled', '2026-11-14 18:00', 'Cancha 1 - Principal', NULL, NULL),

  -- GRUPO B
  ('m-b1', 'Fecha 1', 'groups', 'B', NULL, 't4', 't5', 3, 3, 'finished', '2026-11-10 19:00', 'Cancha 1 - Principal', NULL, NULL),
  ('m-b2', 'Fecha 2', 'groups', 'B', NULL, 't4', 't6', NULL, NULL, 'scheduled', '2026-11-12 19:00', 'Cancha 1 - Principal', NULL, NULL),
  ('m-b3', 'Fecha 3', 'groups', 'B', NULL, 't5', 't6', NULL, NULL, 'scheduled', '2026-11-14 19:00', 'Cancha 1 - Principal', NULL, NULL),

  -- GRUPO C
  ('m-c1', 'Fecha 1', 'groups', 'C', NULL, 't7', 't8', 5, 1, 'finished', '2026-11-11 18:00', 'Cancha 2', NULL, NULL),
  ('m-c2', 'Fecha 2', 'groups', 'C', NULL, 't7', 't9', NULL, NULL, 'scheduled', '2026-11-13 18:00', 'Cancha 2', NULL, NULL),
  ('m-c3', 'Fecha 3', 'groups', 'C', NULL, 't8', 't9', NULL, NULL, 'scheduled', '2026-11-15 18:00', 'Cancha 2', NULL, NULL),

  -- GRUPO D
  ('m-d1', 'Fecha 1', 'groups', 'D', NULL, 't10', 't11', 2, 4, 'finished', '2026-11-11 19:00', 'Cancha 2', NULL, NULL),
  ('m-d2', 'Fecha 2', 'groups', 'D', NULL, 't10', 't12', NULL, NULL, 'scheduled', '2026-11-13 19:00', 'Cancha 2', NULL, NULL),
  ('m-d3', 'Fecha 3', 'groups', 'D', NULL, 't11', 't12', NULL, NULL, 'scheduled', '2026-11-15 19:00', 'Cancha 2', NULL, NULL),

  -- CUARTOS DE FINAL
  ('qf-1', 'Cuartos 1', 'playoffs', NULL, 'QF1', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-17 18:00', 'Cancha Principal', '1º Grupo A', '2º Grupo B'),
  ('qf-2', 'Cuartos 2', 'playoffs', NULL, 'QF2', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-17 19:15', 'Cancha Principal', '1º Grupo C', '2º Grupo D'),
  ('qf-3', 'Cuartos 3', 'playoffs', NULL, 'QF3', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-18 18:00', 'Cancha Principal', '1º Grupo B', '2º Grupo A'),
  ('qf-4', 'Cuartos 4', 'playoffs', NULL, 'QF4', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-18 19:15', 'Cancha Principal', '1º Grupo D', '2º Grupo C'),

  -- SEMIFINALES
  ('sf-1', 'Semifinal 1', 'playoffs', NULL, 'SF1', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-20 18:30', 'Cancha Principal', 'Ganador QF1', 'Ganador QF2'),
  ('sf-2', 'Semifinal 2', 'playoffs', NULL, 'SF2', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-20 19:45', 'Cancha Principal', 'Ganador QF3', 'Ganador QF4'),

  -- TERCER PUESTO
  ('third-place', 'Tercer Puesto', 'playoffs', NULL, '3RD', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-22 17:30', 'Cancha Principal', 'Perdedor SF1', 'Perdedor SF2'),

  -- GRAN FINAL
  ('final-match', 'Gran Final', 'playoffs', NULL, 'FINAL', NULL, NULL, NULL, NULL, 'scheduled', '2026-11-22 19:00', 'Cancha Principal', 'Ganador SF1', 'Ganador SF2')
ON CONFLICT (id) DO UPDATE SET
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score,
  status = EXCLUDED.status;
