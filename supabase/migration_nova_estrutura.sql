-- ============================================================
-- MIGRATION: nova-estrutura
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. INSTITUTIONS
CREATE TABLE IF NOT EXISTS institutions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  logo_url    TEXT DEFAULT '',
  education_level TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DISCIPLINES
CREATE TABLE IF NOT EXISTS disciplines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id  UUID REFERENCES institutions(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  exercise_name   TEXT NOT NULL,
  exercise_type   TEXT NOT NULL,
  criteria        JSONB DEFAULT '[]',
  description     TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institution_id  UUID REFERENCES institutions(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVALUATIONS — adicionar FKs reais (mantém campos de texto para compatibilidade com dados antigos)
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS class_id   UUID REFERENCES classes(id)  ON DELETE SET NULL;

-- 6. PROFILES — adicionar is_default
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Nota: o projeto usa SUPABASE_SERVICE_KEY (service role) que ignora RLS.
-- O isolamento por usuário é feito nas API routes via .eq('user_id', user.userId).
