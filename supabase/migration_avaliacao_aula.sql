-- Avaliação de Aula
-- Professor sobe áudio da aula + contexto e recebe feedback qualitativo de didática.
-- Planos pagos: cota mensal fixa (10/mês). Gratuito: 1 avaliação vitalícia (trial), sem reset.

ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_aula integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_aula_reset_date timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aula_trial_used boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS class_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  temas text[] NOT NULL,
  tema_outro text,
  contexto text NOT NULL,
  tom text NOT NULL DEFAULT 'encorajador',
  nivel text,
  pontos_fortes jsonb NOT NULL DEFAULT '[]',
  pontos_desenvolver jsonb NOT NULL DEFAULT '[]',
  parecer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS class_evaluations_user_id_idx ON class_evaluations(user_id, created_at DESC);

ALTER TABLE class_evaluations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.class_evaluations FROM anon, authenticated;
