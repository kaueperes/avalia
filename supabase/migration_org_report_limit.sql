-- ── Limite individual de relatórios por professor dentro da org ────────────
-- Espelha org_quota_limit/org_quota_used (que já existiam só para avaliações).
-- NULL = sem limite individual (só o pool da org já limita).

ALTER TABLE users ADD COLUMN IF NOT EXISTS org_quota_relatorios_limit integer;
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_quota_relatorios_used integer NOT NULL DEFAULT 0;
