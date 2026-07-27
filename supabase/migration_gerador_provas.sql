-- Gerador de Provas
-- Cota mensal fixa (10/mês), disponível apenas para planos pagos

ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_provas integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_provas_reset_date timestamptz;
