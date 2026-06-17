-- Modo Teste de Prompt
-- Adiciona colunas de cota de testes na tabela users

ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_testes integer DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS quota_testes_reset_date timestamptz;

-- Inicializa cota de testes para usuários existentes
UPDATE users SET quota_testes = 10 WHERE quota_testes IS NULL;

-- Tabela de rascunhos de avaliação (modo teste)
CREATE TABLE IF NOT EXISTS evaluation_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  result_json jsonb NOT NULL,
  input_summary text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS evaluation_drafts_user_id_idx ON evaluation_drafts(user_id, created_at DESC);
