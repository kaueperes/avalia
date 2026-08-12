-- ── Disciplina compartilhada pela organização ───────────────────────────────
-- NULL = disciplina pessoal do professor (continua exatamente como hoje).
-- Preenchida = disciplina da instituição, criada/gerenciada pelo admin,
-- visível (leitura) por todos os professores da organização.

ALTER TABLE disciplines ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id);

CREATE INDEX IF NOT EXISTS disciplines_org_idx ON disciplines(org_id);
