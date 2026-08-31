-- ── Teste sem cadastro (landing /experimente) ─────────────────────────────────
-- Registra cada correção anônima feita pela API pública /api/try-basica, só pra
-- limitar abuso por IP (RATE_LIMIT testes por janela de 24h). Não guarda nenhum
-- dado da prova nem do resultado — apenas IP + horário.
--
-- RLS habilitado sem policy pública: o app só acessa via service_role
-- (BYPASSRLS), então a tabela fica inacessível pelas roles anon/authenticated.
-- Mesmo padrão de migration_rls_security.sql. Seguro rodar em produção.

CREATE TABLE IF NOT EXISTS demo_trials (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip         text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_trials_ip_created_idx ON demo_trials(ip, created_at DESC);

ALTER TABLE demo_trials ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.demo_trials FROM anon, authenticated;

-- Opcional: limpeza periódica das linhas antigas (roda manualmente ou via cron).
-- DELETE FROM demo_trials WHERE created_at < now() - interval '7 days';
